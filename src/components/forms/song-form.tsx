'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Music, Upload } from 'lucide-react'
import { Song } from '@/types'

interface SongFormData {
  title: string
  artist: string
  audio: File | null
  cover: File | null
  isActive: boolean
  order: number
}

interface SongFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: Song
}

export function SongForm({ isOpen, onClose, onSubmit, initialData }: SongFormProps) {
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    artist: '',
    audio: null,
    cover: null,
    isActive: true,
    order: 0
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SongFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        artist: initialData.artist || '',
        audio: null,
        cover: null,
        isActive: initialData.isActive,
        order: initialData.order
      })
      setCoverPreview(initialData.coverUrl || '')
    } else {
      setFormData({
        title: '',
        artist: '',
        audio: null,
        cover: null,
        isActive: true,
        order: 0
      })
      setCoverPreview('')
    }
  }, [initialData, isOpen])

  const handleInputChange = (field: keyof SongFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange('audio', file)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange('cover', file)
    
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SongFormData, string>> = {}

    if (!formData.title.trim()) newErrors.title = 'Song title is required'
    if (!formData.audio && !initialData) newErrors.audio = 'Audio file is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('artist', formData.artist)
      submitData.append('isActive', String(formData.isActive))
      submitData.append('order', String(formData.order))
      
      if (formData.audio) {
        submitData.append('audio', formData.audio)
      }
      if (formData.cover) {
        submitData.append('cover', formData.cover)
      }

      await onSubmit(submitData)
      
      setFormData({
        title: '',
        artist: '',
        audio: null,
        cover: null,
        isActive: true,
        order: 0
      })
      setCoverPreview('')
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Song' : 'Add New Song'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Song Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter song title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  placeholder="Enter artist name"
                />
              </div>

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Music className="h-4 w-4 mr-1" />
                  Audio File {!initialData && '*'}
                </label>
                
                {formData.audio && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Selected: {formData.audio.name}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> audio file
                      </p>
                      <p className="text-xs text-gray-500">MP3, WAV, M4A (max 50MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="audio/*"
                      onChange={handleAudioChange}
                    />
                  </label>
                </div>
                {errors.audio && (
                  <p className="text-red-500 text-sm mt-1">{errors.audio}</p>
                )}
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Cover Image (Optional)
                </label>
                
                {coverPreview && (
                  <div className="mb-4">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> cover image
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (Recommended: 800x800px)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverChange}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-ikigai-primary focus:ring-ikigai-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active song (visible on mobile app)
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (initialData ? 'Updating...' : 'Uploading...') 
                  : (initialData ? 'Update Song' : 'Upload Song')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
