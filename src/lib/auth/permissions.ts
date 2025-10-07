export type UserRole = 'admin' | 'manager' | 'staff'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export const PERMISSIONS = {
  // Provider management
  CREATE_PROVIDER: ['admin', 'manager'],
  READ_PROVIDER: ['admin', 'manager', 'staff'],
  UPDATE_PROVIDER: ['admin', 'manager'],
  DELETE_PROVIDER: ['admin'],

  // Shop management
  CREATE_SHOP: ['admin', 'manager'],
  READ_SHOP: ['admin', 'manager', 'staff'],
  UPDATE_SHOP: ['admin', 'manager'],
  DELETE_SHOP: ['admin'],

  // Service management
  CREATE_SERVICE: ['admin', 'manager'],
  READ_SERVICE: ['admin', 'manager', 'staff'],
  UPDATE_SERVICE: ['admin', 'manager'],
  DELETE_SERVICE: ['admin'],

  // Booking management
  CREATE_BOOKING: ['admin', 'manager', 'staff'],
  READ_BOOKING: ['admin', 'manager', 'staff'],
  UPDATE_BOOKING: ['admin', 'manager', 'staff'],
  DELETE_BOOKING: ['admin', 'manager'],

  // Analytics
  VIEW_ANALYTICS: ['admin', 'manager'],
  EXPORT_DATA: ['admin'],

  // Settings
  MANAGE_SETTINGS: ['admin'],
  MANAGE_USERS: ['admin'],
} as const

export function hasPermission(user: User | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!user) return false
  return PERMISSIONS[permission].includes(user.role)
}

export function canAccess(user: User | null, requiredRole?: UserRole): boolean {
  if (!user) return false
  if (!requiredRole) return true
  
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    staff: 1
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}
