import React, { useState, useEffect, useMemo } from 'react'
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ErrorText, H1, SmallText } from '../../../components/typography'
import { fetchVideos, addVideo, updateVideo, deleteVideo } from '../services/videoService'
import { usePageTitle } from '../../../hooks/usePageTitle'
import type { Video, VideoInsert } from '../types'
import { cl, cc } from '../../../styles/shared'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Toaster, toast } from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { ConfirmDialog, EmptyState, LoadingGrid } from '../../../components/ui'

interface VideoFormData {
  title: string
  description: string
  url: string
  visible: boolean
}

function getVideoEmbedUrl(url: string): string {
  try {
    const videoUrl = new URL(url)

    // YouTube
    if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
      const videoId = videoUrl.hostname.includes('youtu.be')
        ? videoUrl.pathname.slice(1)
        : new URLSearchParams(videoUrl.search).get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }

    // Vimeo
    if (videoUrl.hostname.includes('vimeo.com')) {
      const videoId = videoUrl.pathname.split('/').pop()
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }

    // Streamable
    if (videoUrl.hostname.includes('streamable.com')) {
      const videoId = videoUrl.pathname.split('/').pop()
      return videoId ? `https://streamable.com/e/${videoId}` : url
    }

    return url
  } catch {
    return url
  }
}

function isValidVideoUrl(url: string): boolean {
  try {
    const videoUrl = new URL(url)
    return videoUrl.hostname.includes('youtube.com') ||
           videoUrl.hostname.includes('youtu.be') ||
           videoUrl.hostname.includes('vimeo.com') ||
           videoUrl.hostname.includes('streamable.com')
  } catch {
    return false
  }
}

