import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { Newsletter, CreateNewsletterData } from '../types'
import { createNewsletter, updateNewsletter } from '../services/newsletterService'
import { cc } from '../../../styles/shared'
import { toast } from 'react-hot-toast'

interface NewsletterFormProps {
  newsletter?: Newsletter
  onComplete: () => void
  onCancel: () => void
}

interface FormData {
  subject: string
  content: string
}

export function NewsletterForm({ newsletter, onComplete, onCancel }: NewsletterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    subject: newsletter?.subject || '',
    content: newsletter?.content || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setError(null)

      const newsletterData: CreateNewsletterData = {
        subject: formData.subject.trim(),
        content: formData.content.trim()
      }

      if (!newsletterData.subject || !newsletterData.content) {
        setError('Alle velden zijn verplicht')
        return
      }

      if (newsletter) {
        await updateNewsletter(newsletter.id, newsletterData)
        toast.success('Nieuwsbrief succesvol bijgewerkt.')
      } else {
        await createNewsletter(newsletterData)
        toast.success('Nieuwsbrief succesvol aangemaakt.')
      }

      onComplete()
    } catch (err) {
      console.error('Error saving newsletter:', err)
      setError('Er ging iets mis bij het opslaan')
      toast.error('Fout bij het opslaan van de nieuwsbrief.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`fixed inset-0 ${cc.overlay.medium} overflow-y-auto h-full w-full z-40 flex items-center justify-center ${cc.spacing.container.sm}`}>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {newsletter ? 'Nieuwsbrief Bewerken' : 'Nieuwsbrief Aanmaken'}
          </h2>
          <button
            onClick={onCancel}
            className={cc.button.icon({ color: 'secondary' })}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={`flex-grow overflow-y-auto ${cc.spacing.container.md} ${cc.spacing.section.sm}`}>
          <div>
            <label htmlFor="subject" className={cc.form.label()}>
              Onderwerp *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={handleInputChange}
              name="subject"
              className={cc.form.input({ className: 'mt-1' })}
              required
              placeholder="Voer het onderwerp van de e-mail in"
            />
          </div>

          <div>
            <label htmlFor="content" className={cc.form.label()}>
              Inhoud *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={handleInputChange}
              name="content"
              className={cc.form.input({ className: 'mt-1' })}
              rows={15}
              required
              placeholder="Voer de inhoud van de nieuwsbrief in (HTML wordt ondersteund)"
            />
          </div>

          {error && (
            <div className={cc.alert({ status: 'error' })}>
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Fout</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end ${cc.spacing.gap.md} flex-shrink-0`}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cc.button.base({ color: 'secondary' })}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cc.button.base({ color: 'primary' })}
            >
              {isSubmitting ? 'Opslaan...' : (newsletter ? 'Wijzigingen Opslaan' : 'Nieuwsbrief Opslaan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}