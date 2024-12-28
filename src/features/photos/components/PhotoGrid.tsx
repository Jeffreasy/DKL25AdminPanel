import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
import { PhotoCard } from './PhotoCard'
import { supabase } from '../../../lib/supabase'
import type { Photo } from '../types'
import type { Album } from '../../albums/types'
import { deletePhoto } from '../../../features/services/photoService'

interface PhotoGridProps {
  photos: Photo[]
  loading: boolean
  error: string | null
  onUpdate: () => Promise<void>
  view?: 'grid' | 'list'
  setError?: (error: string | null) => void
}

export function PhotoGrid({ 
  photos, 
  loading, 
  error, 
  onUpdate,
  view = 'grid',
  setError = () => {}
}: PhotoGridProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [showAlbumSelector, setShowAlbumSelector] = useState(false)
  const [albums, setAlbums] = useState<Album[]>([])
  const [loadingAlbums, setLoadingAlbums] = useState(false)

  // Laad albums wanneer de selector wordt geopend
  useEffect(() => {
    if (showAlbumSelector) {
      loadAlbums()
    }
  }, [showAlbumSelector])

  const loadAlbums = async () => {
    try {
      setLoadingAlbums(true)
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('title')

      if (error) throw error
      setAlbums(data)
    } catch (err) {
      console.error('Error loading albums:', err)
      setError('Er ging iets mis bij het ophalen van de albums')
    } finally {
      setLoadingAlbums(false)
    }
  }

  const addToAlbum = async (albumId: string) => {
    try {
      // Eerst checken welke foto's al in het album zitten
      const { data: existingPhotos, error: fetchError } = await supabase
        .from('album_photos')
        .select('photo_id')
        .eq('album_id', albumId)

      if (fetchError) throw fetchError

      // Filter de foto's die we willen toevoegen
      const existingPhotoIds = new Set(existingPhotos?.map(p => p.photo_id) || [])
      const photosToAdd = Array.from(selectedPhotos).filter(id => !existingPhotoIds.has(id))

      if (photosToAdd.length === 0) {
        setError('Deze foto\'s zitten al in het album')
        return
      }

      // Haal huidige order numbers op
      const { data: currentPhotos, error: orderError } = await supabase
        .from('album_photos')
        .select('order_number')
        .eq('album_id', albumId)
        .order('order_number', { ascending: false })
        .limit(1)

      if (orderError) throw orderError

      let nextOrderNumber = (currentPhotos?.[0]?.order_number || 0) + 1

      // Voeg alleen nieuwe foto's toe
      const { error: insertError } = await supabase
        .from('album_photos')
        .insert(
          photosToAdd.map(photoId => ({
            album_id: albumId,
            photo_id: photoId,
            order_number: nextOrderNumber++
          }))
        )

      if (insertError) throw insertError

      setSelectedPhotos(new Set())
      setShowAlbumSelector(false)
      onUpdate()
    } catch (err) {
      console.error('Error adding photos to album:', err)
      setError('Er ging iets mis bij het toevoegen aan het album')
    }
  }

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Weet je zeker dat je deze foto wilt verwijderen?`)) return

    try {
      await deletePhoto(photo.id)
      await onUpdate()
    } catch (err) {
      console.error('Error deleting photo:', err)
      setError('Er ging iets mis bij het verwijderen van de foto')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return
    if (!confirm(`Weet je zeker dat je ${selectedPhotos.size} foto's wilt verwijderen?`)) return

    try {
      await Promise.all(Array.from(selectedPhotos).map(id => deletePhoto(id)))
      setSelectedPhotos(new Set())
      await onUpdate()
    } catch (err) {
      console.error('Error bulk deleting photos:', err)
      setError('Er ging iets mis bij het verwijderen van de foto\'s')
    }
  }

  console.log('PhotoGrid render:', { photos, loading, error });

  if (loading) {
    return (
      <div className={
        view === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-4"
      }>
        {[...Array(8)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-square" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>
  }

  return (
    <div className={
      view === 'grid' 
        ? "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2"
        : "space-y-4"
    }>
      {/* Bulk actions */}
      {selectedPhotos.size > 0 && (
        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedPhotos.size} foto{selectedPhotos.size === 1 ? '' : '\'s'} geselecteerd
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAlbumSelector(true)}
              className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md"
            >
              Toevoegen aan album
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
            >
              Verwijderen
            </button>
          </div>
        </div>
      )}

      {/* Album Selector Modal */}
      {showAlbumSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Kies een album</h2>
            </div>
            <div className="p-6">
              {loadingAlbums ? (
                <LoadingSkeleton className="h-40" />
              ) : (
                <div className="space-y-2">
                  {albums.map(album => (
                    <button
                      key={album.id}
                      onClick={() => addToAlbum(album.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">{album.title}</div>
                      {album.description && (
                        <div className="text-sm text-gray-500">{album.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAlbumSelector(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          selected={selectedPhotos.has(photo.id)}
          onSelect={(selected: boolean) => {
            const newSelection = new Set(selectedPhotos)
            if (selected) {
              newSelection.add(photo.id)
            } else {
              newSelection.delete(photo.id)
            }
            setSelectedPhotos(newSelection)
          }}
          onDelete={() => handleDelete(photo)}
          view={view}
        />
      ))}
    </div>
  )
} 