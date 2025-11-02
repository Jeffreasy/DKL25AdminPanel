import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../styles/shared'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string, alt?: string) => void
}

export function ImageUploadModal({ isOpen, onClose, onInsert }: ImageUploadModalProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      // Basic URL validation
      new URL(url)
      
      // Try to load image to validate it exists
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000)
      })
    } catch {
      return false
    }
  }

  const handleInsert = async () => {
    if (!imageUrl.trim()) {
      setError('Voer een afbeelding URL in')
      return
    }

    setError(null)
    setIsValidating(true)

    const isValid = await validateImageUrl(imageUrl)
    setIsValidating(false)

    if (!isValid) {
      setError('Ongeldige afbeelding URL of afbeelding kan niet worden geladen')
      return
    }

    onInsert(imageUrl, altText || undefined)
    handleClose()
  }

  const handleClose = () => {
    setImageUrl('')
    setAltText('')
    setError(null)
    setIsValidating(false)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={cc.overlay.light} />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 ${cc.spacing.container.md} shadow-xl transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <PhotoIcon className="h-5 w-5" />
                    Afbeelding invoegen
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className={cc.button.icon({ color: 'secondary' })}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className={cc.spacing.section.md}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-md">
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Afbeelding URL *
                      </label>
                      <input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value)
                          setError(null)
                        }}
                        className={cc.form.input()}
                        autoFocus
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Voer de volledige URL van de afbeelding in
                      </p>
                    </div>

                    <div>
                      <label htmlFor="altText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alt tekst (optioneel)
                      </label>
                      <input
                        id="altText"
                        type="text"
                        placeholder="Beschrijving van de afbeelding"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        className={cc.form.input()}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Helpt met toegankelijkheid en SEO
                      </p>
                    </div>

                    {imageUrl && !error && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preview:
                        </p>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                          <img
                            src={imageUrl}
                            alt={altText || 'Preview'}
                            className="max-w-full h-auto max-h-48 mx-auto rounded"
                            onError={() => setError('Kan afbeelding niet laden')}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`flex justify-end ${cc.spacing.gap.sm} mt-6`}>
                    <button
                      type="button"
                      onClick={handleClose}
                      className={cc.button.base({ color: 'secondary' })}
                    >
                      Annuleren
                    </button>
                    <button
                      type="button"
                      onClick={handleInsert}
                      disabled={!imageUrl.trim() || isValidating}
                      className={cc.button.base({ color: 'primary' })}
                    >
                      {isValidating ? 'Valideren...' : 'Invoegen'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}