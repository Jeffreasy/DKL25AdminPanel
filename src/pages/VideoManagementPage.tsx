import React, { useState, useMemo } from 'react'
import type { DropResult } from '@hello-pangea/dnd'
import { Toaster } from 'react-hot-toast'
import { H1, SmallText } from '../components/typography/typography'
import { LoadingGrid, ConfirmDialog } from '../components/ui'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePermissions } from '../hooks/usePermissions'
import { useVideos, useVideoForm, useVideoSelection, useVideoDragDrop } from '../features/videos/hooks'
import { VideoForm } from '../features/videos/components'
import type { Video } from '../features/videos/types'
import { cc } from '../styles/shared'
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { getVideoEmbedUrl } from '../features/videos/utils/videoUrlUtils'

export function VideoManagementPage() {
  usePageTitle("Video's beheren")
  
  // Permissions
  const { hasPermission } = usePermissions()
  const canReadVideos = hasPermission('video', 'read')
  const canWriteVideos = hasPermission('video', 'write')
  const canDeleteVideos = hasPermission('video', 'delete')
  
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
    selectAllRef,
    handleSelectVideo,
    handleSelectAll,
    clearSelection
  } = useVideoSelection(filteredVideos)
  
  // Drag and drop
  const { handleDragEnd } = useVideoDragDrop()
  
  // Delete confirmation
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  
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
          order_number: 0
        })
      }
      closeForm()
    } catch {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    if (!videoToDelete) return
    
    try {
      await removeVideo(videoToDelete.id)
      setVideoToDelete(null)
    } catch {
      // Error handling is done in the hook
    }
  }
  
  const handleBulkDelete = async () => {
    try {
      await removeVideos(Array.from(selectedVideos))
      clearSelection()
      setShowBulkDeleteConfirm(false)
    } catch {
      // Error handling is done in the hook
    }
  }
  
  const onDragEnd = (result: DropResult) => {
    handleDragEnd(result, filteredVideos, setVideos, canWriteVideos)
  }
  
  // Access denied
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
  
  // Loading
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
            <SmallText>Beheer de video's voor de Koninklijke Loop</SmallText>
          </div>
          {canWriteVideos && (
            <button
              onClick={openForm}
              className={cc.button.base({ color: 'primary', className: `flex items-center ${cc.spacing.gap.sm}` })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Video Toevoegen</span>
              <span className="sm:hidden">Toevoegen</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className={cc.alert({ status: 'error' })}>
          <XCircleIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={() => {}} className={cc.button.iconDanger({ size: 'sm', className: "-mx-1.5 -my-1.5" })}>
            <span className="sr-only">Sluiten</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Bar */}
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
              {selectedVideos.size > 0 && canDeleteVideos && (
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
        
        {/* Table */}
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="videos">
              {(provided) => (
                <table ref={provided.innerRef} {...provided.droppableProps} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 hidden md:table-header-group">
                    <tr>
                      <th scope="col" className="w-12 px-4 py-3 text-left">
                        <input 
                          ref={selectAllRef}
                          type="checkbox" 
                          className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800"
                          onChange={() => handleSelectAll(filteredVideos)}
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
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 block md:table-row-group">
                    {filteredVideos.map((video, index) => (
                      <Draggable key={video.id} draggableId={video.id} index={index} isDragDisabled={window.innerWidth < 768}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`block md:table-row ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            {/* Mobile Card View */}
                            <td className="block md:hidden p-3 border-b border-gray-200 dark:border-gray-700">
                              <div className={`grid grid-cols-[auto_max-content_1fr] gap-3 items-start ${selectedVideos.has(video.id) ? 'bg-blue-50 dark:bg-blue-900/30 rounded-md p-1' : 'p-1'}`}>
                                <div className="pt-1">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800"
                                    checked={selectedVideos.has(video.id)}
                                    onChange={() => handleSelectVideo(video.id)}
                                    aria-label={`Selecteer video ${video.title}`}
                                  />
                                </div>
                                <div className="h-20 w-32 bg-gray-200 dark:bg-gray-900 rounded overflow-hidden">
                                  <iframe
                                    src={getVideoEmbedUrl(video.url)}
                                    className="w-full h-full object-cover"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    title={video.title}
                                    loading="lazy"
                                  />
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate break-all" title={video.title}>{video.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 break-words" title={video.description || ''}>{video.description || 'Geen beschrijving'}</p>
                                </div>
                              </div>
                              <div className="flex justify-start items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-1">
                                  {canWriteVideos && (
                                    <button 
                                      onClick={() => toggleVisibility(video)} 
                                      className={cc.button.icon({ color: 'secondary', size: 'sm', className: "rounded-full" })}
                                      title={video.visible ? "Zichtbaar" : "Verborgen"}
                                    >
                                      {video.visible ? 
                                        <EyeIcon className="h-4 w-4 text-green-500" /> : 
                                        <EyeSlashIcon className="h-4 w-4 text-red-500" />
                                      }
                                    </button>
                                  )}
                                  {canWriteVideos && (
                                    <button onClick={() => openEditForm(video)} className={cc.button.icon({ color: 'secondary', size: 'sm'})} title="Bewerken">
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                  {canDeleteVideos && (
                                    <button onClick={() => setVideoToDelete(video)} className={cc.button.iconDanger({ size: 'sm' })} title="Verwijderen">
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                            
                            {/* Desktop Table View */}
                            <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800"
                                checked={selectedVideos.has(video.id)}
                                onChange={() => handleSelectVideo(video.id)}
                                aria-label={`Selecteer video ${video.title}`}
                              />
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-16 w-28 bg-gray-200 dark:bg-gray-900 rounded mr-4 overflow-hidden">
                                  <iframe
                                    src={getVideoEmbedUrl(video.url)}
                                    className="w-full h-full object-cover"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    title={video.title}
                                    loading="lazy"
                                  />
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={video.title}>{video.title}</div>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4">
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md" title={video.description || ''}>{video.description || '-'}</div>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                              {canWriteVideos && (
                                <button 
                                  onClick={() => toggleVisibility(video)} 
                                  className={cc.button.icon({ color: 'secondary', className: "rounded-full p-1" })}
                                  title={video.visible ? "Zichtbaar" : "Verborgen"}
                                >
                                  {video.visible ? 
                                    <EyeIcon className="h-5 w-5 text-green-500" /> : 
                                    <EyeSlashIcon className="h-5 w-5 text-red-500" />
                                  }
                                </button>
                              )}
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                              {canWriteVideos && (
                                <button onClick={() => openEditForm(video)} className={cc.button.icon({ color: 'secondary'})} title="Bewerken">
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                              )}
                              {canDeleteVideos && (
                                <button onClick={() => setVideoToDelete(video)} className={cc.button.iconDanger()} title="Verwijderen">
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
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
          {filteredVideos.length === 0 && (
            <div className="block md:hidden px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              Geen video's gevonden{searchQuery && ' voor uw zoekopdracht'}.
            </div>
          )}
        </div>
      </div>
      
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
        open={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={handleDelete}
        title="Video verwijderen"
        message={`Weet je zeker dat je de video "${videoToDelete?.title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        variant="danger"
      />
      
      {/* Bulk Delete Confirmation */}
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