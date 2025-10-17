'use client'

import { Button } from '@/components/ui/button'
import { X, MapPin, Phone, Mail, Clock, Calendar, User, Image as ImageIcon } from 'lucide-react'
import { Shop } from '@/types'

interface ShopViewModalProps {
  isOpen: boolean
  onClose: () => void
  shop: Shop | null
  onEdit?: (shop: Shop) => void
  onDelete?: (shopId: string) => void
}

export function ShopViewModal({ isOpen, onClose, shop, onEdit, onDelete }: ShopViewModalProps) {
  if (!isOpen || !shop) return null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Shop Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Shop Header */}
          <div className="flex items-start space-x-6 mb-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-lg bg-ikigai-primary flex items-center justify-center overflow-hidden">
                {shop.profileImage ? (
                  <img 
                    src={shop.profileImage} 
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {shop.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{shop.name}</h3>
                  <p className="text-gray-600 mt-1">{shop.description}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  shop.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Shop Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">{shop.address}</div>
                    <div className="text-sm text-gray-500">
                      {shop.area}, {shop.city}, {shop.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{shop.phone}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{shop.email}</span>
                </div>

                {shop.category && (
                  <div className="flex items-center text-gray-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {shop.category}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <User className="h-5 w-5 mr-3 text-gray-400" />
                  <span>Owner ID: {shop.ownerId}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <div className="text-sm">Created: {formatDate(shop.createdAt)}</div>
                    <div className="text-sm">Updated: {formatDate(shop.updatedAt)}</div>
                  </div>
                </div>

                {shop.tags && shop.tags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Tags:</div>
                    <div className="flex flex-wrap gap-2">
                      {shop.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          {shop.openingHours && shop.openingHours.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shop.openingHours.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{schedule.day}</span>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatTime(schedule.open)} - {formatTime(schedule.close)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {shop.images && shop.images.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {shop.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={image} 
                      alt={`${shop.name} gallery ${index + 1}`}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Count */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Services</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total Services:</span>
                <span className="font-semibold text-gray-900">{shop.services?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button 
                variant="outline" 
                onClick={() => onEdit(shop)}
                className="text-ikigai-primary border-ikigai-primary hover:bg-ikigai-primary hover:text-white"
              >
                Edit Shop
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this shop?')) {
                    onDelete(shop.id)
                  }
                }}
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                Delete Shop
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
