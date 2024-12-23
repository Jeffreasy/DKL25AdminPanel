import { useState } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { supabase } from '../../../lib/supabase'
import type { Photo } from '../../photos/types'
import { SortablePhoto } from './SortablePhoto'

interface PhotoOrdererProps {
  albumId: string
  photos: Photo[]
  onUpdate: () => void
  onClose: () => void
}

export function PhotoOrderer({ albumId, photos, onUpdate, onClose }: PhotoOrdererProps) {
  const [orderedPhotos, setOrderedPhotos] = useState(photos)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedPhotos.findIndex(p => p.id === active.id)
    const newIndex = orderedPhotos.findIndex(p => p.id === over.id)

    setOrderedPhotos(arrayMove(orderedPhotos, oldIndex, newIndex))
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const updates = orderedPhotos.map((photo, index) => ({
        album_id: albumId,
        photo_id: photo.id,
        order_number: index + 1
      }))

      const { error } = await supabase
        .from('album_photos')
        .upsert(updates, { onConflict: 'album_id,photo_id' })

      if (error) throw error

      onUpdate()
      onClose()
    } catch (err) {
      console.error('Error saving photo order:', err)
      setError('Er ging iets mis bij het opslaan van de volgorde')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Foto's Ordenen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Sluiten</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedPhotos.map(p => p.id)}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {orderedPhotos.map((photo) => (
                  <SortablePhoto
                    key={photo.id}
                    photo={photo}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Bezig met opslaan...' : 'Volgorde opslaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 