'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, MapPin, Phone, Mail, Tag, Image as ImageIcon, Calendar, Navigation } from 'lucide-react'

interface GeoVille {
  id: number
  countryId: string
  regionId: string
  cityId?: string | null
  districtId?: string | null
  name: string
  isActive: boolean
}

interface OpeningHour {
  day: string
  open: string
  close: string
}

interface ShopFormData {
  name: string;
  type: string;
  address: string;
  pays: string;
  ville: string;
  quartier: string;
  phone: string;
  email: string;
  non_loin_de: string;
  description_shop: string;
  profileImageUrl: string;
   // final URL for backend
  profileImageFile?: File;
  certificationImage: string;
  galleryImages: string[];
  cfeImageUrl: string;
  workingHours: [string, string][]; // Each element is a tuple: [day, hours]
  tags: string;
  owner: string;
  registered_by: string;
  region: string;
  arrondissement: string;
  longitude?: number;
  latitude?: number;
  grade: 'basic' | 'pro' | 'elite';
}

interface ShopFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ShopFormData) => void
  enrollerId?: number
  inline?: boolean
}

const DEFAULT_HOURS: [string, string][] = [
  ["Monday", "08:00 - 18:00"],
  ["Tuesday", "08:00 - 18:00"],
  ["Wednesday", "08:00 - 18:00"],
  ["Thursday", "08:00 - 18:00"],
  ["Friday", "08:00 - 18:00"],
  ["Saturday", "09:00 - 14:00"],
];

const SERVICE_TAGS = [
  'onglerie',      // nail services
  'manicure',
  'pedicure',
  'coiffure',      // hair
  'makeup',
  'spa',
  'barbershop',    // male grooming
  'facial',
  'waxing',
  'eyelash extensions',
  'eyebrow threading',
  'hair coloring',
  'hair treatment',
  'haircut',
  'hair styling',
  'massages',
  'body scrub',
  'body wraps',
  'tanning',
  'skincare',
  'cosmetic tattoo',
  'permanent makeup',
  'bridal makeup',
  'hair braiding',
  'tressage',      // braids
  'hair extensions',
  'beard grooming',
  'men’s haircut',
  'hair removal',
  'beauty consultation'
];


