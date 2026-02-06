'use client'

import { useState } from 'react'
import { Search, X, Users, Store, TrendingUp } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOnly } from '@/components/auth/route-guard'

interface Enroller {
  id: string
  name: string
  email: string
  avatar?: string
  shopsEnrolled: number
  providers: number
  revenue: number
  children?: Enroller[]
}

interface Manager {
  id: string
  name: string
  email: string
  avatar?: string
  enrollersCount: number
  totalShops: number
  enrollers: Enroller[]
}

// Mock data – replace with API calls
const mockManagers: Manager[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    enrollersCount: 3,
    totalShops: 24,
    enrollers: [
      {
        id: 'e1',
        name: 'Marie Martin',
        email: 'marie@example.com',
        shopsEnrolled: 12,
        providers: 8,
        revenue: 4500,
      },
      {
        id: 'e2',
        name: 'Pierre Bernard',
        email: 'pierre@example.com',
        shopsEnrolled: 8,
        providers: 5,
        revenue: 3200,
      },
      {
        id: 'e3',
        name: 'Sophie Laurent',
        email: 'sophie@example.com',
        shopsEnrolled: 4,
        providers: 3,
        revenue: 1800,
      },
    ],
  },
  {
    id: '2',
    name: 'Claire Rousseau',
    email: 'claire@example.com',
    enrollersCount: 2,
    totalShops: 15,
    enrollers: [
      {
        id: 'e4',
        name: 'Thomas Moreau',
        email: 'thomas@example.com',
        shopsEnrolled: 9,
        providers: 6,
        revenue: 4100,
      },
      {
        id: 'e5',
        name: 'Julie Petit',
        email: 'julie@example.com',
        shopsEnrolled: 6,
        providers: 4,
        revenue: 2500,
      },
    ],
  },
]

function EnrollerTreeCard({ enroller, index }: { enroller: Enroller; index: number }) {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 border border-gray-100 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden shrink-0">
          {enroller.avatar ? (
            <img src={enroller.avatar} alt={enroller.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-white">
              {enroller.name.split(' ').map((n) => n[0]).join('')}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{enroller.name}</p>
          <p className="text-xs text-gray-500">{enroller.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-gray-50 rounded p-2">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{enroller.shopsEnrolled}</p>
          <p className="text-xs text-gray-500">Shops</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{enroller.providers}</p>
          <p className="text-xs text-gray-500">Providers</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="font-semibold text-gray-900 dark:text-gray-100">${enroller.revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>
      </div>
    </div>
  )
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>(mockManagers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [showTree, setShowTree] = useState(false)

  const filteredManagers = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleManagerImageClick = (manager: Manager) => {
    setSelectedManager(manager)
    setShowTree(true)
  }

  const handleCloseTree = () => {
    setShowTree(false)
    setTimeout(() => setSelectedManager(null), 300)
  }

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Managers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Click on a manager&apos;s image to view their enroller tree and stats</p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search managers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredManagers.map((manager) => (
              <div
                key={manager.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col items-center text-center">
                  <button
                    type="button"
                    onClick={() => handleManagerImageClick(manager)}
                    className="group relative mb-4 focus:outline-none focus:ring-2 focus:ring-ikigai-primary focus:ring-offset-2 rounded-full"
                  >
                    <div className="h-24 w-24 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg transition-transform group-hover:scale-110 group-active:scale-95">
                      {manager.avatar ? (
                        <img
                          src={manager.avatar}
                          alt={manager.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {manager.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </button>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{manager.name}</h3>
                  <p className="text-sm text-gray-500 truncate w-full">{manager.email}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {manager.enrollersCount} enrollers
                    </span>
                    <span className="flex items-center gap-1">
                      <Store className="h-4 w-4" />
                      {manager.totalShops} shops
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredManagers.length === 0 && (
            <div className="text-center py-12 text-gray-500">No managers found</div>
          )}
        </div>

        {/* Tree overlay - animated */}
        {showTree && selectedManager && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
            onClick={handleCloseTree}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-zoom-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden">
                    {selectedManager.avatar ? (
                      <img
                        src={selectedManager.avatar}
                        alt={selectedManager.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {selectedManager.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedManager.name}</h2>
                    <p className="text-sm text-gray-500">{selectedManager.email}</p>
                    <p className="text-sm text-ikigai-primary font-medium mt-1">
                      {selectedManager.enrollersCount} enrollers · {selectedManager.totalShops} shops
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseTree}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Enroller Tree
                </h3>
                <div className="space-y-4">
                  {selectedManager.enrollers.map((enroller, idx) => (
                    <div key={enroller.id} className="relative pl-6 border-l-2 border-ikigai-primary/30 ml-4">
                      <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-ikigai-primary" />
                      <EnrollerTreeCard enroller={enroller} index={idx} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AdminOnly>
  )
}
