import { useAuth } from './auth-context'
import { hasPermission, PERMISSIONS } from './permissions'
import type { UserRole } from './permissions'

export function usePermissions() {
  const { user } = useAuth()

  const can = (permission: keyof typeof PERMISSIONS): boolean => {
    return hasPermission(user, permission)
  }

  const canAccess = {
    dashboard: can('VIEW_DASHBOARD'),
    providers: can('READ_PROVIDER'),
    shops: can('READ_SHOP'),
    shopServices: can('READ_SERVICE'),
    specialOffers: can('MANAGE_SPECIAL_OFFERS'),
    categories: can('MANAGE_CATEGORIES'),
    sliders: can('MANAGE_SLIDERS'),
    bookings: can('READ_BOOKING'),
    payments: can('READ_PAYMENTS'),
    users: can('MANAGE_USERS'),
    analytics: can('VIEW_ANALYTICS'),
    settings: can('MANAGE_SETTINGS'),
    // Enroller specific
    enrolledShops: can('VIEW_ENROLLED_SHOPS'),
    clientWallets: can('MANAGE_CLIENT_WALLETS'),
    otpCodes: can('VIEW_OTP_CODES'),
  }

  const getNavigationItems = () => {
    if (!user) return []

    type NavItem = {
      name: string
      href: string
      icon: string
      permission: keyof typeof PERMISSIONS
    }

    const allItems: NavItem[] = [
      { name: 'Dashboard', href: '/', icon: 'LayoutDashboard', permission: 'VIEW_DASHBOARD' },
      { name: 'Service Providers', href: '/providers', icon: 'Users', permission: 'READ_PROVIDER' },
      { name: 'Shops', href: '/shops', icon: 'Store', permission: 'READ_SHOP' },
      { name: 'My Services', href: '/shop-services', icon: 'Wrench', permission: 'READ_SERVICE' },
      { name: 'Sous-Categories', href: '/sous-categories', icon: 'Wrench', permission: 'MANAGE_CATEGORIES' },
      { name: 'Special Offers', href: '/special-offers', icon: 'Percent', permission: 'MANAGE_SPECIAL_OFFERS' },
      { name: 'Categories', href: '/categories', icon: 'Scissors', permission: 'MANAGE_CATEGORIES' },
      { name: 'Sliders', href: '/sliders', icon: 'Scissors', permission: 'MANAGE_SLIDERS' },
      { name: 'Bookings', href: '/bookings', icon: 'Calendar', permission: 'READ_BOOKING' },
      { name: 'Transactions', href: '/payments', icon: 'CreditCard', permission: 'READ_PAYMENTS' },
      { name: 'Users', href: '/users', icon: 'Users', permission: 'MANAGE_USERS' },
      { name: 'Marketplace', href: '/marketplace', icon: 'Users', permission: 'VIEW_MARKETPLACE' },
      { name: 'Enrollers', href: '/enrollers', icon: 'Users', permission: 'MANAGE_ENROLLERS' },
      { name: 'Managers', href: '/managers', icon: 'Users', permission: 'MANAGE_MANAGERS' },
      { name: 'Parrainnage', href: '', icon: 'Users', permission: 'MANAGE_REFERRALS' },
      { name: 'Abonnements Prestaires', href: '/abonnements', icon: 'Users', permission: 'MANAGE_SUBSCRIPTIONS' },
      { name: 'Commandes', href: '/commandes', icon: 'ShoppingBag', permission: 'MANAGE_COMMANDES' },
      { name: 'Portefeuille Client', href: '/client-wallets', icon: 'Wallet', permission: 'MANAGE_CLIENT_WALLETS' },
      { name: 'Retraits', href: '/withdrawals', icon: 'ArrowUpRight', permission: 'MANAGE_WITHDRAWALS' },
      { name: 'Mi Services', href: '/mi-services', icon: 'Sparkles', permission: 'MANAGE_MI_SERVICES' },
      { name: 'Mi Services Catégories', href: '/mi-services/categories', icon: 'Tag', permission: 'MANAGE_MI_SERVICES' },
      { name: 'Mi Services Commandees', href: '/mi-services/orders', icon: 'ClipboardList', permission: 'MANAGE_MI_SERVICE_ORDERS' },
      { name: 'OTP Codes', href: '/otp', icon: 'Key', permission: 'VIEW_OTP_CODES' },
      { name: 'Notifications', href: '/notifications', icon: 'Bell', permission: 'SEND_NOTIFICATIONS' },
      { name: 'Analytics', href: '/analytics', icon: 'BarChart3', permission: 'VIEW_ANALYTICS' },
      { name: 'Settings', href: '/settings', icon: 'Settings', permission: 'MANAGE_SETTINGS' },
      { name: 'Geolocation', href: '/geolocation', icon: 'Settings', permission: 'MANAGE_GEOLOCATION' },
      // Enroller specific items
      { name: 'Enrolled Shops', href: '/enrolled-shops', icon: 'Store', permission: 'VIEW_ENROLLED_SHOPS' },
      { name: 'Register Shop', href: '/register-shop', icon: 'Plus', permission: 'CREATE_SHOP' },
    ]

    // The original list had some duplicate items; this ensures each nav item appears only once.
    const uniqueItems = allItems.filter(
      (item, index, self) => index === self.findIndex((t) => t.name === item.name)
    )

    return uniqueItems.filter((item) => hasPermission(user, item.permission))
  }

  return {
    // It can be useful to export these for quick checks in the UI
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isEnroller: user?.role === 'enroller',
    can,
    canAccess,
    getNavigationItems,
    userRole: user?.role as UserRole | undefined,
  }
}
