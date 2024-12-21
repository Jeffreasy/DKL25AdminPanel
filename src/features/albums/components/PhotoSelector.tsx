import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import type { PhotoSelectorPhoto } from '../../photos/types'
import type { AlbumWithDetails } from '../types'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'

interface PhotoSelectorProps {
  album: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

interface PhotoAlbumResponse {
  photo: {
    id: string
    url: string
    alt: string
    visible: boolean
    order_number: number
    created_at: string
    updated_at: string
  }
}

export function PhotoSelector({ album, onComplete, onCancel }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<PhotoSelectorPhoto[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set())

  const fetchPhotos = async () => {
    try {
      const { data: usedPhotoIds } = await supabase
        .from('photos_albums')
        .select('photo_id')

      const usedIds = (usedPhotoIds || []).map(p => p.photo_id)

      const { data: unusedPhotos, error: unusedError } = await supabase
        .from('photos')
        .select('*')
        .not('id', 'in', `(${usedIds.length > 0 ? usedIds.join(',') : '0'})`)
        .eq('visible', true)
        .order('created_at', { ascending: false })

      if (unusedError) throw unusedError

      const { data: albumPhotos, error: albumError } = await supabase
        .from('photos_albums')
        .select(`
          photo:photos (
            id,
            url,
            alt,
            visible,
            order_number,
            created_at,
            updated_at
          )
        `)
        .eq('album_id', album.id)
        .order('order_number') as { data: PhotoAlbumResponse[] | null, error: any }

      if (albumError) throw albumError

      const allPhotos = [
        ...(albumPhotos?.map(ap => ap.photo) || []),
        ...(unusedPhotos || [])
      ]

      const transformedPhotos: PhotoSelectorPhoto[] = allPhotos.map(photo => ({
        id: photo.id,
        url: photo.url,
        alt: photo.alt,
        visible: photo.visible,
        order_number: photo.order_number,
        created_at: photo.created_at,
        updated_at: photo.updated_at
      }))

      setPhotos(transformedPhotos)

      const currentPhotoIds = albumPhotos?.map(ap => ap.photo.id) || []
      setSelectedPhotos(currentPhotoIds)
    } catch (err) {
      console.error('Error fetching photos:', err)
      setError('Er ging iets mis bij het ophalen van de foto\'s')
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [album.id])

  const handleSave = async () => {
    try {
      setIsUploading(true)
      
      await supabase
        .from('photos_albums')
        .delete()
        .eq('album_id', album.id)

      if (selectedPhotos.length > 0) {
        const photosToInsert = selectedPhotos.map((photoId, index) => ({
          photo_id: photoId,
          album_id: album.id,
          order_number: index
        }))

        const { error } = await supabase
          .from('photos_albums')
          .insert(photosToInsert)

        if (error) throw error
      }

      onComplete()
    } catch (err) {
      console.error('Error saving photos:', err)
      setError('Er ging iets mis bij het opslaan van de foto\'s')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFromAlbum = async (photoIds: string[]) => {
    try {
      setIsUploading(true)
      const { error } = await supabase
        .from('photos_albums')
        .delete()
        .eq('album_id', album.id)
        .in('photo_id', photoIds)

      if (error) throw error

      setSelectedPhotos(prev => prev.filter(id => !photoIds.includes(id)))
      setSelectedForDeletion(new Set())
      
      fetchPhotos()
    } catch (err) {
      console.error('Error removing photos:', err)
      setError('Er ging iets mis bij het verwijderen van foto\'s')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    try {
      const oldIndex = selectedPhotos.indexOf(active.id.toString())
      const newIndex = selectedPhotos.indexOf(over.id.toString())
      
      const newOrder = arrayMove(selectedPhotos, oldIndex, newIndex)
      setSelectedPhotos(newOrder)

      const updates = newOrder.map((photoId, index) => ({
        album_id: album.id,
        photo_id: photoId,
        order_number: index
      }))

      const { error } = await supabase
        .from('photos_albums')
        .upsert(updates)

      if (error) throw error
    } catch (err) {
      console.error('Error reordering photos:', err)
      setError('Er ging iets mis bij het herordenen van foto\'s')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Foto's beheren</h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedPhotos.length} foto's geselecteerd
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
              {error}
            </div>
          )}
          
          {selectedForDeletion.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedForDeletion.size} geselecteerd
              </span>
              <button
                onClick={() => handleRemoveFromAlbum(Array.from(selectedForDeletion))}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                disabled={isUploading}
              >
                Verwijderen uit album
              </button>
              <button
                onClick={() => setSelectedForDeletion(new Set())}
                className="text-gray-400 hover:text-gray-500"
              >
                Annuleren
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <SortableContext items={selectedPhotos}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden cursor-pointer
                      ${selectedPhotos.includes(photo.id) ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-gray-300'}
                    `}
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        checked={selectedForDeletion.has(photo.id)}
                        onChange={(e) => {
                          const newSelection = new Set(selectedForDeletion)
                          if (e.target.checked) {
                            newSelection.add(photo.id)
                          } else {
                            newSelection.delete(photo.id)
                          }
                          setSelectedForDeletion(newSelection)
                        }}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  )
} 