import { useState, useMemo, useCallback, useEffect } from 'react'
import { AlbumCard } from './AlbumCard'
import { useAlbumData, useAlbumMutations } from '../../hooks'
import type { AlbumWithDetails } from '../../types'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { usePermissions } from '../../../../hooks/usePermissions'
import debounce from 'lodash/debounce'
import { LoadingGrid, EmptyState } from '../../../../components/ui'
import { FolderIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../../styles/shared'

interface AlbumGridProps {
  onAlbumSelect?: (albumId: string) => void
  selectedAlbumId?: string | null
}

export function AlbumGrid({ onAlbumSelect, selectedAlbumId }: AlbumGridProps) {
  const { hasPermission } = usePermissions()
  const { albums: allAlbums, loading, error, refresh } = useAlbumData({ autoLoad: true })
  const { update } = useAlbumMutations()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showHidden, setShowHidden] = useState(true)
  const [localAlbums, setLocalAlbums] = useState<AlbumWithDetails[]>([])

  const isAdminUser = useMemo(() => hasPermission('album', 'read'), [hasPermission])

  // Sync local albums with fetched albums
  useEffect(() => {
    setLocalAlbums(allAlbums)
  }, [allAlbums])

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query)
    }, 300),
    []
  )


  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localAlbums.findIndex(album => album.id === active.id)
    const newIndex = localAlbums.findIndex(album => album.id === over.id)

    const newOrder = arrayMove(localAlbums, oldIndex, newIndex)
    setLocalAlbums(newOrder)

    // Update order numbers in database
    try {
      await Promise.all(
        newOrder.map((album, index) =>
          update(album.id, { order_number: index + 1 })
        )
      )
    } catch (err) {
      console.error('Error updating order:', err)
      setLocalAlbums(allAlbums) // Revert on error
    }
  }, [localAlbums, allAlbums, update])

  const filteredAlbums = useMemo(() => {
    return localAlbums.filter(album => {
      // Admin sees all albums
      if (isAdminUser) return true

      // Filter by visibility
      if (!showHidden && !album.visible) return false
      
      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        return (
          album.title?.toLowerCase().includes(searchLower) ||
          album.description?.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
  }, [localAlbums, isAdminUser, showHidden, searchQuery])


  if (loading) {
    return <LoadingGrid variant="albums" count={6} aspectRatio="custom" />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (allAlbums.length === 0) {
    return (
      <EmptyState
        icon={<FolderIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />}
        title="Nog geen albums"
        description="Maak je eerste album aan om foto's te organiseren"
      />
    )
  }

  return (
    <div className={cc.spacing.section.sm}>
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
          <div className={`${cc.grid.albums()} gap-4`}>
            {filteredAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onUpdate={refresh}
                isSelected={album.id === selectedAlbumId}
                onSelect={() => onAlbumSelect?.(album.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredAlbums.length === 0 && (
        <EmptyState
          title="Geen albums gevonden"
          description={searchQuery ? `Geen resultaten voor "${searchQuery}"` : undefined}
        />
      )}
    </div>
  )
} 