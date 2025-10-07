'use client'

import { DashboardStats } from '@/components/dashboard-stats'
import { RecentActivity } from '@/components/recent-activity'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RoleGuard } from '@/components/auth/role-guard'
import { useAuth } from '@/lib/auth/auth-context'

export default function Dashboard() {
  const { user } = useAuth()
  
  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here's your Ikigai management overview
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ikigai-primary text-white">
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RoleGuard permission="CREATE_PROVIDER">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="h-12 w-12 bg-ikigai-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">+</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Provider</p>
                </div>
              </button>
            </RoleGuard>
            <RoleGuard permission="CREATE_SHOP">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="h-12 w-12 bg-ikigai-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">+</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Shop</p>
                </div>
              </button>
            </RoleGuard>
            <RoleGuard permission="CREATE_SERVICE">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="h-12 w-12 bg-ikigai-accent rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">+</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Service</p>
                </div>
              </button>
            </RoleGuard>
            <RoleGuard permission="VIEW_ANALYTICS">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">📊</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">View Reports</p>
                </div>
              </button>
            </RoleGuard>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
