import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/supabaseClient'
import { Video } from '../../types/video'
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
import { VideoPreviewModal } from './components/VideoPreviewModal'
import { VideoForm } from './components/VideoForm'

function SortableVideo({ 
  video, 
  index, 
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onToggleVisibility
}: { 
  video: Video
  index: number
  isSelected: boolean
  onSelect: (id: string, event: React.MouseEvent) => void
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
      aria-label={`Video ${index + 1}: ${video.title}`}
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
            onChange={(e) => onSelect(video.id, e as any)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 
              focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700
              dark:checked:bg-indigo-600 transition-colors"
          />
        </div>

        {/* Video Thumbnail */}
        <div className="relative flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden group bg-gray-100 dark:bg-gray-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="ml-4 flex-grow">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {video.title}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(video.updated_at || '').toLocaleDateString('nl-NL')}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {video.description}
            </span>
          </div>
        </div>

        <button
          onClick={() => onEdit(video)}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
            dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors"
          title="Video bewerken"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          onClick={() => onPreview(video)}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
            dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors"
          title="Bekijk video"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        <button
          onClick={() => onToggleVisibility(video)}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
            dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors"
          title={video.visible ? "Video verbergen" : "Video zichtbaar maken"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {video.visible ? (
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

export function VideosOverview() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('order_number')

      if (error) throw error
      setVideos(data || [])
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
      const oldIndex = videos.findIndex(video => video.id === active.id)
      const newIndex = videos.findIndex(video => video.id === over.id)

      // Optimistic update voor de UI
      const newVideos = arrayMove(videos, oldIndex, newIndex)
      setVideos(newVideos)

      // Update de order numbers
      const updates = newVideos.map((video, index) => ({
        id: video.id,
        order_number: index + 1,
        videoId: video.videoId,
        url: video.url,
        title: video.title,
        description: video.description,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('videos')
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
      await fetchVideos()
    }
  }

  const toggleSelection = (videoId: string, event: React.MouseEvent) => {
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

    if (!confirm(`Weet je zeker dat je ${selectedVideos.size} video's wilt verwijderen?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .in('id', Array.from(selectedVideos))

      if (error) throw error

      await fetchVideos()
      setSelectedVideos(new Set())
    } catch (err) {
      setError('Fout bij het verwijderen van video\'s')
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

  const handleFormComplete = () => {
    setShowForm(false)
    setEditingVideo(undefined)
    fetchVideos()
  }

  const handleToggleVisibility = async (video: Video) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ 
          visible: !video.visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id)

      if (error) throw error

      // Update local state
      setVideos(videos.map(v => 
        v.id === video.id 
          ? { ...v, visible: !v.visible }
          : v
      ))
    } catch (err) {
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
              Video Beheer
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Beheer de video's voor de DKL25 website
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {selectedVideos.size > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedVideos.size} video's geselecteerd
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
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Video Toevoegen
          </button>
        </div>
      </div>

      {/* Videos Grid Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Video Overzicht
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Versleep video's om de volgorde aan te passen
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={videos.map(v => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {videos.map((video, index) => (
                <SortableVideo 
                  key={video.id} 
                  video={video} 
                  index={index} 
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

        {videos.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Nog geen video's toegevoegd
            </p>
          </div>
        )}
      </div>

      {/* Forms & Modals */}
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