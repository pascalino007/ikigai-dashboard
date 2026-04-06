'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Plus, Search, Edit, Trash2, ImageIcon, Tag, Loader2, Grid, List,
  ShoppingBag, CheckCircle, AlertCircle, EyeOff, ChevronLeft, ChevronRight,
  Package, Filter, Store, SlidersHorizontal
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOnly } from '@/components/auth/route-guard'
import { ProductForm, Product } from '@/components/forms/product-form'
import { useAuth } from '@/lib/auth/auth-context'

const PAGE_SIZE = 12

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  available:    { label: 'Disponible',   color: 'bg-green-50 text-green-700 border-green-200',   icon: <CheckCircle className="h-3 w-3" /> },
  out_of_stock: { label: 'Rupture',      color: 'bg-red-50 text-red-600 border-red-200',          icon: <AlertCircle className="h-3 w-3" /> },
  hidden:       { label: 'Masqué',       color: 'bg-gray-100 text-gray-500 border-gray-200',      icon: <EyeOff className="h-3 w-3" /> },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-500 border-gray-200', icon: null }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [allSousCategories, setAllSousCategories] = useState<{ id: string; name: string; category: string }[]>([])
  const [catMap, setCatMap] = useState<Record<string, string>>({})
  const [scatMap, setScatMap] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterScat, setFilterScat] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [pRes, cRes, scRes] = await Promise.all([
        fetch(`${API_BASE_URL}/marketplace/products`),
        fetch(`${API_BASE_URL}/categories/`),
        fetch(`${API_BASE_URL}/sous-categories`),
      ])
      if (pRes.ok) { const d = await pRes.json(); setProducts(Array.isArray(d) ? d : []) }
      if (cRes.ok) {
        const d = await cRes.json()
        const cats = Array.isArray(d) ? d.map((c: any) => ({ id: String(c.id), name: c.name })) : []
        setCategories(cats)
        setCatMap(Object.fromEntries(cats.map(c => [c.id, c.name])))
      }
      if (scRes.ok) {
        const d = await scRes.json()
        const scs = Array.isArray(d) ? d.map((s: any) => ({ id: String(s.id), name: s.name, category: String(s.category) })) : []
        setAllSousCategories(scs)
        setScatMap(Object.fromEntries(scs.map(s => [s.id, s.name])))
      }
    } finally { setIsLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const filteredSousCategories = useMemo(() =>
    filterCat === 'all' ? allSousCategories : allSousCategories.filter(s => s.category === filterCat),
    [filterCat, allSousCategories])

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) ||
        (p.Description ?? '').toLowerCase().includes(q) ||
        (catMap[p.Category] ?? p.Category ?? '').toLowerCase().includes(q)
      const matchCat = filterCat === 'all' || p.Category === filterCat
      const matchScat = filterScat === 'all' || p.sous_category === filterScat
      const matchStatus = filterStatus === 'all' || p.status === filterStatus
      return matchSearch && matchCat && matchScat && matchStatus
    })
  }, [products, searchTerm, filterCat, filterScat, filterStatus, catMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetPage = () => setPage(1)

  const stats = useMemo(() => ({
    total: products.length,
    available: products.filter(p => p.status === 'available').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    hidden: products.filter(p => p.status === 'hidden').length,
  }), [products])

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return
    await fetch(`${API_BASE_URL}/marketplace/products/${id}`, { method: 'DELETE' }).catch(() => {})
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-ikigai-primary" />Marketplace
              </h1>
              <p className="text-sm text-gray-500 mt-1">Gérez votre catalogue de produits</p>
            </div>
            <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true) }}
              className="bg-ikigai-primary hover:bg-ikigai-primary/90 self-start sm:self-auto shadow-sm">
              <Plus className="h-4 w-4 mr-2" />Nouveau produit
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Package className="h-5 w-5 text-ikigai-primary" />, bg: 'bg-ikigai-primary/10', val: stats.total, label: 'Total' },
              { icon: <CheckCircle className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', val: stats.available, label: 'Disponibles' },
              { icon: <AlertCircle className="h-5 w-5 text-red-500" />, bg: 'bg-red-50', val: stats.outOfStock, label: 'Rupture' },
              { icon: <EyeOff className="h-5 w-5 text-gray-400" />, bg: 'bg-gray-100', val: stats.hidden, label: 'Masqués' },
            ].map(({ icon, bg, val, label }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
                <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
                <div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{val}</p><p className="text-xs text-gray-500">{label}</p></div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Rechercher un produit..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ikigai-primary"
                  value={searchTerm} onChange={e => { setSearchTerm(e.target.value); resetPage() }} />
              </div>
              {/* Category */}
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ikigai-primary"
                value={filterCat} onChange={e => { setFilterCat(e.target.value); setFilterScat('all'); resetPage() }}>
                <option value="all">Toutes catégories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {/* Sous-category */}
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ikigai-primary disabled:opacity-50"
                value={filterScat} onChange={e => { setFilterScat(e.target.value); resetPage() }}
                disabled={filteredSousCategories.length === 0}>
                <option value="all">Toutes sous-catégories</option>
                {filteredSousCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {/* Status */}
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ikigai-primary"
                value={filterStatus} onChange={e => { setFilterStatus(e.target.value); resetPage() }}>
                <option value="all">Tous statuts</option>
                <option value="available">Disponible</option>
                <option value="out_of_stock">Rupture</option>
                <option value="hidden">Masqué</option>
              </select>
              {/* View toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1 ml-auto">
                {(['grid', 'list'] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === m ? 'bg-white dark:bg-gray-700 shadow-sm text-ikigai-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                    {m === 'grid' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
            {/* Active filters summary */}
            {(filterCat !== 'all' || filterScat !== 'all' || filterStatus !== 'all' || searchTerm) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
                <button onClick={() => { setFilterCat('all'); setFilterScat('all'); setFilterStatus('all'); setSearchTerm(''); resetPage() }}
                  className="text-xs text-ikigai-primary hover:underline ml-auto">Réinitialiser</button>
              </div>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 py-20 flex flex-col items-center justify-center shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-ikigai-primary mb-3" />
              <p className="text-sm text-gray-400">Chargement des produits...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 py-20 flex flex-col items-center justify-center shadow-sm">
              <ShoppingBag className="h-12 w-12 text-gray-200 mb-4" />
              <p className="text-gray-600 font-medium">Aucun produit trouvé</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || filterCat !== 'all' || filterScat !== 'all' || filterStatus !== 'all'
                  ? 'Modifiez vos filtres pour voir plus de résultats.'
                  : 'Commencez par ajouter votre premier produit.'}
              </p>
              {!searchTerm && filterCat === 'all' && filterScat === 'all' && filterStatus === 'all' && (
                <Button className="mt-4 bg-ikigai-primary hover:bg-ikigai-primary/90"
                  onClick={() => { setEditingProduct(null); setIsModalOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />Ajouter un produit
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
              {paginated.map(product => (
                <div key={product.id} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
                    {product.image1 ? (
                      <img src={product.image1} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2"><StatusBadge status={product.status} /></div>
                    {product.provider_id === 0 && (
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-ikigai-primary/90 text-white text-xs rounded font-medium">
                          <Store className="h-2.5 w-2.5" />Admin
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingProduct(product); setIsModalOpen(true) }}
                        className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow text-gray-700 hover:text-ikigai-primary transition-colors">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => product.id && handleDelete(product.id)}
                        className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow text-gray-700 hover:text-red-600 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1 mb-1">{product.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.Category && (
                        <span className="px-1.5 py-0.5 bg-ikigai-primary/10 text-ikigai-primary text-xs rounded font-medium">
                          {catMap[product.Category] ?? product.Category}
                        </span>
                      )}
                      {product.sous_category && (
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded">
                          {scatMap[product.sous_category] ?? product.sous_category}
                        </span>
                      )}
                    </div>
                    {product.Description && (
                      <p className="text-xs text-gray-400 line-clamp-2 flex-1">{product.Description}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                      <p className="text-base font-bold text-ikigai-primary">{Number(product.price).toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA</span></p>
                      {product.image2 && <span className="text-xs text-gray-400">+{[product.image2, product.image3].filter(Boolean).length} photo{[product.image2, product.image3].filter(Boolean).length > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List view */
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produit</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prix</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendeur</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {paginated.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                              {product.image1
                                ? <img src={product.image1} alt={product.name} className="h-full w-full object-cover" />
                                : <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-gray-300" /></div>}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
                              {product.Description && <p className="text-xs text-gray-400 max-w-xs truncate">{product.Description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {product.Category && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ikigai-primary/10 text-ikigai-primary">
                              {catMap[product.Category] ?? product.Category}
                            </span>
                          )}
                          {product.sous_category && (
                            <p className="text-xs text-gray-400 mt-0.5">{scatMap[product.sous_category] ?? product.sous_category}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-bold text-ikigai-primary">{Number(product.price).toLocaleString()}</p>
                          <p className="text-xs text-gray-400">FCFA</p>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={product.status} /></td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.provider_id === 0
                              ? 'bg-ikigai-primary/10 text-ikigai-primary'
                              : 'bg-purple-50 text-purple-700'
                          }`}>
                            <Store className="h-3 w-3" />
                            {product.provider_id === 0 ? 'Admin' : `Salon #${product.provider_id}`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditingProduct(product); setIsModalOpen(true) }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-ikigai-primary hover:bg-ikigai-primary/10 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => product.id && handleDelete(product.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-5 py-3 shadow-sm">
              <p className="text-sm text-gray-500">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} sur <span className="font-semibold text-gray-700 dark:text-gray-300">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-ikigai-primary hover:text-ikigai-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1).reduce<(number | '...')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(n); return acc
                }, []).map((n, i) =>
                  n === '...'
                    ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    : <button key={n} onClick={() => setPage(n as number)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${safePage === n ? 'bg-ikigai-primary text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        {n}
                      </button>
                )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-ikigai-primary hover:text-ikigai-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <ProductForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => { fetchAll(); setIsModalOpen(false) }}
          initialData={editingProduct}
          providerId={user?.id ? parseInt(user.id) : 0}
        />
      </DashboardLayout>
    </AdminOnly>
  )
}
