import { useState, useCallback, useEffect, useRef } from 'react'
import type { Video } from '../types'

interface UseVideoSelectionReturn {
  selectedVideos: Set<string>
  selectAllRef: React.RefObject<HTMLInputElement>
  handleSelectVideo: (videoId: string) => void
  handleSelectAll: (videos: Video[]) => void
  clearSelection: () => void
  isSelected: (videoId: string) => boolean
  hasSelection: boolean
  selectionCount: number
}

export function useVideoSelection(videos: Video[]): UseVideoSelectionReturn {
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const selectAllRef = useRef<HTMLInputElement>(null)

  // Update select-all checkbox state based on selection
  useEffect(() => {
    const numSelected = selectedVideos.size
    const numTotal = videos.length
    
    if (selectAllRef.current) {
      if (numSelected === 0) {
        selectAllRef.current.checked = false
        selectAllRef.current.indeterminate = false
      } else if (numSelected === numTotal && numTotal > 0) {
        selectAllRef.current.checked = true
        selectAllRef.current.indeterminate = false
      } else {
        selectAllRef.current.checked = false
        selectAllRef.current.indeterminate = true
      }
    }
  }, [selectedVideos, videos.length])

  const handleSelectVideo = useCallback((videoId: string) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((videosToSelect: Video[]) => {
    setSelectedVideos(prev => {
      const allSelected = videosToSelect.every(v => prev.has(v.id))
      if (allSelected) {
        return new Set()
      } else {
        return new Set(videosToSelect.map(v => v.id))
      }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedVideos(new Set())
  }, [])

  const isSelected = useCallback((videoId: string) => {
    return selectedVideos.has(videoId)
  }, [selectedVideos])

  return {
    selectedVideos,
    selectAllRef,
    handleSelectVideo,
    handleSelectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedVideos.size > 0,
    selectionCount: selectedVideos.size
  }
}