'use client'

import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'staff'
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
