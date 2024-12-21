import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/supabaseClient'

interface Photo {
  id: string
  url: string
  alt: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          photos_albums!inner(
            album_id,
            albums!inner(
              id,
              title,
              visible
            )
          )
        `)
        .eq('photos_albums.albums.visible', true)
        .order('order_number')
      
      if (error) {
        console.error('Error fetching photos:', error)
        return
      }
      
      setPhotos(data || [])
      setIsLoading(false)
    }

    fetchPhotos()
  }, [])

  if (isLoading) {
    return <div className="text-center py-12">Foto's laden...</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map(photo => (
        <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={photo.url}
            alt={photo.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
      
      {photos.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          Geen foto's gevonden
        </div>
      )}
    </div>
  )
} 