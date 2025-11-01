import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { fetchVideos, addVideo, updateVideo, deleteVideo } from '../services/videoService'
import type { Video, VideoInsert } from '../types'

interface UseVideosReturn {
  videos: Video[]
  loading: boolean
  error: string | null
  loadVideos: () => Promise<void>
  createVideo: (video: VideoInsert) => Promise<void>
  updateVideoData: (id: string, updates: Partial<Video>) => Promise<void>
  removeVideo: (id: string) => Promise<void>
  removeVideos: (ids: string[]) => Promise<void>
  toggleVisibility: (video: Video) => Promise<void>
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>
}

export function useVideos(): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await fetchVideos()
      if (fetchError) throw fetchError
      setVideos(data || [])
    } catch (err) {
      console.error('Error loading videos:', err)
      setError('Er ging iets mis bij het ophalen van de videos')
      toast.error('Fout bij ophalen videos')
    } finally {
      setLoading(false)
    }
  }, [])

  const createVideo = useCallback(async (video: VideoInsert) => {
    try {
      setError(null)
      
      // Calculate order_number
      const { data: allVideos, error: fetchAllError } = await fetchVideos()
      if (fetchAllError) throw fetchAllError
      
      const maxOrderNumber = allVideos && allVideos.length > 0
        ? Math.max(...allVideos.map(v => v.order_number ?? 0))
        : -1
      
      const newVideoData: VideoInsert = {
        ...video,
        order_number: maxOrderNumber + 1,
      }
      
      const { error: createError } = await addVideo(newVideoData)
      if (createError) throw createError
      
      toast.success('Video succesvol toegevoegd!')
      await loadVideos()
    } catch (err) {
      console.error('Error creating video:', err)
      setError('Er ging iets mis bij het toevoegen van de video')
      toast.error('Fout bij toevoegen video')
      throw err
    }
  }, [loadVideos])

  const updateVideoData = useCallback(async (id: string, updates: Partial<Video>) => {
    try {
      setError(null)
      const { error: updateError } = await updateVideo(id, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      if (updateError) throw updateError
      
      toast.success('Video succesvol bijgewerkt!')
      await loadVideos()
    } catch (err) {
      console.error('Error updating video:', err)
      setError('Er ging iets mis bij het bijwerken van de video')
      toast.error('Fout bij bijwerken video')
      throw err
    }
  }, [loadVideos])

  const removeVideo = useCallback(async (id: string) => {
    try {
      setError(null)
      const { error: deleteError } = await deleteVideo(id)
      if (deleteError) throw deleteError
      
      toast.success('Video succesvol verwijderd')
      await loadVideos()
    } catch (err) {
      console.error('Error deleting video:', err)
      setError('Er ging iets mis bij het verwijderen van de video')
      toast.error('Fout bij verwijderen video')
      throw err
    }
  }, [loadVideos])

  const removeVideos = useCallback(async (ids: string[]) => {
    try {
      setError(null)
      await Promise.all(ids.map(id => deleteVideo(id)))
      
      toast.success(`${ids.length} video${ids.length === 1 ? '' : "'s"} succesvol verwijderd`)
      await loadVideos()
    } catch (err) {
      console.error('Error deleting videos:', err)
      setError('Er ging iets mis bij het verwijderen van de videos')
      toast.error('Fout bij verwijderen videos')
      throw err
    }
  }, [loadVideos])

  const toggleVisibility = useCallback(async (video: Video) => {
    try {
      setError(null)
      await updateVideo(video.id, {
        visible: !video.visible,
        updated_at: new Date().toISOString()
      })
      
      toast.success(`Zichtbaarheid video "${video.title}" aangepast`)
      await loadVideos()
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
      toast.error('Fout bij aanpassen zichtbaarheid')
      throw err
    }
  }, [loadVideos])

  useEffect(() => {
    loadVideos()
  }, [loadVideos])

  return {
    videos,
    loading,
    error,
    loadVideos,
    createVideo,
    updateVideoData,
    removeVideo,
    removeVideos,
    toggleVisibility,
    setVideos
  }
}