import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import type { Photo } from '../../../photos/types'
import { Z_INDEX } from '../../../../config/zIndex'
import { cc } from '../../../../styles/shared'
import { LoadingGrid } from '../../../../components/ui'

// API Base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com'

// Helper function for auth headers with JWT
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Get JWT token from localStorage
  const token = localStorage.getItem('jwtToken')
  if (!token) {
    console.error('[PhotoSelector] No auth token found.')
    throw new Error('Geen actieve gebruikerssessie gevonden. Log opnieuw in.')
  }

  headers['Authorization'] = `Bearer ${token}`
  return headers
}

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

  // Laad beschikbare foto's via API
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true)
        const headers = getAuthHeaders()

        // Use admin photos endpoint to get all photos
        const response = await fetch(`${API_BASE}/api/photos/admin`, { headers })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Geen toegang tot foto\'s. Vereiste permissie: photo:read')
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        // Filter out photos that are already in the album
        const availablePhotos = (data || []).filter((photo: Photo) =>
          !existingPhotoIds.includes(photo.id)
        )

        setAvailablePhotos(availablePhotos)
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
      <div className={`fixed inset-0 ${cc.overlay.light} z-[${Z_INDEX.PHOTO_SELECTOR}]`} aria-hidden="true" />
      
      <div className={`fixed inset-0 flex items-center justify-center ${cc.spacing.container.sm} z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
        <Dialog.Panel className={`relative bg-white dark:bg-gray-800 rounded-lg ${cc.spacing.container.md} max-w-4xl w-full max-h-[90vh] flex flex-col`}>
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Foto's toevoegen aan album
          </Dialog.Title>

          {error && (
            <div className={`mb-4 ${cc.spacing.container.sm} bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800`}>
              {error}
            </div>
          )}

          {loading ? (
            <LoadingGrid variant="compact" count={8} />
          ) : availablePhotos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Alle beschikbare foto's zijn al toegevoegd aan dit album
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className={`${cc.grid.compact()} ${cc.spacing.gap.lg}`}>
                {availablePhotos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoSelect(photo.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden group ${cc.transition.normal} ${
                      selectedPhotos.includes(photo.id) ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : ''
                    }`}
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center ${cc.transition.opacity} ${
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

          <div className={`mt-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 ${cc.spacing.py.sm}`}>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedPhotos.length} foto's geselecteerd
            </span>
            <div className={`flex ${cc.spacing.gap.sm}`}>
              <button
                onClick={onCancel}
                className={cc.button.base({ color: 'secondary' })}
              >
                Annuleren
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedPhotos.length === 0 || loading}
                className={cc.button.base({ color: 'primary' })}
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