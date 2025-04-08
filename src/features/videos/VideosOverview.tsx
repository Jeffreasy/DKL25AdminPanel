import { useState, useEffect } from 'react'
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
import { 
  PlusIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline'
import { VideoPreviewModal } from './components/VideoPreviewModal'
import { VideoForm } from './components/VideoForm'
import { fetchVideos, updateVideo, deleteVideo, updateVideoOrder } from './services/videoService'
import type { Video } from './types'

function SortableVideo({ 
  video, 
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onToggleVisibility
}: { 
  video: Video
  isSelected: boolean
  onSelect: (id: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => void
  onPreview: (video: Video) => void
  onEdit: (video: Video) => void
  onToggleVisibility: (video: Video) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: video.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0
  }

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
            onChange={(e) => onSelect(video.id, e)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 
              focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700
              dark:checked:bg-indigo-600 transition-colors"
          />
        </div>

        <div 
          className="relative flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden group 
            bg-gray-100 dark:bg-gray-700 cursor-pointer"
          onClick={() => onPreview(video)}
        >
          <div className="absolute inset-0 flex items-center justify-center 
            bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-12 h-12 flex items-center justify-center rounded-full 
              bg-white/90 group-hover:bg-white transition-colors">
              <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="ml-4 flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
              {video.title}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
              {new Date(video.created_at).toLocaleDateString('nl-NL')}
            </span>
          </div>
          {video.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {video.description}
            </p>
          )}
        </div>

        <div className="ml-4 flex items-center gap-2">
          <button
            onClick={() => onToggleVisibility(video)}
            className={`p-2 rounded-lg transition-colors ${
              video.visible
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {video.visible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onEdit(video)}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 
              dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 

export function VideosOverview() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | undefined>()
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())

  // DnD sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Laad videos bij mount
  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await fetchVideos()
      if (error) throw error
      setVideos(data)
    } catch (err) {
      console.error('Error loading videos:', err)
      setError('Er ging iets mis bij het ophalen van de videos')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = videos.findIndex(v => v.id === active.id)
    const newIndex = videos.findIndex(v => v.id === over.id)

    try {
      // Update lokale state
      const newVideos = arrayMove(videos, oldIndex, newIndex)
      setVideos(newVideos)

      // Update order in database
      const updatedVideo = newVideos[newIndex]
      const { error } = await updateVideoOrder(updatedVideo.id, newIndex + 1)
      if (error) throw error
    } catch (err) {
      console.error('Error updating order:', err)
      // Herstel oude volgorde bij error
      loadVideos()
    }
  }

  const handleToggleVisibility = async (video: Video) => {
    try {
      const { error } = await updateVideo(video.id, { 
        visible: !video.visible,
        updated_at: new Date().toISOString()
      })
      if (error) throw error
      
      // Update lokale state
      setVideos(videos.map(v => 
        v.id === video.id 
          ? { ...v, visible: !v.visible }
          : v
      ))
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
    }
  }

  const toggleSelection = (videoId: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    event.stopPropagation()
    const newSelection = new Set(selectedVideos)
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId)
    } else {
      newSelection.add(videoId)
    }
    setSelectedVideos(newSelection)
  }

  const selectAll = () => {
    setSelectedVideos(new Set(videos.map(v => v.id)))
  }

  const deselectAll = () => {
    setSelectedVideos(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0) return
    if (!confirm(`Weet je zeker dat je ${selectedVideos.size} video's wilt verwijderen?`)) return

    try {
      // Verwijder alle geselecteerde videos
      const deletePromises = Array.from(selectedVideos).map(id => deleteVideo(id))
      const results = await Promise.allSettled(deletePromises)
      
      // Check voor errors
      const errors = results.filter(r => r.status === 'rejected')
      if (errors.length > 0) {
        throw new Error(`${errors.length} video's konden niet worden verwijderd`)
      }

      // Herlaad videos en reset selectie
      await loadVideos()
      setSelectedVideos(new Set())
    } catch (err) {
      console.error('Error deleting videos:', err)
      setError('Er ging iets mis bij het verwijderen van de video\'s')
    }
  }

  const handleAdd = () => {
    setEditingVideo(undefined)
    setShowForm(true)
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setShowForm(true)
  }

  const handleFormComplete = async () => {
    setShowForm(false)
    setEditingVideo(undefined)
    await loadVideos()
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Video Beheer
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Beheer de video's voor de DKL25 website. Sleep om de volgorde aan te passen.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {selectedVideos.size > 0 ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedVideos.size} video{selectedVideos.size === 1 ? '' : '\'s'} geselecteerd
                </span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Deselecteer alles
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 
                    hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-red-500 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Verwijder geselecteerde
                </button>
              </div>
            ) : (
              <button
                onClick={selectAll}
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Selecteer alles
              </button>
            )}

            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Video Toevoegen
            </button>
          </div>
        </div>
      </div>

      {/* Videos List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={videos.map(v => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {videos.map((video) => (
                <SortableVideo 
                  key={video.id}
                  video={video}
                  isSelected={selectedVideos.has(video.id)}
                  onSelect={toggleSelection}
                  onPreview={setSelectedVideo}
                  onEdit={handleEdit}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Nog geen video's toegevoegd
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <VideoForm
          video={editingVideo}
          onComplete={handleFormComplete}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectedVideo && (
        <VideoPreviewModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  )
} 