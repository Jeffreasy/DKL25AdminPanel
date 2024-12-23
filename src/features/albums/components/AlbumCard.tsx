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
      const { error } = await supabase
        .from('albums')
        .update({ visible: !album.visible })
        .eq('id', album.id)

      if (error) throw error
      onUpdate()
    } catch (err) {
      console.error('Error toggling visibility:', err)
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

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow
          ${isSelected ? 'ring-2 ring-indigo-500' : ''}
          ${isDeleting ? 'opacity-50' : ''}
        `}
      >
        {/* Cover Image */}
        <div 
          className="aspect-[4/3] bg-gray-100 relative group cursor-pointer"
          onClick={onSelect}
        >
          {album.cover_photo ? (
            <img
              src={album.cover_photo.thumbnail_url || album.cover_photo.url}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <PhotoIcon className="w-12 h-12" />
            </div>
          )}

          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1 bg-black/20 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>

          {/* Photo Count */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-sm">
            {album.photos_count[0]?.count || 0} foto's
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate">{album.title}</h3>
          {album.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{album.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={handleVisibilityToggle}
            className="p-1.5 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={album.visible ? 'Verbergen' : 'Zichtbaar maken'}
          >
            {album.visible ? (
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
      </div>

      {/* Modals */}
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
    </>
  )
} 