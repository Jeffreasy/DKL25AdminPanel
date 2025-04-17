import React, { useState, useEffect, useMemo, useRef } from 'react'
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorText, H1, SmallText } from '../components/typography'
import { fetchVideos, addVideo, updateVideo, deleteVideo } from '../features/videos/services/videoService'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Video, VideoInsert } from '../features/videos/types'
import { componentClasses as cc } from '../styles/shared'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Toaster, toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'

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

  const handleDelete = async (videoId: string) => {
    if (!confirm('Weet je zeker dat je deze video wilt verwijderen?')) return
    try {
      setError(null)
      await deleteVideo(videoId)
      await loadVideos()
    } catch (err) {
      console.error('Error deleting video:', err)
      setError('Er ging iets mis bij het verwijderen van de video')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0 || !confirm(`Weet je zeker dat je ${selectedVideos.size} video's wilt verwijderen?`)) return
    try {
      setError(null)
      await Promise.all(Array.from(selectedVideos).map(deleteVideo))
      await loadVideos()
      setSelectedVideos(new Set())
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

  const handleEditVideo = (video: Video) => {
    setEditVideoData(video)
    setShowForm(true)
  }

  if (loading && videos.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <H1 className="mb-1">Video's</H1>
            <SmallText>
              Beheer de video's voor de Koninklijke Loop
            </SmallText>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`${cc.button.primary} flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span className="hidden sm:inline">Video Toevoegen</span>
            <span className="sm:hidden">Toevoegen</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800/50">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              <ErrorText>{error}</ErrorText>
            </div>
             <button onClick={() => setError(null)} className="ml-3 -mx-1.5 -my-1.5 rounded-lg p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 flex-shrink-0">
               <span className="sr-only">Sluiten</span>
               <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Zoeken op titel of beschrijving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${cc.form.input} pl-10`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className={cc.button.secondary}
              >
                Sorteer {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              {selectedVideos.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className={`${cc.button.secondary} text-red-600 dark:text-red-400 border-red-300 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center`}
                  title={`Verwijder ${selectedVideos.size} video's`}
                >
                  <TrashIcon className="h-5 w-5 mr-1" /> Verwijder ({selectedVideos.size})
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedVideos.size > 0 && selectedVideos.size === filteredVideos.length && filteredVideos.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Selecteer alle video's"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Video</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Beschrijving</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Zichtbaar</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acties</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVideos.map((video) => (
                <tr key={video.id} className={`${selectedVideos.has(video.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                     <input 
                        type="checkbox" 
                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedVideos.has(video.id)}
                        onChange={() => handleSelectVideo(video.id)}
                        aria-label={`Selecteer video ${video.title}`}
                      />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-28 bg-gray-200 dark:bg-gray-700 rounded mr-4 overflow-hidden relative group">
                         <iframe
                          src={getVideoEmbedUrl(video.url)}
                          className="w-full h-full object-cover"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={video.title}
                          loading="lazy"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        ></iframe>
                         <div className="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-600 group-hover:opacity-0 transition-opacity">
                           <svg className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                         </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{video.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{video.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleToggleVisibility(video)} className={`${cc.button.icon} rounded-full p-1`}>
                      {video.visible ? 
                        <EyeIcon className="h-5 w-5 text-green-500" /> : 
                        <EyeSlashIcon className="h-5 w-5 text-red-500" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                    <button onClick={() => handleEdit(video)} className={cc.button.icon} title="Bewerken">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                     <button onClick={() => handleDelete(video.id)} className={`${cc.button.icon} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300`} title="Verwijderen">
                       <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVideos.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                     Geen video's gevonden{searchQuery && ' voor uw zoekopdracht'}.
                   </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full shadow-xl border border-gray-200 dark:border-gray-700 my-8">
             <form onSubmit={handleSubmit}>
               <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-lg">
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                   {editingVideo ? 'Video Bewerken' : 'Video Toevoegen'}
                 </h3>
                 <button 
                    type="button" 
                    onClick={handleCloseForm} 
                    className={cc.button.icon}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                 <div>
                   <label htmlFor="title" className={cc.form.label}>Titel</label>
                   <input 
                     type="text" 
                     id="title" 
                     value={formData.title}
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                     className={cc.form.input}
                     required 
                   />
                 </div>
                 <div>
                   <label htmlFor="description" className={cc.form.label}>Beschrijving (optioneel)</label>
                   <textarea 
                     id="description" 
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                     className={cc.form.input}
                     rows={3}
                   />
                 </div>
                 <div>
                   <label htmlFor="url" className={cc.form.label}>Video URL (YouTube, Vimeo, Streamable)</label>
                   <input 
                     type="url" 
                     id="url" 
                     value={formData.url}
                     onChange={(e) => setFormData({...formData, url: e.target.value})}
                     className={cc.form.input}
                     required 
                     placeholder="https://www.youtube.com/watch?v=..."
                   />
                   {!isValidVideoUrl(formData.url) && formData.url && (
                      <ErrorText>Ongeldige of niet-ondersteunde video URL.</ErrorText>
                   )}
                 </div>
                 <div className="flex items-center">
                   <input 
                     id="visible" 
                     type="checkbox" 
                     checked={formData.visible}
                     onChange={(e) => setFormData({...formData, visible: e.target.checked})}
                     className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-indigo-500"
                   />
                   <label htmlFor="visible" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Zichtbaar op website</label>
                 </div>
                  {error && !error.includes('ophalen') && !error.includes('zichtbaarheid') && !error.includes('verwijderen') && (
                     <ErrorText>{error}</ErrorText> 
                  )}
               </div>
               <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 rounded-b-lg">
                 <button 
                   type="button" 
                   onClick={handleCloseForm} 
                   className={cc.button.secondary}
                   disabled={isSubmitting}
                 >
                   Annuleren
                 </button>
                 <button 
                   type="submit" 
                   className={cc.button.primary}
                   disabled={isSubmitting || !isValidVideoUrl(formData.url) || !formData.title.trim()}
                 >
                   {isSubmitting ? 'Opslaan...' : (editingVideo ? 'Wijzigingen Opslaan' : 'Video Opslaan')}
                 </button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  )
} 