import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Dialog } from '@headlessui/react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import type { Photo } from '../../photos/types'  // Import from photos/types instead of albums/types
import { Z_INDEX } from '../../../constants/zIndex'

interface PhotoSelectorProps {
  albumId: string  // We keep this for future use
  existingPhotoIds: string[]
  onComplete: (selectedPhotoIds: string[]) => Promise<void>
  onCancel: () => void
}

export function PhotoSelector({ existingPhotoIds, onComplete, onCancel }: PhotoSelectorProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [availablePhotos, setAvailablePhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Laad beschikbare foto's
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .not('id', 'in', `(${existingPhotoIds.join(',')})`)
          .order('created_at', { ascending: false })

        if (error) throw error
        setAvailablePhotos(data || [])
      } catch (err) {
        console.error('Error loading photos:', err)
        setError('Er ging iets mis bij het laden van de foto\'s')
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [existingPhotoIds])

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  const handleSubmit = async () => {
    if (selectedPhotos.length === 0) {
      setError('Selecteer eerst foto\'s om toe te voegen')
      return
    }

    await onComplete(selectedPhotos)
  }

  return (
    <Dialog open={true} onClose={onCancel} className={`relative z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
      <div className={`fixed inset-0 bg-black/30 z-[${Z_INDEX.PHOTO_SELECTOR}]`} aria-hidden="true" />
      
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
        <Dialog.Panel className="relative bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
          <Dialog.Title className="text-lg font-medium mb-4">
            Foto's toevoegen aan album
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <LoadingSkeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : availablePhotos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Alle beschikbare foto's zijn al toegevoegd aan dit album
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                {availablePhotos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoSelect(photo.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden group ${
                      selectedPhotos.includes(photo.id) ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                      selectedPhotos.includes(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <span className="text-sm text-gray-500">
              {selectedPhotos.length} foto's geselecteerd
            </span>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Annuleren
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedPhotos.length === 0 || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 