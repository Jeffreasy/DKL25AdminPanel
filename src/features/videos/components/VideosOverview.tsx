import React, { useState, useEffect, useMemo, useRef } from 'react'
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton' // Adjusted path
import { ErrorText, H1, SmallText } from '../../../components/typography' // Adjusted path
import { fetchVideos, addVideo, updateVideo, deleteVideo } from '../services/videoService' // Adjusted path
import { usePageTitle } from '../../../hooks/usePageTitle' // Adjusted path
import type { Video, VideoInsert } from '../types' // Adjusted path
import { cl } from '../../../styles/shared' // Adjusted path - Changed cc to cl
import { XCircleIcon } from '@heroicons/react/24/solid'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Toaster, toast } from 'react-hot-toast'
import { supabase } from '../../../lib/supabase' // Adjusted path

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
  const [editVideoData, setEditVideoData] = useState<Video | null>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  useEffect(() => {
    const numSelected = selectedVideos.size
    const numFiltered = filteredVideos.length
    if (selectAllRef.current) {
      if (numSelected === 0) {
        selectAllRef.current.checked = false
        selectAllRef.current.indeterminate = false
      } else if (numSelected === numFiltered) {
        selectAllRef.current.checked = true
        selectAllRef.current.indeterminate = false
      } else {
        selectAllRef.current.checked = false
        selectAllRef.current.indeterminate = true
      }
    }
  }, [selectedVideos, filteredVideos.length])

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

  const handleDelete = async (videoId: string, videoTitle: string) => {
    if (!confirm(`Weet je zeker dat je de video "${videoTitle}" wilt verwijderen?`)) return
    try {
      setError(null)
      await deleteVideo(videoId)
      await loadVideos()
      toast.success(`Video "${videoTitle}" succesvol verwijderd.`)
    } catch (err) {
      console.error('Error deleting video:', err)
      setError('Er ging iets mis bij het verwijderen van de video')
      toast.error('Fout bij verwijderen video.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0) {
      toast.error("Geen video's geselecteerd om te verwijderen.");
      return;
    }

    const videoCount = selectedVideos.size;
    const videoText = videoCount === 1 ? 'video' : 'video(\'s)'; // Fix: Escaped single quote

    if (window.confirm(`Weet je zeker dat je ${videoCount} ${videoText} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
      const idsToDelete = Array.from(selectedVideos);
      try {
        // Fix: Call deleteVideo for each selected ID
        await Promise.all(idsToDelete.map(id => deleteVideo(id)));
        toast.success(`${videoCount} ${videoText} succesvol verwijderd.`); // Reverted toast message
        setVideos(currentVideos => currentVideos.filter(video => !idsToDelete.includes(video.id)));
        setSelectedVideos(new Set()); // Clear selection after delete
      } catch (error) {
        console.error('Error deleting videos:', error);
        toast.error(`Fout bij verwijderen ${videoText}.`); // Reverted toast message
      }
    }
  };

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

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedVideos(new Set(filteredVideos.map(v => v.id)))
    } else {
      setSelectedVideos(new Set())
    }
  }

  const handleEditVideo = (video: Video) => {
    // Logic for editing a video (e.g., opening a modal or navigating to an edit page)
    console.log("Editing video:", video);
    // For now, just log, but this could set state to open a modal
    setEditVideoData(video) // Assuming you have a state for this
    // setShowEditModal(true); // Example: if you have a modal
  }

  const handleDragEnd = async (result: any) => {
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
    <div className={cl("page-container", "p-4 md:p-6")}>
      <Toaster position="top-right" />
      <H1>Video's Beheren</H1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <button
          onClick={() => setShowForm(true)}
          className={cl("button", "button-primary")}
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
                className={cl("input", "pl-8")} // Add padding for icon
                disabled={isDragging}
              />
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className={cl("input")}
            disabled={isDragging}
          >
            <option value="asc">Oplopend (Volgorde)</option>
            <option value="desc">Aflopend (Volgorde)</option>
          </select>
        </div>
      </div>

      {selectedVideos.size > 0 && (
        <div className="mb-4 flex justify-between items-center bg-blue-100 p-2 rounded">
          <span className="text-sm font-medium text-blue-800">{selectedVideos.size} video('s) geselecteerd</span>
          <button
            onClick={handleBulkDelete}
            className={cl("button", "button-danger", "button-sm")}
            disabled={isDragging}
          >
            Verwijder Geselecteerde
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorText>{error}</ErrorText>
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
                          "border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4",
                          snapshot.isDragging ? "shadow-lg bg-gray-50 opacity-90" : "",
                          selectedVideos.has(video.id) ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200",
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
                          className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 md:mt-0 flex-shrink-0"
                          checked={selectedVideos.has(video.id)}
                          onChange={() => handleSelectVideo(video.id)}
                          disabled={isDragging}
                        />
                         <div className="flex-shrink-0 w-32 h-20 bg-gray-100 rounded overflow-hidden">
                            {isValidVideoUrl(video.url) ? (
                               <iframe
                                   src={getVideoEmbedUrl(video.url)}
                                   title={video.title}
                                   className="w-full h-full"
                                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                   allowFullScreen
                               ></iframe>
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Ongeldige URL</div>
                           )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold">{video.title}</h3>
                          <SmallText className="text-gray-600">{video.description || "Geen beschrijving"}</SmallText>
                          <SmallText className="text-blue-500 truncate hover:underline">
                            <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a>
                          </SmallText>
                          <SmallText className="text-gray-400">Volgorde: {video.order_number ?? 'N/A'}</SmallText>
                        </div>
                        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => handleToggleVisibility(video)}
                                className={cl("button", "button-icon", "button-sm", video.visible ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600")}
                                title={video.visible ? 'Zichtbaar (klik om te verbergen)' : 'Verborgen (klik om zichtbaar te maken)'}
                                disabled={isDragging}
                            >
                                {video.visible ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={() => handleEdit(video)}
                                className={cl("button", "button-icon", "button-sm", "text-blue-600 hover:text-blue-800")}
                                title="Bewerken"
                                disabled={isDragging}
                            >
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(video.id, video.title)}
                                className={cl("button", "button-icon", "button-sm", "text-red-600 hover:text-red-800")}
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
                 {filteredVideos.length === 0 && !loading && (
                  <div className="text-center py-10 text-gray-500">
                    Geen video's gevonden die voldoen aan de zoekopdracht.
                  </div>
                )}
                 {!loading && videos.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    Er zijn nog geen video's toegevoegd.
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
            <button
              onClick={handleCloseForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4">{editingVideo ? 'Video Bewerken' : 'Nieuwe Video Toevoegen'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titel*</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={cl("input")}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Beschrijving</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={cl("input")}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">Video URL* (YouTube, Vimeo, Streamable)</label>
                <input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className={cl("input")}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isSubmitting}
                />
                {!isValidVideoUrl(formData.url) && formData.url && (
                    <SmallText className="text-red-500 mt-1">Ongeldige of niet-ondersteunde URL.</SmallText>
                )}
              </div>
              <div className="flex items-center">
                <input
                  id="visible"
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="visible" className="ml-2 block text-sm text-gray-900">Zichtbaar</label>
              </div>
              {error && <ErrorText>{error}</ErrorText>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className={cl("button", "button-secondary")}
                  disabled={isSubmitting}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className={cl("button", "button-primary", isSubmitting ? "opacity-50 cursor-not-allowed" : "")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Opslaan...' : (editingVideo ? 'Wijzigingen Opslaan' : 'Video Toevoegen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 