import { useState, useCallback } from 'react'
import { PhotoGrid } from '../../photos/components/PhotoGrid'
import { PhotoSelector } from './PhotoSelector'
import { AlbumForm } from './AlbumForm'
import type { AlbumWithDetails } from '../types'
import { supabase } from '../../../lib/supabase'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { Z_INDEX } from '../../../constants/zIndex'

interface AlbumDetailModalProps {
  album: AlbumWithDetails
  onClose: () => void
  onSave: () => Promise<void>
}

export function AlbumDetailModal({ album, onClose, onSave }: AlbumDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingPhotos, setIsAddingPhotos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [photos, setPhotos] = useState(album.photos?.map(ap => ap.photo) || [])

  const handleError = useCallback((message: string) => {
    setError(new Error(message))
  }, [])

  const handleUpdate = useCallback(async () => {
    try {
      await onSave()
    } catch {
      handleError('Kon gegevens niet bijwerken')
    }
  }, [onSave, handleError])

  const handleVisibilityToggle = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase
        .from('albums')
        .update({ visible: !album.visible })
        .eq('id', album.id)

      if (error) throw error
      handleUpdate()
    } catch (err) {
      console.error('Error toggling visibility:', err)
      handleError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoRemove = async (photoId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase
        .from('album_photos')
        .delete()
        .match({ 
          album_id: album.id,
          photo_id: photoId 
        })

      if (error) throw error

      // Update lokale state
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      handleUpdate()
    } catch (err) {
      console.error('Error removing photo:', err)
      handleError('Er ging iets mis bij het verwijderen van de foto')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotosAdd = useCallback(async (selectedPhotoIds: string[]) => {
    try {
      setLoading(true)
      setError(null)

      // Haal huidige order numbers op
      const { data: currentPhotos, error: orderError } = await supabase
        .from('album_photos')
        .select('order_number')
        .eq('album_id', album.id)
        .order('order_number', { ascending: false })
        .limit(1)

      if (orderError) throw orderError

      let nextOrderNumber = (currentPhotos?.[0]?.order_number || 0) + 1

      // Voeg nieuwe foto's toe
      const { error: insertError } = await supabase
        .from('album_photos')
        .insert(
          selectedPhotoIds.map(photoId => ({
            album_id: album.id,
            photo_id: photoId,
            order_number: nextOrderNumber++
          }))
        )

      if (insertError) throw insertError

      // Haal bijgewerkte foto's op
      const { data: updatedPhotos, error: fetchError } = await supabase
        .from('photos')
        .select('*')
        .in('id', selectedPhotoIds)

      if (fetchError) throw fetchError

      // Update lokale state
      setPhotos(prev => [...prev, ...(updatedPhotos || [])])
      handleUpdate()
    } catch (err) {
      console.error('Error adding photos:', err)
      handleError('Er ging iets mis bij het toevoegen van de foto\'s')
    } finally {
      setLoading(false)
      setIsAddingPhotos(false)
    }
  }, [album.id, handleError, handleUpdate])

  return (
    <div className={`fixed inset-0 bg-black/30 z-[${Z_INDEX.BASE_MODAL}]`}>
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.BASE_MODAL}]`}>
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Album: {album.title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleVisibilityToggle}
                disabled={loading}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  album.visible
                    ? 'text-green-700 bg-green-50 hover:bg-green-100'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {album.visible ? 'Zichtbaar' : 'Verborgen'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
              >
                Bewerken
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Sluiten</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center justify-between">
                <span>{error.message}</span>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <span className="sr-only">Sluiten</span>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Album Info */}
            <div className="mb-6">
              <div className="flex items-start gap-6">
                {album.cover_photo && (
                  <img
                    src={album.cover_photo.thumbnail_url || album.cover_photo.url}
                    alt={album.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="mt-1 text-gray-500">{album.description}</p>
                  )}
                  <div className="mt-2 flex gap-2 text-sm text-gray-500">
                    <span>{album.photos?.length || 0} foto's</span>
                    <span>•</span>
                    <span>Volgorde: {album.order_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setIsAddingPhotos(true)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Foto's toevoegen
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Album bewerken
              </button>
            </div>

            {/* Photos Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Foto's in dit album
                </h3>
                <span className="text-sm text-gray-500">
                  {photos.length} foto's
                </span>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <LoadingSkeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    Nog geen foto's in dit album
                  </p>
                  <button
                    onClick={() => setIsAddingPhotos(true)}
                    className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Foto's toevoegen
                  </button>
                </div>
              ) : (
                <PhotoGrid
                  photos={photos}
                  loading={loading}
                  error={error}
                  onUpdate={handleUpdate}
                  setError={setError}
                  onPhotoRemove={handlePhotoRemove}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                />
              )}
            </div>
          </div>
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
      </div>
    </div>
  )
} 