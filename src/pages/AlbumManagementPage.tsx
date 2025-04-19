import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlbumGrid } from '../features/albums/components/AlbumGrid'
import { AlbumForm } from '../features/albums/components/AlbumForm'
import { AlbumDetailModal } from '../features/albums/components/AlbumDetailModal'
// Import the new preview modal
import { GalleryPreviewModal } from '../features/albums/components/GalleryPreviewModal'
import { usePageTitle } from '../hooks/usePageTitle'
import type { AlbumWithDetails } from '../features/albums/types'
import { supabase } from '../lib/supabase'
import { H1, SmallText } from '../components/typography'
import { cc } from '../styles/shared'

export function AlbumManagementPage() {
  usePageTitle("Albums beheren")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithDetails | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false) // State for preview modal
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleAlbumSelect = useCallback(async (albumId: string | null) => {
    if (!albumId) {
      setSelectedAlbum(null)
      searchParams.delete('openAlbum')
      setSearchParams(searchParams, { replace: true })
      return
    }
    try {
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          cover_photo:photos!cover_photo_id(*),
          photos:album_photos(
            order_number, 
            photo:photos(*)
          )
        `)
        .eq('id', albumId)
        .single()

      if (error) throw error
      setSelectedAlbum(data)
    } catch (err) {
      console.error('Error loading album:', err)
      setSelectedAlbum(null)
      searchParams.delete('openAlbum')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const albumIdToOpen = searchParams.get('openAlbum')
    if (albumIdToOpen && !selectedAlbum) {
      console.log("Opening album from query param:", albumIdToOpen)
      handleAlbumSelect(albumIdToOpen)
    }
  }, [searchParams, handleAlbumSelect, selectedAlbum])

  return (
    <div className="space-y-6">
      {/* Header: Use flex-col on mobile, sm:flex-row on larger screens */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <H1>Albums</H1>
          <SmallText className="mt-1">
            Beheer hier je foto albums. Elk album kan worden getoond op de hoofdpagina.
          </SmallText>
        </div>
        {/* Button group alignment adjustment for flex-col */}
        <div className="flex gap-3 justify-end sm:justify-normal">
          {/* Add Preview Button */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className={cc.button.base({ color: 'secondary' })}
          >
            Preview Galerij
          </button>
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
          onClose={() => handleAlbumSelect(null)}
          onSave={async () => {
            await handleRefresh()
            if (selectedAlbum) {
              handleAlbumSelect(selectedAlbum.id)
            }
          }}
        />
      )}

      {/* Render Preview Modal (conditionally) */}
      {showPreviewModal && (
        <GalleryPreviewModal
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  )
} 