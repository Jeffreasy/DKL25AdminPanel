import { Video } from '../types'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface VideoPreviewModalProps {
  video: Video
  onClose: () => void
}

export function VideoPreviewModal({ video, onClose }: VideoPreviewModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full animate-in fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-start border-b dark:border-gray-700">
          <div className="pr-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {video.title}
            </h3>
            {video.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {video.description}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Sluiten"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative pt-[56.25%] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              src={video.url}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg text-sm text-gray-500 dark:text-gray-400">
          Toegevoegd op {new Date(video.created_at).toLocaleDateString('nl-NL')}
        </div>
      </div>
    </div>
  )
} 