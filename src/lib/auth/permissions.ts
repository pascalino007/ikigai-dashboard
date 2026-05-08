export type UserRole = 'admin' | 'manager' | 'staff' | 'enroller' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export const PERMISSIONS = {
  // General
  VIEW_DASHBOARD: ['admin', 'manager', 'enroller'],

  // Provider management
  CREATE_PROVIDER: ['admin', 'manager'],
  READ_PROVIDER: ['admin', 'manager', 'staff'],
  UPDATE_PROVIDER: ['admin', 'manager'],
  DELETE_PROVIDER: ['admin'],

  // Shop management
  CREATE_SHOP: ['admin', 'manager', 'enroller'],
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

  // NOTE: Add other permissions based on application features
  // Examples from use-permissions.ts:
  MANAGE_CATEGORIES: ['admin', 'manager', 'enroller'],
  MANAGE_SPECIAL_OFFERS: ['admin'],
  MANAGE_SLIDERS: ['admin'],
  READ_PAYMENTS: ['admin', 'manager'],
  VIEW_MARKETPLACE: ['admin', 'manager'],
  MANAGE_ENROLLERS: ['admin', 'manager'],
  MANAGE_MANAGERS: ['admin'],
  MANAGE_REFERRALS: ['admin', 'manager'],
  MANAGE_SUBSCRIPTIONS: ['admin', 'manager'],
  MANAGE_GEOLOCATION: ['admin'],
  VIEW_ENROLLED_SHOPS: ['enroller'],
  MANAGE_COMMANDES: ['admin', 'manager'],
  MANAGE_CLIENT_WALLETS: ['admin'],
  VIEW_OTP_CODES: ['admin'],
} as const

export function hasPermission(user: User | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!user) return false
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(user.role)
}

export function canAccess(user: User | null, requiredRole?: UserRole): boolean {
  if (!user) return false
  if (!requiredRole) return true
  
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    staff: 1,
    enroller: 1,
    user: 0
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}
