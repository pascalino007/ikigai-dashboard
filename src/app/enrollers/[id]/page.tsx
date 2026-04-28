'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Store, Star, Calendar, Phone, Mail, User, Shield, ToggleLeft, ToggleRight, Loader2, ExternalLink } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'
import { API_BASE_URL } from '@/services/api'

interface EnrollerDetail {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  image: string
  is_active: boolean
  points: number
  superior_id: number | null
  superiorName: string | null
  createdAt: string
  shops: Shop[]
}

interface Shop {
  id: number
  name: string
  category: string
  ville: string
  quartier: string
  phone: string
  grade: string
  is_active: boolean
  profileImageUrl: string | null
  createdAt: string
}

const GRADE_POINTS: Record<string, number> = { basic: 10, pro: 30, elite: 50 }
const GRADE_COLOR: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-700',
  pro: 'bg-blue-100 text-blue-700',
  elite: 'bg-purple-100 text-purple-700',
}

export default function EnrollerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const enrollerId = params.id as string

  const [data, setData] = useState<EnrollerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/enrollers/${enrollerId}`)
      if (!res.ok) throw new Error('Enroller introuvable')
      setData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [enrollerId])

  const handleToggle = async () => {
    if (!data) return
    setToggling(true)
    await fetch(`${API_BASE_URL}/enrollers/${data.id}/toggle-active`, { method: 'PATCH' })
    await load()
    setToggling(false)
  }

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['admin', 'manager']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-ikigai-primary" />
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

  if (error || !data) {
    return (
      <RouteGuard allowedRoles={['admin', 'manager']}>
        <DashboardLayout>
          <div className="p-6 text-center py-20">
            <p className="text-gray-500 mb-4">{error || 'Introuvable'}</p>
            <Button onClick={() => router.push('/enrollers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

  const totalPoints = data.shops.reduce((s, sh) => s + (GRADE_POINTS[sh.grade] || 10), 0)

  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/enrollers')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden border-2 border-white shadow">
                  {data.image ? (
                    <img src={data.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {data.firstname[0]}{data.lastname[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {data.firstname} {data.lastname}
                  </h1>
                  <p className="text-gray-500 text-sm">Enroller · Créé le {new Date(data.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${data.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {data.is_active ? 'Actif' : 'Inactif'}
              </span>
              <Button variant="outline" size="sm" onClick={handleToggle} disabled={toggling}>
                {toggling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : data.is_active ? (
                  <ToggleRight className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 mr-2 text-red-500" />
                )}
                {data.is_active ? 'Désactiver' : 'Activer'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Info + Stats */}
            <div className="space-y-6">
              {/* Contact */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Informations</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{data.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{data.phone}</span>
                  </div>
                  {data.superiorName && (
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Supérieur : <strong>{data.superiorName}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Membre depuis {new Date(data.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Store className="h-4 w-4" />
                      Shops enrôlés
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.shops.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 text-amber-500" />
                      Points totaux
                    </div>
                    <span className="text-lg font-bold text-amber-600">{data.points}</span>
                  </div>
                  <div className="pt-3 border-t dark:border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Répartition par grade</p>
                    {(['basic', 'pro', 'elite'] as const).map(g => {
                      const count = data.shops.filter(s => s.grade === g).length
                      return (
                        <div key={g} className="flex items-center justify-between text-xs py-1">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${GRADE_COLOR[g]}`}>{g} (+{GRADE_POINTS[g]} pts)</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{count} shop{count !== 1 ? 's' : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Enrolled Shops */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow">
                <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Shops enrôlés ({data.shops.length})
                  </h3>
                </div>
                {data.shops.length === 0 ? (
                  <div className="p-12 text-center">
                    <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun shop enrôlé pour l'instant</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.shops.map((shop) => (
                      <div
                        key={shop.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => router.push(`/shops/${shop.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {shop.profileImageUrl ? (
                              <img src={shop.profileImageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Store className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{shop.name}</p>
                            <p className="text-xs text-gray-500">{shop.category} · {shop.ville}, {shop.quartier}</p>
                            <p className="text-xs text-gray-400">{shop.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLOR[shop.grade]}`}>
                              {shop.grade}
                            </span>
                            <p className="text-xs text-amber-600 font-semibold mt-1">+{GRADE_POINTS[shop.grade] || 10} pts</p>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${shop.is_active ? 'bg-green-500' : 'bg-red-400'}`} title={shop.is_active ? 'Actif' : 'Inactif'} />
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
