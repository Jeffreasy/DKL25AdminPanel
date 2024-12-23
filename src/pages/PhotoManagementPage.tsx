import { useState, useEffect } from 'react'
import { PhotoGrid } from '../features/photos/components/PhotoGrid'
import { PhotoUploadModal } from '../features/photos/components/PhotoUploadModal'
import { supabase } from '../lib/supabase'
import type { Photo } from '../features/photos/types'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function PhotoManagementPage() {
  useDocumentTitle("Foto's beheren")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        .select('*')
        .order('order_number', { ascending: true })

      if (error) throw error
      setPhotos(data || [])
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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Foto's</h1>
          <p className="mt-1 text-sm text-gray-500">
            Beheer hier je foto's. Foto's kunnen worden toegevoegd aan albums.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Foto's uploaden
        </button>
      </div>

      <PhotoGrid
        photos={photos}
        loading={loading}
        error={error}
        onUpdate={handleRefresh}
        setError={setError}
      />

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