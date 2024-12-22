import { useState } from 'react'
import { H2 } from '../../components/typography'
import { PhotoGrid } from './components/PhotoGrid'
import { PhotoUploadModal } from './components/PhotoUploadModal'
import { BulkUploadButton } from './components/BulkUploadButton'
import type { Photo } from './types'

// TODO: Vervang dit door je nieuwe API service
const fetchPhotosFromAPI = async (): Promise<Photo[]> => {
  // Implementeer je nieuwe API call hier
  return []
}

export function PhotosOverview() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <H2>Foto's</H2>
        <div className="flex items-center gap-4">
          {/* View toggle */}
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                view === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                view === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-l-0 border-gray-300'
              }`}
            >
              Lijst
            </button>
          </div>

          {/* Upload buttons */}
          <div className="flex gap-2">
            <BulkUploadButton
              onUploadComplete={loadPhotos}
              className="bg-white shadow-sm"
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Foto toevoegen
            </button>
          </div>
        </div>
      </div>

      <PhotoGrid
        photos={photos}
        loading={loading}
        error={error}
        onUpdate={loadPhotos}
      />

      <PhotoUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onComplete={() => {
          setShowUploadModal(false)
          loadPhotos()
        }}
      />
    </div>
  )
} 