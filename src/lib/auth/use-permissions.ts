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
      /** Sidebar section — a divider is drawn between sections. */
      group: 1 | 2 | 3 | 4
    }

    // Order within a group follows the dashboard design; items the design doesn't show
    // (Sous-catégories, Sliders, Enrôleurs, …) sit at the end of the group they belong to.
    const allItems: NavItem[] = [
      // 1 — catalogue
      { name: 'Tableau de bord', href: '/', icon: 'LayoutDashboard', permission: 'VIEW_DASHBOARD', group: 1 },
      { name: 'Prestataires de services', href: '/providers', icon: 'UserSquare', permission: 'READ_PROVIDER', group: 1 },
      { name: 'Boutiques', href: '/shops', icon: 'Store', permission: 'READ_SHOP', group: 1 },
      { name: 'Mes prestations', href: '/shop-services', icon: 'CalendarCheck', permission: 'READ_SERVICE', group: 1 },
      { name: 'Catégories & Offres', href: '/categories', icon: 'Tag', permission: 'MANAGE_CATEGORIES', group: 1 },
      { name: 'Sous-catégories', href: '/sous-categories', icon: 'Layers', permission: 'MANAGE_CATEGORIES', group: 1 },
      { name: 'Offres spéciales', href: '/special-offers', icon: 'Percent', permission: 'MANAGE_SPECIAL_OFFERS', group: 1 },
      { name: 'Sliders', href: '/sliders', icon: 'Image', permission: 'MANAGE_SLIDERS', group: 1 },
      // Enroller specific items
      { name: 'Boutiques enrôlées', href: '/enrolled-shops', icon: 'Store', permission: 'VIEW_ENROLLED_SHOPS', group: 1 },
      { name: 'Enregistrer une boutique', href: '/register-shop', icon: 'Plus', permission: 'SHOW_REGISTER_SHOP_MENU', group: 1 },
      // 2 — people & activity
      { name: 'Réservations', href: '/bookings', icon: 'Calendar', permission: 'READ_BOOKING', group: 2 },
      { name: 'Utilisateurs', href: '/users', icon: 'User', permission: 'MANAGE_USERS', group: 2 },
      { name: 'Marketplace', href: '/marketplace', icon: 'ShoppingBag', permission: 'VIEW_MARKETPLACE', group: 2 },
      { name: 'Gestionnaires', href: '/managers', icon: 'Users', permission: 'MANAGE_MANAGERS', group: 2 },
      { name: 'Enrôleurs', href: '/enrollers', icon: 'UserCheck', permission: 'MANAGE_ENROLLERS', group: 2 },
      { name: 'Parrainage', href: '', icon: 'Gift', permission: 'MANAGE_REFERRALS', group: 2 },
      { name: 'Abonnements prestataires', href: '/abonnements', icon: 'Crown', permission: 'MANAGE_SUBSCRIPTIONS', group: 2 },
      // 3 — orders & money
      { name: 'Commandes', href: '/commandes', icon: 'Package', permission: 'MANAGE_COMMANDES', group: 3 },
      { name: 'Client portefeuille', href: '/client-wallets', icon: 'Wallet', permission: 'MANAGE_CLIENT_WALLETS', group: 3 },
      { name: 'Transactions', href: '/payments', icon: 'CreditCard', permission: 'READ_PAYMENTS', group: 3 },
      { name: 'Retraits', href: '/withdrawals', icon: 'ArrowUpRight', permission: 'MANAGE_WITHDRAWALS', group: 3 },
      { name: 'Mes services', href: '/mi-services', icon: 'Sparkles', permission: 'MANAGE_MI_SERVICES', group: 3 },
      { name: 'Mes services · catégories', href: '/mi-services/categories', icon: 'Tag', permission: 'MANAGE_MI_SERVICES', group: 3 },
      { name: 'Mes services · commandes', href: '/mi-services/orders', icon: 'ClipboardList', permission: 'MANAGE_MI_SERVICE_ORDERS', group: 3 },
      // 4 — platform
      { name: 'Analyses', href: '/analytics', icon: 'BarChart3', permission: 'VIEW_ANALYTICS', group: 4 },
      { name: 'Notifications', href: '/notifications', icon: 'Bell', permission: 'SEND_NOTIFICATIONS', group: 4 },
      { name: 'Utilisation des apps', href: '/app-usage', icon: 'Smartphone', permission: 'VIEW_APP_USAGE', group: 4 },
      { name: 'Géolocalisation', href: '/geolocation', icon: 'MapPin', permission: 'MANAGE_GEOLOCATION', group: 4 },
      { name: 'Paramètres', href: '/settings', icon: 'Settings', permission: 'MANAGE_SETTINGS', group: 4 },
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
    isDesigner: user?.role === 'designer',
    can,
    canAccess,
    getNavigationItems,
    userRole: user?.role as UserRole | undefined,
  }
}
