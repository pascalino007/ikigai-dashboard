'use client'

import { API_BASE_URL } from '@/services/api'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AreaCountryForm } from '@/components/forms/area-form'
import { AreaEditModal } from '@/components/modals/area-edit-modal'

/* ---------------- TYPES ---------------- */
interface GeoVille {
  id: number
  countryId: string
  regionId: string
  cityId?: string | null
  districtId?: string | null
  name: string
  zoneName?: string | null
  tags?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/* ---------------- PAGE ---------------- */
export default function GeolocationPage() {
  const [zones, setZones] = useState<GeoVille[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [editingZone, setEditingZone] = useState<GeoVille | null>(null)

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/geoville`)
      if (!res.ok) throw new Error('Failed to load geolocations')
      const data = await res.json()
      setZones(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- FILTER ---------------- */
  const filteredZones = zones.filter(z =>
    `${z.countryId} ${z.regionId} ${z.cityId ?? ''} ${z.name} ${z.tags ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  /* ---------------- SELECTION ---------------- */
  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette zone ?')) return

    try {
      await fetch(`${API_BASE_URL}/geoville/${id}`, {
        method: 'DELETE'
      })
      setZones(prev => prev.filter(z => z.id !== id))
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Géolocalisation</h1>
            <p className="text-gray-600">Gestion des pays, villes et quartiers</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une zone
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              placeholder="Rechercher pays, ville, quartier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-medium">Pays</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Région</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Ville</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Arrondissement</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Quartier</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredZones.map(zone => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(zone.id)}
                      onChange={() => toggleSelect(zone.id)}
                    />
                  </td>

                  <td className="px-4 py-3">{zone.countryId}</td>
                  <td className="px-4 py-3">{zone.regionId}</td>
                  <td className="px-4 py-3">{zone.cityId ?? '-'}</td>
                  <td className="px-4 py-3">{zone.districtId ?? '-'}</td>
                  <td className="px-4 py-3 font-medium">{zone.name}</td>
                  <td className="px-4 py-3">{zone.zoneName ?? '-'}</td>
                  <td className="px-4 py-3">
                    {zone.tags
                      ? zone.tags.split(',').map((t, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1"
                          >
                            {t.trim()}
                          </span>
                        ))
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        zone.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {zone.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingZone(zone)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(zone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredZones.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-6 text-gray-500">
                    Aucune zone trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <AreaCountryForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchZones}
        />

        <AreaEditModal
          isOpen={!!editingZone}
          onClose={() => setEditingZone(null)}
          area={editingZone as any}
          onSuccess={fetchZones}
        />
      </div>
    </DashboardLayout>
  )
}
