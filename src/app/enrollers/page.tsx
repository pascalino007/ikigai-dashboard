'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Search, Store, Star, Eye, ToggleLeft, ToggleRight, X, Loader2, User, Upload, Lock } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'
import { useAuth } from '@/lib/auth/auth-context'
import { API_BASE_URL } from '@/services/api'

interface Enroller {
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
  shopsCount: number
  createdAt: string
}

interface CreateForm {
  firstname: string
  lastname: string
  email: string
  phone: string
  password: string
  profilePicture: File | null
}

const EMPTY_FORM: CreateForm = { firstname: '', lastname: '', email: '', phone: '', password: '', profilePicture: null }

export default function EnrollersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [enrollers, setEnrollers] = useState<Enroller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateForm, string>>>({})
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchEnrollers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/enrollers`)
      if (res.ok) setEnrollers(await res.json())
    } catch (e) {
      console.error('Failed to fetch enrollers', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchEnrollers() }, [])

  const openModal = () => {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setImagePreview('')
    setSubmitError(null)
    setShowModal(true)
  }

  const filtered = enrollers.filter((e) => {
    const name = `${e.firstname} ${e.lastname}`.toLowerCase()
    const matchSearch = name.includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && e.is_active) || (filterStatus === 'inactive' && !e.is_active)
    return matchSearch && matchStatus
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setForm(p => ({ ...p, profilePicture: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview('')
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd })
    const data = await res.json()
    return data.filename || ''
  }

  const validate = () => {
    const errs: Partial<Record<keyof CreateForm, string>> = {}
    if (!form.firstname.trim()) errs.firstname = 'First name is required'
    if (!form.lastname.trim()) errs.lastname = 'Last name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email is invalid'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    if (!form.password.trim() || form.password.length < 4) errs.password = 'Password must be at least 4 characters'
    return errs
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let imageName = ''
      if (form.profilePicture instanceof File) {
        imageName = await uploadImage(form.profilePicture)
      }

      const res = await fetch(`${API_BASE_URL}/enrollers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          phone: form.phone,
          password: form.password,
          image: imageName,
          creatorRole: user?.role,
          creatorId: Number(user?.id),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Creation failed')
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      setImagePreview('')
      fetchEnrollers()
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`${API_BASE_URL}/enrollers/${id}/toggle-active`, { method: 'PATCH' })
    fetchEnrollers()
  }

  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Enrollers</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Gérer les enrollers et suivre leurs performances</p>
            </div>
            <Button onClick={openModal}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un enroller
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un enroller..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-ikigai-primary" /></div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['Enroller', 'Supérieur', 'Shops', 'Points', 'Statut', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map((enroller) => (
                      <tr
                        key={enroller.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => router.push(`/enrollers/${enroller.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                              {enroller.image ? (
                                <img src={enroller.image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium text-white">
                                  {enroller.firstname[0]}{enroller.lastname[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{enroller.firstname} {enroller.lastname}</p>
                              <p className="text-xs text-gray-500">{enroller.email}</p>
                              <p className="text-xs text-gray-400">{enroller.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {enroller.superiorName || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            <Store className="h-4 w-4 text-gray-400" />
                            {enroller.shopsCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                            <Star className="h-4 w-4" />
                            {enroller.points}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${enroller.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {enroller.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => router.push(`/enrollers/${enroller.id}`)}
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleToggle(enroller.id, e)}
                              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${enroller.is_active ? 'text-green-600' : 'text-red-500'}`}
                              title={enroller.is_active ? 'Désactiver' : 'Activer'}
                            >
                              {enroller.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">Aucun enroller trouvé</div>
              )}
            </div>
          )}
        </div>

        {/* Create Enroller Modal — same layout as Add New User */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Enroller</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleCreate} className="space-y-6">
                  {/* USER DETAILS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-gray-100">
                      <User className="h-5 w-5 mr-2" />
                      User Details
                    </h3>

                    {/* FIRST / LAST NAME */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          value={form.firstname}
                          onChange={(e) => setForm(p => ({ ...p, firstname: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formErrors.firstname ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                          placeholder="Enter first name"
                        />
                        {formErrors.firstname && <p className="text-red-500 text-xs mt-1">{formErrors.firstname}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={form.lastname}
                          onChange={(e) => setForm(p => ({ ...p, lastname: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formErrors.lastname ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                          placeholder="Enter last name"
                        />
                        {formErrors.lastname && <p className="text-red-500 text-xs mt-1">{formErrors.lastname}</p>}
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        placeholder="Enter email"
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>

                    {/* PHONE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        placeholder="Enter phone number"
                      />
                      {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    {/* PROFILE PICTURE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                      {imagePreview && (
                        <img src={imagePreview} className="w-20 h-20 object-cover rounded-lg border mb-4" alt="preview" />
                      )}
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-gray-100">
                      <Lock className="h-5 w-5 mr-2" />
                      Security
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        placeholder="Enter password manually"
                      />
                      {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 rounded p-3">{submitError}</p>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Enroller'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RouteGuard>
  )
}
