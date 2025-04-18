import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Photo } from '../../photos/types'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { Z_INDEX } from '../../../constants/zIndex'

interface CoverPhotoSelectorProps {
  albumId: string
  currentCoverPhotoId: string | null
  onSelect: (photoId: string | null) => void
}

export function CoverPhotoSelector({ albumId, currentCoverPhotoId, onSelect }: CoverPhotoSelectorProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAlbumPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('album_photos')
        .select('photo:photos(*)')
        .eq('album_id', albumId)
        .order('order_number', { ascending: true })

      if (error) throw error
      const photosData = data?.map(item => item.photo as any).filter(p => p && typeof p === 'object') || []
      setPhotos(photosData as Photo[])
    } catch (err) {
      console.error('Error loading album photos:', err)
      setError('Kon foto\'s niet laden')
    } finally {
      setLoading(false)
    }
  }, [albumId])

  useEffect(() => {
    loadAlbumPhotos()
  }, [loadAlbumPhotos])

  return (
    <div className={`fixed inset-0 bg-black/50 z-[${Z_INDEX.COVER_SELECTOR}] flex items-center justify-center p-4`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Kies cover foto</h2>
          <button onClick={() => onSelect(null)} className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <span className="sr-only">Sluiten</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-800/50">
          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {[...Array(16)].map((_, i) => (
                <LoadingSkeleton key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 text-center py-8">{error}</p>
          ) : photos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Dit album heeft nog geen foto's.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => onSelect(photo.id)}
                  className={`relative aspect-square rounded-md overflow-hidden group border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 ${
                    currentCoverPhotoId === photo.id 
                      ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img 
                    src={photo.thumbnail_url || photo.url}
                    alt={photo.alt_text || photo.title}
                    className="absolute inset-0 w-full h-full object-cover bg-gray-100 dark:bg-gray-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium text-center text-xs px-1">
                      {currentCoverPhotoId === photo.id ? 'Huidige cover' : 'Als cover instellen'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 