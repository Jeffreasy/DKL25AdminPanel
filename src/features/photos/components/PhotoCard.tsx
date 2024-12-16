import { useState, useCallback, memo } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { H3, SmallText } from '../../../components/typography'
import { PhotoForm } from './PhotoForm'
import type { PhotoWithDetails } from '../types'

interface PhotoCardProps {
  photo: PhotoWithDetails
  view: 'grid' | 'list'
  onUpdate: () => void
}

export const PhotoCard = memo(function PhotoCard({ photo, view, onUpdate }: PhotoCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const handleVisibilityToggle = useCallback(async () => {
    try {
      setIsUpdating(true)
      await supabase
        .from('photos')
        .update({ visible: !photo.visible })
        .eq('id', photo.id)
      onUpdate()
    } catch (err) {
      console.error('Error toggling visibility:', err)
    } finally {
      setIsUpdating(false)
    }
  }, [photo.id, photo.visible, onUpdate])

  if (view === 'grid') {
    return (
      <>
        <div className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={photo.url}
            alt={photo.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay met info */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex flex-col justify-end p-4 transition-all duration-200">
            <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <H3 className="text-white mb-1 line-clamp-2">{photo.title}</H3>
              {photo.description && (
                <p className="text-gray-200 text-sm line-clamp-2 mb-2">
                  {photo.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <SmallText className="text-gray-300">
                  {photo.year}
                </SmallText>
                <div className="flex gap-1">
                  <button
                    onClick={handleVisibilityToggle}
                    disabled={isUpdating}
                    className={`p-2 rounded-full ${
                      photo.visible
                        ? 'text-green-400 hover:bg-green-400/20'
                        : 'text-gray-400 hover:bg-gray-400/20'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {photo.visible ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowEdit(true)}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-400/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showEdit && (
          <PhotoForm
            photo={photo}
            onComplete={() => {
              setShowEdit(false)
              onUpdate()
            }}
            onCancel={() => setShowEdit(false)}
          />
        )}
      </>
    )
  }

  // List view
  return (
    <>
      <div className="p-4 hover:bg-gray-50 flex items-center gap-4">
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={photo.url}
            alt={photo.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <H3 className="mb-1 truncate">{photo.title}</H3>
          {photo.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
              {photo.description}
            </p>
          )}
          <SmallText>
            {photo.year}
          </SmallText>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVisibilityToggle}
            disabled={isUpdating}
            className={`p-2 rounded-full transition-colors ${
              photo.visible
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {photo.visible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {showEdit && (
        <PhotoForm
          photo={photo}
          onComplete={() => {
            setShowEdit(false)
            onUpdate()
          }}
          onCancel={() => setShowEdit(false)}
        />
      )}
    </>
  )
}) 