'use client'

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
  const router = useRouter()
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // 15 minutes inactivity timeout
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000

  const logout = useCallback(() => {
    localStorage.removeItem('ikigai_token')
    localStorage.removeItem('ikigai_user')
    setUser(null)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    router.push('/auth/login')
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:4040/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.access_token || data.token
        const userData = { email, token, ...data.user }
        
        localStorage.setItem('ikigai_token', token)
        localStorage.setItem('ikigai_user', JSON.stringify(userData))
        setUser(userData)
        return true
      }
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
