'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, User, Upload, Shield } from 'lucide-react'
import { User as UserType } from '@/types'

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  superior : string
  role: 'admin' | 'manager' | 'provider' | 'customer' | 'enroller' | 'designer'
  profilePicture: File | null
  isActive: boolean
}

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  /** Called after the user was created/updated on the backend. */
  onSubmit?: (data: any) => void
  initialData?: UserType | null
}

export function UserForm({ isOpen, onClose, onSubmit, initialData }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    superior : '' ,
    role: 'customer',
    profilePicture: null,
    isActive: true
  })

  const [errors, setErrors] = useState<Partial<UserFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  // INIT DATA --------------------------------------
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone || '',
        superior : initialData.superior ,
        role: initialData.role,
        profilePicture: null,
        isActive: initialData.isActive
      })
      setImagePreview(initialData.profilePicture || '')
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'customer',
        superior: 'admin',
        profilePicture: null,
        isActive: true
      })
      setImagePreview('')
    }
  }, [initialData, isOpen])

  // INPUT HANDLERS ----------------------------------------
  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange('profilePicture', file)

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(initialData?.profilePicture || '')
    }
  }

  // VALIDATION -------------------------------------
  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // IMAGE UPLOAD ------------------------------------
  const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.filename; 
};


  // SUBMIT FORM -------------------------------------
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    let uploadedImageName = initialData?.profilePicture || "";

    // Upload image ONLY if it's a new File
    if (formData.profilePicture && formData.profilePicture instanceof File) {
      const imgName = await uploadImage(formData.profilePicture);

      if (imgName) {
        uploadedImageName = imgName;
      } else {
        console.error("Image upload failed");
      }
    }

    // Payload to backend — create via /auth/signup, edit via /auth/:id
    const isEdit = !!initialData;
    const payload: any = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      image: uploadedImageName,
    };
    if (isEdit) {
      payload.is_active = formData.isActive;
    } else {
      payload.password = "ikigai";
    }

    const url = isEdit
      ? `${API_BASE_URL}/auth/${initialData!.id}`
      : `${API_BASE_URL}/auth/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.log(isEdit ? "Update failed" : "Signup failed");
      console.log(payload);
      return;
    }

    const result = await res.json().catch(() => null);
    onSubmit?.(result ?? payload);

    // Reset fields
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      superior : "",
      role: "customer",
      profilePicture: null,
      isActive: true
    });

    setImagePreview("");
    onClose();
  } catch (err) {
    console.error("Submit error:", err);
  } finally {
    setIsSubmitting(false);
  }
};


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {initialData ? 'Edit User' : 'Add New User'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* FULL UI UNCHANGED — ONLY SUBMIT LOGIC MODIFIED */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- all your original form fields stay exactly the same --- */}
            {/* (I did not touch layout, styling, or structure) */}

            {/* USER DETAILS */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-gray-100">
                <User className="h-5 w-5 mr-2" />
                User Details
              </h3>

              {/* FIRST / LAST NAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.firstName ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    }`}
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.lastName ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                  placeholder="Enter email"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter phone number"
                />
              </div>

              {/* PROFILE PICTURE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>

                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-20 h-20 object-cover rounded-lg border mb-4"
                  />
                )}

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* ROLE + STATUS */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-gray-100">
                <Shield className="h-5 w-5 mr-2" />
                Role & Status
              </h3>


              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="enroller">Enroller</option>
                  <option value="manager">Manager</option>
                  <option value="designer">Designer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                 Superieur Herachique*
                </label>
                <select
                  value={formData.superior}
                  onChange={(e) => handleInputChange("superior", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="1">Mrs Eric</option>
                  <option value="2"> Mrs John Doe</option>
                  <option value="3">Mr Barro</option>
                  <option value="4">N/A</option>
                  <option value="5">Admin</option>
                </select>
              </div>

              

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="h-4 w-4 text-ikigai-primary"
                />
                <label className="ml-2 text-sm">Active user</label>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? initialData
                    ? "Updating..."
                    : "Creating..."
                  : initialData
                  ? "Update User"
                  : "Create User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
