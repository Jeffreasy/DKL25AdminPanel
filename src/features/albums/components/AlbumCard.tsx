import { useState } from 'react'
import { AlbumForm } from './AlbumForm'
import { PhotoSelector } from './PhotoSelector'
import type { AlbumWithDetails } from '../types'
import { FolderIcon } from '@heroicons/react/24/outline'

interface AlbumCardProps {
  album: AlbumWithDetails
  view: 'grid' | 'list'
  onUpdate: () => void
}

export function AlbumCard({ album, view, onUpdate }: AlbumCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)

  if (view === 'grid') {
    return (
      <>
        <div className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer" onClick={() => setShowPhotos(true)}>
          {album.cover_photo ? (
            <img
              src={album.cover_photo.url}
              alt={album.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FolderIcon className="w-12 h-12" />
            </div>
          )}
          
          {/* Overlay met info */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex flex-col justify-end p-4 transition-all duration-200">
            <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <h3 className="text-white font-medium mb-1">{album.title}</h3>
              {album.description && (
                <p className="text-gray-200 text-sm line-clamp-2 mb-2">
                  {album.description}
                </p>
              )}
              <p className="text-gray-300 text-sm">
                {album.photos_count} foto's
              </p>
            </div>
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
            album={album}
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

  // List view
  return (
    <>
      <div className="p-4 hover:bg-gray-50 flex items-center gap-4 cursor-pointer" onClick={() => setShowPhotos(true)}>
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          {album.cover_photo ? (
            <img
              src={album.cover_photo.url}
              alt={album.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FolderIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{album.title}</h3>
          {album.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {album.description}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {album.photos_count} foto's
          </p>
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
          album={album}
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