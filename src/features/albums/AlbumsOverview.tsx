import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AlbumGrid } from './components/display/AlbumGrid'
import { AlbumForm } from './components/forms/AlbumForm'
import { AlbumDetailModal } from './components/detail/AlbumDetailModal'
import { GalleryPreviewModal } from './components/preview/GalleryPreviewModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import type { AlbumWithDetails } from './types'
import { fetchAlbumById } from './services/albumService'
import { H1, SmallText } from '../../components/typography/typography'
import { cc } from '../../styles/shared'
import { usePermissions } from '../../hooks/usePermissions'
import {
  InformationCircleIcon,
  PhotoIcon,
  PlusCircleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

export function AlbumsOverview() {
  const { hasPermission } = usePermissions()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithDetails | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const canWriteAlbums = hasPermission('album', 'write')

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleAlbumSelect = useCallback(async (albumId: string | null) => {
    if (!albumId) {
      setSelectedAlbum(null)
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('openAlbum')
      setSearchParams(newSearchParams, { replace: true })
      return
    }
    try {
      const data = await fetchAlbumById(albumId)
      setSelectedAlbum(data)
    } catch (err) {
      console.error('Error loading album:', err)
      setSelectedAlbum(null)
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('openAlbum')
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const albumIdToOpen = searchParams.get('openAlbum')
    if (albumIdToOpen && !selectedAlbum) {
      console.log("Opening album from query param:", albumIdToOpen)
      handleAlbumSelect(albumIdToOpen)
    }
  }, [searchParams, selectedAlbum, handleAlbumSelect])

  return (
    <div className={cc.spacing.section.md}>
      {/* Help Section - Explaining Albums */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-5 mb-6">
        <div className="flex gap-4">
          <InformationCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
              📁 Wat zijn Albums?
            </h3>
            <div className="text-sm text-purple-800 dark:text-purple-200 space-y-3">
              <p>
                Albums zijn verzamelingen van foto's die je kunt groeperen per evenement, thema of datum.
                Je kunt albums publiceren op de website zodat bezoekers je fotogalerijen kunnen bekijken.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="bg-white/50 dark:bg-purple-800/20 rounded-lg p-3 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-start gap-2">
                    <PlusCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">1. Maak een Album</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Klik op "Nieuw album" en geef het een titel en beschrijving
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-purple-800/20 rounded-lg p-3 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-start gap-2">
                    <PhotoIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">2. Voeg Foto's Toe</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Open het album en voeg foto's toe vanuit je{' '}
                        <Link to="/media?tab=photos" className="underline hover:text-purple-900 dark:hover:text-purple-100">
                          foto bibliotheek
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-purple-800/20 rounded-lg p-3 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-start gap-2">
                    <PencilIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">3. Stel Cover In</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Kies een foto als cover afbeelding voor het album
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-purple-800/20 rounded-lg p-3 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-start gap-2">
                    <EyeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">4. Publiceer</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Zet "Zichtbaar op website" aan om het album te publiceren
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center ${cc.spacing.gap.lg}`}>
          <div>
            <H1 className="mb-1">Albums</H1>
            <SmallText>
              Organiseer je foto's in albums en publiceer ze op de website
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