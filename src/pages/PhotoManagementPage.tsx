import { useState, useEffect } from 'react'
import { PhotoGrid } from '../features/photos/components/PhotoGrid'
import { PhotoUploadModal } from '../features/photos/components/PhotoUploadModal'
import { fetchPhotosFromAPI } from '../features/photos/services/photoService'
import type { Photo } from '../features/photos/types'
import { useNavigationHistory } from '../contexts/NavigationHistoryContext'

export function PhotoManagementPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToHistory } = useNavigationHistory()

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetchPhotosFromAPI()
      setPhotos(response.data || [])
    } catch (err) {
      console.error('Error loading photos:', err)
      setError('Er ging iets mis bij het ophalen van de foto\'s')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    addToHistory("Foto's")
    loadPhotos()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Foto's</h1>
              <p className="mt-2 text-sm text-gray-700">
                Beheer de foto's van de Koninklijke Loop
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Foto's Toevoegen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <PhotoGrid
          photos={photos}
          loading={loading}
          error={error}
          onUpdate={loadPhotos}
          setError={setError}
        />
      </div>

      {/* Upload Modal */}
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