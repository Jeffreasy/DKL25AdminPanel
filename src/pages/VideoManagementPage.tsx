import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/supabaseClient'
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { LoadingSkeleton } from '../components/auth/LoadingSkeleton'
import { ErrorText } from '../components/typography'

interface Video {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail_url: string | null
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

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

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('order_number', { ascending: true })

      if (error) throw error
      setVideos(data)
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError('Er ging iets mis bij het ophalen van de videos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const videoData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        url: formData.url.trim(),
        visible: formData.visible,
        updated_at: new Date().toISOString()
      }

      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', editingVideo.id)

        if (error) throw error
      } else {
        // Get highest order number
        const { data: lastVideo } = await supabase
          .from('videos')
          .select('order_number')
          .order('order_number', { ascending: false })
          .limit(1)

        const orderNumber = (lastVideo?.[0]?.order_number || 0) + 1

        const { error } = await supabase
          .from('videos')
          .insert({ ...videoData, order_number: orderNumber })

        if (error) throw error
      }

      await fetchVideos()
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
      const { error } = await supabase
        .from('videos')
        .update({ 
          visible: !video.visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id)

      if (error) throw error
      await fetchVideos()
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0) return
    if (!confirm(`Weet je zeker dat je ${selectedVideos.size} video's wilt verwijderen?`)) return

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .in('id', Array.from(selectedVideos))

      if (error) throw error
      await fetchVideos()
      setSelectedVideos(new Set())
    } catch (err) {
      console.error('Error deleting videos:', err)
      setError('Er ging iets mis bij het verwijderen van de videos')
    }
  }

  const filteredVideos = videos
    .filter(video => 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.order_number - b.order_number
      }
      return b.order_number - a.order_number
    })

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Video's</h1>
            <p className="text-sm text-gray-500">
              Beheer de video's voor de Koninklijke Loop
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Video Toevoegen</span>
            <span className="sm:hidden">Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Zoeken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-primary w-full pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="btn-secondary"
              >
                Sorteer {sortOrder === 'asc' ? '↓' : '↑'}
              </button>
              {selectedVideos.size > 0 && (
                <>
                  <span className="text-sm text-gray-500">
                    {selectedVideos.size} geselecteerd
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="btn-danger"
                  >
                    Verwijderen
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div className="divide-y divide-gray-200">
          {filteredVideos.map((video) => (
            <div key={video.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Thumbnail */}
                <div className="w-full sm:w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {isValidVideoUrl(video.url) ? (
                    <iframe
                      src={getVideoEmbedUrl(video.url)}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{video.title}</h3>
                  {video.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{video.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="badge">
                      Positie {video.order_number}
                    </span>
                    <span className={`badge ${video.visible ? 'badge-success' : 'badge-gray'}`}>
                      {video.visible ? 'Zichtbaar' : 'Verborgen'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(video)}
                    className="btn-icon"
                    title={video.visible ? 'Verbergen' : 'Zichtbaar maken'}
                  >
                    {video.visible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(video)}
                    className="btn-icon"
                    title="Bewerken"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const newSelection = new Set(selectedVideos)
                      if (newSelection.has(video.id)) {
                        newSelection.delete(video.id)
                      } else {
                        newSelection.add(video.id)
                      }
                      setSelectedVideos(newSelection)
                    }}
                    className={`btn-icon ${selectedVideos.has(video.id) ? 'text-red-500' : ''}`}
                    title={selectedVideos.has(video.id) ? 'Deselecteren' : 'Selecteren'}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredVideos.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Geen video's gevonden
            </div>
          )}
        </div>
      </div>

      {/* Video Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                {editingVideo ? 'Video bewerken' : 'Nieuwe video'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-primary"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Beschrijving
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="input-primary"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="input-primary"
                  required
                  disabled={isSubmitting}
                />
                {formData.url && isValidVideoUrl(formData.url) && (
                  <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={getVideoEmbedUrl(formData.url)}
                      title="Video preview"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visible"
                  checked={formData.visible}
                  onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                  className="checkbox-primary"
                  disabled={isSubmitting}
                />
                <label htmlFor="visible" className="ml-2 block text-sm text-gray-900">
                  Zichtbaar op de website
                </label>
              </div>

              {error && <ErrorText>{error}</ErrorText>}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Bezig met opslaan...
                    </span>
                  ) : (
                    'Opslaan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 