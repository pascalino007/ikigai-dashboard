'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ChatWidget } from '@/components/chat-widget'
import { IkigaiLogo } from '@/components/brand/ikigai-logo'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'staff'
  /** Shown at the left of the top bar (the home page's greeting). */
  header?: React.ReactNode
}

function DashboardFooter() {
  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-6 pt-2 sm:px-6">
      <IkigaiLogo
        markClassName="h-5"
        wordmarkClassName="text-base font-semibold"
        className="gap-1.5 text-ikigai-primary dark:text-ikigai-teal"
      />
      <span className="text-xs text-muted-foreground">
        Plateforme sécurisée <span aria-hidden>•</span> Ikigai © {new Date().getFullYear()}
      </span>
    </footer>
  )
}

export function DashboardLayout({ children, requiredRole, header }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="flex min-h-screen bg-background">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileOpen(true)}>{header}</Topbar>
          <main className="flex-1">{children}</main>
          <DashboardFooter />
        </div>
        <ChatWidget />
      </div>
    </ProtectedRoute>
  )
}
