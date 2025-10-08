import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../../lib/supabase'
import type { Photo } from '../../../photos/types'
import { Z_INDEX } from '../../../../constants/zIndex'
import { cc } from '../../../../styles/shared'
import { LoadingGrid } from '../../../../components/ui'

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
    <div className={`fixed inset-0 ${cc.overlay.medium} z-[${Z_INDEX.COVER_SELECTOR}] flex items-center justify-center ${cc.spacing.container.sm}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0`}>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Kies cover foto</h2>
          <button onClick={() => onSelect(null)} className={`p-1 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 ${cc.transition.colors}`}>
            <span className="sr-only">Sluiten</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`${cc.spacing.container.md} overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-800/50`}>
          {loading ? (
            <LoadingGrid variant="thumbnails" count={16} />
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 text-center py-8">{error}</p>
          ) : photos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Dit album heeft nog geen foto's.
            </p>
          ) : (
            <div className={`${cc.grid.thumbnails()} ${cc.spacing.gap.sm}`}>
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => onSelect(photo.id)}
                  className={`relative aspect-square rounded-md overflow-hidden group border-2 ${cc.transition.normal} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 ${
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
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${cc.hover.fadeIn}`}>
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