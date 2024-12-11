import { Video } from '../../../types/video'

interface VideoPreviewModalProps {
  video: Video
  onClose: () => void
}

export function VideoPreviewModal({ video, onClose }: VideoPreviewModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {video.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {video.description}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Sluiten"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <div className="relative pt-[56.25%]">
            <iframe
              src={video.url}
              className="absolute inset-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
} 