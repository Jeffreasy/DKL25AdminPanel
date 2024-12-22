import { useState, useEffect } from 'react'
import type { PhotoSelectorPhoto } from '../../photos/types'
import type { AlbumWithDetails } from '../types'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { PhotoUploadModal } from '../../photos/components/PhotoUploadModal'

// TODO: Vervang dit door je nieuwe API service
const fetchPhotosForAlbum = async (_albumId: string): Promise<PhotoSelectorPhoto[]> => {
  // Implementeer je nieuwe API call hier
  return []
}

const saveAlbumPhotos = async (_albumId: string, _photoIds: string[]): Promise<void> => {
  // Implementeer je nieuwe API call hier
}

const removePhotosFromAlbum = async (_albumId: string, _photoIds: string[]): Promise<void> => {
  // Implementeer je nieuwe API call hier
}

const reorderAlbumPhotos = async (_albumId: string, _photoIds: string[]): Promise<void> => {
  // Implementeer je nieuwe API call hier
}

interface PhotoSelectorProps {
  album: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

export function PhotoSelector({ album, onComplete, onCancel }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<PhotoSelectorPhoto[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set())
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchPhotos = async () => {
    try {
      const data = await fetchPhotosForAlbum(album.id)
      setPhotos(data)
      setSelectedPhotos(data.filter(p => p.inAlbum).map(p => p.id))
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
      await saveAlbumPhotos(album.id, selectedPhotos)
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
      await removePhotosFromAlbum(album.id, photoIds)
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

      await reorderAlbumPhotos(album.id, newOrder)
    } catch (err) {
      console.error('Error reordering photos:', err)
      setError('Er ging iets mis bij het herordenen van foto\'s')
    }
  }

  const handlePhotoClick = (photoId: string) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId)
      } else {
        return [...prev, photoId]
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-medium">Foto's beheren</h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedPhotos.length} foto's geselecteerd
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 4v16m8-8H4" />
              </svg>
              Foto's toevoegen
            </button>
          </div>

          <div className="flex justify-between items-center">
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
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <SortableContext items={selectedPhotos}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => handlePhotoClick(photo.id)}
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
                    
                    {selectedPhotos.includes(photo.id) && (
                      <div className="absolute inset-0 bg-indigo-500 bg-opacity-10">
                        <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    {selectedForDeletion.size > 0 && (
                      <div className="absolute top-2 right-2">
                        <input
                          type="checkbox"
                          checked={selectedForDeletion.has(photo.id)}
                          onChange={(e) => {
                            e.stopPropagation()
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
                    )}
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

        {showUploadModal && (
          <PhotoUploadModal
            open={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onComplete={() => {
              setShowUploadModal(false)
              fetchPhotos()
            }}
          />
        )}
      </div>
    </div>
  )
} 