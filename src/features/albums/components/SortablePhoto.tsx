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
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="aspect-square bg-gray-100 rounded-lg overflow-hidden group relative"
      {...attributes}
      {...listeners}
    >
      <img
        src={photo.thumbnail_url || photo.url}
        alt={photo.alt}
        className="w-full h-full object-cover"
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