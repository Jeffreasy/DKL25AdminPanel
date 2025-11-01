import React from 'react'
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { SmallText } from '../../../components/typography/typography'
import { cc } from '../../../styles/shared'
import type { Video } from '../types'
import { getVideoEmbedUrl, isValidVideoUrl } from '../utils/videoUrlUtils'

interface VideoCardProps {
  video: Video
  isSelected: boolean
  isDragging?: boolean
  onSelect: (videoId: string) => void
  onToggleVisibility: (video: Video) => void
  onEdit: (video: Video) => void
  onDelete: (video: Video) => void
  canWrite?: boolean
  canDelete?: boolean
}

export function VideoCard({
  video,
  isSelected,
  isDragging = false,
  onSelect,
  onToggleVisibility,
  onEdit,
  onDelete,
  canWrite = true,
  canDelete = true
}: VideoCardProps) {
  return (
    <div
      className={`
        border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm 
        flex flex-col md:flex-row items-start md:items-center gap-4
        transition-all duration-200
        ${isDragging ? 'shadow-lg bg-gray-50 dark:bg-gray-700 opacity-90' : ''}
        ${isSelected ? 'border-blue-500 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-800/50' : 'border-gray-200 dark:border-gray-700'}
        ${!isDragging ? 'cursor-grab hover:shadow-md' : 'cursor-grabbing'}
      `}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:checked:bg-blue-600"
        checked={isSelected}
        onChange={() => onSelect(video.id)}
        disabled={isDragging}
        aria-label={`Selecteer video ${video.title}`}
      />

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-32 h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
        {isValidVideoUrl(video.url) ? (
          <iframe
            src={getVideoEmbedUrl(video.url)}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
            Ongeldige URL
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold dark:text-white truncate" title={video.title}>
          {video.title}
        </h3>
        <SmallText className="text-gray-600 dark:text-gray-400 line-clamp-2">
          {video.description || 'Geen beschrijving'}
        </SmallText>
        <SmallText className="text-blue-500 dark:text-blue-400 truncate hover:underline">
          <a href={video.url} target="_blank" rel="noopener noreferrer">
            {video.url}
          </a>
        </SmallText>
        <SmallText className="text-gray-400 dark:text-gray-500">
          Volgorde: {video.order_number ?? 'N/A'}
        </SmallText>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-end md:items-center gap-2 flex-shrink-0">
        {canWrite && (
          <button
            onClick={() => onToggleVisibility(video)}
            className={`${cc.button.icon({ color: 'secondary', size: 'sm' })} ${
              video.visible
                ? 'text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
            }`}
            title={video.visible ? 'Zichtbaar (klik om te verbergen)' : 'Verborgen (klik om zichtbaar te maken)'}
            disabled={isDragging}
          >
            {video.visible ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
          </button>
        )}
        {canWrite && (
          <button
            onClick={() => onEdit(video)}
            className={`${cc.button.icon({ color: 'secondary', size: 'sm' })} text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400`}
            title="Bewerken"
            disabled={isDragging}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(video)}
            className={`${cc.button.iconDanger({ size: 'sm' })} text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400`}
            title="Verwijderen"
            disabled={isDragging}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}