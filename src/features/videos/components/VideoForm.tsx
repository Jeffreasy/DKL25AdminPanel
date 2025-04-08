import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { addVideo, updateVideo } from '../services/videoService'
import type { Video } from '../types'

interface VideoFormProps {
  video?: Video
  onComplete: () => void
  onCancel: () => void
}

export function VideoForm({ video, onComplete, onCancel }: VideoFormProps) {
  const [title, setTitle] = useState(video?.title || '')
  const [description, setDescription] = useState(video?.description || '')
  const [videoId, setVideoId] = useState(video?.video_id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validatie
      if (!title || !videoId) {
        throw new Error('Vul alle verplichte velden in')
      }

      // Streamable URL opbouwen
      const url = `https://streamable.com/e/${videoId}?loop=0&autoplay=0&muted=0&controls=1&title=0`

      if (video?.id) {
        // Update bestaande video
        const { error: updateError } = await updateVideo(video.id, {
          title,
          description,
          video_id: videoId,
          url
        })
        if (updateError) throw updateError
      } else {
        // Nieuwe video toevoegen
        const { error: addError } = await addVideo({
          title,
          description,
          video_id: videoId,
          url,
          visible: true,
          order_number: 999, // Tijdelijk hoog nummer, wordt later aangepast
          thumbnail_url: null
        })
        if (addError) throw addError
      }

      onComplete()
    } catch (err) {
      console.error('Form error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full animate-in fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Form header */}
          <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {video ? 'Video Bewerken' : 'Nieuwe Video'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title Input */}
            <div>
              <label 
                htmlFor="title" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Titel *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
                disabled={loading}
              />
            </div>

            {/* Description Input */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Beschrijving
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                disabled={loading}
              />
            </div>

            {/* Video ID Input */}
            <div>
              <label 
                htmlFor="videoId" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Streamable Video ID *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400 sm:text-sm">
                  streamable.com/
                </span>
                <input
                  type="text"
                  id="videoId"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bijvoorbeeld: voor https://streamable.com/tt6k80, vul in: tt6k80
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              disabled={loading}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Bezig met opslaan...
                </>
              ) : video ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 