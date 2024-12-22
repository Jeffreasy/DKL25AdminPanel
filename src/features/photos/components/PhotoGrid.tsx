import { useState } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
import { PhotoCard } from './PhotoCard'
import type { Photo } from '../types'
import { deletePhotoFromAPI } from '../services/photoService'

interface PhotoGridProps {
  photos: Photo[]
  loading: boolean
  error: string | null
  onUpdate: () => Promise<void>
  setError?: (error: string | null) => void
}

export function PhotoGrid({ 
  photos, 
  loading, 
  error, 
  onUpdate,
  setError = () => {} // Default no-op function
}: PhotoGridProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Weet je zeker dat je deze foto wilt verwijderen?`)) return

    try {
      await deletePhotoFromAPI(photo.id)
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
      await Promise.all(Array.from(selectedPhotos).map(id => deletePhotoFromAPI(id)))
      setSelectedPhotos(new Set())
      await onUpdate()
    } catch (err) {
      console.error('Error bulk deleting photos:', err)
      setError('Er ging iets mis bij het verwijderen van de foto\'s')
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectedPhotos.size > 0 && (
        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedPhotos.size} foto{selectedPhotos.size === 1 ? '' : '\'s'} geselecteerd
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
          >
            Verwijderen
          </button>
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          />
        ))}
      </div>
    </div>
  )
} 