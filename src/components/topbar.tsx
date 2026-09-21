'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, Camera, ChevronDown, LogOut, Menu, Moon, Search, Sun } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { usePermissions } from '@/lib/auth/use-permissions'
import { useTheme } from '@/lib/theme-context'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  enroller: 'Enrôleur',
  designer: 'Designer',
  provider: 'Prestataire',
}

const menuItem =
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-muted'

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Jump-to-page search over the sections this user can open. */
function PageSearch({ className }: { className?: string }) {
  const router = useRouter()
  const { getNavigationItems } = usePermissions()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = strip(query.trim())
    if (!q) return []
    return getNavigationItems()
      .filter((i) => i.href && strip(i.name).includes(q))
      .slice(0, 6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const go = (href: string) => {
    setQuery('')
    setOpen(false)
    router.push(href)
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].href)
          if (e.key === 'Escape') {
            setQuery('')
            e.currentTarget.blur()
          }
        }}
        placeholder="Rechercher une page..."
        aria-label="Rechercher une page"
        className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-foreground shadow-card placeholder:text-muted-foreground focus:border-ikigai-primary/40 focus:outline-none focus:ring-2 focus:ring-ikigai-primary/15"
      />
      {open && query.trim() && (
        // onMouseDown keeps the input focused so the click lands before onBlur closes the list
        <ul
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Aucune page trouvée</li>
          ) : (
            results.map((r) => (
              <li key={r.name}>
                <button
                  type="button"
                  onClick={() => go(r.href)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {r.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

function UserMenu() {
  const router = useRouter()
  const { user, logout, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const name = user?.name || user?.email || ''
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? ''

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Any signed-in user (enroller included) can change their own picture.
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file || !user?.id) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${API_BASE_URL}/auth/${user.id}/profile-image`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      if (data?.imageUrl) updateUser({ avatar: data.imageUrl })
    } catch (err) {
      console.error('Avatar upload failed:', err)
      alert('Impossible de mettre à jour la photo de profil')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {/* Lives outside the menu content so it survives the menu closing */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl py-1 pl-1 pr-2 outline-none transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-ikigai-primary/30 dark:hover:bg-white/5"
            aria-label="Menu du compte"
          >
            <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-ikigai-primary text-sm font-semibold text-white">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
              {uploading && (
                <span className="absolute inset-0 grid place-items-center bg-black/50">
                  <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                </span>
              )}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[140px] truncate text-sm font-semibold leading-tight text-foreground">{name}</span>
              <span className="block text-xs text-muted-foreground">{roleLabel}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 w-60 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
          >
            <div className="px-2.5 py-2">
              <p className="truncate text-sm font-semibold">{name}</p>
              {user?.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Item className={menuItem} onSelect={() => fileRef.current?.click()}>
              <Camera className="h-4 w-4 text-muted-foreground" />
              Changer ma photo
            </DropdownMenu.Item>
            <DropdownMenu.Item className={menuItem} onSelect={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Item
              className={cn(menuItem, 'text-red-600 data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-500/10')}
              onSelect={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  )
}

interface TopbarProps {
  onMenuClick: () => void
  /** Left slot — the home page puts its greeting here; other pages leave it empty. */
  children?: React.ReactNode
}

export function Topbar({ onMenuClick, children }: TopbarProps) {
  const { can } = usePermissions()

  return (
    <header className="flex min-h-[72px] items-center gap-3 px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground shadow-card xl:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">{children}</div>

      <PageSearch className="hidden w-64 md:block" />

      {can('SEND_NOTIFICATIONS') && (
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-foreground transition-colors hover:bg-black/[0.04] dark:hover:bg-white/5"
        >
          <Bell className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </Link>
      )}

      <UserMenu />
    </header>
  )
}
