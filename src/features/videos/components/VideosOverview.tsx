import React, { useState, useMemo } from 'react'
import { Toaster } from 'react-hot-toast'
import type { DropResult } from '@hello-pangea/dnd'
import { ConfirmDialog, LoadingGrid } from '../../../components/ui'
import { H1, ErrorText } from '../../../components/typography/typography'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { usePermissions } from '../../../hooks/usePermissions'
import { useVideos } from '../hooks/useVideos'
import { useVideoForm } from '../hooks/useVideoForm'
import { useVideoSelection } from '../hooks/useVideoSelection'
import { useVideoDragDrop } from '../hooks/useVideoDragDrop'
import { VideoForm } from './VideoForm'
import { VideoList } from './VideoList'
import { BulkActions } from './BulkActions'
import { SearchAndSort } from './SearchAndSort'
import type { Video } from '../types'
import { cc } from '../../../styles/shared'

export function VideosOverview() {
  usePageTitle("Video's beheren")
  const { hasPermission } = usePermissions()
  
  // Hooks
  const {
    videos,
    loading,
    error,
    createVideo,
    updateVideoData,
    removeVideo,
    removeVideos,
    toggleVisibility,
    setVideos
  } = useVideos()
  
  const {
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
    validateForm
  } = useVideoForm()
  
  // Search and sort
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Filtered and sorted videos
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
  
  // Selection
  const {
    selectedVideos,
    handleSelectVideo,
    clearSelection
  } = useVideoSelection(filteredVideos)
  
  // Drag and drop
  const { isDragging, handleDragEnd } = useVideoDragDrop()
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    videoId: string | null
    videoTitle: string | null
  }>({
    isOpen: false,
    videoId: null,
    videoTitle: null
  })
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  
  // Permissions
  const canWrite = hasPermission('video', 'write')
  const canDelete = hasPermission('video', 'delete')
  
  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      if (editingVideo) {
        await updateVideoData(editingVideo.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          url: formData.url.trim(),
          visible: formData.visible
        })
      } else {
        await createVideo({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          url: formData.url.trim(),
          visible: formData.visible,
          order_number: 0 // Will be calculated in the hook
        })
      }
      closeForm()
    } catch {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = (video: Video) => {
    setDeleteConfirm({
      isOpen: true,
      videoId: video.id,
      videoTitle: video.title
    })
  }
  
  const confirmDelete = async () => {
    if (!deleteConfirm.videoId) return
    
    try {
      await removeVideo(deleteConfirm.videoId)
    } finally {
      setDeleteConfirm({ isOpen: false, videoId: null, videoTitle: null })
    }
  }
  
  const handleBulkDelete = () => {
    if (selectedVideos.size === 0) return
    setBulkDeleteConfirm(true)
  }
  
  const confirmBulkDelete = async () => {
    try {
      await removeVideos(Array.from(selectedVideos))
      clearSelection()
    } finally {
      setBulkDeleteConfirm(false)
    }
  }
  
  const onDragEnd = (result: DropResult) => {
    handleDragEnd(result, filteredVideos, setVideos, canWrite)
  }
  
  return (
    <div className={`${cc.spacing.container.md} dark:bg-gray-900`}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <H1 className="dark:text-white mb-6">Video's Beheren</H1>
      
      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <button
          onClick={openForm}
          className={cc.button.base({ color: 'primary' })}
          disabled={isDragging || !canWrite}
        >
          Nieuwe Video Toevoegen
        </button>
        <SearchAndSort
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          onSearchChange={setSearchQuery}
          onSortChange={setSortOrder}
          isDragging={isDragging}
        />
      </div>
      
      {/* Bulk Actions */}
      {canDelete && (
        <BulkActions
          selectedCount={selectedVideos.size}
          onBulkDelete={handleBulkDelete}
          isDragging={isDragging}
        />
      )}
      
      {/* Error */}
      {error && <ErrorText className="dark:text-red-400 mb-4">{error}</ErrorText>}
      
      {/* Content */}
      {loading ? (
        <LoadingGrid count={6} variant="albums" />
      ) : (
        <VideoList
          videos={filteredVideos}
          selectedVideos={selectedVideos}
          isDragging={isDragging}
          onDragEnd={onDragEnd}
          onSelectVideo={handleSelectVideo}
          onToggleVisibility={toggleVisibility}
          onEdit={openEditForm}
          onDelete={handleDelete}
          canWrite={canWrite}
          canDelete={canDelete}
          emptyMessage={
            searchQuery
              ? "Geen video's gevonden die voldoen aan de zoekopdracht."
              : "Er zijn nog geen video's toegevoegd. Klik op 'Nieuwe Video Toevoegen' om te beginnen."
          }
        />
      )}
      
      {/* Form Modal */}
      {showForm && (
        <VideoForm
          formData={formData}
          isSubmitting={isSubmitting}
          isEditing={!!editingVideo}
          error={formError}
          onSubmit={handleSubmit}
          onChange={(updates) => setFormData({ ...formData, ...updates })}
          onClose={closeForm}
        />
      )}
      
      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, videoId: null, videoTitle: null })}
        onConfirm={confirmDelete}
        title="Video verwijderen"
        message={`Weet je zeker dat je de video "${deleteConfirm.videoTitle}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        variant="danger"
      />
      
      {/* Bulk Delete Confirmation */}
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