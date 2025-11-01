import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import type { DropResult } from '@hello-pangea/dnd'
import type { Video } from '../types'
import { videoClient } from '../../../api/client/videoClient'

interface UseVideoDragDropReturn {
  isDragging: boolean
  handleDragEnd: (result: DropResult, videos: Video[], setVideos: (videos: Video[]) => void, canWrite: boolean) => Promise<void>
}

export function useVideoDragDrop(): UseVideoDragDropReturn {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = useCallback(async (
    result: DropResult,
    videos: Video[],
    setVideos: (videos: Video[]) => void,
    canWrite: boolean
  ) => {
    const { source, destination } = result

    if (!destination || source.index === destination.index) {
      return
    }

    if (!canWrite) {
      toast.error('Je hebt geen toestemming om video volgorde te wijzigen')
      return
    }

    setIsDragging(true)

    // Reorder videos
    const reorderedVideos = Array.from(videos)
    const [movedVideo] = reorderedVideos.splice(source.index, 1)
    reorderedVideos.splice(destination.index, 0, movedVideo)

    // Store original state for rollback
    const originalVideos = [...videos]

    // Optimistically update the UI with new order numbers
    const updatedVideos = reorderedVideos.map((video, index) => ({
      ...video,
      order_number: index
    }))
    
    setVideos(updatedVideos)

    try {
      // Reorder videos via backend API
      const reorderData = updatedVideos.map(v => ({
        id: v.id,
        order_number: v.order_number
      }))
      
      await videoClient.reorderVideos(reorderData)
      toast.success('Video volgorde bijgewerkt')
    } catch (error) {
      console.error('Error updating video order:', error)
      toast.error('Fout bij bijwerken volgorde')
      // Rollback on error
      setVideos(originalVideos)
    } finally {
      setIsDragging(false)
    }
  }, [])

  return {
    isDragging,
    handleDragEnd
  }
}