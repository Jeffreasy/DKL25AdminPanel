import { useState } from 'react'
import { Video } from '../../../types/video'
import { supabase } from '../../../lib/supabase/supabaseClient'

interface VideoFormProps {
  video?: Video
  onComplete: () => void
  onCancel: () => void
}

export function VideoForm({ video, onComplete, onCancel }: VideoFormProps) {
  const [title, setTitle] = useState(video?.title || '')
  const [description, setDescription] = useState(video?.description || '')
  const [videoId, setVideoId] = useState(video?.videoId || '')
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

      // Bepaal order_number voor nieuwe video's
      let order_number = video?.order_number
      if (!order_number) {
        const { data: videos } = await supabase
          .from('videos')
          .select('order_number')
          .order('order_number', { ascending: false })
          .limit(1)
        
        order_number = (videos?.[0]?.order_number || 0) + 1
      }

      // Update of insert video
      const { error: dbError } = await supabase
        .from('videos')
        .upsert({
          id: video?.id,
          title,
          description,
          videoId,
          url,
          visible: true,
          order_number,
          updated_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      onComplete()
    } catch (err) {
      console.error('Form error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {video ? 'Video Bewerken' : 'Nieuwe Video'}
            </h3>
          </div>

          <div className="p-4 space-y-4">
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
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bijvoorbeeld: voor https://streamable.com/tt6k80, vul in: tt6k80
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-3">
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Bezig...' : video ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 