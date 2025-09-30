import { useState, useEffect, useMemo, useCallback } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { AlbumCard } from './AlbumCard'
import type { AlbumWithDetails } from '../types'
import { supabase } from '../../../lib/supabase'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { isAdmin } from '../../../lib/supabase'
import debounce from 'lodash/debounce'

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
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const ALBUMS_PER_PAGE = 12

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query)
    }, 300),
    []
  )

  const loadAlbums = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setHasMore(true)
      }

      // Eerst checken of gebruiker admin is (alleen bij eerste load)
      if (!loadMore || !isAdminUser) {
        const adminCheck = await isAdmin()
        setIsAdminUser(adminCheck)
      }

      const from = loadMore ? albums.length : 0
      const to = from + ALBUMS_PER_PAGE - 1

      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          photos_count:album_photos(count)
        `, { count: 'exact' })
        .order('order_number', { ascending: true })
        .range(from, to)

      if (error) throw error

      // Als admin, toon alle albums, anders alleen zichtbare
      const visibleAlbums = isAdminUser
        ? data || []
        : (data || []).filter(album => album.visible)

      // Check if there are more albums
      setHasMore(visibleAlbums.length === ALBUMS_PER_PAGE)

      // Load cover photos separately
      const coverPhotoIds = visibleAlbums.map(album => album.cover_photo_id).filter(Boolean)
      let coverPhotoMap = new Map()
      if (coverPhotoIds.length > 0) {
        const { data: coverPhotos, error: coverError } = await supabase
          .from('photos')
          .select('*')
          .in('id', coverPhotoIds)

        if (coverError) console.error('Error loading cover photos:', coverError)
        else {
          coverPhotoMap = new Map(coverPhotos?.map(photo => [photo.id, photo]) || [])
        }
      }

      // Transform de data om aan het type te voldoen
      const transformedData = visibleAlbums.map(album => ({
        ...album,
        cover_photo: album.cover_photo_id ? coverPhotoMap.get(album.cover_photo_id) || null : null,
        photos_count: album.photos_count || [{ count: 0 }]
      })) as AlbumWithDetails[]

      if (loadMore) {
        setAlbums(prev => [...prev, ...transformedData])
      } else {
        setAlbums(transformedData)
      }
    } catch (err) {
      console.error('Error loading albums:', err)
      setError('Er ging iets mis bij het ophalen van de albums')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [albums.length, isAdminUser])

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadAlbums(true)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [refreshKey, loadAlbums])

  // Reset pagination when search changes
  useEffect(() => {
    if (searchQuery) {
      setHasMore(false) // Disable load more during search
    } else {
      setHasMore(true) // Re-enable when search is cleared
    }
  }, [searchQuery])

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
      <div className="space-y-4">
        {/* Search skeleton */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <LoadingSkeleton className="h-10 rounded-md" />
          </div>
          <LoadingSkeleton className="h-6 w-32" />
        </div>

        {/* Albums grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <LoadingSkeleton className="w-full h-2/3" />
              <div className="p-4 space-y-2">
                <LoadingSkeleton className="h-5 w-3/4" />
                <LoadingSkeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
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
            defaultValue={searchQuery}
            onChange={(e) => debouncedSearch(e.target.value)}
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

      {/* Load More Button - only show when not searching */}
      {hasMore && !loading && albums.length > 0 && !searchQuery && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Laden...
              </>
            ) : (
              'Meer laden'
            )}
          </button>
        </div>
      )}
    </div>
  )
} 