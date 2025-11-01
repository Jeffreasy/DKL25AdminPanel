import { useState, useCallback, useEffect } from 'react'
import { PhotoSelector } from '../forms/PhotoSelector'
import { AlbumForm } from '../forms/AlbumForm'
import { CoverPhotoSelector } from '../forms/CoverPhotoSelector'
import { AlbumDetailHeader } from './AlbumDetailHeader'
import { AlbumDetailInfo } from './AlbumDetailInfo'
import { AlbumDetailActions } from './AlbumDetailActions'
import { AlbumDetailPhotos } from './AlbumDetailPhotos'
import { useAlbumData, useAlbumMutations } from '../../hooks'
import type { AlbumWithDetails } from '../../types'
import { Z_INDEX } from '../../../../config/zIndex'
import { toast } from 'react-hot-toast'

interface AlbumDetailModalProps {
  album: AlbumWithDetails
  onClose: () => void
  onSave: () => Promise<void>
}

export function AlbumDetailModal({ album: initialAlbum, onClose, onSave }: AlbumDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingPhotos, setIsAddingPhotos] = useState(false)
  const [showCoverSelector, setShowCoverSelector] = useState(false)
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { album, loading: loadingAlbum, loadAlbum } = useAlbumData({
    albumId: initialAlbum.id,
    autoLoad: true
  })
  
  const {
    toggleVisibility,
    addPhotos,
    removePhoto,
    updateCoverPhoto,
    updating
  } = useAlbumMutations()

  const currentAlbum = album || initialAlbum
  const photos = currentAlbum.photos?.map(ap => ap.photo) || []
  const isLoading = loadingAlbum || updating

  // Reload album when initialAlbum changes
  useEffect(() => {
    if (initialAlbum.id && !album) {
      loadAlbum(initialAlbum.id)
    }
  }, [initialAlbum.id, album, loadAlbum])

  const handleUpdate = useCallback(async () => {
    try {
      await onSave()
      await loadAlbum(initialAlbum.id)
    } catch {
      setError(new Error('Kon gegevens niet bijwerken'))
    }
  }, [initialAlbum.id, onSave, loadAlbum])

  const handleVisibilityToggle = useCallback(async () => {
    try {
      setError(null)
      await toggleVisibility(currentAlbum)
      await handleUpdate()
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError(new Error('Er ging iets mis bij het wijzigen van de zichtbaarheid'))
    }
  }, [currentAlbum, toggleVisibility, handleUpdate])

  const handlePhotoRemove = useCallback(async (photoId: string) => {
    setRemovingPhotoId(photoId)
    try {
      setError(null)
      await removePhoto(currentAlbum.id, photoId)
      await handleUpdate()
    } catch (err) {
      console.error('Error removing photo:', err)
      setError(new Error('Er ging iets mis bij het verwijderen van de foto'))
    } finally {
      setRemovingPhotoId(null)
    }
  }, [currentAlbum.id, removePhoto, handleUpdate])

  const handlePhotosAdd = useCallback(async (selectedPhotoIds: string[]) => {
    try {
      setError(null)
      await addPhotos(currentAlbum.id, selectedPhotoIds)

      // Set cover photo automatically if none exists
      if (!currentAlbum.cover_photo_id && selectedPhotoIds.length > 0) {
        try {
          await updateCoverPhoto(currentAlbum.id, selectedPhotoIds[0])
        } catch (coverError) {
          console.error('Error setting cover photo:', coverError)
        }
      }

      await handleUpdate()
    } catch (err) {
      console.error('Error adding photos:', err)
      setError(new Error('Er ging iets mis bij het toevoegen van de foto\'s'))
    } finally {
      setIsAddingPhotos(false)
    }
  }, [currentAlbum.id, currentAlbum.cover_photo_id, addPhotos, updateCoverPhoto, handleUpdate])

  const handleCoverPhotoSelect = useCallback(async (photoId: string | null) => {
    if (photoId === null) {
      setShowCoverSelector(false)
      return
    }
    try {
      setError(null)
      await updateCoverPhoto(currentAlbum.id, photoId)
      toast.success('Cover foto bijgewerkt')
      await handleUpdate()
    } catch (err) {
      console.error('Error updating cover photo:', err)
      setError(new Error(err instanceof Error ? err.message : 'Kon cover foto niet bijwerken'))
    } finally {
      setShowCoverSelector(false)
    }
  }, [currentAlbum.id, updateCoverPhoto, handleUpdate])

  return (
    <div className={`fixed inset-0 bg-black/30 dark:bg-black/60 z-[${Z_INDEX.BASE_MODAL}]`}> 
      <div className={`fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[${Z_INDEX.BASE_MODAL}]`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[90vh] sm:max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
          <AlbumDetailHeader
            title={currentAlbum.title}
            visible={currentAlbum.visible}
            onVisibilityToggle={handleVisibilityToggle}
            onEdit={() => setIsEditing(true)}
            onClose={onClose}
            loading={updating}
          />

          {/* Content: Adjusted padding */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-md flex items-center justify-between border border-red-200 dark:border-red-800/50">
                <span>{error.message}</span>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50"
                >
                  <span className="sr-only">Sluiten</span>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            <AlbumDetailInfo
              album={currentAlbum}
              photosCount={photos.length}
              onCoverPhotoSelect={() => setShowCoverSelector(true)}
            />

            <AlbumDetailActions
              onAddPhotos={() => setIsAddingPhotos(true)}
              onEditAlbum={() => setIsEditing(true)}
              loading={updating}
            />

            <AlbumDetailPhotos
              album={currentAlbum}
              photosCount={photos.length}
              loading={isLoading}
              onOrderChange={handleUpdate}
              onPhotoRemove={handlePhotoRemove}
              onAddPhotos={() => setIsAddingPhotos(true)}
              removingPhotoId={removingPhotoId}
            />
          </div>

          {isEditing && (
            <AlbumForm
              album={currentAlbum}
              onComplete={() => {
                setIsEditing(false)
                handleUpdate()
              }}
              onCancel={() => setIsEditing(false)}
            />
          )}

          {isAddingPhotos && (
            <PhotoSelector
              albumId={currentAlbum.id}
              existingPhotoIds={photos.map(p => p.id)}
              onComplete={handlePhotosAdd}
              onCancel={() => setIsAddingPhotos(false)}
            />
          )}

          {showCoverSelector && (
            <CoverPhotoSelector
              albumId={currentAlbum.id}
              currentCoverPhotoId={currentAlbum.cover_photo_id ?? null}
              onSelect={handleCoverPhotoSelect}
            />
          )}
        </div>
      </div>
    </div>
  )
} 