import { useState } from 'react'
import { AlbumForm } from './AlbumForm'
import { PhotoSelector } from './PhotoSelector'
import type { AlbumWithDetails } from '../types'
import { FolderIcon } from '@heroicons/react/24/outline'

// TODO: Vervang dit door je nieuwe API service
const deleteAlbumFromAPI = async (_albumId: string) => {
  // Implementeer je nieuwe API call hier
}

interface AlbumCardProps {
  album: AlbumWithDetails
  view: 'grid' | 'list'
  onUpdate: () => void
  isSelected?: boolean
  onSelect?: () => void
}

export function AlbumCard({ album, view, onUpdate, isSelected, onSelect }: AlbumCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirm(`Weet je zeker dat je het album "${album.title}" wilt verwijderen?`)) {
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError(null)

      await deleteAlbumFromAPI(album.id)
      onUpdate() // Ververs de album lijst
    } catch (err) {
      console.error('Error deleting album:', err)
      setDeleteError('Er ging iets mis bij het verwijderen van het album')
    } finally {
      setIsDeleting(false)
    }
  }

  // Voeg een selectie indicator toe aan de card
  const selectionClasses = isSelected 
    ? 'ring-2 ring-indigo-500' 
    : 'hover:ring-1 hover:ring-gray-300'

  if (view === 'grid') {
    return (
      <>
        <div 
          className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${selectionClasses}`}
          onClick={onSelect}
        >
          {album.cover_photo ? (
            <div 
              onClick={() => setShowPhotos(true)}
              className="w-full h-full cursor-pointer"
            >
              <img
                src={album.cover_photo.url}
                alt={album.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div 
              onClick={() => setShowPhotos(true)}
              className="w-full h-full flex items-center justify-center text-gray-400 cursor-pointer"
            >
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
              <div className="flex justify-between items-center">
                <p className="text-gray-300 text-sm">
                  {album.photos_count} foto's
                </p>
                <div className="flex items-center gap-2">
                  {album.visible ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Zichtbaar
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Verborgen
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPhotos(true)
                    }}
                    className="text-white hover:text-indigo-200 transition-colors"
                    title="Foto's beheren"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEdit(true)
                    }}
                    className="text-white hover:text-indigo-200 transition-colors"
                    title="Album bewerken"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="text-white hover:text-red-200 transition-colors"
                    title="Album verwijderen"
                    disabled={isDeleting}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
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

        {/* Toon error message als er iets mis gaat */}
        {deleteError && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 text-sm p-2 rounded">
            {deleteError}
          </div>
        )}
      </>
    )
  }

  // List view
  return (
    <>
      <div 
        className={`group bg-white hover:bg-gray-50 flex items-center gap-4 p-4 transition-colors ${selectionClasses}`}
        onClick={onSelect}
      >
        {/* Thumbnail sectie */}
        <div 
          className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer" 
          onClick={() => setShowPhotos(true)}
        >
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
          
          {/* Hover overlay voor thumbnail */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200" />
        </div>
        
        {/* Content sectie */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-gray-900 truncate">{album.title}</h3>
              {album.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                  {album.description}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {album.photos_count} foto's
              </p>
            </div>
            
            {/* Actieknoppen */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowPhotos(true)}
                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Foto's beheren"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Album bewerken"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
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

      {/* Toon error message als er iets mis gaat */}
      {deleteError && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 text-sm p-2 rounded">
          {deleteError}
        </div>
      )}
    </>
  )
} 