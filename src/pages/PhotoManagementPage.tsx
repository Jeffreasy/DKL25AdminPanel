import { useState, useEffect, useCallback } from 'react'
import { PhotoGrid } from '../features/photos/components/PhotoGrid'
import { PhotoUploadModal } from '../features/photos/components/PhotoUploadModal'
import { supabase } from '../lib/supabase'
import type { Photo } from '../features/photos/types'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { componentClasses as cc } from '../styles/shared'

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Foto's</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Beheer hier je foto's. Foto's kunnen worden toegevoegd aan albums.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowUploadModal(true)}
            className={cc.button.primary}
          >
            Foto's uploaden
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800/50">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <PhotoGrid
            photos={photos}
            loading={loading}
            error={error}
            setError={handleError}
            onUpdate={handleRefresh}
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