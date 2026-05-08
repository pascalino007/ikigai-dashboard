'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { otpApi } from '@/services/api'
import { Key, Mail, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OtpEntry {
  email: string
  otp: string
  createdAt: number
  validated?: boolean
  validatedAt?: number
  expired?: boolean
  expiresAt?: number
}

export default function OtpPage() {
  const [active, setActive] = useState<OtpEntry[]>([])
  const [history, setHistory] = useState<OtpEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOtps = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await otpApi.getAll()
      setActive(data.active || [])
      setHistory(data.history || [])
    } catch (e: any) {
      setError(e.message || 'Failed to fetch OTP codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOtps()
    const interval = setInterval(fetchOtps, 10000) // auto-refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const formatDate = (ts: number) => {
    if (!ts) return '-'
    return new Date(ts).toLocaleString()
  }

  const isExpired = (entry: OtpEntry) => {
    if (entry.expired) return true
    if (entry.expiresAt) return Date.now() > entry.expiresAt
    return false
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">OTP Codes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor active and historical password-reset OTP codes
            </p>
          </div>
          <Button onClick={fetchOtps} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Active OTPs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <Key className="h-5 w-5 mr-2 text-ikigai-primary dark:text-ikigai-teal" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Active OTPs ({active.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTP Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {active.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No active OTP codes
                    </td>
                  </tr>
                ) : (
                  active.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {entry.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-mono font-bold text-ikigai-primary dark:text-ikigai-teal">
                          {entry.otp}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatDate(entry.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {entry.expiresAt ? formatDate(entry.expiresAt) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isExpired(entry) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            <XCircle className="h-3 w-3 mr-1" /> Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Key className="h-3 w-3 mr-1" /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              OTP History ({history.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTP Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No OTP history yet
                    </td>
                  </tr>
                ) : (
                  history.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {entry.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                          {entry.otp}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {entry.validatedAt ? formatDate(entry.validatedAt) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.validated ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <CheckCircle className="h-3 w-3 mr-1" /> Validated
                          </span>
                        ) : entry.expired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            <XCircle className="h-3 w-3 mr-1" /> Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