// Renamed component
export function VideosOverview() {
  usePageTitle("Video's beheren")
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    url: '',
    visible: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; videoId: string | null; videoTitle: string | null }>({
    isOpen: false,
    videoId: null,
    videoTitle: null
  })
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const filteredVideos = useMemo(() => {
    return videos
      .filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return (a.order_number ?? 0) - (b.order_number ?? 0)
        } else {
          return (b.order_number ?? 0) - (a.order_number ?? 0)
        }
      })
  }, [videos, searchQuery, sortOrder])

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await fetchVideos()
      if (fetchError) throw fetchError
      setVideos(data || [])
    } catch (err) {
      console.error('Error loading videos:', err)
      setError('Er ging iets mis bij het ophalen van de videos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidVideoUrl(formData.url)) {
      setError('Ongeldige video URL. Ondersteunde platformen: YouTube, Vimeo, Streamable.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const videoData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        url: formData.url.trim(),
        visible: formData.visible,
        updated_at: new Date().toISOString()
      }

      if (editingVideo) {
        await updateVideo(editingVideo.id, videoData)
        toast.success('Video succesvol bijgewerkt!')
      } else {
        // Fetch all videos to find the max order number
        const { data: allVideos, error: fetchAllError } = await fetchVideos()
        if (fetchAllError) throw fetchAllError;
        const maxOrderNumber = allVideos && allVideos.length > 0
          ? Math.max(...allVideos.map(v => v.order_number ?? 0))
          : -1; // Start at 0 if no videos exist
        const orderNumber = maxOrderNumber + 1;

        // Use addVideo service function here, assuming it exists and takes VideoInsert
        // The structure of VideoInsert needs confirmation based on addVideo definition
        // For now, creating the object based on formData and calculated order_number
        const newVideoData: VideoInsert = {
            ...videoData,
            order_number: orderNumber,
            // Assuming video_id and thumbnail_url are handled by backend or addVideo service
            // video_id: '', // Potentially required by VideoInsert?
            // thumbnail_url: '', // Potentially required by VideoInsert?
        };
        await addVideo(newVideoData); // Use addVideo instead of updateVideo with tempId
        toast.success('Video succesvol toegevoegd!')
      }

      await loadVideos()
      handleCloseForm()
    } catch (err) {
      console.error('Error saving video:', err)
      setError('Er ging iets mis bij het opslaan van de video')
      toast.error('Fout bij opslaan video.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description || '',
      url: video.url,
      visible: video.visible
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingVideo(null)
    setFormData({
      title: '',
      description: '',
      url: '',
      visible: true
    })
    setError(null)
  }

  const handleToggleVisibility = async (video: Video) => {
    try {
      setError(null)
      await updateVideo(video.id, {
        visible: !video.visible,
        updated_at: new Date().toISOString()
      })
      await loadVideos()
      toast.success(`Zichtbaarheid video "${video.title}" aangepast.`)
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
      toast.error('Fout bij aanpassen zichtbaarheid.')
    }
  }

  const handleDelete = (videoId: string, videoTitle: string) => {
    setDeleteConfirm({ isOpen: true, videoId, videoTitle })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.videoId) return
    
    try {
      setError(null)
      await deleteVideo(deleteConfirm.videoId)
      await loadVideos()
      toast.success(`Video "${deleteConfirm.videoTitle}" succesvol verwijderd.`)
    } catch (err) {
      console.error('Error deleting video:', err)
      setError('Er ging iets mis bij het verwijderen van de video')
      toast.error('Fout bij verwijderen video.')
    } finally {
      setDeleteConfirm({ isOpen: false, videoId: null, videoTitle: null })
    }
  }

  const handleBulkDelete = () => {
    if (selectedVideos.size === 0) {
      toast.error("Geen video's geselecteerd om te verwijderen.")
      return
    }
    setBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    const idsToDelete = Array.from(selectedVideos)
    const videoCount = idsToDelete.length
    
    try {
      await Promise.all(idsToDelete.map(id => deleteVideo(id)))
      toast.success(`${videoCount} video${videoCount === 1 ? '' : "'s"} succesvol verwijderd.`)
      setVideos(currentVideos => currentVideos.filter(video => !idsToDelete.includes(video.id)))
      setSelectedVideos(new Set())
    } catch (error) {
      console.error('Error deleting videos:', error)
      toast.error('Fout bij verwijderen video\'s.')
    } finally {
      setBulkDeleteConfirm(false)
    }
  }

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
      }
      return newSet
    })
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result

    if (!destination || source.index === destination.index) {
      return
    }

    setIsDragging(true)
    const reorderedVideos = Array.from(filteredVideos)
    const [movedVideo] = reorderedVideos.splice(source.index, 1)
    reorderedVideos.splice(destination.index, 0, movedVideo)

    // Create a shallow copy for optimistic UI update
    const currentVideos = [...videos];

    // Optimistically update the UI
    setVideos(prevVideos => {
      const updatedVideosMap = new Map(prevVideos.map(v => [v.id, v]));
      reorderedVideos.forEach((video, index) => {
        const existingVideo = updatedVideosMap.get(video.id);
        if (existingVideo) {
          updatedVideosMap.set(video.id, { ...existingVideo, order_number: index });
        }
      });
      return Array.from(updatedVideosMap.values()).sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));
    });

    try {
      // Update the order_number for all affected videos in the database
      const updates = reorderedVideos.map((video, index) => ({
        id: video.id,
        order_number: index
      }))

      // Batch update using Supabase client
      const { error: updateError } = await supabase
        .from('videos')
        .upsert(updates, { onConflict: 'id' })

      if (updateError) {
        throw updateError
      }

      // No need to call loadVideos() again if optimistic update is successful
      // toast.success('Volgorde succesvol bijgewerkt!'); // Optional: Confirmation toast

    } catch (error) {
      console.error('Error updating video order:', error)
      toast.error('Fout bij bijwerken volgorde.')
      // Rollback UI on error
      setVideos(currentVideos);
    } finally {
      setIsDragging(false)
    }
  }


  return (
    <div className={cl("page-container", "p-4 md:p-6", "dark:bg-gray-900")}>
      <Toaster position="top-right" />
      <H1 className="dark:text-white">Video's Beheren</H1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <button
          onClick={() => setShowForm(true)}
          className={cl("button", "button-primary", "dark:bg-indigo-600 dark:hover:bg-indigo-700")}
          disabled={isDragging}
        >
          Nieuwe Video Toevoegen
        </button>
        <div className="flex gap-2 items-center">
          <div className="relative">
              <input
                type="text"
                placeholder="Zoeken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cl("input", "pl-8", "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400")} // Add padding for icon
                disabled={isDragging}
              />
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className={cl("input", "dark:bg-gray-700 dark:border-gray-600 dark:text-white")}
            disabled={isDragging}
          >
            <option value="asc">Oplopend (Volgorde)</option>
            <option value="desc">Aflopend (Volgorde)</option>
          </select>
        </div>
      </div>

      {selectedVideos.size > 0 && (
        <div className="mb-4 flex justify-between items-center bg-blue-100 dark:bg-blue-900/50 p-2 rounded border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{selectedVideos.size} video('s) geselecteerd</span>
          <button
            onClick={handleBulkDelete}
            className={cl("button", "button-danger", "button-sm", "dark:bg-red-600 dark:hover:bg-red-700")}
            disabled={isDragging}
          >
            Verwijder Geselecteerde
          </button>
        </div>
      )}

      {loading ? (
        <LoadingGrid count={6} variant="albums" />
      ) : error ? (
        <ErrorText className="dark:text-red-400">{error}</ErrorText>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="videos">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {filteredVideos.map((video, index) => (
                  <Draggable key={video.id} draggableId={video.id} index={index} isDragDisabled={isDragging}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cl(
                          "video-card",
                          "border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4",
                          snapshot.isDragging ? "shadow-lg bg-gray-50 dark:bg-gray-700 opacity-90" : "",
                          selectedVideos.has(video.id) ? "border-blue-500 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-800/50" : "border-gray-200 dark:border-gray-700",
                          isDragging ? "cursor-grabbing" : "cursor-grab"
                        )}
                        style={{
                          ...provided.draggableProps.style,
                          // backgroundColor: snapshot.isDragging ? '#e0f2fe' : 'white',
                          // transition: 'background-color 0.2s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:checked:bg-blue-600"
                          checked={selectedVideos.has(video.id)}
                          onChange={() => handleSelectVideo(video.id)}
                          disabled={isDragging}
                        />
                         <div className="flex-shrink-0 w-32 h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                            {isValidVideoUrl(video.url) ? (
                               <iframe
                                   src={getVideoEmbedUrl(video.url)}
                                   title={video.title}
                                   className="w-full h-full"
                                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                   allowFullScreen
                               ></iframe>
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">Ongeldige URL</div>
                           )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold dark:text-white">{video.title}</h3>
                          <SmallText className="text-gray-600 dark:text-gray-400">{video.description || "Geen beschrijving"}</SmallText>
                          <SmallText className="text-blue-500 dark:text-blue-400 truncate hover:underline">
                            <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a>
                          </SmallText>
                          <SmallText className="text-gray-400 dark:text-gray-500">Volgorde: {video.order_number ?? 'N/A'}</SmallText>
                        </div>
                        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => handleToggleVisibility(video)}
                                className={cl("button", "button-icon", "button-sm", video.visible ? "text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400")}
                                title={video.visible ? 'Zichtbaar (klik om te verbergen)' : 'Verborgen (klik om zichtbaar te maken)'}
                                disabled={isDragging}
                            >
                                {video.visible ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={() => handleEdit(video)}
                                className={cl("button", "button-icon", "button-sm", "text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400")}
                                title="Bewerken"
                                disabled={isDragging}
                            >
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(video.id, video.title)}
                                className={cl("button", "button-icon", "button-sm", "text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400")}
                                title="Verwijderen"
                                disabled={isDragging}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                 {filteredVideos.length === 0 && !loading && videos.length > 0 && (
                  <EmptyState
                    title="Geen resultaten"
                    description="Geen video's gevonden die voldoen aan de zoekopdracht."
                  />
                )}
                 {!loading && videos.length === 0 && (
                  <EmptyState
                    title="Geen video's"
                    description="Er zijn nog geen video's toegevoegd. Klik op 'Nieuwe Video Toevoegen' om te beginnen."
                  />
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative">
            <button
              onClick={handleCloseForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">{editingVideo ? 'Video Bewerken' : 'Nieuwe Video Toevoegen'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titel*</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={cl("input", "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400")}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Beschrijving</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={cl("input", "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400")}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video URL* (YouTube, Vimeo, Streamable)</label>
                <input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className={cl("input", "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400")}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isSubmitting}
                />
                {!isValidVideoUrl(formData.url) && formData.url && (
                    <SmallText className="text-red-500 dark:text-red-400 mt-1">Ongeldige of niet-ondersteunde URL.</SmallText>
                )}
              </div>
              <div className="flex items-center">
                <input
                  id="visible"
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:checked:bg-blue-600"
                  disabled={isSubmitting}
                />
                <label htmlFor="visible" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Zichtbaar</label>
              </div>
              {error && <ErrorText className="dark:text-red-400">{error}</ErrorText>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className={cl("button", "button-secondary", "dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-300 dark:border-gray-500")}
                  disabled={isSubmitting}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className={cl("button", "button-primary", "dark:bg-indigo-600 dark:hover:bg-indigo-700", isSubmitting ? "opacity-50 cursor-not-allowed" : "")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Opslaan...' : (editingVideo ? 'Wijzigingen Opslaan' : 'Video Toevoegen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, videoId: null, videoTitle: null })}
        onConfirm={confirmDelete}
        title="Video verwijderen"
        message={`Weet je zeker dat je de video "${deleteConfirm.videoTitle}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        variant="danger"
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Video's verwijderen"
        message={`Weet je zeker dat je ${selectedVideos.size} video${selectedVideos.size === 1 ? '' : "'s"} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        variant="danger"
      />
    </div>
  )
}