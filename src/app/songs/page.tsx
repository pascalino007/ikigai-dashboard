'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Music, Upload, Volume2 } from 'lucide-react'
import { Song } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SongForm } from '@/components/forms/song-form'

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (song.artist?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && song.isActive) ||
                         (filterStatus === 'inactive' && !song.isActive)
    return matchesSearch && matchesStatus
  })

  const handleAddSong = async (data: any) => {
    const newSong: Song = {
      id: Date.now().toString(),
      title: data.title,
      artist: data.artist || '',
      coverUrl: data.coverUrl || null,
      fileUrl: data.fileUrl,
      isActive: data.isActive !== false,
      order: data.order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSongs(prev => [newSong, ...prev])
    setShowAddModal(false)
  }

  const handleUpdateSong = async (data: any) => {
    if (!editingSong) return
    
    const updatedSong: Song = {
      ...editingSong,
      title: data.title,
      artist: data.artist || '',
      coverUrl: data.coverUrl || null,
      isActive: data.isActive !== false,
      order: data.order || 0,
      updatedAt: new Date()
    }
    
    setSongs(prev => prev.map(s => 
      s.id === editingSong.id ? updatedSong : s
    ))
    setEditingSong(null)
  }

  const handleDeleteSong = (songId: string) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      setSongs(prev => prev.filter(s => s.id !== songId))
    }
  }

  const handleToggleStatus = (songId: string) => {
    setSongs(prev => prev.map(s => 
      s.id === songId 
        ? { ...s, isActive: !s.isActive, updatedAt: new Date() }
        : s
    ))
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Music Library</h1>
              <p className="text-gray-600 mt-2">Manage songs available on the mobile app</p>
              <div className="mt-2 text-sm text-gray-500">
                Active songs: {songs.filter(s => s.isActive).length} / {songs.length}
              </div>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Song
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search songs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.map((song) => (
            <div key={song.id} className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="h-16 w-16 text-white" />
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    song.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {song.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
                    <p className="text-sm text-gray-600">{song.artist || 'Unknown Artist'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                  <Volume2 className="h-3 w-3" />
                  <span>Available on mobile app</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Added {song.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleStatus(song.id)}
                    >
                      {song.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingSong(song)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSong(song.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSongs.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Music className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No songs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first song.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Song
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Add Song Form */}
        <SongForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSong}
        />

        {/* Edit Song Form */}
        <SongForm
          isOpen={!!editingSong}
          onClose={() => setEditingSong(null)}
          onSubmit={handleUpdateSong}
          initialData={editingSong || undefined}
        />
      </div>
    </DashboardLayout>
  )
}
