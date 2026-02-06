'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, MapPin, Phone, Mail, Tag, Image as ImageIcon, Calendar, Navigation } from 'lucide-react'

interface OpeningHour {
  day: string
  open: string
  close: string
}

interface ShopFormData {
  name: string;
  category: string;
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
  long?: number;
  lat?: number;
}

interface ShopFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ShopFormData) => void
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
  const { isOpen, onClose, onSubmit } = props

const [formData, setFormData] = useState<ShopFormData>({
  name: '',
  category: '',
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
  long: undefined,
  lat: undefined,
});

  const [errors, setErrors] = useState<Partial<Record<keyof ShopFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // fetched lists for selects
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [responsables, setResponsables] = useState<Array<{ id: string; name: string }>>([])
  const [listsLoading, setListsLoading] = useState(false)
  const [listsError, setListsError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const loadLists = async () => {
      setListsLoading(true)
      setListsError(null)
      try {
        const [catRes, provRes] = await Promise.all([
          fetch('http://168.231.101.119:4040/categories/'),
          fetch('http://168.231.101.119:4040/proownners')
        ])
        if (!catRes.ok) throw new Error(`Failed to fetch categories (${catRes.status})`)
        if (!provRes.ok) throw new Error(`Failed to fetch responsables (${provRes.status})`)

        const cats = await catRes.json()
        const provs = await provRes.json()

        if (!mounted) return
        // normalize responses to { id, name }
        setCategories(Array.isArray(cats) ? cats.map((c: any) => ({ id: String(c.id ?? c._id ?? c._key ?? c.name), name: c.name ?? c.Category ?? String(c) })) : [])
        setResponsables(Array.isArray(provs) ? provs.map((p: any) => ({ id: String(p.id ?? p._id ?? p._key), name: `${p.firstname || ''} ${p.lastname || ''}`.trim() || p.email || p.name || 'Unknown' })) : [])
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

  // Upload profile image to backend and set returned imageUrl on success
  const uploadProfileImage = async (file: File) => {
    setProfileUploadError(null)
    // local preview immediately
    setFormData(prev => ({ ...prev, profileImageUrl: URL.createObjectURL(file) }))
    const form = new FormData()
    form.append('image', file) // backend expects 'image'

    setIsUploadingProfile(true)
    try {
      const res = await fetch('http://168.231.101.119:4040/upload', { method: 'POST', body: form })
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
            long: longitude,
            lat: latitude,
            ...(geo && {
              address: geo.address,
              pays: geo.pays || prev.pays,
              ville: geo.ville || prev.ville,
              quartier: geo.quartier || prev.quartier,
            }),
          }))
        } catch {
          setLocationError('Could not fetch address from coordinates')
          setFormData(prev => ({ ...prev, long: longitude, lat: latitude }))
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
  if (!formData.category.trim()) newErrors.category = 'Category is required';
  if (!formData.type.trim()) newErrors.type = 'Type is required';
  if (!formData.tags.trim()) newErrors.tags = 'Tags are required';
  if ( !formData.profileImageUrl) newErrors.profileImageUrl = 'Profile image is required';
  if (!formData.cfeImageUrl.trim()) newErrors.cfeImageUrl = 'CFE image is required';
  if (!formData.address.trim()) newErrors.address = 'Address is required';
  if (!formData.pays?.trim()) newErrors.pays = 'Country is required';
  if (!formData.ville.trim()) newErrors.ville = 'City is required';
  if (!formData.quartier.trim()) newErrors.quartier = 'Neighborhood is required';
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
    const res = await fetch('http://168.231.101.119:4040/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error('Failed to submit shop data');

    const data = await res.json();
    console.log('✅ Shop created:', data);

    // ✅ Show success modal
    setModal({
      type: 'success',
      message: 'Shop created successfully!',
    });

    // Optionally close form
    onClose();
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


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Shop</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
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
      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
      <select
        value={formData.category}
        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
        disabled={listsLoading}
      >
        <option value="">{listsLoading ? 'Loading categories...' : 'Select category'}</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>
      {listsError && <p className="text-xs text-red-500 mt-1">Failed to load lists: {listsError}</p>}
      {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
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
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
      <Tag className="h-4 w-4 mr-2" /> Service Tags
    </label>
    <div className="flex flex-wrap gap-2">
      {SERVICE_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1 rounded-full text-sm border ${formData.tags.includes(tag) ? 'bg-ikigai-primary text-white border-ikigai-primary' : 'bg-white text-gray-700 border-gray-300'}`}
        >
          {tag}
        </button>
      ))}
    </div>
    {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
  </div>

  {/* Address / Pays / Ville / Quartier */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        <MapPin className="h-4 w-4 mr-1" /> Address *
      </label>
      <input
        type="text"
        value={formData.address}
        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Enter address"
      />
      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
      <select
        value={formData.pays}
        onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.pays ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select Region</option>
        <option value="maritime">Maririme</option>
        <option value="centrale">Centrale</option>
      </select>
      {errors.pays && <p className="text-red-500 text-sm mt-1">{errors.pays}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
      <select
        value={formData.pays}
        onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.pays ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select country</option>
        <option value="Togo">Togo</option>
        <option value="Benin">Benin</option>
        <option value="Ghana">Ghana</option>
      </select>
      {errors.pays && <p className="text-red-500 text-sm mt-1">{errors.pays}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
      <select
        value={formData.ville}
        onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.ville ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select city</option>
        <option value="Lomé">Lomé</option>
        <option value="Kara">Kara</option>
      </select>
      {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Arrondissement*</label>
      <select
        value={formData.ville}
        onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.ville ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select Arrondissement</option>
         <option value="1">1er arrondissement</option>
         <option value="2">2em arrondissement</option>
         <option value="3">3em arrondissement</option>
          <option value="4">4em arrondissement</option>
         <option value="5">5em arrondissement</option>

      </select>
      {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Quartier *</label>
      <select
        value={formData.quartier}
        onChange={(e) => setFormData(prev => ({ ...prev, quartier: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.quartier ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select quartier</option>
        <option value="Agoe">Agoe</option>
        <option value="Avedji">Avedji</option>
      </select>
      {errors.quartier && <p className="text-red-500 text-sm mt-1">{errors.quartier}</p>}
    </div>

    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        <MapPin className="h-4 w-4 mr-1" /> Position (long, lat)
      </label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePickCurrentPosition}
          disabled={isGettingLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isGettingLocation ? 'Getting position...' : 'Use my location'}
        </Button>
        {(formData.lat != null && formData.long != null) && (
          <span className="text-sm text-gray-600">
            {formData.lat.toFixed(6)}, {formData.long.toFixed(6)}
          </span>
        )}
      </div>
      {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
    </div>
  </div>

   <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Non loin de  *</label>
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
    <label className="block text-sm font-medium text-gray-700 mb-1">Description le Boutique *</label>
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
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
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
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
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
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
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
  <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images *</label>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files || []);
      const urls = files.map(file => URL.createObjectURL(file)); // temporary preview URLs
      setFormData(prev => ({
        ...prev,
        galleryImages: urls
      }));
    }}
  />
  {errors.galleryImages && <p className="text-red-500 text-sm mt-1">{errors.galleryImages}</p>}
</div>
  </div>

  {/* Working Hours */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
      <Calendar className="h-4 w-4 mr-2" /> Working Hours *
    </label>
    <div className="space-y-3">
      {formData.workingHours.map((wh, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 text-sm text-gray-700">{wh[0]}</div>
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

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        <MapPin className="h-4 w-4 mr-1" /> Address *
      </label>
      <input
        type="text"
        value={formData.address}
        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Enter address"
      />
      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
      <select
        value={formData.pays}
        onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.pays ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select Region</option>
        <option value="maritime">Maririme</option>
        <option value="centrale">Centrale</option>
      </select>
      {errors.pays && <p className="text-red-500 text-sm mt-1">{errors.pays}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Abonnement *</label>
      <select
        value={formData.pays}
        onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.pays ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select Abonnement</option>
        <option value="BASIC">BASIC</option>
        <option value="recommended">Recommended</option>
        <option value="vip">VIP </option>
      </select>
      {errors.pays && <p className="text-red-500 text-sm mt-1">{errors.pays}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Duree *</label>
      <select
        value={formData.ville}
        onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.ville ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select Duration en Mois</option>
        <option value="6"> 6 </option>
        <option value="12"> 12 </option>
      </select>
      {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville}</p>}
    </div>

   

  
  </div>

   <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Responsable Shop *</label>
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
    <Button type="submit" disabled={isSubmitting || isUploadingProfile}>
      {isUploadingProfile ? 'Uploading image...' : isSubmitting ? 'Creating...' : 'Create Shop'}
    </Button>
  </div>
</form>

{modal && (
  <div className={`fixed inset-0 flex items-center justify-center bg-black/50`}>
    <div className="bg-white rounded-xl p-6 shadow-lg text-center w-80">
      <h2 className="text-lg font-semibold mb-2">
        {modal.type === 'success' ? '✅ Success' : '❌ Error'}
      </h2>
      <p className="text-gray-700 mb-4">{modal.message}</p>
      <button
        className="bg-blue-600 text-white rounded-lg px-4 py-2"
        onClick={() => setModal(null)}
      >
        OK
      </button>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  )
}



