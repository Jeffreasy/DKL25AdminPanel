import React, { useState, useEffect, useMemo, useRef } from 'react'
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { H1, SmallText } from '../components/typography/typography'
import { LoadingGrid, ConfirmDialog } from '../components/ui'
import { fetchVideos, addVideo, updateVideo, deleteVideo } from '../features/videos/services/videoService'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Video, VideoInsert } from '../features/videos/types'
import { cc } from '../styles/shared'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Toaster, toast } from 'react-hot-toast'
import { supabase } from '../api/client/supabase'
import { usePermissions } from '../hooks/usePermissions'

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

export function VideoManagementPage() {
  usePageTitle("Video's beheren")
  const { hasPermission } = usePermissions()
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
  const selectAllRef = useRef<HTMLInputElement>(null)
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  const canReadVideos = hasPermission('video', 'read')
  const canWriteVideos = hasPermission('video', 'write')

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
      }

      await loadVideos()
      handleCloseForm()
    } catch (err) {
      console.error('Error saving video:', err)
      setError('Er ging iets mis bij het opslaan van de video')
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
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
    }
  }

  const handleDelete = async () => {
    if (!videoToDelete) return
    try {
      setError(null)
      await deleteVideo(videoToDelete.id)
      await loadVideos()
      setVideoToDelete(null)
    } catch (err) {
      console.error('Error deleting video:', err)
      setError('Er ging iets mis bij het verwijderen van de video')
    }
  }

  const handleBulkDelete = async () => {
    try {
      setError(null)
      await Promise.all(Array.from(selectedVideos).map(deleteVideo))
      await loadVideos()
      setSelectedVideos(new Set())
      setShowBulkDeleteConfirm(false)
    } catch (err) {
      console.error('Error deleting videos:', err)
      setError('Er ging iets mis bij het verwijderen van de videos')
    }
  }

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideos(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(videoId)) {
        newSelection.delete(videoId)
      } else {
        newSelection.add(videoId)
      }
      return newSelection
    })
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedVideos(new Set(filteredVideos.map(v => v.id)))
    } else {
      setSelectedVideos(new Set())
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for responsiveness
    setVideos(items.map((item, index) => ({ ...item, order_number: index })));

    // Update order numbers in the backend
    try {
      const updates = items.map((video, index) => 
        supabase.from('videos').update({ order_number: index }).eq('id', video.id)
      );
      await Promise.all(updates);
      toast.success('Volgorde opgeslagen!');
      // Optionally re-fetch to confirm, though local state should be accurate
      // loadVideos(); 
    } catch (error) {
      console.error("Error updating video order:", error);
      toast.error('Opslaan van volgorde mislukt.');
      // Revert local state on error?
      loadVideos(); // Re-fetch to revert to actual DB state
    }
  };

  if (!canReadVideos) {
    return (
      <div className={cc.spacing.container.md}>
        <div className="text-center">
          <H1>Geen toegang</H1>
          <SmallText>U heeft geen toestemming om video's te beheren.</SmallText>
        </div>
      </div>
    )
  }

  if (loading && videos.length === 0) {
    return <LoadingGrid variant="compact" count={8} />
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center ${cc.spacing.gap.lg}`}>
          <div>
            <H1 className="mb-1">Video's</H1>
            <SmallText>
              Beheer de video's voor de Koninklijke Loop
            </SmallText>
          </div>
          {canWriteVideos && (
            <button
              onClick={() => {
                setEditingVideo(null);
                setFormData({ title: '', description: '', url: '', visible: true });
                setShowForm(true);
              }}
              className={cc.button.base({ color: 'primary', className: `flex items-center ${cc.spacing.gap.sm}` })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <span className="hidden sm:inline">Video Toevoegen</span>
              <span className="sm:hidden">Toevoegen</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={cc.alert({ status: 'error' })}>
           <XCircleIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
           <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{error}</p>
           </div>
           <button onClick={() => setError(null)} className={cc.button.iconDanger({ size: 'sm', className: "-mx-1.5 -my-1.5" })}>
             <span className="sr-only">Sluiten</span>
             <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`${cc.spacing.container.sm} border-b border-gray-200 dark:border-gray-700`}>
          <div className={`flex flex-col sm:flex-row ${cc.spacing.gap.lg}`}>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Zoeken op titel of beschrijving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cc.form.input({ className: "pl-10" })}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className={`flex items-center ${cc.spacing.gap.sm} flex-shrink-0 flex-wrap`}>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className={cc.button.base({ color: 'secondary' })}
                title={sortOrder === 'asc' ? "Sorteer aflopend" : "Sorteer oplopend"}
              >
                Volgorde {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              {selectedVideos.size > 0 && (
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className={cc.button.base({ color: 'danger', className: "flex items-center" })}
                  title={`Verwijder ${selectedVideos.size} video's`}
                >
                  <TrashIcon className="h-5 w-5 mr-1" /> Verwijder ({selectedVideos.size})
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
           <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="videos">
              {(provided) => (
                <table ref={provided.innerRef} {...provided.droppableProps} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Hide thead on mobile */}
                  <thead className="bg-gray-50 dark:bg-gray-800/50 hidden md:table-header-group">
                    <tr>
                      <th scope="col" className="w-12 px-4 py-3 text-left">
                        <input 
                          ref={selectAllRef}
                          type="checkbox" 
                          className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800"
                          onChange={handleSelectAll}
                          aria-label="Selecteer alle video's"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Video</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Beschrijving</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Zichtbaar</th>
                      <th scope="col" className="w-28 relative px-6 py-3">
                        <span className="sr-only">Acties</span>
                      </th>
                    </tr>
                  </thead>
                  {/* Use a div wrapper for tbody to allow different display modes */}
                  <tbody 
                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 block md:table-row-group" // block on mobile, table-row-group on md+
                  >
                    {filteredVideos.map((video, index) => (
                      <Draggable key={video.id} draggableId={video.id} index={index} isDragDisabled={window.innerWidth < 768}>
                         {(provided, snapshot) => (
                          // TR acts as a simple container on mobile
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`block md:table-row ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            {/* Mobile Card View (hidden on md+) */}
                            <td className="block md:hidden p-3 border-b border-gray-200 dark:border-gray-700">
                              {/* --- Switched to Grid Layout --- */}
                              <div className={`grid grid-cols-[auto_max-content_1fr] gap-3 items-start ${selectedVideos.has(video.id) ? 'bg-blue-50 dark:bg-blue-900/30 rounded-md p-1' : 'p-1'}`}>
                                {/* Col 1: Checkbox */}
                                <div className="pt-1">
                                  <input 
                                      type="checkbox" 
                                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800"
                                      checked={selectedVideos.has(video.id)}
                                      onChange={() => handleSelectVideo(video.id)}
                                      aria-label={`Selecteer video ${video.title}`}
                                    />
                                </div>
                                {/* Col 2: Thumbnail */}
                                <div className="h-20 w-32 bg-gray-200 dark:bg-gray-900 rounded overflow-hidden relative group">
                                   <iframe
                                    src={getVideoEmbedUrl(video.url)}
                                    className="w-full h-full object-cover"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    title={video.title}
                                    loading="lazy"
                                    onError={(e) => { 
                                      const target = e.currentTarget as HTMLIFrameElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if(parent) parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-500 p-1">Preview Error</div>';
                                    }}
                                  ></iframe>
                                </div>
                                {/* Col 3: Text Content - Kept min-w-0 overflow-hidden */}
                                <div className="min-w-0 overflow-hidden">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate break-all" title={video.title}>{video.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 break-words" title={video.description || ''}>{video.description || 'Geen beschrijving'}</p>
                                </div>
                              </div>
                              {/* Actions row remains flex */}
                              <div className="flex justify-start items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                 {/* Action Buttons Group */}
                                <div className="flex items-center gap-1">
                                  {/* Status Button */}
                                  <button 
                                    onClick={() => handleToggleVisibility(video)} 
                                    className={cc.button.icon({ color: 'secondary', size: 'sm', className: "rounded-full" })}
                                    title={video.visible ? "Zichtbaar" : "Verborgen"}
                                  >
                                    {video.visible ? 
                                      <EyeIcon className="h-4 w-4 text-green-500" /> : 
                                      <EyeSlashIcon className="h-4 w-4 text-red-500" />
                                    }
                                  </button>
                                  {/* Edit Button */}
                                  <button onClick={() => handleEdit(video)} className={cc.button.icon({ color: 'secondary', size: 'sm'})} title="Bewerken">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  {/* Delete Button */}
                                  <button onClick={() => setVideoToDelete(video)} className={cc.button.iconDanger({ size: 'sm' })} title="Verwijderen">
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Desktop Table View Cells (hidden on mobile) */}
                            <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap">
                              {/* Checkbox content for desktop */}
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800"
                                    checked={selectedVideos.has(video.id)}
                                    onChange={() => handleSelectVideo(video.id)}
                                    aria-label={`Selecteer video ${video.title}`}
                                  />
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                              {/* Video content for desktop */}
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-16 w-28 bg-gray-200 dark:bg-gray-900 rounded mr-4 overflow-hidden relative group">
                                   <iframe
                                    src={getVideoEmbedUrl(video.url)}
                                    className="w-full h-full object-cover"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    title={video.title}
                                    loading="lazy"
                                    onError={(e) => { 
                                      const target = e.currentTarget as HTMLIFrameElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if(parent) parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-500 p-1">Preview Error</div>';
                                    }}
                                  ></iframe>
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={video.title}>{video.title}</div>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4">
                              {/* Description content for desktop */}
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md" title={video.description || ''}>{video.description || '-'}</div>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                              {/* Visibility content for desktop */}
                               <button 
                                  onClick={() => handleToggleVisibility(video)} 
                                  className={cc.button.icon({ color: 'secondary', className: "rounded-full p-1" })}
                                  title={video.visible ? "Zichtbaar" : "Verborgen"}
                                >
                                  {video.visible ? 
                                    <EyeIcon className="h-5 w-5 text-green-500" /> : 
                                    <EyeSlashIcon className="h-5 w-5 text-red-500" />
                                  }
                                </button>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                              {/* Actions content for desktop */}
                                <button onClick={() => handleEdit(video)} className={cc.button.icon({ color: 'secondary'})} title="Bewerken">
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => setVideoToDelete(video)} className={cc.button.iconDanger()} title="Verwijderen">
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {/* Empty state row - hide on mobile if parent tbody is block */}
                    {filteredVideos.length === 0 && (
                      <tr className="hidden md:table-row"> 
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          Geen video's gevonden{searchQuery && ' voor uw zoekopdracht'}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
             </Droppable>
           </DragDropContext>
           {/* Empty state message for mobile */}
           {filteredVideos.length === 0 && (
              <div className="block md:hidden px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Geen video's gevonden{searchQuery && ' voor uw zoekopdracht'}.
              </div>
           )}
        </div>
      </div>

      {showForm && (
        <div className={`fixed inset-0 ${cc.overlay.medium} z-50 flex items-center justify-center p-4`}>
          <div className={cc.card({ className: "p-0 w-full max-w-lg flex flex-col max-h-[90vh]" })}>
             <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
               <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0`}>
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                   {editingVideo ? 'Video Bewerken' : 'Video Toevoegen'}
                 </h3>
                 <button 
                    type="button" 
                    onClick={handleCloseForm} 
                    className={cc.button.icon({ color: 'secondary' })}
                    title="Sluiten"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
               </div>
               <div className={`${cc.spacing.container.md} ${cc.spacing.section.sm} flex-grow overflow-y-auto`}>
                 <div>
                   <label htmlFor="title" className={cc.form.label()}>Titel</label>
                   <input 
                     type="text" 
                     id="title" 
                     value={formData.title}
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                     className={cc.form.input({ className: 'mt-1' })}
                     required 
                   />
                 </div>
                 <div>
                   <label htmlFor="description" className={cc.form.label()}>Beschrijving (optioneel)</label>
                   <textarea 
                     id="description" 
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                     className={cc.form.input({ className: 'mt-1' })}
                     rows={3}
                   />
                 </div>
                 <div>
                   <label htmlFor="url" className={cc.form.label()}>Video URL (YouTube, Vimeo, Streamable)</label>
                   <input 
                     type="url" 
                     id="url" 
                     value={formData.url}
                     onChange={(e) => setFormData({...formData, url: e.target.value})}
                     className={cc.form.input({ className: 'mt-1' })}
                     required 
                     placeholder="https://www.youtube.com/watch?v=..."
                   />
                   {!isValidVideoUrl(formData.url) && formData.url && (
                      <p className={cc.form.error()}>Ongeldige of niet-ondersteunde video URL.</p>
                   )}
                 </div>
                 <div className="flex items-center">
                   <input 
                     id="visible" 
                     type="checkbox" 
                     checked={formData.visible}
                     onChange={(e) => setFormData({...formData, visible: e.target.checked})}
                     className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800"
                   />
                   <label htmlFor="visible" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Zichtbaar op website</label>
                 </div>
                 {error && !error.includes('ophalen') && !error.includes('zichtbaarheid') && !error.includes('verwijderen') && (
                    <p className={cc.form.error()}>{error}</p>
                 )}
               </div>
               <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-t border-gray-200 dark:border-gray-700 flex justify-end ${cc.spacing.gap.md} flex-shrink-0 bg-gray-50 dark:bg-gray-800/50`}>
                 <button type="button" className={cc.button.base({ color: 'secondary' })} onClick={handleCloseForm}>
                    Annuleren
                  </button>
                  <button type="submit" className={cc.button.base({ color: 'primary' })} disabled={isSubmitting || !isValidVideoUrl(formData.url)}>
                    {isSubmitting ? 'Opslaan...' : (editingVideo ? 'Wijzigingen Opslaan' : 'Video Opslaan')}
                  </button>
               </div>
             </form>
           </div>
        </div>
      )}

      <ConfirmDialog
        open={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={handleDelete}
        title="Video verwijderen"
        message={`Weet je zeker dat je de video "${videoToDelete?.title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        variant="danger"
      />

      <ConfirmDialog
        open={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Video's verwijderen"
        message={`Weet je zeker dat je ${selectedVideos.size} video's wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        variant="danger"
      />

      <Toaster position="bottom-center" />
    </div>
  )
}