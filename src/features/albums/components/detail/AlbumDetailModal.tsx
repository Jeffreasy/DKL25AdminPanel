import { useState, useCallback } from 'react'
import { PhotoSelector } from '../forms/PhotoSelector'
import { AlbumForm } from '../forms/AlbumForm'
import { CoverPhotoSelector } from '../forms/CoverPhotoSelector'
import { AlbumDetailHeader } from './AlbumDetailHeader'
import { AlbumDetailInfo } from './AlbumDetailInfo'
import { AlbumDetailActions } from './AlbumDetailActions'
import { AlbumDetailPhotos } from './AlbumDetailPhotos'
import type { AlbumWithDetails } from '../../types'
import { updateAlbum, addPhotosToAlbum, removePhotoFromAlbum, fetchAlbumById } from '../../services/albumService'
import { Z_INDEX } from '../../../../config/zIndex'
import { toast } from 'react-hot-toast'

interface AlbumDetailModalProps {
  album: AlbumWithDetails
  onClose: () => void
  onSave: () => Promise<void>
}

export function AlbumDetailModal({ album, onClose, onSave }: AlbumDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingPhotos, setIsAddingPhotos] = useState(false)
  const [showCoverSelector, setShowCoverSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [photos, setPhotos] = useState(album.photos?.map(ap => ap.photo) || [])
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null)

  const handleError = useCallback((message: string) => {
    setError(new Error(message))
  }, [])

  const handleUpdate = useCallback(async () => {
    try {
      await onSave()
      // Refresh album data to get updated photos
      const updatedAlbum = await fetchAlbumById(album.id)
      if (updatedAlbum && updatedAlbum.photos) {
        setPhotos(updatedAlbum.photos.map(ap => ap.photo))
      }
    } catch {
      handleError('Kon gegevens niet bijwerken')
    }
  }, [album.id, onSave, handleError])

  const handleVisibilityToggle = async () => {
    const newVisible = !album.visible

    // Optimistic update - immediately update UI
    album.visible = newVisible

    try {
      setLoading(true)
      setError(null)
      await updateAlbum(album.id, { visible: newVisible })
      handleUpdate()
    } catch (err) {
      console.error('Error toggling visibility:', err)
      // Revert optimistic update on error
      album.visible = !newVisible
      handleError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoRemove = async (photoId: string) => {
    // Optimistic update - immediately remove from UI
    const originalPhotos = [...photos]
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    setRemovingPhotoId(photoId)

    try {
      setLoading(true)
      setError(null)

      await removePhotoFromAlbum(album.id, photoId)

      handleUpdate() // Call full update to refresh data source
    } catch (err) {
      console.error('Error removing photo:', err)
      // Revert optimistic update on error
      setPhotos(originalPhotos)
      handleError('Er ging iets mis bij het verwijderen van de foto')
    } finally {
      setLoading(false)
      setRemovingPhotoId(null)
    }
  }

  const handlePhotosAdd = useCallback(async (selectedPhotoIds: string[]) => {
    try {
      setLoading(true)
      setError(null)

      await addPhotosToAlbum(album.id, selectedPhotoIds)

      // Stel automatisch cover foto in als er nog geen is
      if (!album.cover_photo_id && selectedPhotoIds.length > 0) {
        try {
          await updateAlbum(album.id, { cover_photo_id: selectedPhotoIds[0] })
        } catch (coverError) {
          console.error('Error setting cover photo:', coverError)
        }
      }

      handleUpdate() // Call full update to refresh data source
    } catch (err) {
      console.error('Error adding photos:', err)
      handleError('Er ging iets mis bij het toevoegen van de foto\'s')
    } finally {
      setLoading(false)
      setIsAddingPhotos(false)
    }
  }, [album.id, album.cover_photo_id, handleError, handleUpdate])

  // Handler for selecting cover photo
  const handleCoverPhotoSelect = async (photoId: string | null) => {
    if (photoId === null) {
      setShowCoverSelector(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await updateAlbum(album.id, { cover_photo_id: photoId });

      toast.success('Cover foto bijgewerkt');
      handleUpdate(); // Refresh data
    } catch (err) {
      console.error('Error updating cover photo:', err);
      setError(new Error(err instanceof Error ? err.message : 'Kon cover foto niet bijwerken'));
    } finally {
      setLoading(false);
      setShowCoverSelector(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/30 dark:bg-black/60 z-[${Z_INDEX.BASE_MODAL}]`}> 
      <div className={`fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[${Z_INDEX.BASE_MODAL}]`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl max-h-[90vh] sm:max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
          <AlbumDetailHeader
            title={album.title}
            visible={album.visible}
            onVisibilityToggle={handleVisibilityToggle}
            onEdit={() => setIsEditing(true)}
            onClose={onClose}
            loading={loading}
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
              album={album}
              photosCount={photos?.length || 0}
              onCoverPhotoSelect={() => setShowCoverSelector(true)}
            />

            <AlbumDetailActions
              onAddPhotos={() => setIsAddingPhotos(true)}
              onEditAlbum={() => setIsEditing(true)}
              loading={loading}
            />

            <AlbumDetailPhotos
              album={album}
              photosCount={photos.length}
              loading={loading}
              onOrderChange={handleUpdate}
              onPhotoRemove={handlePhotoRemove}
              onAddPhotos={() => setIsAddingPhotos(true)}
              removingPhotoId={removingPhotoId}
            />
          </div>

          {/* Edit Modal */} 
          {isEditing && (
            <AlbumForm
              album={album}
              onComplete={() => {
                setIsEditing(false)
                handleUpdate()
              }}
              onCancel={() => setIsEditing(false)}
            />
          )}

          {/* Photo Selector */}
          {isAddingPhotos && (
            <PhotoSelector
              albumId={album.id}
              existingPhotoIds={photos.map(p => p.id)}
              onComplete={handlePhotosAdd}
              onCancel={() => setIsAddingPhotos(false)}
            />
          )}

          {/* Cover Photo Selector Modal */}
          {showCoverSelector && (
            <CoverPhotoSelector
              albumId={album.id}
              currentCoverPhotoId={album.cover_photo_id ?? null}
              onSelect={handleCoverPhotoSelect}
            />
          )}
        </div>
      </div>
    </div>
  )
} 