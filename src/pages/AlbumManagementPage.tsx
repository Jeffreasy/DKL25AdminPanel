import { useState, useCallback } from 'react'
import { AlbumGrid } from '../features/albums/components/AlbumGrid'
import { AlbumForm } from '../features/albums/components/AlbumForm'

export function AlbumManagementPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Albums</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Nieuw album
        </button>
      </div>

      <AlbumGrid key={refreshKey} />

      {isCreating && (
        <AlbumForm
          onComplete={() => {
            setIsCreating(false)
            handleRefresh()
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </div>
  )
} 