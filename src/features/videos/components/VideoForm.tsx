import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SmallText } from '../../../components/typography/typography'
import { cc } from '../../../styles/shared'
import type { VideoFormData } from '../hooks/useVideoForm'
import { isValidVideoUrl } from '../utils/videoUrlUtils'

interface VideoFormProps {
  formData: VideoFormData
  isSubmitting: boolean
  isEditing: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onChange: (data: Partial<VideoFormData>) => void
  onClose: () => void
}

export function VideoForm({
  formData,
  isSubmitting,
  isEditing,
  error,
  onSubmit,
  onChange,
  onClose
}: VideoFormProps) {
  const isUrlInvalid = !!(formData.url && !isValidVideoUrl(formData.url))

  return (
    <div className={`fixed inset-0 ${cc.overlay.medium} flex items-center justify-center z-50 ${cc.spacing.container.sm}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${cc.spacing.container.md} w-full max-w-lg relative`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={isSubmitting}
          type="button"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          {isEditing ? 'Video Bewerken' : 'Nieuwe Video Toevoegen'}
        </h2>

        <form onSubmit={onSubmit} className={cc.spacing.section.sm}>
          {/* Title */}
          <div>
            <label htmlFor="title" className={cc.form.label()}>
              Titel*
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className={cc.form.input()}
              required
              disabled={isSubmitting}
              placeholder="Voer een titel in"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={cc.form.label()}>
              Beschrijving
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              className={cc.form.input()}
              rows={3}
              disabled={isSubmitting}
              placeholder="Voer een beschrijving in (optioneel)"
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className={cc.form.label()}>
              Video URL* (YouTube, Vimeo, Streamable)
            </label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => onChange({ url: e.target.value })}
              className={cc.form.input()}
              required
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isSubmitting}
            />
            {isUrlInvalid && (
              <SmallText className="text-red-500 dark:text-red-400 mt-1">
                Ongeldige of niet-ondersteunde URL.
              </SmallText>
            )}
          </div>

          {/* Visible */}
          <div className="flex items-center">
            <input
              id="visible"
              type="checkbox"
              checked={formData.visible}
              onChange={(e) => onChange({ visible: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:checked:bg-blue-600"
              disabled={isSubmitting}
            />
            <label htmlFor="visible" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Zichtbaar
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className={cc.alert({ status: 'error' })}>
              <SmallText className="dark:text-red-400">{error}</SmallText>
            </div>
          )}

          {/* Actions */}
          <div className={`flex justify-end ${cc.spacing.gap.sm}`}>
            <button
              type="button"
              onClick={onClose}
              className={cc.button.base({ color: 'secondary' })}
              disabled={isSubmitting}
            >
              Annuleren
            </button>
            <button
              type="submit"
              className={cc.button.base({ color: 'primary' })}
              disabled={isSubmitting || isUrlInvalid}
            >
              {isSubmitting ? 'Opslaan...' : isEditing ? 'Wijzigingen Opslaan' : 'Video Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}