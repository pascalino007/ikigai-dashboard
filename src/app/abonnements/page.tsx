'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus, Search, Edit, Trash2, Check, Star, Crown, Zap,
  Calendar, MapPin, Clock, Bell, Wrench, BarChart3,
  Users, Percent, Gift, Smartphone, CreditCard
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOnly } from '@/components/auth/route-guard'

interface Subscription {
  id: number
  plan: string
  price: number
  interval: string
  status: string
  shop_id?: number | null
  user_id?: number | null
  features?: string | null
  max_bookings?: number | null
  next_billing?: string | null
  started_at?: string | null
  ends_at?: string | null
  created_at: string
}

interface SubscriptionPlan {
  id: number
  key: string
  name: string
  subtitle: string
  description: string
  monthly_price: number
  yearly_price: number
  currency: string
  accent_color: string
  is_recommended: boolean
  is_active: boolean
  sort_order: number
  features_json: string | null
}

function parseFeatures(jsonStr: string | null): { category: string; items: string[] }[] {
  if (!jsonStr) return []
  try {
    return JSON.parse(jsonStr) as { category: string; items: string[] }[]
  } catch {
    return []
  }
}

function getIconForPlan(key: string) {
  switch (key) {
    case 'elite': return Crown
    case 'pro': return Star
    default: return Zap
  }
}

function getColorClasses(accentColor: string): { color: string; border: string; accent: string; badge: string } {
  switch (accentColor.toLowerCase()) {
    case '#d4a843':
    case 'gold':
      return {
        color: 'bg-gradient-to-br from-ikigai-gold-light to-white dark:from-ikigai-gold/10 dark:to-gray-900',
        border: 'border-ikigai-gold/40 dark:border-ikigai-gold/40',
        accent: 'text-ikigai-gold',
        badge: 'bg-ikigai-gold text-white',
      }
    case '#002d39':
    case '#004a5a':
      return {
        color: 'bg-gradient-to-br from-ikigai-light to-white dark:from-ikigai-primary/20 dark:to-gray-900',
        border: 'border-ikigai-accent/30 dark:border-ikigai-accent/30',
        accent: 'text-ikigai-primary dark:text-ikigai-teal',
        badge: 'bg-ikigai-primary text-white dark:bg-ikigai-teal dark:text-gray-950',
      }
    default:
      return {
        color: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
        border: 'border-gray-200 dark:border-gray-700',
        accent: 'text-gray-700 dark:text-gray-300',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      }
  }
}

