import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Photo } from '../../photos/types'
import type { Album } from '../types'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'

interface CoverPhotoSelectorProps {
  album: Album
  onSelect: (photoId: string) => Promise<void>
  onClose: () => void
}

// Type voor de database response
interface PhotoQueryResult {
  photo: {
    id: string
    url: string
    thumbnail_url: string | null
    title: string
    alt: string
    year: number
    visible: boolean
    order_number: number
    created_at: string
    updated_at: string
    description: string | null
  }
}

export function CoverPhotoSelector({ album, onSelect, onClose }: CoverPhotoSelectorProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAlbumPhotos()
  }, [album.id])

  const loadAlbumPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('album_photos')
        .select(`
          photo:photos (
            id,
            url,
            thumbnail_url,
            title,
            alt,
            year,
            visible,
            order_number,
            created_at,
            updated_at,
            description
          )
        `)
        .eq('album_id', album.id)
        .order('order_number')

      if (error) throw error

      // Correct type casting van de database response
      const albumPhotos = (data as unknown as PhotoQueryResult[]).map(item => ({
        ...item.photo
      })) as Photo[]

      setPhotos(albumPhotos)
    } catch (err) {
      console.error('Error loading album photos:', err)
      setError('Er ging iets mis bij het laden van de foto\'s')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Kies een cover foto
          </h2>
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

        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : photos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Dit album heeft nog geen foto's
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => onSelect(photo.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    album.cover_photo_id === photo.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <img
                    src={photo.thumbnail_url || photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium">
                      {album.cover_photo_id === photo.id ? 'Huidige cover' : 'Als cover instellen'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  )
} 