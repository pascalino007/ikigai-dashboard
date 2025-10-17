'use client'

import { Button } from '@/components/ui/button'
import { X, MapPin, Phone, Mail, Clock, DollarSign, Star, Calendar, User } from 'lucide-react'
import { Worker } from '@/types'

interface WorkerViewModalProps {
  isOpen: boolean
  onClose: () => void
  worker: Worker | null
  onEdit?: (worker: Worker) => void
  onDelete?: (workerId: string) => void
}

export function WorkerViewModal({ isOpen, onClose, worker, onEdit, onDelete }: WorkerViewModalProps) {
  if (!isOpen || !worker) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-red-100 text-red-800'
      case 'break': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'busy': return 'Busy'
      case 'break': return 'On Break'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Worker Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Worker Header */}
          <div className="flex items-start space-x-6 mb-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-lg bg-ikigai-primary flex items-center justify-center overflow-hidden">
                {worker.profilePicture ? (
                  <img 
                    src={worker.profilePicture} 
                    alt={`${worker.firstName} ${worker.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {worker.firstName[0]}{worker.lastName[0]}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {worker.firstName} {worker.lastName}
                  </h3>
                  <p className="text-gray-600 mt-1">{worker.specialization}</p>
                  <p className="text-sm text-gray-500 mt-1">{worker.experience} years of experience</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(worker.status)}`}>
                    {getStatusText(worker.status)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    worker.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {worker.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Worker Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{worker.email}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{worker.phone}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <User className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{worker.specialization}</span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Professional Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                  <span>${worker.hourlyRate}/hour</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Star className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{worker.rating} rating ({worker.totalBookings} bookings)</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                  <span>${worker.totalEarnings.toLocaleString()} total earnings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Schedule</span>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{worker.workingHours.start} - {worker.workingHours.end}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {worker.workingHours.days.map((day, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-ikigai-primary text-white">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Bookings</p>
                    <p className="text-2xl font-bold text-blue-900">{worker.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-900">${worker.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Average Rating</p>
                    <p className="text-2xl font-bold text-yellow-900">{worker.rating}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {worker.status === 'busy' && worker.currentBookingId && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Booking</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Currently working on booking</p>
                    <p className="text-sm text-red-600">Booking ID: {worker.currentBookingId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button 
                variant="outline" 
                onClick={() => onEdit(worker)}
                className="text-ikigai-primary border-ikigai-primary hover:bg-ikigai-primary hover:text-white"
              >
                Edit Worker
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this worker?')) {
                    onDelete(worker.id)
                  }
                }}
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                Delete Worker
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
