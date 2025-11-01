import { useState, useCallback } from 'react'
import type { Video } from '../types'
import { isValidVideoUrl } from '../utils/videoUrlUtils'

export interface VideoFormData {
  title: string
  description: string
  url: string
  visible: boolean
}

interface UseVideoFormReturn {
  formData: VideoFormData
  isSubmitting: boolean
  showForm: boolean
  editingVideo: Video | null
  formError: string | null
  setFormData: React.Dispatch<React.SetStateAction<VideoFormData>>
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>
  openForm: () => void
  closeForm: () => void
  openEditForm: (video: Video) => void
  validateForm: () => boolean
  resetForm: () => void
}

const initialFormData: VideoFormData = {
  title: '',
  description: '',
  url: '',
  visible: true
}

export function useVideoForm(): UseVideoFormReturn {
  const [formData, setFormData] = useState<VideoFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const openForm = useCallback(() => {
    setShowForm(true)
    setEditingVideo(null)
    setFormData(initialFormData)
    setFormError(null)
  }, [])

  const closeForm = useCallback(() => {
    setShowForm(false)
    setEditingVideo(null)
    setFormData(initialFormData)
    setFormError(null)
    setIsSubmitting(false)
  }, [])

  const openEditForm = useCallback((video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description || '',
      url: video.url,
      visible: video.visible
    })
    setShowForm(true)
    setFormError(null)
  }, [])

  const validateForm = useCallback(() => {
    if (!formData.title.trim()) {
      setFormError('Titel is verplicht')
      return false
    }
    
    if (!formData.url.trim()) {
      setFormError('Video URL is verplicht')
      return false
    }
    
    if (!isValidVideoUrl(formData.url)) {
      setFormError('Ongeldige video URL. Ondersteunde platformen: YouTube, Vimeo, Streamable.')
      return false
    }
    
    setFormError(null)
    return true
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setFormError(null)
  }, [])

  return {
    formData,
    isSubmitting,
    showForm,
    editingVideo,
    formError,
    setFormData,
    setIsSubmitting,
    openForm,
    closeForm,
    openEditForm,
    validateForm,
    resetForm
  }
}