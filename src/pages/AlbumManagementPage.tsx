import { useState, useCallback, useEffect } from 'react'
import { AlbumGrid } from '../features/albums/components/AlbumGrid'
import { AlbumForm } from '../features/albums/components/AlbumForm'
import { PhotoSelector } from '../features/albums/components/PhotoSelector'
import { supabase } from '../lib/supabase/supabaseClient'
import type { AlbumWithDetails } from '../features/albums/types'

export function AlbumManagementPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [albums, setAlbums] = useState<AlbumWithDetails[]>([])

  const selectedAlbumData = selectedAlbum 
    ? albums.find(a => a.id === selectedAlbum)
    : null

  useEffect(() => {
    const fetchAlbums = async () => {
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          cover_photo:cover_photo_id(*),
          photos:photos_albums(count)
        `)
        .order('order_number', { ascending: true })

      if (error) {
        console.error('Error fetching albums:', error)
        return
      }

      const transformedData: AlbumWithDetails[] = (data || []).map((album: any) => ({
        ...album,
        cover_photo: album.cover_photo ? {
          id: album.cover_photo.id,
          url: album.cover_photo.url
        } : null,
        photos_count: album.photos[0]?.count || 0
      }))

      setAlbums(transformedData)
    }

    fetchAlbums()
  }, [refreshKey])

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

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