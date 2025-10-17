'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { usePermissions } from '@/lib/auth/use-permissions'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'enroller'
  allowedRoles?: ('admin' | 'manager' | 'enroller')[]
  fallbackPath?: string
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  allowedRoles, 
  fallbackPath = '/login' 
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { isAdmin, isManager, isEnroller } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // Wait for auth to load

    if (!isAuthenticated) {
      router.push(fallbackPath)
      return
    }

    // Check role-based access
    if (requiredRole) {
      const hasRequiredRole = 
        (requiredRole === 'admin' && isAdmin) ||
        (requiredRole === 'manager' && isManager) ||
        (requiredRole === 'enroller' && isEnroller)

      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (isAdmin) router.push('/')
        else if (isManager) router.push('/')
        else if (isEnroller) router.push('/enrolled-shops')
        else router.push(fallbackPath)
        return
      }
    }

    // Check if user has any of the allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some(role => {
        if (role === 'admin') return isAdmin
        if (role === 'manager') return isManager
        if (role === 'enroller') return isEnroller
        return false
      })

      if (!hasAllowedRole) {
        // Redirect to appropriate dashboard based on user role
        if (isAdmin) router.push('/')
        else if (isManager) router.push('/')
        else if (isEnroller) router.push('/enrolled-shops')
        else router.push(fallbackPath)
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, allowedRoles, isAdmin, isManager, isEnroller, router, fallbackPath])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-primary"></div>
      </div>
    )
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="admin">
      {children}
    </RouteGuard>
  )
}

export function ManagerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="manager">
      {children}
    </RouteGuard>
  )
}

export function EnrollerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="enroller">
      {children}
    </RouteGuard>
  )
}

export function AdminOrManager({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      {children}
    </RouteGuard>
  )
}