export default function AbonnementsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [plansLoading, setPlansLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [planSaving, setPlanSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'month' | 'year'>('month')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [form, setForm] = useState({
    plan: '', price: '', interval: 'month', status: 'active',
    shop_id: '', user_id: '', max_bookings: '', features: '',
  })
  const [planForm, setPlanForm] = useState({
    key: '', name: '', subtitle: '', description: '',
    monthly_price: '', yearly_price: '', accent_color: '#6B7280',
    is_recommended: false, sort_order: '1',
  })
  interface PlanFeatureGroup {
    category: string
    items: string[]
  }
  const [planFeatures, setPlanFeatures] = useState<PlanFeatureGroup[]>([
    { category: '', items: [] },
  ])

  useEffect(() => {
    fetchSubscriptions()
    fetchPlans()
  }, [])

  async function fetchSubscriptions() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscriptions`)
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPlans() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscriptions/plans`)
      if (res.ok) {
        const data = await res.json()
        setPlans(data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setPlansLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: form.plan,
          price: Number(form.price) || 0,
          interval: form.interval,
          status: form.status,
          shop_id: form.shop_id ? Number(form.shop_id) : null,
          user_id: form.user_id ? Number(form.user_id) : null,
          max_bookings: form.max_bookings ? Number(form.max_bookings) : null,
          features: form.features || null,
        }),
      })
      if (res.ok) {
        setShowModal(false)
        setForm({ plan: '', price: '', interval: 'month', status: 'active', shop_id: '', user_id: '', max_bookings: '', features: '' })
        await fetchSubscriptions()
      } else {
        alert('Failed to create subscription')
      }
    } catch (e) {
      alert('Error creating subscription')
    } finally {
      setSaving(false)
    }
  }

  async function togglePlanActive(plan: SubscriptionPlan) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscriptions/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !plan.is_active }),
      })
      if (res.ok) await fetchPlans()
    } catch (e) {
      console.error(e)
    }
  }

  function openPlanEdit(plan: SubscriptionPlan) {
    setEditingPlan(plan)
    setPlanForm({
      key: plan.key,
      name: plan.name,
      subtitle: plan.subtitle,
      description: plan.description,
      monthly_price: String(plan.monthly_price),
      yearly_price: String(plan.yearly_price),
      accent_color: plan.accent_color,
      is_recommended: plan.is_recommended,
      sort_order: String(plan.sort_order),
    })
    const parsed = parseFeatures(plan.features_json)
    setPlanFeatures(parsed.length > 0 ? parsed : [{ category: '', items: [] }])
    setShowPlanModal(true)
  }

  function resetPlanForm() {
    setEditingPlan(null)
    setPlanForm({
      key: '', name: '', subtitle: '', description: '',
      monthly_price: '', yearly_price: '', accent_color: '#6B7280',
      is_recommended: false, sort_order: '1',
    })
    setPlanFeatures([{ category: '', items: [] }])
  }

  function addFeatureCategory() {
    setPlanFeatures([...planFeatures, { category: '', items: [] }])
  }

  function removeFeatureCategory(idx: number) {
    setPlanFeatures(planFeatures.filter((_g: PlanFeatureGroup, i: number) => i !== idx))
  }

  function updateCategoryName(idx: number, name: string) {
    const next = [...planFeatures]
    next[idx] = { ...next[idx], category: name }
    setPlanFeatures(next)
  }

  function addFeatureItem(groupIdx: number, item: string) {
    if (!item.trim()) return
    const next = [...planFeatures]
    next[groupIdx] = { ...next[groupIdx], items: [...next[groupIdx].items, item.trim()] }
    setPlanFeatures(next)
  }

  function removeFeatureItem(groupIdx: number, itemIdx: number) {
    const next = [...planFeatures]
    next[groupIdx] = { ...next[groupIdx], items: next[groupIdx].items.filter((_s: string, i: number) => i !== itemIdx) }
    setPlanFeatures(next)
  }

  async function handlePlanSave(e: React.FormEvent) {
    e.preventDefault()
    setPlanSaving(true)
    try {
      const cleanedFeatures = planFeatures
        .filter((g: PlanFeatureGroup) => g.category.trim() || g.items.length > 0)
        .map((g: PlanFeatureGroup) => ({ category: g.category.trim(), items: g.items }))
      const body = {
        key: planForm.key,
        name: planForm.name,
        subtitle: planForm.subtitle,
        description: planForm.description,
        monthly_price: Number(planForm.monthly_price) || 0,
        yearly_price: Number(planForm.yearly_price) || 0,
        accent_color: planForm.accent_color,
        is_recommended: planForm.is_recommended,
        sort_order: Number(planForm.sort_order) || 1,
        features_json: cleanedFeatures.length > 0 ? JSON.stringify(cleanedFeatures) : null,
      }
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscriptions/plans`
      const res = editingPlan
        ? await fetch(`${url}/${editingPlan.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        setShowPlanModal(false)
        resetPlanForm()
        await fetchPlans()
      } else {
        alert('Failed to save plan')
      }
    } catch (e) {
      alert('Error saving plan')
    } finally {
      setPlanSaving(false)
    }
  }

  async function deletePlan(id: number) {
    if (!confirm('Supprimer ce forfait ? Cette action est irréversible.')) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subscriptions/plans/${id}`, { method: 'DELETE' })
      if (res.ok) await fetchPlans()
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = subscriptions.filter(sub =>
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold ik-heading">Abonnements</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Gérez les formules d'abonnement et leurs avantages
                </p>
              </div>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel abonnement
              </Button>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex">
              <button
                onClick={() => setActiveTab('month')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'month'
                    ? 'bg-white dark:bg-gray-700 text-ikigai-primary dark:text-ikigai-teal shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setActiveTab('year')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'year'
                    ? 'bg-white dark:bg-gray-700 text-ikigai-primary dark:text-ikigai-teal shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Annuel
              </button>
            </div>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plansLoading ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Chargement des forfaits...</p>
              </div>
            ) : plans.filter((p: SubscriptionPlan) => p.is_active).length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Aucun forfait disponible</p>
              </div>
            ) : (
              plans.filter((p: SubscriptionPlan) => p.is_active).map((plan) => {
                const Icon = getIconForPlan(plan.key)
                const price = activeTab === 'month' ? plan.monthly_price : plan.yearly_price
                const period = activeTab === 'month' ? 'mois' : 'an'
                const isSelected = selectedPlan === plan.key
                const colors = getColorClasses(plan.accent_color)
                const features = parseFeatures(plan.features_json)
                return (
                  <Card
                    key={plan.key}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${colors.color} ${colors.border} ${
                      isSelected ? 'ring-2 ring-ikigai-primary dark:ring-ikigai-teal shadow-xl scale-[1.02]' : ''
                    }`}
                  >
                    {plan.is_recommended && (
                      <div className="absolute top-0 right-0 bg-ikigai-gold text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Recommandé
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors.badge}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className={`text-xl font-bold ${colors.accent}`}>
                            {plan.name}
                          </CardTitle>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {plan.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Price */}
                      <div className="text-center py-4 border-y border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-extrabold ik-heading">
                            {price.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">FCFA / {period}</span>
                        </div>
                        {activeTab === 'year' && plan.monthly_price > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                            Économisez {((plan.monthly_price * 12 - plan.yearly_price) / (plan.monthly_price * 12) * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-4">
                        {features.map((group) => (
                          <div key={group.category}>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              {group.category}
                            </h4>
                            {group.items.length > 0 ? (
                              <ul className="space-y-2">
                                {group.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                Tous les avantages inclus
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button
                        className="w-full"
                        variant={plan.is_recommended ? 'default' : 'outline'}
                        onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                      >
                        {isSelected ? 'Sélectionné' : 'Choisir ce pack'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 mb-8" />

          {/* Plans management section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold ik-heading mb-2">Gérer les forfaits</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Créez, modifiez ou désactivez les formules d'abonnement
                </p>
              </div>
              <Button onClick={() => setShowPlanModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un forfait
              </Button>
            </div>
          </div>

          {/* Plans management table */}
          <div className="ik-card overflow-hidden mb-16">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="ik-th">Forfait</th>
                    <th className="ik-th">Clé</th>
                    <th className="ik-th">Prix mensuel</th>
                    <th className="ik-th">Prix annuel</th>
                    <th className="ik-th">Couleur</th>
                    <th className="ik-th">Recommandé</th>
                    <th className="ik-th">Actif</th>
                    <th className="ik-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {plans.map((p) => (
                    <tr key={p.id} className="ik-tr-hover">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{p.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{p.subtitle}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {p.key}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {p.monthly_price.toLocaleString()} FCFA
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {p.yearly_price.toLocaleString()} FCFA
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: p.accent_color }}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{p.accent_color}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {p.is_recommended ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ikigai-gold/10 text-ikigai-gold">
                            Oui
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePlanActive(p)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            p.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              p.is_active ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button className="ik-action-btn" onClick={() => openPlanEdit(p)}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="ik-action-btn-danger" onClick={() => deletePlan(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {plans.length === 0 && !plansLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Aucun forfait trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 mb-8" />

          {/* Existing subscriptions section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold ik-heading mb-2">Abonnements actifs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gérez les abonnements souscrits par les partenaires
            </p>
          </div>

          {/* Filters */}
          <div className="ik-filter-bar mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un plan..."
                className="ik-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="ik-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="ik-th">Plan</th>
                    <th className="ik-th">Prix</th>
                    <th className="ik-th">Période</th>
                    <th className="ik-th">Boutique</th>
                    <th className="ik-th">Début</th>
                    <th className="ik-th">Prochain paiement</th>
                    <th className="ik-th">Statut</th>
                    <th className="ik-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((sub) => (
                    <tr key={sub.id} className="ik-tr-hover">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.plan}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {sub.price.toLocaleString()} FCFA
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 capitalize">
                        {sub.interval === 'month' ? 'Mensuel' : 'Annuel'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        #{sub.shop_id ?? '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {sub.started_at ? new Date(sub.started_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {sub.next_billing ? new Date(sub.next_billing).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {(() => {
                          const now = new Date()
                          const nextBilling = sub.next_billing ? new Date(sub.next_billing) : null
                          const isExpired = nextBilling ? nextBilling < now : false
                          const statusClass = sub.status === 'active' && !isExpired
                            ? 'ik-badge-green'
                            : sub.status === 'active' && isExpired
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'ik-badge-gray'
                          const statusLabel = sub.status === 'active' && !isExpired
                            ? 'Actif'
                            : sub.status === 'active' && isExpired
                              ? 'Expiré'
                              : 'Inactif'
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
                              {statusLabel}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button className="ik-action-btn">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="ik-action-btn-danger">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Aucun abonnement trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="ik-overlay">
            <div className="ik-modal max-w-md">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold ik-heading">Nouvel abonnement</h2>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="ik-label">Plan</label>
                  <select
                    className="ik-input"
                    value={form.plan}
                    onChange={e => setForm({ ...form, plan: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un pack</option>
                    {plans.filter((p: SubscriptionPlan) => p.is_active).map((p: SubscriptionPlan) => (
                      <option key={p.key} value={p.name}>{p.name} – {p.subtitle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ik-label">Prix (FCFA)</label>
                  <input
                    type="number"
                    className="ik-input"
                    placeholder="15000"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="ik-label">Période</label>
                  <select
                    className="ik-input"
                    value={form.interval}
                    onChange={e => setForm({ ...form, interval: e.target.value })}
                  >
                    <option value="month">Mensuel</option>
                    <option value="year">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="ik-label">Boutique ID (optionnel)</label>
                  <input
                    type="number"
                    className="ik-input"
                    placeholder="123"
                    value={form.shop_id}
                    onChange={e => setForm({ ...form, shop_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="ik-label">Max réservations (optionnel)</label>
                  <input
                    type="number"
                    className="ik-input"
                    placeholder="Illimité"
                    value={form.max_bookings}
                    onChange={e => setForm({ ...form, max_bookings: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plan management modal */}
        {showPlanModal && (
          <div className="ik-overlay">
            <div className="ik-modal max-w-lg">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold ik-heading">
                  {editingPlan ? 'Modifier le forfait' : 'Nouveau forfait'}
                </h2>
              </div>
              <form onSubmit={handlePlanSave} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ik-label">Clé technique</label>
                    <input
                      className="ik-input"
                      placeholder="basic"
                      value={planForm.key}
                      onChange={e => setPlanForm({ ...planForm, key: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="ik-label">Nom</label>
                    <input
                      className="ik-input"
                      placeholder="BASIC"
                      value={planForm.name}
                      onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="ik-label">Sous-titre</label>
                  <input
                    className="ik-input"
                    placeholder="Démarrage"
                    value={planForm.subtitle}
                    onChange={e => setPlanForm({ ...planForm, subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <label className="ik-label">Description</label>
                  <input
                    className="ik-input"
                    placeholder="Idéal pour démarrer..."
                    value={planForm.description}
                    onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ik-label">Prix mensuel (FCFA)</label>
                    <input
                      type="number"
                      className="ik-input"
                      placeholder="15000"
                      value={planForm.monthly_price}
                      onChange={e => setPlanForm({ ...planForm, monthly_price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="ik-label">Prix annuel (FCFA)</label>
                    <input
                      type="number"
                      className="ik-input"
                      placeholder="180000"
                      value={planForm.yearly_price}
                      onChange={e => setPlanForm({ ...planForm, yearly_price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ik-label">Couleur (hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-10 rounded border-0 p-0"
                        value={planForm.accent_color}
                        onChange={e => setPlanForm({ ...planForm, accent_color: e.target.value })}
                      />
                      <input
                        className="ik-input flex-1"
                        value={planForm.accent_color}
                        onChange={e => setPlanForm({ ...planForm, accent_color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="ik-label">Ordre d'affichage</label>
                    <input
                      type="number"
                      className="ik-input"
                      placeholder="1"
                      value={planForm.sort_order}
                      onChange={e => setPlanForm({ ...planForm, sort_order: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="is_recommended"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-ikigai-primary focus:ring-ikigai-primary"
                    checked={planForm.is_recommended}
                    onChange={e => setPlanForm({ ...planForm, is_recommended: e.target.checked })}
                  />
                  <label htmlFor="is_recommended" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    Marquer comme recommandé
                  </label>
                </div>
                {/* Feature builder */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="ik-label mb-0">Fonctionnalités</label>
                    <button
                      type="button"
                      onClick={addFeatureCategory}
                      className="text-xs font-semibold text-ikigai-primary hover:underline"
                    >
                      + Ajouter une catégorie
                    </button>
                  </div>
                  <div className="space-y-4">
                    {planFeatures.map((group, gIdx) => (
                      <div key={gIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            className="ik-input flex-1 text-sm"
                            placeholder="Nom de la catégorie (ex: Visibilité numérique)"
                            value={group.category}
                            onChange={e => updateCategoryName(gIdx, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeFeatureCategory(gIdx)}
                            className="text-red-500 hover:text-red-600 p-1"
                            title="Supprimer cette catégorie"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Items */}
                        <div className="space-y-1 pl-2">
                          {group.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item}</span>
                              <button
                                type="button"
                                onClick={() => removeFeatureItem(gIdx, iIdx)}
                                className="text-gray-400 hover:text-red-500 p-0.5"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              const input = e.currentTarget.querySelector('input') as HTMLInputElement
                              addFeatureItem(gIdx, input.value)
                              input.value = ''
                            }}
                            className="flex items-center gap-2 mt-2"
                          >
                            <input
                              className="ik-input flex-1 text-sm py-1.5"
                              placeholder="Ajouter un item..."
                            />
                            <button
                              type="submit"
                              className="text-xs font-semibold text-ikigai-primary hover:underline px-2"
                            >
                              + Ajouter
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button type="button" variant="ghost" onClick={() => { setShowPlanModal(false); resetPlanForm(); }}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={planSaving}>
                    {planSaving ? 'Enregistrement...' : (editingPlan ? 'Mettre à jour' : 'Créer')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AdminOnly>
  )
}
