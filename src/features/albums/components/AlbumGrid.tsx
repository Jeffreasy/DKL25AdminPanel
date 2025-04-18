import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
import { AlbumCard } from './AlbumCard'
import type { AlbumWithDetails } from '../types'
import { supabase } from '../../../lib/supabase'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { isAdmin } from '../../../lib/supabase'
import { cc } from '../../../styles/shared'

interface AlbumGridProps {
  onAlbumSelect?: (albumId: string) => void
  selectedAlbumId?: string | null
}

export function AlbumGrid({ onAlbumSelect, selectedAlbumId }: AlbumGridProps) {
  const [albums, setAlbums] = useState<AlbumWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showHidden, setShowHidden] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadAlbums()
  }, [refreshKey])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      console.log('Fetching albums...')

      // Eerst checken of gebruiker admin is
      const adminCheck = await isAdmin()
      setIsAdminUser(adminCheck)
      console.log('Is admin:', adminCheck)

      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          cover_photo:photos!albums_cover_photo_id_fkey(*),
          photos:album_photos(
            photo:photos(
              id,
              url,
              thumbnail_url,
              title,
              alt_text,
              visible
            )
          ),
          photos_count:album_photos(count)
        `)
        .order('order_number', { ascending: true })

      console.log('Raw albums data:', data)
      console.log('Query error:', error)

      if (error) throw error

      // Als admin, toon alle albums, anders alleen zichtbare
      const visibleAlbums = adminCheck 
        ? data 
        : data?.filter(album => album.visible)

      console.log('Visible albums:', visibleAlbums)

      // Transform de data om aan het type te voldoen
      const transformedData = visibleAlbums?.map(album => ({
        ...album,
        cover_photo: album.cover_photo?.[0] || null,
        photos_count: album.photos_count || [{ count: 0 }]
      })) as AlbumWithDetails[]

      setAlbums(transformedData || [])
    } catch (err) {
      console.error('Error loading albums:', err)
      setError('Er ging iets mis bij het ophalen van de albums')
    } finally {
      setLoading(false)
    }
  }

  // Debug logs toevoegen
  console.log('Current state:', {
    albums,
    loading,
    error,
    searchQuery,
    showHidden
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = albums.findIndex(album => album.id === active.id)
    const newIndex = albums.findIndex(album => album.id === over.id)

    const newOrder = arrayMove(albums, oldIndex, newIndex)
    setAlbums(newOrder)

    // Update order numbers in database
    try {
      const updates = newOrder.map((album, index) => ({
        id: album.id,
        order_number: index + 1
      }))

      const { error } = await supabase
        .from('albums')
        .upsert(updates)

      if (error) throw error
    } catch (err) {
      console.error('Error updating order:', err)
      loadAlbums() // Reload original order on error
    }
  }

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  const filteredAlbums = albums.filter(album => {
    // Als admin, toon altijd alle albums
    if (isAdminUser) return true

    // Anders, filter op zichtbaarheid
    if (!showHidden && !album.visible) return false
    
    // Filter op zoekterm
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        album.title?.toLowerCase().includes(searchLower) ||
        album.description?.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

  console.log('Filtered albums:', filteredAlbums)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(8)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-[4/3] rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Nog geen albums gevonden.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Zoeken..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {!isAdminUser && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Toon verborgen albums</span>
          </label>
        )}
      </div>

      {/* Albums Grid */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredAlbums.map(a => a.id)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onUpdate={handleUpdate}
                isSelected={album.id === selectedAlbumId}
                onSelect={() => onAlbumSelect?.(album.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredAlbums.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Geen albums gevonden
        </div>
      )}
    </div>
  )
} 