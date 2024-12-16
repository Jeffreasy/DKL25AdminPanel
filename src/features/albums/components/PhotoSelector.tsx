import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import type { PhotoWithDetails } from '../../photos/types'
import type { AlbumWithDetails } from '../types'

interface PhotoSelectorProps {
  album: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

export function PhotoSelector({ album, onComplete, onCancel }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<PhotoWithDetails[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      // Eerst haal de huidige foto's van het album op
      const { data: albumPhotos } = await supabase
        .from('photos_albums')
        .select('photo_id')
        .eq('album_id', album.id)

      const currentPhotoIds = albumPhotos?.map(p => p.photo_id) || []
      setSelectedPhotos(currentPhotoIds)

      // Dan alle beschikbare foto's
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('order_number', { ascending: true })

      if (error) throw error
      setPhotos(data)
    } catch (err) {
      console.error('Error fetching photos:', err)
      setError('Er ging iets mis bij het ophalen van de foto\'s')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Verwijder eerst alle bestaande relaties
      await supabase
        .from('photos_albums')
        .delete()
        .eq('album_id', album.id)

      // Voeg dan de nieuwe relaties toe
      if (selectedPhotos.length > 0) {
        const photosToInsert = selectedPhotos.map((photoId, index) => ({
          photo_id: photoId,
          album_id: album.id,
          order_number: index
        }))

        const { error } = await supabase
          .from('photos_albums')
          .insert(photosToInsert)

        if (error) throw error
      }

      onComplete()
    } catch (err) {
      console.error('Error saving photos:', err)
      setError('Er ging iets mis bij het opslaan van de foto\'s')
    }
  }

  const togglePhoto = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Foto's selecteren</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {selectedPhotos.length} foto's geselecteerd
            </span>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Sluiten</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  onClick={() => togglePhoto(photo.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                    selectedPhotos.includes(photo.id) ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-black transition-opacity ${
                    selectedPhotos.includes(photo.id) ? 'bg-opacity-40' : 'bg-opacity-0 group-hover:bg-opacity-20'
                  }`}>
                    {selectedPhotos.includes(photo.id) && (
                      <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  )
} 