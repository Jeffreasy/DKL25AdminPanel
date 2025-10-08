import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlbumGrid } from '../features/albums/components/display/AlbumGrid'
import { AlbumForm } from '../features/albums/components/forms/AlbumForm'
import { AlbumDetailModal } from '../features/albums/components/detail/AlbumDetailModal'
import { GalleryPreviewModal } from '../features/albums/components/preview/GalleryPreviewModal'
import { ErrorBoundary } from '../features/albums/components/ErrorBoundary'
import { usePageTitle } from '../hooks/usePageTitle'
import type { AlbumWithDetails } from '../features/albums/types'
import { supabase } from '../lib/supabase'
import { H1, SmallText } from '../components/typography'
import { cc } from '../styles/shared'
import { usePermissions } from '../hooks/usePermissions'

export function AlbumManagementPage() {
  usePageTitle("Albums beheren")
  const { hasPermission } = usePermissions()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithDetails | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false) // State for preview modal
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const canReadAlbums = hasPermission('album', 'read')
  const canWriteAlbums = hasPermission('album', 'write')

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

  if (!canReadAlbums) {
    return (
      <div className={cc.spacing.container.md}>
        <div className="text-center">
          <H1>Geen toegang</H1>
          <SmallText>U heeft geen toestemming om albums te beheren.</SmallText>
        </div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center ${cc.spacing.gap.lg}`}>
          <div>
            <H1 className="mb-1">Albums</H1>
            <SmallText>
              Beheer hier je foto albums. Elk album kan worden getoond op de hoofdpagina.
            </SmallText>
          </div>
          <div className={`flex ${cc.spacing.gap.md} justify-end sm:justify-normal flex-shrink-0`}>
            <button
              onClick={() => setShowPreviewModal(true)}
              className={cc.button.base({ color: 'secondary' })}
            >
              Preview Galerij
            </button>
            {canWriteAlbums && (
              <button
                onClick={() => setIsCreating(true)}
                className={cc.button.base({ color: 'primary' })}
              >
                Nieuw album
              </button>
            )}
          </div>
        </div>
      </div>

      <ErrorBoundary>
        <AlbumGrid
          key={refreshKey}
          onAlbumSelect={handleAlbumSelect}
          selectedAlbumId={selectedAlbum?.id}
        />
      </ErrorBoundary>

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