import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/supabaseClient'
import { Photo, PhotoWithDetails } from './types'
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
import { BulkUploadButton } from './components/BulkUploadButton'
import { PhotoForm } from './components/PhotoForm'

function SortablePhoto({ 
  photo, 
  index, 
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onToggleVisibility
}: { 
  photo: Photo
  index: number
  isSelected: boolean
  onSelect: (id: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => void
  onPreview: (photo: Photo) => void
  onEdit: (photo: Photo) => void
  onToggleVisibility: (photo: Photo) => void
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
        bg-white dark:bg-gray-800 rounded-lg shadow-sm 
        transition-all duration-200
        ${isDragging ? 'shadow-xl scale-[1.02] bg-gray-50 dark:bg-gray-700' : 'hover:shadow-md'}
        ${isSelected ? 'ring-2 ring-indigo-500' : ''}
      `}
    >
      <div className="flex items-center p-4">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 rounded-lg cursor-grab 
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-3
            text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Versleep om volgorde aan te passen"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="mr-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(photo.id, e)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 
              focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700
              dark:checked:bg-indigo-600 transition-colors"
          />
        </div>
        <div className="relative flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden group">
          <img 
            src={photo.url} 
            alt={altText} 
            className={`w-full h-full object-cover transition-transform duration-200
              group-hover:scale-105 ${!photo.visible ? 'opacity-50' : ''}`}
          />
          {!photo.visible && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <span className="text-white text-sm font-medium px-2 py-1 rounded bg-black bg-opacity-50">
                Verborgen
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 
            transition-opacity duration-200" />
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Positie {index + 1}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(photo.updated_at).toLocaleDateString('nl-NL')}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {altText}
            </span>
          </div>
        </div>
        <button
          onClick={() => onEdit(photo)}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
            dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors"
          title="Foto bewerken"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onPreview(photo)}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
            dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors"
          title="Bekijk foto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button
          onClick={() => onToggleVisibility(photo)}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
            dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors"
          title={photo.visible ? "Foto verbergen" : "Foto zichtbaar maken"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {photo.visible ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
        </button>
      </div>
    </div>
  )
}

export function PhotosOverview() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<Photo | undefined>(undefined)

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

      // Update de volgorde via de specifieke stored procedure
      const { error } = await supabase.rpc('reorder_photos', {
        photo_ids: newPhotos.map(p => p.id)
      })

      if (error) throw error
    } catch (error) {
      console.error('Drag error:', error)
      setError('Fout bij het updaten van de volgorde')
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

  const toggleSelection = (photoId: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
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
    } catch (error) {
      console.error('Delete error:', error)
      setError('Fout bij het verwijderen van foto\'s')
    }
  }

  const handleEdit = (photo: Photo) => {
    const photoWithDetails: PhotoWithDetails = {
      ...photo,
      title: '',
      description: undefined,
      year: new Date().getFullYear(),
    }
    
    setSelectedPhoto(photoWithDetails)
  }

  const handleFormComplete = () => {
    setShowForm(false)
    setEditingPhoto(undefined)
    fetchPhotos()
  }

  const handleToggleVisibility = async (photo: Photo) => {
    try {
      // Log de huidige status
      console.log('Toggling visibility for photo:', photo.id, 'Current visible:', photo.visible)

      const { error } = await supabase
        .from('photos')
        .update({ 
          visible: !photo.visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', photo.id)

      if (error) throw error

      // Update local state
      setPhotos(photos.map(p => 
        p.id === photo.id 
          ? { ...p, visible: !p.visible }
          : p
      ))

      // Log de nieuwe status
      console.log('Visibility toggled successfully')
    } catch (error) {
      console.error('Visibility toggle error:', error)
      setError('Fout bij het wijzigen van de zichtbaarheid')
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
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Foto Beheer
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Beheer de foto's voor de DKL25 website
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {selectedPhotos.size > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedPhotos.size} foto's geselecteerd
                  </span>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Deselecteer alles
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Verwijder geselecteerde
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={selectAll}
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Selecteer alles
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Forms & Modals */}
      {showForm && (
        <PhotoForm
          photo={editingPhoto}
          onComplete={handleFormComplete}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Foto's Uploaden
        </h3>
        <BulkUploadButton onUploadComplete={fetchPhotos} />
      </div>

      {/* Photos Grid Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Foto Overzicht
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Versleep foto's om de volgorde aan te passen
          </div>
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
            <div className="space-y-2">
              {photos.map((photo, index) => (
                <SortablePhoto 
                  key={photo.id} 
                  photo={photo} 
                  index={index} 
                  isSelected={selectedPhotos.has(photo.id)} 
                  onSelect={toggleSelection}
                  onPreview={setSelectedPhoto}
                  onEdit={handleEdit}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {photos.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Nog geen foto's geüpload
            </p>
          </div>
        )}
      </div>

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