export function ShopForm(props: ShopFormProps) {
  const { isOpen, onClose, onSubmit, enrollerId, inline } = props

const [formData, setFormData] = useState<ShopFormData>({
  name: '',
  type: '',
  tags: '',         // local file before upload
  profileImageUrl: '',        // URL after upload
  certificationImage: '',     // optional
  galleryImages: [],          // array of image URLs
  cfeImageUrl: '',            
  address: '',
  pays: '',                   // optional, can fill later
  ville: '',                   // optional duplicate of 'ville'
  quartier: '',
  non_loin_de: '',
  workingHours: DEFAULT_HOURS,
  phone: '',
  email: '',
  description_shop: '',
  owner: '',
  registered_by: 'admin_123',
  region: '',
  arrondissement: '',
  longitude: undefined,
  latitude: undefined,
  grade: 'basic',
});

  const [errors, setErrors] = useState<Partial<Record<keyof ShopFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // fetched lists for selects
  const [responsables, setResponsables] = useState<Array<{ id: string; name: string }>>([])
  const [listsLoading, setListsLoading] = useState(false)
  const [listsError, setListsError] = useState<string | null>(null)
  const [geoZones, setGeoZones] = useState<GeoVille[]>([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [quartierSearch, setQuartierSearch] = useState('')

  useEffect(() => {
    let mounted = true
    const loadLists = async () => {
      setListsLoading(true)
      setListsError(null)
      try {
        const provRes = await fetch(`${API_BASE_URL}/proownners`)
        if (!provRes.ok) throw new Error(`Failed to fetch responsables (${provRes.status})`)

        const provs = await provRes.json()

        if (!mounted) return
        // normalize responses to { id, name }
        setResponsables(Array.isArray(provs) ? provs.map((p: any) => ({ id: p.email || String(p.id ?? p._id ?? p._key), name: `${p.firstname || ''} ${p.lastname || ''}`.trim() || p.email || p.name || 'Unknown' })) : [])
      } catch (err) {
        console.error('Error loading lists for shop form:', err)
        if (mounted) setListsError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (mounted) setListsLoading(false)
      }
    }
    loadLists()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setGeoLoading(true)
    fetch(`${API_BASE_URL}/geoville`)
      .then(r => r.json())
      .then(data => setGeoZones(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setGeoLoading(false))
  }, [])

  // Upload profile image to backend and set returned imageUrl on success
  const uploadProfileImage = async (file: File) => {
    setProfileUploadError(null)
    // local preview immediately
    setFormData(prev => ({ ...prev, profileImageUrl: URL.createObjectURL(file) }))
    const form = new FormData()
    form.append('image', file) // backend expects 'image'

    setIsUploadingProfile(true)
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      if (!data?.imageUrl) throw new Error('No imageUrl in upload response')

      // Use the returned full imageUrl for preview and submission
      setFormData(prev => ({ ...prev, profileImageUrl: data.imageUrl }))
      console.log('✅ Profile image uploaded:', data.imageUrl)
    } catch (err) {
      console.error('❌ Profile upload error:', err)
      setProfileUploadError(err instanceof Error ? err.message : 'Upload failed')
      // clear preview if upload failed
      setFormData(prev => ({ ...prev, profileImageUrl: '' }))
      setErrors(prev => ({ ...prev, profileImageUrl: err instanceof Error ? err.message : 'Failed to upload profile image' }))
    } finally {
      setIsUploadingProfile(false)
    }
  }

  // Upload gallery images to backend and set the returned imageUrls on success
  const uploadGalleryImages = async (files: File[]) => {
    setGalleryUploadError(null)
    setIsUploadingGallery(true)
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const form = new FormData()
        form.append('image', file) // backend expects 'image'
        const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: form })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || `Upload failed (${res.status})`)
        }
        const data = await res.json()
        if (!data?.imageUrl) throw new Error('No imageUrl in upload response')
        return data.imageUrl as string
      }))
      setFormData(prev => ({ ...prev, galleryImages: urls }))
      console.log('✅ Gallery images uploaded:', urls)
    } catch (err) {
      console.error('❌ Gallery upload error:', err)
      setGalleryUploadError(err instanceof Error ? err.message : 'Upload failed')
      setFormData(prev => ({ ...prev, galleryImages: [] }))
      setErrors(prev => ({ ...prev, galleryImages: err instanceof Error ? err.message : 'Failed to upload gallery images' }))
    } finally {
      setIsUploadingGallery(false)
    }
  }

  const uniqueCountries = Array.from(new Set(geoZones.map(z => z.countryId).filter(Boolean)))

  // Quartiers of the selected country, narrowed by the search box and deduped
  // by name; at most 20 are shown at a time.
  const countryQuartiers = formData.pays
    ? geoZones.filter(z => z.name && z.countryId === formData.pays)
    : []
  const searchedQuartiers = quartierSearch.trim()
    ? countryQuartiers.filter(z => z.name.toLowerCase().includes(quartierSearch.trim().toLowerCase()))
    : countryQuartiers
  const dedupedQuartiers = Array.from(new Map(searchedQuartiers.map(z => [z.name, z])).values())
  const visibleQuartiers = dedupedQuartiers.slice(0, 20)

  // Région/ville/arrondissement are no longer picked by the user — they come
  // from the selected quartier's geolocation record.
  const selectQuartier = (zone: GeoVille) => {
    setFormData(prev => ({
      ...prev,
      quartier: zone.name,
      ville: zone.cityId || '',
      region: zone.regionId || '',
      arrondissement: zone.districtId || '',
    }))
    setErrors(prev => ({ ...prev, quartier: undefined }))
  }

  if (!isOpen) return null

   const toggleTag = (tag: string) => {
  setFormData(prev => {
    const tagArray = prev.tags ? prev.tags.split(',') : [];
    const newTagArray = tagArray.includes(tag)
      ? tagArray.filter(t => t !== tag)
      : [...tagArray, tag];
    return { ...prev, tags: newTagArray.join(',') };
  });
 }

  const reverseGeocode = async (lat: number, lon: number): Promise<{ address: string; pays: string; ville: string; quartier: string } | null> => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'IkigaiDashboard/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const addr = data?.address || {}
    const displayName = data?.display_name || ''
    return {
      address: displayName,
      pays: addr.country || '',
      ville: addr.city || addr.town || addr.village || addr.municipality || addr.state || '',
      quartier: addr.suburb || addr.neighbourhood || addr.quarter || addr.district || addr.county || '',
    }
  }

  const handlePickCurrentPosition = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }
    setIsGettingLocation(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const geo = await reverseGeocode(latitude, longitude)
          setFormData(prev => ({
            ...prev,
            longitude: longitude,
            latitude: latitude,
            ...(geo && {
              address: geo.address,
              pays: geo.pays || prev.pays,
              ville: geo.ville || prev.ville,
              quartier: geo.quartier || prev.quartier,
            }),
          }))
        } catch {
          setLocationError('Could not fetch address from coordinates')
          setFormData(prev => ({ ...prev, longitude: longitude, latitude: latitude }))
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out')
            break
          default:
            setLocationError('Unable to get your location')
        }
      },
      { enableHighAccuracy: true }
    )
  } 

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const newErrors: Partial<Record<keyof ShopFormData, string>> = {};

  // Required field validation
  if (!formData.name.trim()) newErrors.name = 'Shop name is required';
  if (!formData.type.trim()) newErrors.type = 'Type is required';
  if (!formData.tags.trim()) newErrors.tags = 'Tags are required';
  if ( !formData.profileImageUrl) newErrors.profileImageUrl = 'Profile image is required';
  if (!formData.cfeImageUrl.trim()) newErrors.cfeImageUrl = 'CFE image is required';
  if (!formData.pays?.trim()) newErrors.pays = 'Country is required';
  // ville/region/arrondissement are derived from the selected quartier's geo record
  if (!formData.quartier.trim()) newErrors.quartier = 'Quartier is required';
  if (!formData.non_loin_de.trim()) newErrors.non_loin_de = 'Landmark is required';
  if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
  if (!formData.email.trim()) newErrors.email = 'Email is required';
  if (!formData.description_shop.trim()) newErrors.description_shop = 'Description is required';
  if (!formData.owner.trim()) newErrors.owner = 'Owner name is required';
  if (!formData.registered_by.trim()) newErrors.registered_by = 'Registered by is required';
  if (!formData.workingHours || formData.workingHours.length === 0)
    newErrors.workingHours = 'Working hours are required';
  if (!formData.galleryImages || formData.galleryImages.length === 0)
    newErrors.galleryImages = 'At least one gallery image is required';
  if (!formData.certificationImage?.trim()) newErrors.certificationImage = 'Certification image is required';

  const selectedTags = formData.tags ? formData.tags.split(',') : [];
  if (selectedTags.length < 10) newErrors.tags = 'Please select at least 10 tags';

  setErrors(newErrors);

  // Stop submission if there are errors
  //if (Object.keys(newErrors).length > 0) return;

  setIsSubmitting(true);
    try {
    const res = await fetch(`${API_BASE_URL}/shops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, ...(enrollerId != null ? { registered_by: String(enrollerId) } : {}) }),
    });

    if (!res.ok) throw new Error('Failed to submit shop data');

    const data = await res.json();
    console.log('✅ Shop created:', data);

    // ✅ Show success modal
    setModal({
      type: 'success',
      message: 'Shop created successfully!',
    });

    // In modal mode close immediately; in inline mode let the user see the success dialog
    if (!inline) onClose();
  } catch (error) {
    console.error('❌ Error creating shop:', error);

    // ❌ Show failure modal
    setModal({
      type: 'error',
      message: 'Failed to create shop. Please try again.',
    });
  } finally {
    setIsSubmitting(false);
  }


};


  const formContent = (
        <div className="p-6">
          {!inline && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Shop</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name *</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Enter shop name"
      />
      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
      <select
        value={formData.type}
        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select type</option>
        <option value="Salon">Salon</option>
        <option value="Institut">Institut</option>
        <option value="Freelance">Freelance</option>
      </select>
      {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
    </div>
  </div>

  {/* Tags */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
      <Tag className="h-4 w-4 mr-2" /> Service Tags
    </label>
    <div className="flex flex-wrap gap-2">
      {SERVICE_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1 rounded-full text-sm border ${formData.tags.includes(tag) ? 'bg-ikigai-primary text-white border-ikigai-primary' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
        >
          {tag}
        </button>
      ))}
    </div>
    {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
  </div>

  {/* Location */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
        <MapPin className="h-4 w-4 mr-1" /> Location
      </label>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={handlePickCurrentPosition}
          disabled={isGettingLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isGettingLocation ? 'Getting position...' : 'Use my location'}
        </Button>
        {(formData.latitude != null && formData.longitude != null) && (
          <span className="text-sm text-gray-600">
            {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </span>
        )}
        {formData.address && (
          <span className="text-sm text-gray-500 truncate max-w-xs">{formData.address}</span>
        )}
      </div>
      {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pays *</label>
      <select
        value={formData.pays}
        onChange={(e) => {
          setFormData(prev => ({ ...prev, pays: e.target.value, region: '', ville: '', arrondissement: '', quartier: '' }))
          setQuartierSearch('')
        }}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.pays ? 'border-red-500' : 'border-gray-300'}`}
        disabled={geoLoading}
      >
        <option value="">{geoLoading ? 'Loading...' : 'Select country'}</option>
        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {errors.pays && <p className="text-red-500 text-sm mt-1">{errors.pays}</p>}
    </div>

    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quartier *</label>
      {!formData.pays ? (
        <p className="text-sm text-gray-400 px-3 py-2 border border-dashed border-gray-300 rounded-md">
          Select a country to choose a quartier
        </p>
      ) : (
        <>
          <input
            type="text"
            value={quartierSearch}
            onChange={(e) => setQuartierSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
            placeholder="Search for a quartier..."
          />
          {formData.quartier && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-ikigai-primary text-white">
              {formData.quartier}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, quartier: '', ville: '', region: '', arrondissement: '' }))}
                className="hover:opacity-70"
                aria-label="Clear quartier"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {visibleQuartiers.map(z => (
              <button
                key={z.id}
                type="button"
                onClick={() => selectQuartier(z)}
                className={`px-3 py-1 rounded-full text-sm border ${formData.quartier === z.name ? 'bg-ikigai-primary text-white border-ikigai-primary' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-ikigai-primary'}`}
              >
                {z.name}
              </button>
            ))}
          </div>
          {visibleQuartiers.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">No quartier found{quartierSearch ? ` for “${quartierSearch}”` : ' for this country'}</p>
          )}
          {dedupedQuartiers.length > visibleQuartiers.length && (
            <p className="text-xs text-gray-400 mt-2">
              Showing {visibleQuartiers.length} of {dedupedQuartiers.length} — refine the search to see more
            </p>
          )}
        </>
      )}
      {errors.quartier && <p className="text-red-500 text-sm mt-1">{errors.quartier}</p>}
    </div>
  </div>

   <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Non loin de  *</label>
    <textarea
      rows={3}
      value={formData.non_loin_de}
      onChange={(e) => setFormData(prev => ({ ...prev, non_loin_de: e.target.value }))}
      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.description_shop ? 'border-red-500' : 'border-gray-300'}`}
      placeholder="Describe the shop..."
    />
    {errors.non_loin_de && <p className="text-red-500 text-sm mt-1">{errors.non_loin_de}</p>}
  </div>

  {/* Description Shop */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description le Boutique *</label>
    <textarea
      rows={3}
      value={formData.description_shop}
      onChange={(e) => setFormData(prev => ({ ...prev, description_shop: e.target.value }))}
      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.description_shop ? 'border-red-500' : 'border-gray-300'}`}
      placeholder="Describe the shop..."
    />
    {errors.description_shop && <p className="text-red-500 text-sm mt-1">{errors.description_shop}</p>}
  </div>

  {/* Phone / Email */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
        <Phone className="h-4 w-4 mr-1" /> Phone *
      </label>
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Enter phone number"
      />
      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
        <Mail className="h-4 w-4 mr-1" /> Email
      </label>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Enter email (optional)"
      />
      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
    </div>
  </div>

  {/* Images / Files */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Profile Image */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
        <ImageIcon className="h-4 w-4 mr-1" /> Profile Image *
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          // optionally keep the File too
          setFormData(prev => ({ ...prev, profileImageFile: file }))
          await uploadProfileImage(file)
        }}
      />
      {isUploadingProfile && <p className="text-xs text-ink-600 mt-1">Uploading profile image...</p>}
      {profileUploadError && <p className="text-red-500 text-sm mt-1">{profileUploadError}</p>}
      {/* preview */}
      {formData.profileImageUrl && (
        <img src={formData.profileImageUrl} alt="Profile preview" className="mt-2 w-32 h-32 object-cover rounded" />
      )}
      {errors.profileImageUrl && <p className="text-red-500 text-sm mt-1">{errors.profileImageUrl}</p>}
    </div>

    {/* Gallery Images */}
  <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gallery Images *</label>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      void uploadGalleryImages(files);
    }}
  />
  {isUploadingGallery && <p className="text-xs text-ink-600 mt-1">Uploading gallery images...</p>}
  {galleryUploadError && <p className="text-red-500 text-sm mt-1">{galleryUploadError}</p>}
  {errors.galleryImages && <p className="text-red-500 text-sm mt-1">{errors.galleryImages}</p>}
