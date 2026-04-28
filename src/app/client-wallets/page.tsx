'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Wallet, User, ArrowUpRight, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'
import { API_BASE_URL } from '@/services/api'

interface ClientWallet {
  id: number
  client_id: number
  balance: number
  client?: {
    id: number
    firstname: string
    lastname: string
    email: string
    phone: string
  }
}

export default function ClientWalletsPage() {
  const [wallets, setWallets] = useState<ClientWallet[]>([])
  const [filteredWallets, setFilteredWallets] = useState<ClientWallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWallet, setSelectedWallet] = useState<ClientWallet | null>(null)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadWallets()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWallets(wallets)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredWallets(
        wallets.filter(
          (w) =>
            w.client?.firstname?.toLowerCase().includes(query) ||
            w.client?.lastname?.toLowerCase().includes(query) ||
            w.client?.email?.toLowerCase().includes(query) ||
            w.client?.phone?.includes(query)
        )
      )
    }
  }, [searchQuery, wallets])

  const loadWallets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/client-wallet`)
      if (!res.ok) throw new Error('Failed to fetch wallets')
      const data = await res.json()
      setWallets(data)
      setFilteredWallets(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load client wallets')
    } finally {
      setIsLoading(false)
    }
  }

  const openTopUpModal = (wallet: ClientWallet) => {
    setSelectedWallet(wallet)
    setTopUpAmount('')
    setError(null)
    setSuccess(null)
    setIsTopUpModalOpen(true)
  }

  const openResetModal = (wallet: ClientWallet) => {
    setSelectedWallet(wallet)
    setError(null)
    setSuccess(null)
    setIsResetModalOpen(true)
  }

  const handleTopUp = async () => {
    if (!selectedWallet || !topUpAmount) return
    
    const amount = parseInt(topUpAmount, 10)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${API_BASE_URL}/client-wallet/${selectedWallet.id}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      
      if (!res.ok) throw new Error('Failed to top up wallet')
      
      const result = await res.json()
      setSuccess(`Successfully added ${amount.toLocaleString()} FCFA to wallet`)
      setIsTopUpModalOpen(false)
      loadWallets()
    } catch (err: any) {
      setError(err.message || 'Failed to top up wallet')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = async () => {
    if (!selectedWallet) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${API_BASE_URL}/client-wallet/${selectedWallet.id}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Failed to reset wallet')

      const result = await res.json()
      setSuccess(`Wallet reset to 0 FCFA successfully`)
      setIsResetModalOpen(false)
      loadWallets()
    } catch (err: any) {
      setError(err.message || 'Failed to reset wallet')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`
  }

  return (
    <RouteGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Portefeuille Client
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gérer les portefeuilles et effectuer des recharges manuelles
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)} 
                className="ml-auto text-red-700 hover:text-red-800 hover:bg-red-100"
              >
                ×
              </Button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSuccess(null)} 
                className="ml-auto text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                ×
              </Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Wallets
                </CardTitle>
                <Wallet className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wallets.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Balance
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(wallets.reduce((sum, w) => sum + w.balance, 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Average Balance
                </CardTitle>
                <User className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    wallets.length > 0
                      ? Math.round(wallets.reduce((sum, w) => sum + w.balance, 0) / wallets.length)
                      : 0
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Wallets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Client Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-primary"></div>
                </div>
              ) : filteredWallets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun portefeuille trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Téléphone</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Solde</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWallets.map((wallet) => (
                        <tr
                          key={wallet.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-ikigai-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-ikigai-primary" />
                              </div>
                              <span className="font-medium">
                                {wallet.client?.firstname} {wallet.client?.lastname}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {wallet.client?.email || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {wallet.client?.phone || '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-ikigai-primary">
                            {formatCurrency(wallet.balance)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              onClick={() => openTopUpModal(wallet)}
                              className="bg-ikigai-primary hover:bg-ikigai-primary/90"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Recharger
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openResetModal(wallet)}
                              disabled={wallet.balance === 0}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reset
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Up Modal */}
          {isTopUpModalOpen && selectedWallet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4">Recharger le portefeuille</h2>
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">
                    {selectedWallet.client?.firstname} {selectedWallet.client?.lastname}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Solde actuel</p>
                  <p className="font-medium text-ikigai-primary">
                    {formatCurrency(selectedWallet.balance)}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Montant à ajouter (FCFA)</label>
                  <Input
                    type="number"
                    placeholder="Entrez le montant"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="1"
                    step="1"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsTopUpModalOpen(false)}
                    disabled={isProcessing}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleTopUp}
                    disabled={isProcessing || !topUpAmount}
                    className="bg-ikigai-primary hover:bg-ikigai-primary/90"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Confirmer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Confirmation Modal */}
          {isResetModalOpen && selectedWallet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4 text-red-600">Confirmer le reset</h2>
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">
                    {selectedWallet.client?.firstname} {selectedWallet.client?.lastname}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Solde actuel</p>
                  <p className="font-bold text-red-600">
                    {formatCurrency(selectedWallet.balance)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Cette action va remettre le solde à <strong>0 FCFA</strong>. Êtes-vous sûr ?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsResetModalOpen(false)}
                    disabled={isProcessing}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Confirmer Reset
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
