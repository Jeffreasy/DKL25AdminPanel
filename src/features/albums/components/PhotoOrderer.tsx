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
import { supabase } from '../../../lib/supabase'
import type { AlbumWithDetails } from '../types'
import type { Photo } from '../../photos/types'
import { SortablePhoto } from './SortablePhoto'

interface PhotoOrdererProps {
  album: AlbumWithDetails
  onOrderChange: () => Promise<void>
  onPhotoRemove: (photoId: string) => void
}

export function PhotoOrderer({ album, onOrderChange, onPhotoRemove }: PhotoOrdererProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      const { data, error: fetchError } = await supabase
        .from('album_photos')
        .select('photo:photos(*)')
        .eq('album_id', album.id)
        .order('order_number', { ascending: true })

      if (fetchError) throw fetchError
      const photosData = data?.map(item => item.photo as any).filter(p => p && typeof p === 'object') || []
      setPhotos(photosData as Photo[])
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
      
      setIsSubmitting(true)
      setError(null)
      try {
        const updates = newOrderedPhotos.map((photo, index) => ({
          album_id: album.id,
          photo_id: photo.id,
          order_number: index + 1,
        }))

        const { error: updateError } = await supabase
          .from('album_photos')
          .upsert(updates, { onConflict: 'album_id, photo_id' })

        if (updateError) throw updateError
        
        await onOrderChange()

      } catch (err) {
        console.error('Error updating photo order:', err)
        setError('Kon volgorde niet opslaan')
        setPhotos(photos) 
      } finally {
        setIsSubmitting(false)
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {photos.map(photo => (
            <SortablePhoto 
              key={photo.id} 
              photo={photo} 
              onRemove={onPhotoRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
} 