</div>
  </div>

  {/* Working Hours */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
      <Calendar className="h-4 w-4 mr-2" /> Working Hours *
    </label>
    <div className="space-y-3">
      {formData.workingHours.map((wh, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 text-sm text-gray-700 dark:text-gray-300">{wh[0]}</div>
          <div className="col-span-4">
            <input
              type="text"
              value={wh[1].split(" - ")[0]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                workingHours: prev.workingHours.map((o, i) => i === idx ? [o[0], `${e.target.value} - ${o[1].split(" - ")[1]}`] : o)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Open"
            />
          </div>
          <div className="col-span-4">
            <input
              type="text"
              value={wh[1].split(" - ")[1]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                workingHours: prev.workingHours.map((o, i) => i === idx ? [o[0], `${o[1].split(" - ")[0]} - ${e.target.value}`] : o)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Close"
            />
          </div>
        </div>
      ))}
      {errors.workingHours && <p className="text-red-500 text-sm mt-1">{errors.workingHours}</p>}
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade de la boutique *</label>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {([
        { value: 'basic', label: 'Basic', stars: 1, desc: '1 étoile — Boutique standard' },
        { value: 'pro',   label: 'Pro',   stars: 3, desc: '3 étoiles — Boutique recommandée' },
        { value: 'elite', label: 'Elite', stars: 5, desc: '5 étoiles — Boutique VIP haut de gamme' },
      ] as const).map(({ value, label, stars, desc }) => (
        <button
          key={value}
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, grade: value }))}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            formData.grade === value
              ? 'border-ikigai-primary bg-ikigai-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-800">{label}</span>
            <span className="text-yellow-400">{Array(stars).fill('★').join('')}{Array(5 - stars).fill('☆').join('')}</span>
          </div>
          <p className="text-xs text-gray-500">{desc}</p>
        </button>
      ))}
    </div>
  </div>

   <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsable Shop *</label>
      <select
        value={formData.owner}
        onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.owner ? 'border-red-500' : 'border-gray-300'}`}
        disabled={listsLoading}
      >
        <option value="">{listsLoading ? 'Loading owners...' : 'Select Owner'}</option>
        {responsables.length === 0 && !listsLoading && (
          <option value="">No owners available</option>
        )}
        {responsables.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      {errors.owner && <p className="text-red-500 text-sm mt-1">{errors.owner}</p>}
    </div>



  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
    <Button type="submit" disabled={isSubmitting || isUploadingProfile || isUploadingGallery}>
      {isUploadingProfile || isUploadingGallery ? 'Uploading image...' : isSubmitting ? 'Creating...' : 'Create Shop'}
    </Button>
  </div>
</form>

{modal && (
  <div className={`fixed inset-0 flex items-center justify-center bg-black/50`}>
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg text-center w-80">
      <h2 className="text-lg font-semibold mb-2">
        {modal.type === 'success' ? '✅ Success' : '❌ Error'}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{modal.message}</p>
      <button
        className="bg-blue-600 text-white rounded-lg px-4 py-2"
        onClick={() => { setModal(null); if (inline && modal?.type === 'success') onClose(); }}
      >
        OK
      </button>
    </div>
  </div>
)}

        </div>
  )

  if (inline) return <div className="bg-white dark:bg-gray-900 rounded-lg w-full">{formContent}</div>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {formContent}
      </div>
    </div>
  )
}



