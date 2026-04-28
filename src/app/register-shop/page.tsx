'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Store, User, Upload, CheckCircle, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth/auth-context'
import { EnrollerOnly } from '@/components/auth/route-guard'
import { ShopForm } from '@/components/forms/shop-form'
import { API_BASE_URL } from '@/services/api'

// ── Provider form state ────────────────────────────────────────────────────────
interface ProviderForm {
  firstname: string
  lastname: string
  email: string
  phone_number: string
  CNI_number: string
  service_type: string
  year_expe: string
  profileImageUrl: string
  profileImageFile: File | null
}

const EMPTY_PROVIDER: ProviderForm = {
  firstname: '', lastname: '', email: '', phone_number: '',
  CNI_number: '', service_type: '', year_expe: '',
  profileImageUrl: '', profileImageFile: null,
}

type Tab = 'shop' | 'provider'

export default function RegisterShopPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('shop')
  const [shopKey, setShopKey] = useState(0) // force ShopForm remount on success

  // ── Provider state ──────────────────────────────────────────────────────────
  const [provider, setProvider] = useState<ProviderForm>(EMPTY_PROVIDER)
  const [provErrors, setProvErrors] = useState<Partial<Record<keyof ProviderForm, string>>>({})
  const [provImagePreview, setProvImagePreview] = useState('')
  const [provSubmitting, setProvSubmitting] = useState(false)
  const [provSuccess, setProvSuccess] = useState(false)
  const [provError, setProvError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories/`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data.map((c: any) => ({ id: String(c.id), name: c.name })) : []))
      .catch(() => {})
  }, [])

  const handleProviderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setProvider(p => ({ ...p, profileImageFile: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setProvImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setProvImagePreview('')
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd })
    const data = await res.json()
    return data.imageUrl || data.filename || ''
  }

  const validateProvider = () => {
    const errs: Partial<Record<keyof ProviderForm, string>> = {}
    if (!provider.firstname.trim()) errs.firstname = 'Required'
    if (!provider.lastname.trim()) errs.lastname = 'Required'
    if (!provider.email.trim()) errs.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(provider.email)) errs.email = 'Invalid email'
    if (!provider.phone_number.trim()) errs.phone_number = 'Required'
    if (!provider.CNI_number.trim()) errs.CNI_number = 'Required'
    if (!provider.service_type) errs.service_type = 'Required'
    if (!provider.year_expe || isNaN(Number(provider.year_expe))) errs.year_expe = 'Required (number)'
    return errs
  }

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateProvider()
    setProvErrors(errs)
    if (Object.keys(errs).length > 0) return

    setProvSubmitting(true)
    setProvError(null)
    try {
      let imageUrl = ''
      if (provider.profileImageFile instanceof File) {
        imageUrl = await uploadImage(provider.profileImageFile)
      }
      const res = await fetch(`${API_BASE_URL}/proownners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: provider.firstname,
          lastname: provider.lastname,
          email: provider.email,
          phone_number: provider.phone_number,
          CNI_number: provider.CNI_number,
          service_type: Number(provider.service_type),
          year_expe: Number(provider.year_expe),
          profileImageUrl: imageUrl,
          registered_by: user?.id ? String(user.id) : 'enroller',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create provider')
      }
      setProvSuccess(true)
      setProvider(EMPTY_PROVIDER)
      setProvImagePreview('')
    } catch (err: any) {
      setProvError(err.message)
    } finally {
      setProvSubmitting(false)
    }
  }

  const pField = (key: keyof ProviderForm, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={provider[key] as string}
        onChange={(e) => setProvider(p => ({ ...p, [key]: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${provErrors[key] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
        placeholder={placeholder || label}
      />
      {provErrors[key] && <p className="text-red-500 text-xs mt-1">{provErrors[key]}</p>}
    </div>
  )

  return (
    <EnrollerOnly>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/enrolled-shops')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Enroller Portal</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Register shops and add service providers</p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mb-6">
            {([
              { key: 'shop' as Tab, icon: Store, label: 'Register Shop' },
              { key: 'provider' as Tab, icon: User, label: 'Add Provider' },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setProvSuccess(false); setProvError(null) }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                  tab === key
                    ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab 1: Register Shop ─────────────────────────────────────── */}
          {tab === 'shop' && (
            <ShopForm
              key={shopKey}
              isOpen={true}
              inline={true}
              enrollerId={user?.id ? Number(user.id) : undefined}
              onClose={() => setShopKey(k => k + 1)}
              onSubmit={() => {}}
            />
          )}

          {/* ── Tab 2: Add Provider ──────────────────────────────────────── */}
          {tab === 'provider' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg w-full">
              <div className="p-6">
                {provSuccess && (
                  <div className="mb-6 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-4">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">Provider created successfully!</p>
                      <p className="text-sm text-green-600 dark:text-green-400">The provider has been registered in the system.</p>
                    </div>
                    <button onClick={() => setProvSuccess(false)} className="ml-auto text-green-500 text-xs underline">Dismiss</button>
                  </div>
                )}

                <form onSubmit={handleProviderSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-gray-100">
                      <User className="h-5 w-5 mr-2" />
                      Provider Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pField('firstname', 'First Name *', 'text', 'Enter first name')}
                      {pField('lastname', 'Last Name *', 'text', 'Enter last name')}
                    </div>

                    {pField('email', 'Email *', 'email', 'Enter email')}
                    {pField('phone_number', 'Phone Number *', 'tel', 'Enter phone number')}
                    {pField('CNI_number', 'CNI Number *', 'text', 'Identity card number')}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type *</label>
                        <select
                          value={provider.service_type}
                          onChange={(e) => setProvider(p => ({ ...p, service_type: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${provErrors.service_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        >
                          <option value="">Select service type</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        {provErrors.service_type && <p className="text-red-500 text-xs mt-1">{provErrors.service_type}</p>}
                      </div>
                      {pField('year_expe', 'Years of Experience *', 'number', '0')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
                      {provImagePreview && (
                        <img src={provImagePreview} className="w-20 h-20 object-cover rounded-lg border mb-4" alt="preview" />
                      )}
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handleProviderImageChange} />
                      </label>
                    </div>
                  </div>

                  {provError && (
                    <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 rounded p-3">{provError}</p>
                  )}

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={() => { setProvider(EMPTY_PROVIDER); setProvImagePreview(''); setProvErrors({}) }}>
                      Reset
                    </Button>
                    <Button type="submit" disabled={provSubmitting}>
                      {provSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Provider'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </EnrollerOnly>
  )
}