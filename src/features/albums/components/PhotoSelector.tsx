import { useState, useEffect } from 'react'
import type { Photo } from '../../photos/types'
import { supabase } from '../../../lib/supabase'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'

interface PhotoSelectorProps {
  albumId: string
  onComplete: () => void
  onCancel: () => void
}

export function PhotoSelector({ albumId, onComplete, onCancel }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      
      // Haal alle foto's op
      const { data: allPhotos, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('order_number')

      if (photosError) throw photosError

      // Haal de foto's op die al in het album zitten
      const { data: albumPhotos, error: albumError } = await supabase
        .from('album_photos')
        .select('photo_id')
        .eq('album_id', albumId)

      if (albumError) throw albumError

      // Zet de geselecteerde foto's
      const selectedIds = albumPhotos.map(ap => ap.photo_id)
      setSelectedPhotos(selectedIds)
      setPhotos(allPhotos)

    } catch (err) {
      console.error('Error loading photos:', err)
      setError('Er ging iets mis bij het ophalen van de foto\'s')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)

      // Verwijder eerst alle bestaande koppelingen
      const { error: deleteError } = await supabase
        .from('album_photos')
        .delete()
        .eq('album_id', albumId)

      if (deleteError) throw deleteError

      // Voeg nieuwe koppelingen toe
      if (selectedPhotos.length > 0) {
        const { error: insertError } = await supabase
          .from('album_photos')
          .insert(
            selectedPhotos.map((photoId, index) => ({
              album_id: albumId,
              photo_id: photoId,
              order_number: index + 1
            }))
          )

        if (insertError) throw insertError
      }

      // Update de photos_count in het album
      const { error: updateError } = await supabase
        .from('albums')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', albumId)

      if (updateError) throw updateError

      // Trigger een refresh van de AlbumGrid
      onComplete()
    } catch (err) {
      console.error('Error saving album photos:', err)
      setError('Er ging iets mis bij het opslaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePhoto = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = selectedPhotos.indexOf(active.id.toString())
    const newIndex = selectedPhotos.indexOf(over.id.toString())

    const newOrder = arrayMove(selectedPhotos, oldIndex, newIndex)
    setSelectedPhotos(newOrder)
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorText>{error}</ErrorText>

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Foto's Selecteren</h2>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={selectedPhotos}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => togglePhoto(photo.id)}
                    className={`
                      aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer
                      relative group hover:ring-2 hover:ring-indigo-500 transition-all
                      ${selectedPhotos.includes(photo.id) ? 'ring-2 ring-indigo-500' : ''}
                    `}
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                    {selectedPhotos.includes(photo.id) && (
                      <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Bezig met opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
} 