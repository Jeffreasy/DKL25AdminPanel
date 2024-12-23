import { useState } from 'react'
import { AlbumGrid } from '../features/albums/components/AlbumGrid'
import { AlbumForm } from '../features/albums/components/AlbumForm'
import { PhotoSelector } from '../features/albums/components/PhotoSelector'
import { usePageTitle } from '../hooks/usePageTitle'

export function AlbumManagementPage() {
  usePageTitle("Albums beheren")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
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

      {selectedAlbum && (
        <PhotoSelector
          albumId={selectedAlbum}
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