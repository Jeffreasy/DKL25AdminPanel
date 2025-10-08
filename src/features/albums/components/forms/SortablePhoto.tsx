import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Photo } from '../../../photos/types'
import { TrashIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../../styles/shared'
import { ConfirmDialog } from '../../../../components/ui'

interface SortablePhotoProps {
  photo: Photo
  onRemove?: (photoId: string) => void
  isRemoving?: boolean
}

export function SortablePhoto({ photo, onRemove, isRemoving }: SortablePhotoProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  
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
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setShowConfirm(true)
            }}
            disabled={isRemoving}
            className={`absolute top-1 right-1 z-[1] ${cc.button.iconDanger({ size: 'sm', className: 'bg-black/60 text-white hover:bg-red-700/80 disabled:opacity-50' })}`}
            title="Verwijder uit album"
          >
          {isRemoving ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <TrashIcon className="w-4 h-4" />
          )}
          </button>
          
          <ConfirmDialog
            open={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => {
              onRemove(photo.id)
              setShowConfirm(false)
            }}
            title="Foto verwijderen"
            message="Weet je zeker dat je deze foto uit het album wilt verwijderen?"
            confirmText="Verwijderen"
            variant="danger"
          />
        </>
      )}

      {isRemoving && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[2]">
          <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  )
} 