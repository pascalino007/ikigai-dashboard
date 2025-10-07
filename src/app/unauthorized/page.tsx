'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleGoBack = () => {
    router.push('/')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this resource.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-left">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current User:</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Name:</strong> {user?.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button onClick={handleGoBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Dashboard
          </Button>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
