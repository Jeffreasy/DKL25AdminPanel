import { useState, useCallback, memo } from 'react'
import { cl } from '../../../styles/shared'
import type { Photo } from '../types'
import { 
  updatePhotoVisibility, 
  deletePhoto 
} from '../../../features/services/photoService'

type ViewMode = 'grid' | 'list'

interface PhotoCardProps {
  photo: Photo
  selected: boolean
  onSelect: (selected: boolean) => void
  onDelete: () => void
  view?: ViewMode
}

export const PhotoCard = memo(function PhotoCard({ 
  photo, 
  selected,
  onSelect, 
  onDelete,
  view = 'grid' 
}: PhotoCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleVisibilityToggle = useCallback(async () => {
    try {
      setIsUpdating(true)
      await updatePhotoVisibility(photo.id, !photo.visible)
      onSelect(true)
    } catch (err) {
      console.error('Error toggling visibility:', err)
    } finally {
      setIsUpdating(false)
    }
  }, [photo.id, photo.visible, onSelect])

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) {
      return
    }

    try {
      setIsUpdating(true)
      await deletePhoto(photo.id)
      onDelete()
    } catch (err) {
      console.error('Error deleting photo:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (view === 'grid') {
    return (
      <div 
        className={cl(
          'group relative aspect-square rounded-md overflow-hidden cursor-pointer',
          'hover:ring-2 hover:ring-indigo-500 transition-all',
          'hover:z-10',
          selected && 'ring-2 ring-indigo-500'
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={() => onSelect(!selected)}
      >
        <img
          src={photo.thumbnail_url || photo.url}
          alt={photo.alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 text-xs">
            <h3 className="text-white font-medium truncate">{photo.title}</h3>
          </div>
        </div>

        <div className={cl(
          'absolute top-1 right-1 flex gap-1 transition-opacity scale-90',
          showActions ? 'opacity-100' : 'opacity-0'
        )}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleVisibilityToggle()
            }}
            disabled={isUpdating}
            className="p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors"
          >
            <svg className={cl(
              "w-4 h-4",
              photo.visible ? "text-green-600" : "text-gray-400"
            )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {photo.visible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            disabled={isUpdating}
            className="p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
        <img
          src={photo.thumbnail_url || photo.url}
          alt={photo.alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
        {photo.description && (
          <p className="text-sm text-gray-500 truncate mt-1">{photo.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Toegevoegd op {new Date(photo.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleVisibilityToggle}
          disabled={isUpdating}
          className={cl(
            'p-1.5 rounded-full transition-colors',
            photo.visible
              ? 'text-green-600 hover:bg-green-50'
              : 'text-gray-400 hover:bg-gray-50'
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {photo.visible ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={isUpdating}
          className="p-1.5 rounded-full text-red-600 hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}) 