'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'enroller'
  avatar?: string
  enrolledShops?: number // For enrollers to track their enrolled shops
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user credentials for demonstration
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@ikigai.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
    avatar: undefined
  },
  {
    id: '2',
    email: 'manager@ikigai.com',
    password: 'manager123',
    name: 'Manager User',
    role: 'manager' as const,
    avatar: undefined
  },
  {
    id: '3',
    email: 'enroller@ikigai.com',
    password: 'enroller123',
    name: 'Enroller User',
    role: 'enroller' as const,
    avatar: undefined,
    enrolledShops: 5
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const savedUser = localStorage.getItem('ikigai_user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('ikigai_user')
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock authentication logic
    const foundUser = MOCK_USERS.find(user => 
      user.email === email && user.password === password
    )
    
    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        avatar: foundUser.avatar,
        enrolledShops: foundUser.enrolledShops
      }
      
      setUser(userData)
      localStorage.setItem('ikigai_user', JSON.stringify(userData))
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ikigai_user')
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
