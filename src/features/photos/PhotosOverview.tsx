import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase/supabaseClient'
import { Photo } from '../../types/photo'
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
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDropzone } from 'react-dropzone'

function SortablePhoto({ 
  photo, 
  index, 
  isSelected,
  onSelect 
}: { 
  photo: Photo
  index: number
  isSelected: boolean
  onSelect: (id: string, event: React.MouseEvent) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0
  }

  const altText = `DKL 2024 foto ${index + 1}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg shadow-sm 
        transition-all duration-200
        ${isDragging ? 'shadow-xl scale-[1.02]' : 'hover:shadow-md'}
        ${isSelected ? 'ring-2 ring-indigo-500' : ''}
      `}
    >
      <div className="flex items-center p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab mr-4 text-gray-400 hover:text-gray-600"
        >
          ⋮⋮
        </div>
        <div className="mr-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(photo.id, e as any)}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
          />
        </div>
        <div className="flex-shrink-0 w-48 h-32 overflow-hidden rounded">
          <img 
            src={photo.url} 
            alt={altText} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Positie: {index + 1}
            </span>
            <span className="text-sm text-gray-500">
              {altText}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhotoUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadError(null)

    try {
      // Haal het huidige hoogste order_number op
      const { data: photos } = await supabase
        .from('photos')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1)

      const startOrderNumber = (photos?.[0]?.order_number || 0) + 1

      // Upload elke foto
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        // Specificeer het volledige pad inclusief folders
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'dkl25_photos')

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.message)

        // Voeg de foto toe aan de database
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            url: data.secure_url,
            alt: `DKL 2024 foto ${startOrderNumber + i}`,
            order_number: startOrderNumber + i,
          })

        if (dbError) throw dbError
      }

      onUploadComplete()
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Er is een fout opgetreden bij het uploaden')
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
          <p>Bezig met uploaden...</p>
        </div>
      ) : isDragActive ? (
        <p>Sleep de foto's hier...</p>
      ) : (
        <div>
          <p className="text-gray-600">Sleep foto's hierheen of klik om te selecteren</p>
          <p className="text-sm text-gray-500 mt-1">JPG, PNG of WebP</p>
        </div>
      )}
      {uploadError && (
        <p className="text-red-500 mt-2">{uploadError}</p>
      )}
    </div>
  )
}

export function PhotosOverview() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('order_number')

      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    try {
      const oldIndex = photos.findIndex(photo => photo.id === active.id)
      const newIndex = photos.findIndex(photo => photo.id === over.id)

      // Optimistic update voor de UI
      const newPhotos = arrayMove(photos, oldIndex, newIndex)
      setPhotos(newPhotos)

      // Bereid de updates voor met nieuwe order numbers en alt text
      const updates = newPhotos.map((photo, index) => ({
        id: photo.id,
        order_number: index + 1,
        url: photo.url,
        alt: `DKL 2024 foto ${index + 1}`,
        created_at: photo.created_at,
        updated_at: new Date().toISOString()
      }))

      // Voer de update uit
      const { error } = await supabase
        .from('photos')
        .upsert(updates, { 
          onConflict: 'id'
        })

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database update failed: ${error.message}`)
      }

    } catch (err) {
      console.error('Error in handleDragEnd:', err)
      setError('Fout bij het updaten van de volgorde. Probeer het opnieuw.')
      await fetchPhotos()
    }
  }

  const PreviewModal = ({ photo, onClose }: { photo: Photo; onClose: () => void }) => {
    const [zoomLevel, setZoomLevel] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3))
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
    const handleReset = () => setZoomLevel(1)

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg max-w-6xl w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="text-lg font-medium">{photo.alt}</h3>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom uit"
              >
                <span>-</span>
              </button>
              <button 
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 rounded"
                title="Reset zoom"
              >
                <span>{Math.round(zoomLevel * 100)}%</span>
              </button>
              <button 
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom in"
              >
                <span>+</span>
              </button>
              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded"
                title="Volledig scherm"
              >
                <span>{isFullscreen ? '⤓' : '⤢'}</span>
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded"
                title="Sluiten"
              >
                ✕
              </button>
            </div>
          </div>
          <div 
            className="relative overflow-auto p-4"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            <div 
              className="transition-transform duration-200 ease-in-out"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            >
              <img 
                src={photo.url} 
                alt={photo.alt} 
                className="w-full h-auto rounded"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const toggleSelection = (photoId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Voorkom dat de preview modal opent
    const newSelection = new Set(selectedPhotos)
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId)
    } else {
      newSelection.add(photoId)
    }
    setSelectedPhotos(newSelection)
  }

  const selectAll = () => {
    setSelectedPhotos(new Set(photos.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedPhotos(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return

    if (!confirm(`Weet je zeker dat je ${selectedPhotos.size} foto's wilt verwijderen?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .in('id', Array.from(selectedPhotos))

      if (error) throw error

      // Refresh de lijst en clear selectie
      await fetchPhotos()
      setSelectedPhotos(new Set())
    } catch (err) {
      setError('Fout bij het verwijderen van foto\'s')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  )
  
  if (error) return (
    <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
      {error}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Foto Beheer</h2>
        <div className="flex items-center space-x-4">
          {selectedPhotos.size > 0 ? (
            <>
              <span className="text-sm text-gray-500">
                {selectedPhotos.size} foto's geselecteerd
              </span>
              <button
                onClick={deselectAll}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Deselecteer alles
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Verwijder geselecteerde
              </button>
            </>
          ) : (
            <>
              <button
                onClick={selectAll}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Selecteer alles
              </button>
              <div className="text-sm text-gray-500">
                Versleep foto's om de volgorde aan te passen
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-8">
        <PhotoUpload onUploadComplete={fetchPhotos} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col space-y-4">
            {photos.map((photo, index) => (
              <SortablePhoto 
                key={photo.id} 
                photo={photo} 
                index={index} 
                isSelected={selectedPhotos.has(photo.id)} 
                onSelect={toggleSelection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Preview Modal */}
      {selectedPhoto && (
        <PreviewModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
} 