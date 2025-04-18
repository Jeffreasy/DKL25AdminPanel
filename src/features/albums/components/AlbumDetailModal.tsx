import { useState, useCallback } from 'react'
import { PhotoGrid } from '../../photos/components/PhotoGrid'
import { PhotoSelector } from './PhotoSelector'
import { AlbumForm } from './AlbumForm'
import { CoverPhotoSelector } from './CoverPhotoSelector'
import type { AlbumWithDetails } from '../types'
import type { Photo } from '../../photos/types'
import { supabase } from '../../../lib/supabase'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { Z_INDEX } from '../../../constants/zIndex'
import { PhotoOrderer } from './PhotoOrderer'
import { cc } from '../../../styles/shared'
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

  const handleError = useCallback((message: string) => {
    setError(new Error(message))
  }, [])

  const handleUpdate = useCallback(async () => {
    try {
      await onSave()
      // Refresh photos in modal after save if necessary
      const { data, error: fetchError } = await supabase
        .from('album_photos')
        .select('photo:photos(*)')
        .eq('album_id', album.id)
        .order('order_number', { ascending: true })
      if (fetchError) throw fetchError
      const photosData = data?.map(item => item.photo as any).filter(p => p && typeof p === 'object') || []
      setPhotos(photosData as Photo[])
    } catch {
      handleError('Kon gegevens niet bijwerken')
    }
  }, [album.id, onSave, handleError])

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
      handleUpdate() // Call full update to refresh data source
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

      const { data: currentPhotos, error: orderError } = await supabase
        .from('album_photos')
        .select('order_number')
        .eq('album_id', album.id)
        .order('order_number', { ascending: false })
        .limit(1)

      if (orderError) throw orderError

      let nextOrderNumber = (currentPhotos?.[0]?.order_number || 0) + 1

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

      handleUpdate() // Call full update to refresh data source
    } catch (err) {
      console.error('Error adding photos:', err)
      handleError('Er ging iets mis bij het toevoegen van de foto\'s')
    } finally {
      setLoading(false)
      setIsAddingPhotos(false)
    }
  }, [album.id, handleError, handleUpdate])

  // Handler for selecting cover photo
  const handleCoverPhotoSelect = async (photoId: string | null) => {
    if (photoId === null) {
      setShowCoverSelector(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('albums')
        .update({ cover_photo_id: photoId })
        .eq('id', album.id);
  
      if (error) throw error;
  
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
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.BASE_MODAL}]`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Album: {album.title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleVisibilityToggle}
                disabled={loading}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                  album.visible
                    ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900'
                    : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {album.visible ? 'Zichtbaar' : 'Verborgen'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Bewerken
              </button>
              <button 
                onClick={onClose} 
                className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">Sluiten</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/50">
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

            {/* Album Info */}
            <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={album.cover_photo?.thumbnail_url || album.cover_photo?.url || ''}
                    alt={album.title}
                    className="w-48 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
                    onError={(e) => {
                       e.currentTarget.onerror = null;
                       e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF' width='48' height='48'%3E%3Cpath d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm16.5-1.5H3.75V6h16.5v13.5z'/%3E%3C/svg%3E`;
                       e.currentTarget.classList.add('p-4');
                    }}
                  />
                  <button 
                    onClick={() => setShowCoverSelector(true)}
                    className={cc.button.icon({ size: 'sm', color: 'secondary', className: 'absolute bottom-1 right-1 bg-white/70 dark:bg-gray-900/70'})}
                    title="Cover foto wijzigen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{album.description}</p>
                  )}
                  <div className="mt-2 flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{photos?.length || 0} foto's</span>
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
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Album details bewerken
              </button>
            </div>

            {/* Photos Grid */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Album Foto's (Sleep = sorteer, Klik 🗑️ = verwijder)
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {photos.length} foto's
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <LoadingSkeleton key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Nog geen foto's in dit album
                  </p>
                  <button
                    onClick={() => setIsAddingPhotos(true)}
                    className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                  >
                    Foto's toevoegen
                  </button>
                </div>
              ) : (
                <PhotoOrderer 
                  album={album} 
                  onOrderChange={handleUpdate} 
                  onPhotoRemove={handlePhotoRemove}
                />
              )}
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