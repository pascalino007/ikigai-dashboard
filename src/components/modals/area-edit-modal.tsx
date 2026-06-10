'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Tag } from 'lucide-react'

export interface Geoville {
  id: string
  countryId: string
  regionId: string
  cityId?: string
  districtId?: string
  name: string
  zoneName?: string
  tags?: string | string[]
}

interface AreaEditModalProps {
  isOpen: boolean
  onClose: () => void
  area: Geoville | null
  onSuccess?: () => void
}

export function AreaEditModal({ isOpen, onClose, area, onSuccess }: AreaEditModalProps) {
  const [formData, setFormData] = useState({
    countryId: '',
    regionId: '',
    cityId: '',
    districtId: '',
    name: '',
    zoneName: '',
    tags: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (area) {
      let tagsStr = ''
      if (Array.isArray(area.tags)) {
        tagsStr = area.tags.join(', ')
      } else if (typeof area.tags === 'string') {
        tagsStr = area.tags
      }

      setFormData({
        countryId: area.countryId || '',
        regionId: area.regionId || '',
        cityId: area.cityId || '',
        districtId: area.districtId || '',
        name: area.name || '',
        zoneName: area.zoneName || '',
        tags: tagsStr
      })
    }
  }, [area])

  if (!isOpen || !area) return null

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const e: Record<string, string> = {}

    if (!formData.countryId) e.countryId = 'Pays requis'
    if (!formData.regionId) e.regionId = 'Région requise'
    if (!formData.name.trim()) e.name = 'Nom du quartier requis'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const payload = {
        countryId: formData.countryId,
        regionId: formData.regionId,
        cityId: formData.cityId || undefined,
        districtId: formData.districtId || undefined,
        name: formData.name,
        zoneName: formData.zoneName || undefined,
        tags: formData.tags || undefined
      }

      const res = await fetch(`${API_BASE_URL}/geoville/${area.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Erreur lors de la mise à jour')
      }

      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">Modifier le quartier</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pays & Région */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Pays *</label>
              <select
                className={`w-full mt-1 px-3 py-2 border rounded-md ${
                  errors.countryId ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.countryId}
                onChange={e => update('countryId', e.target.value)}
              >
                <option value="">Sélectionner un pays</option>
                <option value="togo">TOGO</option>
                <option value="benin">BENIN</option>
                <option value="Burkina">BURKINA</option>
                <option value="mali">MALI</option>
                <option value="ghana">GHANA</option>
                <option value="niger">NIGER</option>
                <option value="coteivoire">COTE D'IVOIRE</option>
              </select>
              {errors.countryId && (
                <p className="text-red-500 text-xs mt-1">{errors.countryId}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Région *</label>
              <select
                className={`w-full mt-1 px-3 py-2 border rounded-md ${
                  errors.regionId ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.regionId}
                onChange={e => update('regionId', e.target.value)}
              >
                <option value="">-- Sélectionner une région --</option>
                <option value="maritime">Région Maritime</option>
                <option value="plateaux">Région des Plateaux</option>
                <option value="centrale">Région Centrale</option>
                <option value="kara">Région de la Kara</option>
                <option value="savanes">Région des Savanes</option>
              </select>
              {errors.regionId && (
                <p className="text-red-500 text-xs mt-1">{errors.regionId}</p>
              )}
            </div>
          </div>

          {/* Ville & Arrondissement */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Ville (optionnel)</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md border-gray-300"
                value={formData.cityId}
                onChange={e => update('cityId', e.target.value)}
              >
                <option value="">Sélectionner une ville</option>
                <optgroup label="Région Maritime">
                  <option value="tsevie">Tsévié</option>
                  <option value="aneho">Aného</option>
                  <option value="vogan">Vogan</option>
                  <option value="tabligbo">Tabligbo</option>
                  <option value="afagnan">Afagnan</option>
                </optgroup>
                <optgroup label="Région des Plateaux">
                  <option value="atakpame">Atakpamé</option>
                  <option value="kpaltime">Kpalimé</option>
                  <option value="badou">Badou</option>
                  <option value="notse">Notsè</option>
                  <option value="agnegble">Agou Nyogbo</option>
                </optgroup>
                <optgroup label="Région Centrale">
                  <option value="sokode">Sokodé</option>
                  <option value="tchamba">Tchamba</option>
                  <option value="blitta">Blitta</option>
                  <option value="sotouboua">Sotouboua</option>
                </optgroup>
                <optgroup label="Région de la Kara">
                  <option value="kara">Kara</option>
                  <option value="bassar">Bassar</option>
                  <option value="bafilo">Bafilo</option>
                  <option value="niamtougou">Niamtougou</option>
                  <option value="kanté">Kantè</option>
                </optgroup>
                <optgroup label="Région des Savanes">
                  <option value="dapaong">Dapaong</option>
                  <option value="mango">Mango</option>
                  <option value="tandjouare">Tandjouaré</option>
                  <option value="cinkasse">Cinkassé</option>
                </optgroup>
                <optgroup label="District Autonome du Grand Lomé">
                  <option value="lome">Lomé</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Arrondissement (optionnel)</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md border-gray-300"
                value={formData.districtId}
                onChange={e => update('districtId', e.target.value)}
              >
                <option value="">Sélectionner un arrondissement</option>
                <option value="1">1er arrondissement</option>
                <option value="2">2ème arrondissement</option>
                <option value="3">3ème arrondissement</option>
                <option value="4">4ème arrondissement</option>
                <option value="5">5ème arrondissement</option>
                <option value="6">6ème arrondissement</option>
                <option value="7">7ème arrondissement</option>
                <option value="8">8ème arrondissement</option>
                <option value="9">9ème arrondissement</option>
                <option value="10">10ème arrondissement</option>
                <option value="11">11ème arrondissement</option>
                <option value="12">12ème arrondissement</option>
                <option value="13">13ème arrondissement</option>
                <option value="14">14ème arrondissement</option>
                <option value="15">15ème arrondissement</option>
                <option value="16">16ème arrondissement</option>
                <option value="17">17ème arrondissement</option>
                <option value="18">18ème arrondissement</option>
                <option value="19">19ème arrondissement</option>
                <option value="20">20ème arrondissement</option>
              </select>
            </div>
          </div>

          {/* Quartier & Zone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom du quartier *</label>
              <input
                className={`w-full mt-1 px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={e => update('name', e.target.value)}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Nom de la zone (optionnel)
              </label>
              <input
                className="w-full mt-1 px-3 py-2 border rounded-md border-gray-300"
                value={formData.zoneName}
                onChange={e => update('zoneName', e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Tags (optionnel)
            </label>
            <input
              className="w-full mt-1 px-3 py-2 border rounded-md border-gray-300"
              placeholder="Marché, Carrefour, Station..."
              value={formData.tags}
              onChange={e => update('tags', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}