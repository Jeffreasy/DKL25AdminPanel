import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Photo } from '../../photos/types'
import { TrashIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../styles/shared'

interface SortablePhotoProps {
  photo: Photo
  onRemove?: (photoId: string) => void
}

export function SortablePhoto({ photo, onRemove }: SortablePhotoProps) {
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
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative aspect-square rounded-md overflow-hidden group bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm touch-none"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute inset-0 cursor-grab group-active:cursor-grabbing"
        title={photo.title}
      ></div>
      
      <img 
        src={photo.thumbnail_url || photo.url}
        alt={photo.alt_text || photo.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            if (window.confirm('Weet je zeker dat je deze foto uit het album wilt verwijderen?')) {
              onRemove(photo.id)
            }
          }}
          className={`absolute top-1 right-1 z-[1] ${cc.button.iconDanger({ size: 'sm', className: 'bg-black/60 text-white hover:bg-red-700/80' })}`}
          title="Verwijder uit album"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
} 