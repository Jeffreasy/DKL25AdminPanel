import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlbumForm } from './AlbumForm'
import { PhotoSelector } from './PhotoSelector'
import type { AlbumWithDetails } from '../types'
import { supabase } from '../../../lib/supabase'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { cl } from '../../../styles/shared'
import { CoverPhotoSelector } from './CoverPhotoSelector'

interface AlbumCardProps {
  album: AlbumWithDetails
  onUpdate: () => void
  isSelected?: boolean
  onSelect?: () => void
}

export function AlbumCard({ album, onUpdate, isSelected, onSelect }: AlbumCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCoverSelector, setShowCoverSelector] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: album.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleVisibilityToggle = async () => {
    try {
      setIsUpdating(true)
      const { error } = await supabase
        .from('albums')
        .update({ visible: !album.visible })
        .eq('id', album.id)

      if (error) throw error
      onUpdate()
    } catch (err) {
      console.error('Error toggling visibility:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Weet je zeker dat je het album "${album.title}" wilt verwijderen?`)) {
      return
    }

    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', album.id)

      if (error) throw error
      onUpdate()
    } catch (err) {
      console.error('Error deleting album:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCoverPhotoSelect = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('albums')
        .update({ cover_photo_id: photoId })
        .eq('id', album.id)

      if (error) throw error
      
      setShowCoverSelector(false)
      onUpdate()
    } catch (err) {
      console.error('Error updating cover photo:', err)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cl(
          "bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow",
          isSelected && "ring-2 ring-indigo-500",
          isDeleting && "opacity-50"
        )}
      >
        <div 
          className="aspect-[4/3] bg-gray-100 relative group cursor-pointer"
          onClick={() => onSelect?.()}
        >
          {album.cover_photo ? (
            <img
              src={album.cover_photo.thumbnail_url || album.cover_photo.url}
              alt={album.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback naar placeholder als de afbeelding niet kan worden geladen
                e.currentTarget.onerror = null
                e.currentTarget.src = 'data:image/svg+xml,...' // Placeholder SVG
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <PhotoIcon className="w-12 h-12" />
            </div>
          )}

          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1.5 bg-black/20 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>

          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
            {album.photos_count[0]?.count || 0} foto's
          </div>

          {!album.visible && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 rounded-full text-white text-xs font-medium">
              Verborgen
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate">{album.title}</h3>
          {album.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{album.description}</p>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={handleVisibilityToggle}
            disabled={isUpdating}
            className={cl(
              "p-1.5 text-gray-500 rounded-lg transition-colors",
              isUpdating 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:text-gray-600 hover:bg-gray-100"
            )}
            title={album.visible ? 'Verbergen' : 'Zichtbaar maken'}
          >
            {isUpdating ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : album.visible ? (
              <EyeIcon className="w-5 h-5" />
            ) : (
              <EyeSlashIcon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setShowPhotos(true)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Foto's beheren"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Album bewerken"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Album verwijderen"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setShowCoverSelector(true)}
          className="absolute top-2 right-2 p-1.5 bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Cover foto kiezen"
        >
          <PhotoIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {showEdit && (
        <AlbumForm
          album={album}
          onComplete={() => {
            setShowEdit(false)
            onUpdate()
          }}
          onCancel={() => setShowEdit(false)}
        />
      )}

      {showPhotos && (
        <PhotoSelector
          albumId={album.id}
          onComplete={() => {
            setShowPhotos(false)
            onUpdate()
          }}
          onCancel={() => setShowPhotos(false)}
        />
      )}

      {showCoverSelector && (
        <CoverPhotoSelector
          album={album}
          onSelect={handleCoverPhotoSelect}
          onClose={() => setShowCoverSelector(false)}
        />
      )}
    </>
  )
} 