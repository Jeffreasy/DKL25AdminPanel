import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Photo } from '../../photos/types'
import type { Album } from '../types'

interface CoverPhotoSelectorProps {
  album: Album
  photos: Photo[]
  onUpdate: () => void
  onClose: () => void
}

export function CoverPhotoSelector({ album, photos, onUpdate, onClose }: CoverPhotoSelectorProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(album.cover_photo_id || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const { error } = await supabase
        .from('albums')
        .update({ 
          cover_photo_id: selectedPhotoId,
          updated_at: new Date().toISOString()
        })
        .eq('id', album.id)

      if (error) throw error

      onUpdate()
      onClose()
    } catch (err) {
      console.error('Error updating cover photo:', err)
      setError('Er ging iets mis bij het opslaan van de cover foto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Cover Foto Selecteren</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Sluiten</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhotoId(photo.id)}
                className={`
                  aspect-square bg-gray-100 rounded-lg overflow-hidden relative group
                  ${selectedPhotoId === photo.id ? 'ring-2 ring-indigo-500' : ''}
                `}
              >
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                />
                <div className={`
                  absolute inset-0 flex items-center justify-center
                  ${selectedPhotoId === photo.id ? 'bg-indigo-500/20' : 'bg-black/0 group-hover:bg-black/10'}
                  transition-colors
                `}>
                  {selectedPhotoId === photo.id && (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !selectedPhotoId}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Bezig met opslaan...' : 'Cover foto instellen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 