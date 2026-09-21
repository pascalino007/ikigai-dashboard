import { useSyncExternalStore } from 'react'

// Every page wraps itself in <DashboardLayout>, so the sidebar is re-created on each
// navigation. Keeping the collapsed flag in a module-level store (mirrored to
// localStorage) means it survives that without a flash of the wrong width.
const KEY = 'ikigai_sidebar_collapsed'
const listeners = new Set<() => void>()
let collapsed: boolean | null = null

function read(): boolean {
  if (collapsed === null) {
    try {
      collapsed = localStorage.getItem(KEY) === '1'
    } catch {
      collapsed = false
    }
  }
  return collapsed
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useSidebarCollapsed(): [boolean, () => void] {
  // Server and hydration render expanded; the client value takes over right after.
  const value = useSyncExternalStore(subscribe, read, () => false)
  const toggle = () => {
    collapsed = !read()
    try {
      localStorage.setItem(KEY, collapsed ? '1' : '0')
    } catch {}
    listeners.forEach((l) => l())
  }
  return [value, toggle]
}
