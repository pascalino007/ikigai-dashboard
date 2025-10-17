import { useAuth } from './auth-context'

export function usePermissions() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const isEnroller = user?.role === 'enroller'

  const canAccess = {
    // Admin has access to everything
    dashboard: isAdmin || isManager || isEnroller,
    providers: isAdmin,
    shops: isAdmin || isManager || isEnroller,
    shopServices: isAdmin || isManager || isEnroller,
    specialOffers: isAdmin,
    categories: isAdmin,
    sliders: isAdmin,
    bookings: isAdmin || isManager,
    payments: isAdmin || isManager,
    users: isAdmin,
    analytics: isAdmin || isManager,
    settings: isAdmin,
    // Enroller specific
    enrolledShops: isEnroller,
  }

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: 'LayoutDashboard', roles: ['admin', 'manager', 'enroller'] },
    ]

    if (isAdmin) {
      return [
        ...baseItems,
        { name: 'Service Providers', href: '/providers', icon: 'Users', roles: ['admin'] },
        { name: 'Shops', href: '/shops', icon: 'Store', roles: ['admin', 'manager', 'enroller'] },
        { name: 'My Services', href: '/shop-services', icon: 'Wrench', roles: ['admin', 'manager', 'enroller'] },
        { name: 'Special Offers', href: '/special-offers', icon: 'Percent', roles: ['admin'] },
        { name: 'Categories', href: '/categories', icon: 'Scissors', roles: ['admin'] },
        { name: 'Sliders', href: '/sliders', icon: 'Scissors', roles: ['admin'] },
        { name: 'Bookings', href: '/bookings', icon: 'Calendar', roles: ['admin', 'manager'] },
        { name: 'Payments', href: '/payments', icon: 'CreditCard', roles: ['admin', 'manager'] },
        { name: 'Users', href: '/users', icon: 'Users', roles: ['admin'] },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart3', roles: ['admin', 'manager'] },
        { name: 'Settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
      ]
    }

    if (isManager) {
      return [
        ...baseItems,
        { name: 'Shops', href: '/shops', icon: 'Store', roles: ['admin', 'manager', 'enroller'] },
        { name: 'My Services', href: '/shop-services', icon: 'Wrench', roles: ['admin', 'manager', 'enroller'] },
        { name: 'Bookings', href: '/bookings', icon: 'Calendar', roles: ['admin', 'manager'] },
        { name: 'Payments', href: '/payments', icon: 'CreditCard', roles: ['admin', 'manager'] },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart3', roles: ['admin', 'manager'] },
      ]
    }

    if (isEnroller) {
      return [
        ...baseItems,
        { name: 'Enrolled Shops', href: '/enrolled-shops', icon: 'Store', roles: ['enroller'] },
        { name: 'Register Shop', href: '/register-shop', icon: 'Plus', roles: ['enroller'] },
      ]
    }

    return baseItems
  }

  return {
    isAdmin,
    isManager,
    isEnroller,
    canAccess,
    getNavigationItems,
    userRole: user?.role
  }
}
