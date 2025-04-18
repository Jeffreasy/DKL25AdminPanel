import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Photo } from '../../photos/types'

interface SortablePhotoProps {
  photo: Photo
}

export function SortablePhoto({ photo }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(photo.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="relative aspect-square rounded-md overflow-hidden touch-none border border-transparent hover:border-gray-300 dark:hover:border-gray-600 cursor-grab active:cursor-grabbing"
    >
      <img 
        src={photo.thumbnail_url || photo.url}
        alt={photo.alt_text || photo.title}
        className="absolute inset-0 w-full h-full object-cover bg-gray-100 dark:bg-gray-700 pointer-events-none"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
        <div className="absolute top-2 left-2 p-1 bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      </div>
    </div>
  )
} 