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

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
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

  // 15 minutes inactivity timeout
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000

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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Login API Response:', data)

        const token = data.access_token || data.token
        // Handle potential flat response structure where user data is at root
        const rawUser = data.user || data

        // Check if user is active based on DB column 'is_active' (1 = active, 0 = inactive)
        if (rawUser.is_active === 0 || rawUser.is_active === false) {
          console.warn('Login blocked: User is inactive')
          return false
        }

        // Map DB fields to App User Interface
        // DB: firstname, lastname, image, role
        // App: name, avatar, role
        const userData: User = {
          id: rawUser.id?.toString() || rawUser.userId?.toString(),
          email: rawUser.email || email,
          token,
          role: rawUser.role || 'user',
          name: rawUser.name || `${rawUser.firstname || ''} ${rawUser.lastname || ''}`.trim(),
          avatar: rawUser.image || rawUser.avatar,
          enrolledShops: rawUser.enrolledShops
        }
        
        localStorage.setItem('ikigai_token', token)
        localStorage.setItem('ikigai_user', JSON.stringify(userData))
        if (data.sessionId) localStorage.setItem('ikigai_session', data.sessionId)
        setUser(userData)
        return true
      }

      // Log the specific error message from the backend to the console
      const errorData = await response.json().catch(() => null)
      console.error('Login failed details:', response.status, errorData)
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    login,
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
