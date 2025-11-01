import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { EmptyState } from '../../../components/ui'
import { VideoCard } from './VideoCard'
import type { Video } from '../types'
import type { DropResult } from '@hello-pangea/dnd'

interface VideoListProps {
  videos: Video[]
  selectedVideos: Set<string>
  isDragging: boolean
  onDragEnd: (result: DropResult) => void
  onSelectVideo: (videoId: string) => void
  onToggleVisibility: (video: Video) => void
  onEdit: (video: Video) => void
  onDelete: (video: Video) => void
  canWrite?: boolean
  canDelete?: boolean
  emptyMessage?: string
}

export function VideoList({
  videos,
  selectedVideos,
  isDragging,
  onDragEnd,
  onSelectVideo,
  onToggleVisibility,
  onEdit,
  onDelete,
  canWrite = true,
  canDelete = true,
  emptyMessage = "Er zijn nog geen video's toegevoegd."
}: VideoListProps) {
  if (videos.length === 0) {
    return (
      <EmptyState
        title="Geen video's"
        description={emptyMessage}
      />
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="videos">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {videos.map((video, index) => (
              <Draggable
                key={video.id}
                draggableId={video.id}
                index={index}
                isDragDisabled={isDragging}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <VideoCard
                      video={video}
                      isSelected={selectedVideos.has(video.id)}
                      isDragging={snapshot.isDragging}
                      onSelect={onSelectVideo}
                      onToggleVisibility={onToggleVisibility}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      canWrite={canWrite}
                      canDelete={canDelete}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}