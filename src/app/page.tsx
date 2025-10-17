'use client'

import { DashboardStats } from '@/components/dashboard-stats'
import { RecentActivity } from '@/components/recent-activity'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth/auth-context'
import { usePermissions } from '@/lib/auth/use-permissions'
import { RouteGuard } from '@/components/auth/route-guard'
import { Button } from '@/components/ui/button'
import { Plus, Store, Users, BarChart3, Calendar, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user } = useAuth()
  const { isAdmin, isManager, isEnroller } = usePermissions()
  const router = useRouter()
  
  return (
    <RouteGuard>
      <DashboardLayout>
        <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Here's your Ikigai management overview
          </p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isAdmin ? 'bg-blue-100 text-blue-800' :
              isManager ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

      <div className="space-y-8">
        {/* Statistics Cards */}
        <DashboardStats />

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart will be implemented here</p>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>

        {/* Role-specific Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAdmin && (
              <>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/providers')}
                >
                  <Users className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">Manage Providers</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/special-offers')}
                >
                  <Plus className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">Special Offers</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/analytics')}
                >
                  <BarChart3 className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">Analytics</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/users')}
                >
                  <Users className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Button>
              </>
            )}

            {(isAdmin || isManager) && (
              <>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/shops')}
                >
                  <Store className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">Manage Shops</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/shop-services')}
                >
                  <Plus className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">Manage Services</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/bookings')}
                >
                  <Calendar className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">View Bookings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/payments')}
                >
                  <CreditCard className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">View Payments</span>
                </Button>
              </>
            )}

            {isEnroller && (
              <>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/enrolled-shops')}
                >
                  <Store className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">My Enrolled Shops</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex flex-col items-center space-y-2"
                  onClick={() => router.push('/register-shop')}
                >
                  <Plus className="h-8 w-8 text-ikigai-primary" />
                  <span className="text-sm font-medium">Register New Shop</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
    </RouteGuard>
  )
}
