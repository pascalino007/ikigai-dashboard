'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  type LucideIcon,
  LayoutDashboard,
  Users,
  UserSquare,
  Store,
  CalendarCheck,
  Calendar,
  BarChart3,
  Settings,
  X,
  User,
  CreditCard,
  Percent,
  Plus,
  UserCheck,
  ShoppingBag,
  Wallet,
  Bell,
  ArrowUpRight,
  Sparkles,
  ClipboardList,
  Tag,
  Smartphone,
  Layers,
  Image as ImageIcon,
  Gift,
  Crown,
  Package,
  MapPin,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/lib/auth/use-permissions'
import { useSidebarCollapsed } from '@/lib/sidebar-store'
import { IkigaiKWatermark, IkigaiLogo, IkigaiMark } from '@/components/brand/ikigai-logo'

// Icon mapping for dynamic navigation (names come from use-permissions)
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserSquare,
  Store,
  CalendarCheck,
  Calendar,
  BarChart3,
  Settings,
  User,
  CreditCard,
  Percent,
  Plus,
  UserCheck,
  ShoppingBag,
  Wallet,
  Bell,
  ArrowUpRight,
  Sparkles,
  ClipboardList,
  Tag,
  Smartphone,
  Layers,
  Image: ImageIcon,
  Gift,
  Crown,
  Package,
  MapPin,
}

// Where "Aide" and the help card lead. Left unset, both are hidden rather than pointing nowhere.
const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors'

interface SidebarProps {
  /** Off-canvas drawer state below xl (owned by DashboardLayout so the top bar can open it). */
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { getNavigationItems } = usePermissions()
  const [collapsed, toggleCollapsed] = useSidebarCollapsed()
  const activeRef = useRef<HTMLAnchorElement>(null)

  const items = getNavigationItems()

  // Highlight the closest matching route so /shops/12 still lights up "Boutiques".
  const activeHref = items
    .filter((i) => i.href && (pathname === i.href || (i.href !== '/' && pathname.startsWith(i.href + '/'))))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  const groups = [1, 2, 3, 4]
    .map((g) => items.filter((i) => i.group === g))
    .filter((g) => g.length > 0)

  // The sidebar is re-created on every navigation; keep the current page in view in long menus.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [])

  const labelClass = cn(collapsed && 'xl:hidden')
  const itemLayout = cn(collapsed && 'xl:justify-center xl:px-0')

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 xl:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden text-white',
          'bg-gradient-to-b from-sidebar-from to-sidebar-to',
          'transition-[transform,width] duration-300 ease-in-out',
          'xl:sticky xl:top-0 xl:h-screen xl:shrink-0 xl:translate-x-0',
          collapsed && 'xl:w-[76px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* The "k" of the logo, oversized and cropped by the edge */}
        <IkigaiKWatermark className="pointer-events-none absolute -right-28 top-[38%] h-[430px] w-auto text-white/[0.05]" />

        {/* Logo + collapse */}
        <div
          className={cn(
            'relative flex h-[76px] shrink-0 items-center justify-between px-5',
            collapsed && 'xl:h-auto xl:flex-col xl:justify-center xl:gap-3 xl:px-0 xl:py-5',
          )}
        >
          <Link href="/" onClick={onMobileClose} aria-label="ikigai — tableau de bord">
            <IkigaiLogo
              markClassName="h-9"
              wordmarkClassName={cn('text-white', labelClass)}
              className={cn(collapsed && 'xl:gap-0')}
            />
          </Link>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 xl:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white xl:inline-flex"
            aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
            title={collapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="ik-sidebar-scroll relative flex-1 overflow-y-auto px-4 pb-4">
          {groups.map((group, gi) => (
            <div key={gi} className={cn(gi > 0 && 'mt-3 border-t border-white/25 pt-3')}>
              <div className="space-y-0.5">
                {group.map((item) => {
                  const Icon = iconMap[item.icon] ?? LayoutDashboard
                  const isActive = item.href !== '' && item.href === activeHref
                  const content = (
                    <>
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                      <span className={cn('truncate', labelClass)}>{item.name}</span>
                    </>
                  )

                  // Entries without a page yet (e.g. Parrainage) render inert instead of linking to nowhere.
                  if (!item.href) {
                    return (
                      <div
                        key={item.name}
                        title={collapsed ? item.name : undefined}
                        className={cn(linkBase, itemLayout, 'cursor-default text-white/50')}
                      >
                        {content}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      ref={isActive ? activeRef : undefined}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onMobileClose}
                      className={cn(
                        linkBase,
                        itemLayout,
                        isActive
                          ? 'bg-white/[0.18] text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {content}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {SUPPORT_URL && (
            <div className="mt-3 border-t border-white/25 pt-3">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                title={collapsed ? 'Aide' : undefined}
                className={cn(linkBase, itemLayout, 'text-white/80 hover:bg-white/10 hover:text-white')}
              >
                <HelpCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                <span className={labelClass}>Aide</span>
              </a>
            </div>
          )}
        </nav>

        {/* Help card */}
        {SUPPORT_URL && (
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            title={collapsed ? "Besoin d'aide ?" : undefined}
            className={cn(
              'relative m-4 mt-1 flex items-center gap-3 rounded-xl border border-white/25 bg-white/[0.06] p-3 transition-colors hover:bg-white/10',
              collapsed && 'xl:mx-3 xl:justify-center xl:p-2',
            )}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white">
              <IkigaiMark className="h-6 text-ikigai-primary" />
            </span>
            <span className={cn('min-w-0 flex-1', labelClass)}>
              <span className="block text-[13px] font-semibold leading-tight">Besoin d&apos;aide ?</span>
              <span className="block text-[11px] leading-snug text-white/70">Notre équipe est là pour vous</span>
            </span>
            <ChevronRight className={cn('h-4 w-4 shrink-0 text-white/80', labelClass)} />
          </a>
        )}
      </aside>
    </>
  )
}
