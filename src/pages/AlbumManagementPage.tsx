import { useState } from 'react'
import { AlbumGrid } from '../features/albums/components/AlbumGrid'
import { AlbumForm } from '../features/albums/components/AlbumForm'
import { AlbumDetailModal } from '../features/albums/components/AlbumDetailModal'
import { usePageTitle } from '../hooks/usePageTitle'
import type { AlbumWithDetails } from '../features/albums/types'
import { supabase } from '../lib/supabase'

export function AlbumManagementPage() {
  usePageTitle("Albums beheren")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithDetails | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleAlbumSelect = async (albumId: string) => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          cover_photo:photos!albums_cover_photo_id_fkey(*),
          photos:album_photos(
            photo:photos(*)
          )
        `)
        .eq('id', albumId)
        .single()

      if (error) throw error
      setSelectedAlbum(data)
    } catch (err) {
      console.error('Error loading album:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Albums</h1>
          <p className="mt-1 text-sm text-gray-500">
            Beheer hier je foto albums. Elk album kan worden getoond op de hoofdpagina.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Nieuw album
          </button>
        </div>
      </div>

      <AlbumGrid 
        key={refreshKey}
        onAlbumSelect={handleAlbumSelect}
        selectedAlbumId={selectedAlbum?.id}
      />

      {isCreating && (
        <AlbumForm
          onComplete={() => {
            setIsCreating(false)
            handleRefresh()
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {selectedAlbum && (
        <AlbumDetailModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          onSave={async () => {
            await handleRefresh()
            handleAlbumSelect(selectedAlbum.id)
          }}
        />
      )}
    </div>
  )
} 