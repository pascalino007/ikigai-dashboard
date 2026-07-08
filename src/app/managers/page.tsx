'use client'

import { useState, useEffect } from 'react'
import { Search, X, Users, Store, TrendingUp, Loader2, Award, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOnly } from '@/components/auth/route-guard'
import { API_BASE_URL } from '@/services/api'

// Shapes returned by the backend
interface ApiUser {
  id: number
  firstname: string
  lastname: string
  email: string
  role: string
  image?: string
}
interface ApiEnroller {
  id: number
  firstname: string
  lastname: string
  email: string
  image?: string
  points?: number
  is_active?: boolean
  shopsCount?: number
  superior_id?: number | null
}

// View models built from the two endpoints
interface EnrollerNode {
  id: string
  name: string
  email: string
  avatar?: string
  shopsEnrolled: number
  points: number
  isActive: boolean
}
interface Manager {
  id: string
  name: string
  email: string
  avatar?: string
  enrollersCount: number
  totalShops: number
  enrollers: EnrollerNode[]
}

function fullName(first?: string, last?: string) {
  return `${first ?? ''} ${last ?? ''}`.trim() || 'Sans nom'
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function EnrollerTreeCard({ enroller, index }: { enroller: EnrollerNode; index: number }) {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden shrink-0">
          {enroller.avatar ? (
            <img src={enroller.avatar} alt={enroller.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-white">{initials(enroller.name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{enroller.name}</p>
          <p className="text-xs text-gray-500 truncate">{enroller.email}</p>
        </div>
        <span
          className={`ml-auto shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
            enroller.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {enroller.isActive ? 'Actif' : 'Inactif'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-sm">
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{enroller.shopsEnrolled}</p>
          <p className="text-xs text-gray-500">Shops enrôlés</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{enroller.points}</p>
          <p className="text-xs text-gray-500">Points</p>
        </div>
      </div>
    </div>
  )
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [showTree, setShowTree] = useState(false)

  const loadManagers = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, enrollersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth`),
        fetch(`${API_BASE_URL}/enrollers`),
      ])
      if (!usersRes.ok) throw new Error(`Erreur ${usersRes.status} lors du chargement des utilisateurs`)
      const users: ApiUser[] = await usersRes.json()
      const enrollers: ApiEnroller[] = enrollersRes.ok ? await enrollersRes.json() : []

      // Group enrollers under the manager referenced by their superior_id.
      const enrollersByManager = new Map<string, EnrollerNode[]>()
      for (const e of enrollers) {
        if (e.superior_id == null) continue
        const key = String(e.superior_id)
        const node: EnrollerNode = {
          id: String(e.id),
          name: fullName(e.firstname, e.lastname),
          email: e.email,
          avatar: e.image || undefined,
          shopsEnrolled: e.shopsCount ?? 0,
          points: e.points ?? 0,
          isActive: e.is_active ?? true,
        }
        const list = enrollersByManager.get(key)
        if (list) list.push(node)
        else enrollersByManager.set(key, [node])
      }

      const built: Manager[] = users
        .filter((u) => u.role === 'manager')
        .map((u) => {
          const list = enrollersByManager.get(String(u.id)) ?? []
          return {
            id: String(u.id),
            name: fullName(u.firstname, u.lastname),
            email: u.email,
            avatar: u.image || undefined,
            enrollersCount: list.length,
            totalShops: list.reduce((sum, e) => sum + e.shopsEnrolled, 0),
            enrollers: list,
          }
        })

      setManagers(built)
    } catch (err) {
      console.error('Failed to load managers', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadManagers()
  }, [])

  const filteredManagers = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleManagerImageClick = (manager: Manager) => {
    setSelectedManager(manager)
    setShowTree(true)
  }

  const handleCloseTree = () => {
    setShowTree(false)
    setTimeout(() => setSelectedManager(null), 300)
  }

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Managers</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Cliquez sur la photo d&apos;un manager pour voir son arbre d&apos;enrôleurs et ses statistiques
              </p>
            </div>
            <button
              type="button"
              onClick={loadManagers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un manager..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              Chargement des managers...
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 py-12 text-center text-red-500 shadow-sm">
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={loadManagers}
                className="mt-3 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredManagers.map((manager) => (
                  <div
                    key={manager.id}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex flex-col items-center text-center">
                      <button
                        type="button"
                        onClick={() => handleManagerImageClick(manager)}
                        className="group relative mb-4 focus:outline-none focus:ring-2 focus:ring-ikigai-primary focus:ring-offset-2 rounded-full"
                      >
                        <div className="h-24 w-24 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg transition-transform group-hover:scale-110 group-active:scale-95">
                          {manager.avatar ? (
                            <img src={manager.avatar} alt={manager.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-white">{initials(manager.name)}</span>
                          )}
                        </div>
                        <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors" />
                      </button>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{manager.name}</h3>
                      <p className="text-sm text-gray-500 truncate w-full">{manager.email}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {manager.enrollersCount} enrôleurs
                        </span>
                        <span className="flex items-center gap-1">
                          <Store className="h-4 w-4" />
                          {manager.totalShops} shops
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredManagers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {managers.length === 0 ? 'Aucun manager trouvé' : 'Aucun manager ne correspond à la recherche'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Tree overlay - animated */}
        {showTree && selectedManager && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
            onClick={handleCloseTree}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-zoom-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden">
                    {selectedManager.avatar ? (
                      <img src={selectedManager.avatar} alt={selectedManager.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-white">{initials(selectedManager.name)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedManager.name}</h2>
                    <p className="text-sm text-gray-500">{selectedManager.email}</p>
                    <p className="text-sm text-ikigai-primary font-medium mt-1">
                      {selectedManager.enrollersCount} enrôleurs · {selectedManager.totalShops} shops
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseTree}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Arbre d&apos;enrôleurs
                </h3>
                {selectedManager.enrollers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Award className="h-8 w-8 mb-2" />
                    <p className="text-sm">Ce manager n&apos;a encore aucun enrôleur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedManager.enrollers.map((enroller, idx) => (
                      <div key={enroller.id} className="relative pl-6 border-l-2 border-ikigai-primary/30 ml-4">
                        <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-ikigai-primary" />
                        <EnrollerTreeCard enroller={enroller} index={idx} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AdminOnly>
  )
}
