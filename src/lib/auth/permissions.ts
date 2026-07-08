export type UserRole = 'admin' | 'manager' | 'staff' | 'enroller' | 'designer' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export const PERMISSIONS = {
  // General
  VIEW_DASHBOARD: ['admin', 'manager', 'enroller', 'designer'],

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
  MANAGE_SETTINGS: ['admin', 'manager'],
  MANAGE_USERS: ['admin', 'manager'],

  // NOTE: Add other permissions based on application features
  // Examples from use-permissions.ts:
  MANAGE_CATEGORIES: ['admin', 'manager', 'enroller'],
  MANAGE_SPECIAL_OFFERS: ['admin', 'manager'],
  // Designers manage the app's visual content (sliders, songs).
  MANAGE_SLIDERS: ['admin', 'designer'],
  READ_PAYMENTS: ['admin', 'manager'],
  VIEW_MARKETPLACE: ['admin', 'manager'],
  MANAGE_ENROLLERS: ['admin', 'manager'],
  MANAGE_MANAGERS: ['admin'],
  MANAGE_REFERRALS: ['admin', 'manager'],
  MANAGE_SUBSCRIPTIONS: ['admin'],
  MANAGE_GEOLOCATION: ['admin'],
  VIEW_ENROLLED_SHOPS: ['enroller'],
  MANAGE_COMMANDES: ['admin', 'manager'],
  MANAGE_CLIENT_WALLETS: ['admin'],
  MANAGE_WITHDRAWALS: ['admin', 'manager'],
  VIEW_OTP_CODES: ['admin'],
  SEND_NOTIFICATIONS: ['admin', 'manager'],
  MANAGE_MI_SERVICES: ['admin'],
  MANAGE_MI_SERVICE_ORDERS: ['admin', 'manager'],
  VIEW_APP_USAGE: ['admin'],
  // Nav-only visibility for the "Register Shop" menu (admins manage shops elsewhere).
  SHOW_REGISTER_SHOP_MENU: ['enroller'],
} as const

// Accepts any user-shaped object (the auth context's User has an optional
// role), so both User types in the app can be passed in.
export function hasPermission(user: { role?: string } | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!user?.role) return false
  return (PERMISSIONS[permission] as readonly string[]).includes(user.role)
}

export function canAccess(user: { role?: string } | null, requiredRole?: UserRole): boolean {
  if (!user?.role) return false
  if (!requiredRole) return true

  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    staff: 1,
    enroller: 1,
    designer: 1,
    user: 0
  }

  return (roleHierarchy[user.role as UserRole] ?? 0) >= roleHierarchy[requiredRole]
}
