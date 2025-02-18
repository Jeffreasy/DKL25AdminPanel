import { useState, useEffect, useCallback } from 'react'
import { PhotoGrid } from '../features/photos/components/PhotoGrid'
import { PhotoUploadModal } from '../features/photos/components/PhotoUploadModal'
import { supabase } from '../lib/supabase'
import type { Photo } from '../features/photos/types'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function PhotoManagementPage() {
  useDocumentTitle("Foto's beheren")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1)
    await loadPhotos()
  }

  useEffect(() => {
    loadPhotos()
  }, [refreshKey])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          album_photos (
            album:albums (
              id,
              title
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      console.error('Error loading photos:', err)
      setError(new Error('Er ging iets mis bij het ophalen van de foto\'s'))
    } finally {
      setLoading(false)
    }
  }

  const handleError = useCallback((error: Error | null) => {
    setError(error)
  }, [])

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Foto's</h1>
          <p className="mt-1 text-sm text-gray-500">
            Beheer hier je foto's. Foto's kunnen worden toegevoegd aan albums.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Foto's uploaden
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <PhotoGrid
            photos={photos}
            loading={loading}
            error={error}
            setError={handleError}
            onUpdate={handleRefresh}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          />
        </div>
      </div>

      {showUploadModal && (
        <PhotoUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onComplete={() => {
            setShowUploadModal(false)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
} 