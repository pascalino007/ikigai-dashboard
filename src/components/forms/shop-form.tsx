'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, MapPin, Phone, Mail, Tag, Image as ImageIcon, Calendar } from 'lucide-react'

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


export function ShopForm({ isOpen, onClose, onSubmit }: ShopFormProps) {
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
});

  const [errors, setErrors] = useState<Partial<Record<keyof ShopFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
            <h2 className="text-2xl font-bold text-gray-900">Add New Shop</h2>
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
      >
        <option value="">Select category</option>
        <option value="Beaute">Beaute</option>
        <option value="Coiffure Homme">Coiffure Homme</option>
        <option value="Tresse">Tresse</option>
      </select>
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
   onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      profileImageFile: file,
      profileImageUrl: URL.createObjectURL(file) // optional preview
    }));
  }}
/>
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

   <div>s
      <label className="block text-sm font-medium text-gray-700 mb-1">Responsable Shop *</label>
      <select
        value={formData.owner}
        onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.ville ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option >Select Owner</option>
        <option value="Joe">Mr Joe</option>
        <option value="Kim">Miss Kim</option>
      </select>
      {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville}</p>}
    </div>

  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Shop'}</Button>
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



