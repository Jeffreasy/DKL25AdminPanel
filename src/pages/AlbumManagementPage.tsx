import { useState, useCallback, useEffect } from 'react'
import { AlbumGrid } from '../features/albums/components/AlbumGrid'
import { AlbumForm } from '../features/albums/components/AlbumForm'
import { PhotoSelector } from '../features/albums/components/PhotoSelector'
import type { AlbumWithDetails } from '../features/albums/types'
import { usePageTitle } from '../hooks/usePageTitle'

// TODO: Vervang dit door je nieuwe API service
const fetchAlbumsFromAPI = async (): Promise<AlbumWithDetails[]> => {
  // Implementeer je nieuwe API call hier
  // Zorg dat de response data al getransformeerd is naar het juiste formaat
  return []
}

export function AlbumManagementPage() {
  usePageTitle("Albums beheren")
  const [isCreating, setIsCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [albums, setAlbums] = useState<AlbumWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedAlbumData = selectedAlbum 
    ? albums.find(a => a.id === selectedAlbum)
    : null

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true)
        const data = await fetchAlbumsFromAPI()
        setAlbums(data)
      } catch (err) {
        console.error('Error fetching albums:', err)
        setError('Er ging iets mis bij het ophalen van de albums')
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [refreshKey])

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Albums</h1>
          <p className="mt-1 text-sm text-gray-500">
            Beheer hier je foto albums. Elk album kan worden getoond op de hoofdpagina.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Nieuw album
          </button>
        </div>
      </div>

      <AlbumGrid 
        key={refreshKey} 
        onAlbumSelect={setSelectedAlbum}
        selectedAlbumId={selectedAlbum}
      />

      {isCreating && (
        <AlbumForm
          onComplete={() => {
            setIsCreating(false)
            handleRefresh()
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {selectedAlbumData && (
        <PhotoSelector
          album={selectedAlbumData}
          onComplete={() => {
            setSelectedAlbum(null)
            handleRefresh()
          }}
          onCancel={() => setSelectedAlbum(null)}
        />
      )}
    </div>
  )
} 