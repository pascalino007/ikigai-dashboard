'use client'

import { API_BASE_URL } from '@/services/api'
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  token?: string
  id?: string
  name?: string
  role?: string
  avatar?: string
  enrolledShops?: number
}

interface OtpRequestResult {
  success: boolean
  /** false when the backend recognized a trusted device and logged in directly */
  otpRequired: boolean
  message?: string
  error?: string
}

interface OtpVerifyResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  /** Step 1: validate credentials; sends an OTP email unless the device is trusted. */
  requestLoginOtp: (email: string, password: string) => Promise<OtpRequestResult>
  /** Step 2: verify the emailed code and open the session. */
  verifyLoginOtp: (email: string, otp: string, rememberDevice: boolean) => Promise<OtpVerifyResult>
  /** Patch the in-memory + persisted user (e.g. after changing the avatar). */
  updateUser: (patch: Partial<User>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const router = useRouter()
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Auto-logout only after 30 minutes of real inactivity — any mouse/keyboard/
  // scroll activity resets the timer, so an active user is never signed out.
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000

  const logout = useCallback(() => {
    // Best-effort: release the active session server-side so it isn't left dangling.
    try {
      const sid = localStorage.getItem('ikigai_session')
      const savedUser = localStorage.getItem('ikigai_user')
      const uid = savedUser ? JSON.parse(savedUser)?.id : null
      if (uid && sid) {
        fetch(`${API_BASE_URL}/auth/session/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: Number(uid), sessionId: sid }),
        }).catch(() => {})
      }
    } catch {}
    localStorage.removeItem('ikigai_token')
    localStorage.removeItem('ikigai_user')
    localStorage.removeItem('ikigai_session')
    setUser(null)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    router.push('/login')
  }, [router])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    
    if (user) {
      inactivityTimerRef.current = setTimeout(() => {
        logout()
      }, INACTIVITY_TIMEOUT)
    }
  }, [user, logout])

  const handleUserActivity = useCallback(() => {
    const now = Date.now()
    // Throttle activity updates to once per second
    if (now - lastActivityRef.current > 1000) {
      lastActivityRef.current = now
      resetInactivityTimer()
    }
  }, [resetInactivityTimer])

  useEffect(() => {
    if (user) {
      window.addEventListener('mousemove', handleUserActivity)
      window.addEventListener('keydown', handleUserActivity)
      window.addEventListener('click', handleUserActivity)
      window.addEventListener('scroll', handleUserActivity)
      
      // Initial timer start
      resetInactivityTimer()
    }

    return () => {
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
      window.removeEventListener('click', handleUserActivity)
      window.removeEventListener('scroll', handleUserActivity)
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [user, handleUserActivity, resetInactivityTimer])

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const token = localStorage.getItem('ikigai_token')
      const savedUser = localStorage.getItem('ikigai_user')
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('ikigai_token')
          localStorage.removeItem('ikigai_user')
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  // Single active session: poll the backend; if this session was superseded by a
  // newer login elsewhere, sign out here.
  useEffect(() => {
    if (!user) return
    let active = true
    const check = async () => {
      try {
        const sid = localStorage.getItem('ikigai_session')
        if (!sid || !user.id) return
        const res = await fetch(`${API_BASE_URL}/auth/session/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: Number(user.id), sessionId: sid }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (active && data && data.valid === false) {
          setNotice('Votre session a été fermée : votre compte a été utilisé sur un autre appareil.')
          localStorage.removeItem('ikigai_token')
          localStorage.removeItem('ikigai_user')
          localStorage.removeItem('ikigai_session')
          setUser(null)
          router.push('/login')
        }
      } catch {}
    }
    check()
    const id = setInterval(check, 45000)
    return () => { active = false; clearInterval(id) }
  }, [user, router])

  // Auto-dismiss the session notice.
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 7000)
    return () => clearTimeout(t)
  }, [notice])

  // Stable per-browser id: lets the backend recognize this device and skip the
  // OTP for 30 days when "remember this device" was checked at verification.
  const getDeviceId = (): string => {
    let id = localStorage.getItem('ikigai_device_id')
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('ikigai_device_id', id)
    }
    return id
  }

  /** Map a session response (accessToken/user/sessionId) into local state. Returns an error message or null. */
  const completeSession = (data: any, fallbackEmail: string): string | null => {
    const token = data.accessToken || data.access_token || data.token
    // Handle potential flat response structure where user data is at root
    const rawUser = data.user || data
    if (!token) return 'Réponse invalide du serveur'

    // Check if user is active based on DB column 'is_active' (1 = active, 0 = inactive)
    if (rawUser.is_active === 0 || rawUser.is_active === false) {
      console.warn('Login blocked: User is inactive')
      return 'Ce compte est désactivé.'
    }

    // Map DB fields to App User Interface
    // DB: firstname, lastname, image, role
    // App: name, avatar, role
    const userData: User = {
      id: rawUser.id?.toString() || rawUser.userId?.toString(),
      email: rawUser.email || fallbackEmail,
      token,
      role: rawUser.role || 'user',
      name: rawUser.name || `${rawUser.firstname || ''} ${rawUser.lastname || ''}`.trim(),
      avatar: rawUser.image || rawUser.avatar,
      enrolledShops: rawUser.enrolledShops
    }

    localStorage.setItem('ikigai_token', token)
    localStorage.setItem('ikigai_user', JSON.stringify(userData))
    if (data.sessionId) localStorage.setItem('ikigai_session', data.sessionId)
    // Secret proving this device is trusted; sent with the next login to skip the OTP.
    if (data.deviceToken) localStorage.setItem('ikigai_device_token', data.deviceToken)
    setUser(userData)
    return null
  }

  const requestLoginOtp = async (email: string, password: string): Promise<OtpRequestResult> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          deviceId: getDeviceId(),
          deviceToken: localStorage.getItem('ikigai_device_token') || undefined,
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        console.error('Login failed details:', response.status, data)
        return {
          success: false,
          otpRequired: false,
          error: data?.message || 'Email ou mot de passe invalide',
        }
      }

      // Trusted device: the backend returned the session directly, no OTP step.
      if (data?.otpRequired === false) {
        const err = completeSession(data, email)
        if (err) return { success: false, otpRequired: false, error: err }
        return { success: true, otpRequired: false }
      }

      return { success: true, otpRequired: true, message: data?.message }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, otpRequired: false, error: 'Erreur réseau — veuillez réessayer' }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyLoginOtp = async (email: string, otp: string, rememberDevice: boolean): Promise<OtpVerifyResult> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          deviceId: getDeviceId(),
          rememberDevice,
          deviceName: 'Ikigai Dashboard (web)',
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        console.error('OTP verify failed details:', response.status, data)
        return { success: false, error: data?.message || 'Code invalide ou expiré' }
      }

      const err = completeSession(data, email)
      if (err) return { success: false, error: err }
      return { success: true }
    } catch (error) {
      console.error('OTP verify error:', error)
      return { success: false, error: 'Erreur réseau — veuillez réessayer' }
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (patch: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem('ikigai_user', JSON.stringify(next))
      return next
    })
  }

  const value: AuthContextType = {
    user,
    requestLoginOtp,
    verifyLoginOtp,
    updateUser,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {notice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] px-4 py-3 rounded-lg bg-red-600 text-white text-sm shadow-lg text-center">
          {notice}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
