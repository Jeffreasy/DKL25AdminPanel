import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { fetchAlbumById, updatePhotoOrder } from '../../services/albumService'
import type { AlbumWithDetails } from '../../types'
import type { Photo } from '../../../photos/types'
import { SortablePhoto } from './SortablePhoto'
import { cc } from '../../../../styles/shared'

interface PhotoOrdererProps {
  album: AlbumWithDetails
  onOrderChange: () => Promise<void>
  onPhotoRemove: (photoId: string) => void
  removingPhotoId?: string | null
}

export function PhotoOrderer({ album, onOrderChange, onPhotoRemove, removingPhotoId }: PhotoOrdererProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const albumData = await fetchAlbumById(album.id)
      if (albumData && albumData.photos) {
        const photosData = albumData.photos.map(ap => ap.photo).filter(p => p && typeof p === 'object')
        setPhotos(photosData as Photo[])
      } else {
        setPhotos([])
      }
    } catch (err) {
      console.error('Error fetching photos for ordering:', err)
      setError('Kon foto\'s niet laden')
    } finally {
      setLoading(false)
    }
  }, [album.id])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id)
      const newIndex = photos.findIndex((p) => p.id === over.id)
      const newOrderedPhotos = arrayMove(photos, oldIndex, newIndex)
      setPhotos(newOrderedPhotos)

      setError(null)
      try {
        const photoOrders = newOrderedPhotos.map((photo, index) => ({
          photo_id: photo.id,
          order_number: index + 1,
        }))

        await updatePhotoOrder(album.id, photoOrders)
        await onOrderChange()

      } catch (err) {
        console.error('Error updating photo order:', err)
        setError('Kon volgorde niet opslaan')
        setPhotos(photos)
      }
    }
  }

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-4">Foto's laden...</p>
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400 text-center py-4">{error}</p>
  }

  if (photos.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nog geen foto's in dit album.</p>
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={photos.map(p => p.id)}
        strategy={rectSortingStrategy}
      >
        <div className={`${cc.grid.photoOrderer()} gap-2`}>
          {photos.map(photo => (
            <SortablePhoto
              key={photo.id}
              photo={photo}
              onRemove={onPhotoRemove}
              isRemoving={removingPhotoId === photo.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
} 