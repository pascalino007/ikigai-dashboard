'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Users, TrendingUp, RefreshCw, Loader2, CheckCircle, Flame, BarChart3, Eye, Activity } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOrManager } from '@/components/auth/route-guard'
import { API_BASE_URL } from '@/services/api'

interface AppUsageStats {
  totalClients: number
  appUsers: number
  activeClients: number
  adoptionRate: number
  newLast7Days: number
  newLast30Days: number
  signupsByDay: { date: string; count: number }[]
  source: string
  generatedAt: string
}

interface AnalyticsOverview {
  days: number
  totalEvents: number
  screenViews: number
  activeUsers: number
  eventsByName: { name: string; count: number }[]
  topScreens: { screen: string; count: number }[]
  eventsByDay: { date: string; count: number }[]
  generatedAt: string
}

function dayLabel(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function AppUsagePage() {
  const [stats, setStats] = useState<AppUsageStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    // Analytics is best-effort — its failure must not hide the primary stats.
    fetch(`${API_BASE_URL}/analytics/overview?days=14`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAnalytics(d))
      .catch(() => setAnalytics(null))
    try {
      const res = await fetch(`${API_BASE_URL}/auth/stats/app-usage`)
      if (!res.ok) throw new Error(`Erreur ${res.status} lors du chargement des statistiques`)
      setStats(await res.json())
    } catch (err) {
      console.error('Failed to load app usage stats', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const maxCount = stats ? Math.max(...stats.signupsByDay.map((d) => d.count), 1) : 1
  const maxEventDay = analytics ? Math.max(...analytics.eventsByDay.map((d) => d.count), 1) : 1
  const maxEventName = analytics ? Math.max(...analytics.eventsByName.map((d) => d.count), 1) : 1
  const maxScreen = analytics ? Math.max(...analytics.topScreens.map((d) => d.count), 1) : 1

  return (
    <AdminOrManager>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Utilisation de l&apos;application</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Nombre de clients utilisant l&apos;application mobile, mesuré via les enregistrements Firebase (notifications push)
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 self-start"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              Chargement des statistiques...
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 py-12 text-center text-red-500 shadow-sm">
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-3 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Réessayer
              </button>
            </div>
          ) : stats ? (
            <>
              {/* Hero: active app users */}
              <div className="bg-gradient-to-br from-ikigai-primary to-ikigai-primary/80 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Utilisateurs actifs de l&apos;app</span>
                </div>
                <p className="text-5xl font-bold tracking-tight">{stats.appUsers.toLocaleString('fr-FR')}</p>
                <p className="text-sm text-white/80 mt-2">
                  Clients dont l&apos;appareil est enregistré auprès de Firebase — soit {stats.adoptionRate}% des {stats.totalClients.toLocaleString('fr-FR')} comptes clients
                </p>
              </div>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <Users className="h-5 w-5 text-ikigai-primary" />, bg: 'bg-ikigai-primary/10', val: stats.totalClients, label: 'Comptes clients' },
                  { icon: <CheckCircle className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', val: stats.activeClients, label: 'Comptes actifs' },
                  { icon: <Flame className="h-5 w-5 text-orange-500" />, bg: 'bg-orange-50', val: stats.newLast7Days, label: 'Nouveaux (7 jours)' },
                  { icon: <TrendingUp className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50', val: stats.newLast30Days, label: 'Nouveaux (30 jours)' },
                ].map(({ icon, bg, val, label }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{val.toLocaleString('fr-FR')}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adoption bar */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Taux d&apos;adoption de l&apos;app</h3>
                  <span className="text-sm font-semibold text-ikigai-primary">{stats.adoptionRate}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ikigai-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(stats.adoptionRate, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {stats.appUsers.toLocaleString('fr-FR')} appareils enregistrés sur {stats.totalClients.toLocaleString('fr-FR')} comptes clients
                </p>
              </div>

              {/* Signups trend (last 14 days) */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Nouvelles inscriptions (14 derniers jours)</h3>
                <div className="h-56 flex items-end justify-between gap-1.5">
                  {stats.signupsByDay.map((d) => {
                    const heightPercent = (d.count / maxCount) * 100
                    return (
                      <div key={d.date} className="flex flex-col items-center flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{d.count > 0 ? d.count : ''}</div>
                        <div
                          className="w-full bg-ikigai-primary rounded-t transition-all duration-700 ease-out"
                          style={{ height: `${Math.max(heightPercent, 3)}%` }}
                          title={`${dayLabel(d.date)} : ${d.count} inscription(s)`}
                        />
                        <div className="text-[10px] text-gray-400 mt-2 rotate-45 origin-left whitespace-nowrap">{dayLabel(d.date)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Source : Firebase Cloud Messaging · Un « utilisateur actif » est un client dont l&apos;application a enregistré un jeton de notification Firebase.
                Mis à jour le {new Date(stats.generatedAt).toLocaleString('fr-FR')}
              </p>
            </>
          ) : null}

          {/* Analytics — first-party events, also logged to Firebase / Google Analytics */}
          {!loading && !error && analytics && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pt-2">
                <BarChart3 className="h-5 w-5 text-ikigai-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics de l&apos;application</h2>
                <span className="text-xs text-gray-400">· {analytics.days} derniers jours</span>
              </div>

              {/* Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: <Activity className="h-5 w-5 text-ikigai-primary" />, bg: 'bg-ikigai-primary/10', val: analytics.totalEvents, label: 'Événements' },
                  { icon: <Users className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50', val: analytics.activeUsers, label: 'Utilisateurs actifs' },
                  { icon: <Eye className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', val: analytics.screenViews, label: 'Écrans vus' },
                ].map(({ icon, bg, val, label }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{val.toLocaleString('fr-FR')}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top events + top screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Top événements</h3>
                  {analytics.eventsByName.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucun événement sur la période</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.eventsByName.slice(0, 8).map((e) => (
                        <div key={e.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{e.name}</span>
                            <span className="text-gray-500">{e.count.toLocaleString('fr-FR')}</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-ikigai-primary rounded-full" style={{ width: `${(e.count / maxEventName) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Écrans les plus vus</h3>
                  {analytics.topScreens.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucun écran suivi</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topScreens.map((s) => (
                        <div key={s.screen}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{s.screen}</span>
                            <span className="text-gray-500">{s.count.toLocaleString('fr-FR')}</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(s.count / maxScreen) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Events per day */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Événements par jour</h3>
                <div className="h-56 flex items-end justify-between gap-1.5">
                  {analytics.eventsByDay.map((d) => {
                    const h = (d.count / maxEventDay) * 100
                    return (
                      <div key={d.date} className="flex flex-col items-center flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{d.count > 0 ? d.count : ''}</div>
                        <div className="w-full bg-ikigai-primary rounded-t transition-all duration-700 ease-out" style={{ height: `${Math.max(h, 3)}%` }} title={`${dayLabel(d.date)} : ${d.count} événement(s)`} />
                        <div className="text-[10px] text-gray-400 mt-2 rotate-45 origin-left whitespace-nowrap">{dayLabel(d.date)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Source : événements first-party envoyés par l&apos;app mobile (également enregistrés dans Firebase / Google Analytics).
                {analytics.generatedAt ? ` Mis à jour le ${new Date(analytics.generatedAt).toLocaleString('fr-FR')}` : ''}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminOrManager>
  )
}
