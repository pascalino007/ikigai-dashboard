'use client'

import Link from 'next/link'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentActivity } from '@/components/recent-activity'
import { RevenueChart } from '@/components/revenue-chart'
import { DashboardLayout } from '@/components/dashboard-layout'
import { IkigaiMark } from '@/components/brand/ikigai-logo'
import { useAuth } from '@/lib/auth/auth-context'
import { usePermissions } from '@/lib/auth/use-permissions'
import { RouteGuard } from '@/components/auth/route-guard'
import {
  type LucideIcon,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Plus,
  Store,
  Tag,
  UserSquare,
  Users,
  Zap,
} from 'lucide-react'

interface QuickActionProps {
  href: string
  icon: LucideIcon
  title: string
  subtitle: string
}

function QuickAction({ href, icon: Icon, title, subtitle }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-ikigai-primary/30 hover:shadow-card"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ikigai-light text-ikigai-primary dark:bg-ikigai-teal/15 dark:text-ikigai-teal">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { isAdmin, isManager, isEnroller } = usePermissions()

  const firstName = user?.name?.trim().split(' ')[0]

  const greeting = (
    <div className="flex items-center gap-4">
      <IkigaiMark className="hidden h-11 shrink-0 text-ikigai-primary dark:text-ikigai-teal sm:block" />
      <div className="min-w-0">
        <h1 className="truncate text-[26px] font-bold leading-tight text-foreground">
          Bonjour{firstName ? ` ${firstName}` : ''} !
        </h1>
        <p className="truncate text-sm text-muted-foreground">
          Voici un aperçu de la gestion de votre plateforme Ikigai.
        </p>
      </div>
    </div>
  )

  return (
    <RouteGuard>
      <DashboardLayout header={greeting}>
        <div className="space-y-5 px-4 pb-4 pt-1 sm:px-6">
          {/* Statistics Cards */}
          <DashboardStats />

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]">
            <RevenueChart />
            <RecentActivity />
          </div>

          {/* Role-specific Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-ikigai-primary dark:text-ikigai-teal" strokeWidth={2.25} />
              <h3 className="text-lg font-bold text-foreground">Actions rapides</h3>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {isAdmin && (
                <>
                  <QuickAction href="/providers" icon={UserSquare} title="Gérer les prestataires" subtitle="Ajouter, modifier, consulter" />
                  <QuickAction href="/special-offers" icon={Tag} title="Offres spéciales" subtitle="Créer et gérer vos promotions" />
                  <QuickAction href="/analytics" icon={BarChart3} title="Analyses" subtitle="Voir les statistiques" />
                  <QuickAction href="/users" icon={Users} title="Gérer les utilisateurs" subtitle="Comptes et permissions" />
                </>
              )}

              {(isAdmin || isManager) && (
                <>
                  <QuickAction href="/shops" icon={Store} title="Gérer les boutiques" subtitle="Boutiques et catalogues" />
                  <QuickAction href="/shop-services" icon={CalendarCheck} title="Gérer les services" subtitle="Services disponibles" />
                  <QuickAction href="/bookings" icon={CalendarDays} title="Voir les réservations" subtitle="Toutes les réservations" />
                  <QuickAction href="/payments" icon={CreditCard} title="Voir les paiements" subtitle="Transactions et retraits" />
                </>
              )}

              {isEnroller && (
                <>
                  <QuickAction href="/enrolled-shops" icon={Store} title="Mes boutiques enrôlées" subtitle="Boutiques que vous avez inscrites" />
                  <QuickAction href="/register-shop" icon={Plus} title="Enregistrer une boutique" subtitle="Inscrire une nouvelle boutique" />
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
