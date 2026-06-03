'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
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

export default function AbonnementsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    plan: '', price: '', interval: 'month', status: 'active',
    shop_id: '', user_id: '', max_bookings: '', features: '',
  })

  useEffect(() => {
    fetchSubscriptions()
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

  const filtered = subscriptions.filter(sub =>
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminOnly>
      <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Abonnements</h1>
            <p className="text-gray-600 mt-2">Manage subscription plans and pricing</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.plan}</div>
                    <div className="text-sm text-gray-500">Shop #{sub.shop_id ?? 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {sub.price.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {sub.interval}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {sub.max_bookings ?? 'Unlimited'} bookings
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Subscription</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="w-full border rounded-md px-3 py-2" placeholder="Plan name" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} required />
              <input type="number" className="w-full border rounded-md px-3 py-2" placeholder="Price (FCFA)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              <select className="w-full border rounded-md px-3 py-2" value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })}>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              <input type="number" className="w-full border rounded-md px-3 py-2" placeholder="Shop ID (optional)" value={form.shop_id} onChange={e => setForm({ ...form, shop_id: e.target.value })} />
              <input type="number" className="w-full border rounded-md px-3 py-2" placeholder="Max bookings (optional)" value={form.max_bookings} onChange={e => setForm({ ...form, max_bookings: e.target.value })} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
    </AdminOnly>
  )
}
