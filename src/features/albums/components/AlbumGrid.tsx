import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
import { AlbumCard } from './AlbumCard'
import type { AlbumWithDetails } from '../types'
import { supabase } from '../../../lib/supabase'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { isAdmin } from '../../../lib/supabase'

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
              alt,
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
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-[4/3]" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>
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