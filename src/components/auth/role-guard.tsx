'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { hasPermission, canAccess, UserRole } from '@/lib/auth/permissions'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  permission?: keyof typeof import('@/lib/auth/permissions').PERMISSIONS
  requiredRole?: UserRole
  fallback?: ReactNode
}

export function RoleGuard({ children, permission, requiredRole, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  // Check permission if provided
  if (permission && !hasPermission(user, permission)) {
    return <>{fallback}</>
  }

  // Check role if provided
  if (requiredRole && !canAccess(user, requiredRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
