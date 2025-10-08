import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlbumForm } from '../forms/AlbumForm'
import { PhotoSelector } from '../forms/PhotoSelector'
import type { AlbumWithDetails } from '../../types'
import { supabase } from '../../../../api/client/supabase'
import { FolderIcon } from '@heroicons/react/24/outline'
import { CoverPhotoSelector } from '../forms/CoverPhotoSelector'
import { cc } from '../../../../styles/shared'
import clsx from 'clsx'

interface AlbumCardProps {
  album: AlbumWithDetails
  onUpdate: () => void
  isSelected?: boolean
  onSelect?: (albumId: string) => void
}

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E`

export function AlbumCard({ album, onUpdate, isSelected, onSelect }: AlbumCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
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

  const getCoverPhotoUrl = () => {
    if (album.cover_photo) {
      return album.cover_photo.thumbnail_url || album.cover_photo.url
    }
    
    if (album.photos?.[0]?.photo) {
      const firstPhoto = album.photos[0].photo
      return firstPhoto.thumbnail_url || firstPhoto.url
    }
    
    return PLACEHOLDER_SVG
  }

  const handleAddPhotos = async (selectedPhotoIds: string[]) => {
    try {
      // Haal huidige order numbers op
      const { data: currentPhotos, error: orderError } = await supabase
        .from('album_photos')
        .select('order_number')
        .eq('album_id', album.id)
        .order('order_number', { ascending: false })
        .limit(1)

      if (orderError) throw orderError

      let nextOrderNumber = (currentPhotos?.[0]?.order_number || 0) + 1

      // Voeg nieuwe foto's toe
      const { error: insertError } = await supabase
        .from('album_photos')
        .insert(
          selectedPhotoIds.map(photoId => ({
            album_id: album.id,
            photo_id: photoId,
            order_number: nextOrderNumber++
          }))
        )

      if (insertError) throw insertError

      // Stel automatisch cover foto in als er nog geen is
      if (!album.cover_photo_id && selectedPhotoIds.length > 0) {
        const { error: coverError } = await supabase
          .from('albums')
          .update({ cover_photo_id: selectedPhotoIds[0] })
          .eq('id', album.id)

        if (coverError) console.error('Error setting cover photo:', coverError)
      }

      setShowPhotos(false)
      onUpdate()
    } catch (err) {
      console.error('Error adding photos:', err)
    }
  }

  const photoCount = album.photos_count?.[0]?.count || 0

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={clsx(
          "group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer",
          cc.transition.normal,
          "ease-in-out shadow-sm",
          cc.hover.card,
          isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900' : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600',
          'bg-gray-100 dark:bg-gray-800'
        )}
        onClick={() => onSelect?.(album.id)}
      >
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700">
          {getCoverPhotoUrl() !== PLACEHOLDER_SVG ? (
            <img
              src={getCoverPhotoUrl()}
              alt={album.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = PLACEHOLDER_SVG
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FolderIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <h3 className="text-white text-lg font-semibold truncate group-hover:underline">{album.title}</h3>
          <p className="text-sm text-gray-300 mt-0.5">
            {photoCount} foto{photoCount !== 1 ? 's' : ''}
          </p>
        </div>

        {!album.visible && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded-full shadow">
            Verborgen
          </div>
        )}

        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
          {photoCount} foto's
        </div>

        <div
          {...attributes}
          {...listeners}
          className={`absolute top-2 left-2 p-1.5 bg-black/20 rounded cursor-move ${cc.hover.fadeInFast}`}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
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
          existingPhotoIds={album.photos?.map(p => p.photo.id) || []}
          onComplete={handleAddPhotos}
          onCancel={() => setShowPhotos(false)}
        />
      )}

      {showCoverSelector && (
        <CoverPhotoSelector
          albumId={album.id}
          currentCoverPhotoId={album.cover_photo_id ?? null}
          onSelect={(photoId) => {
            if (photoId) {
              handleCoverPhotoSelect(photoId)
            } else {
              setShowCoverSelector(false)
            }
          }}
        />
      )}
    </>
  )
} 