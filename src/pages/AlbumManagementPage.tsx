import { useState } from 'react'
import { AlbumGrid } from '../features/albums/components/AlbumGrid'
import { AlbumForm } from '../features/albums/components/AlbumForm'
import { AlbumDetailModal } from '../features/albums/components/AlbumDetailModal'
import { usePageTitle } from '../hooks/usePageTitle'
import type { AlbumWithDetails } from '../features/albums/types'
import { supabase } from '../lib/supabase'
import { H1, SmallText } from '../components/typography'
import { cc } from '../styles/shared'

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
          <H1>Albums</H1>
          <SmallText className="mt-1">
            Beheer hier je foto albums. Elk album kan worden getoond op de hoofdpagina.
          </SmallText>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className={cc.button.base({ color: 'primary' })}
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