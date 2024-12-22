import { useState, useEffect } from 'react'
import { LoadingSkeleton } from './LoadingSkeleton'
import { ErrorText } from './typography'

interface Photo {
  id: string
  url: string
  alt: string
  title?: string
  description?: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

// TODO: Vervang dit door je nieuwe API service
const fetchPhotosFromAPI = async (): Promise<Photo[]> => {
  // Implementeer je nieuwe API call hier
  return []
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true)
        const data = await fetchPhotosFromAPI()
        setPhotos(data)
      } catch (err) {
        console.error('Error loading photos:', err)
        setError('Er ging iets mis bij het ophalen van de foto\'s')
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <LoadingSkeleton className="aspect-square" />
        <LoadingSkeleton className="aspect-square" />
        <LoadingSkeleton className="aspect-square" />
        <LoadingSkeleton className="aspect-square" />
      </div>
    )
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
    </div>
  )
} 