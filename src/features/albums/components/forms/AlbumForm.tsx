import { useState } from 'react'
import { supabase } from '../../../../api/client/supabase'
import type { AlbumWithDetails } from '../../types'
import { useAuth } from '../../../auth/hooks/useAuth'
import { useForm } from '../../../../hooks/useForm'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../../styles/shared'
import { Modal, ModalActions } from '../../../../components/ui'

interface AlbumFormProps {
  album?: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

interface AlbumFormData {
  title: string
  description: string
  visible: boolean
  order_number: number
}

export function AlbumForm({ album, onComplete, onCancel }: AlbumFormProps) {
  const { user } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<AlbumFormData>({
    initialValues: {
      title: album?.title || '',
      description: album?.description || '',
      visible: album?.visible ?? true,
      order_number: album?.order_number || 0
    },
    validate: (values) => {
      const errors: Partial<Record<keyof AlbumFormData, string>> = {}
      if (!values.title.trim()) {
        errors.title = 'Titel is verplicht'
      }
      return errors
    },
    onSubmit: async (values) => {
      if (!user) {
        throw new Error('Authenticatie vereist')
      }

      setSubmitError(null)

      try {
        const upsertData = {
          title: values.title,
          description: values.description || null,
          visible: values.visible,
          order_number: Number(values.order_number) || 1,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }

        if (album?.id) {
          const { error: updateError } = await supabase
            .from('albums')
            .update(upsertData)
            .eq('id', album.id)

          if (updateError) throw updateError
        } else {
          const { error: insertError } = await supabase
            .from('albums')
            .insert([{ ...upsertData, user_id: user.id }])

          if (insertError) throw insertError
        }

        onComplete()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Opslaan mislukt'
        setSubmitError(errorMessage)
        throw err
      }
    }
  })

  if (!user) {
    return <div>Authenticatie vereist.</div>
  }

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={album ? 'Album bewerken' : 'Nieuw album aanmaken'}
      size="md"
      footer={
        <ModalActions
          onCancel={onCancel}
          onConfirm={form.handleSubmit}
          cancelText="Annuleren"
          confirmText={album ? 'Opslaan' : 'Toevoegen'}
          isLoading={form.isSubmitting}
        />
      }
    >
      <form onSubmit={form.handleSubmit} className={`${cc.spacing.container.md} ${cc.spacing.section.md}`}>
        <div>
          <label htmlFor="title" className={cc.form.label()}>
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className={cc.form.input({ className: 'mt-1' })}
            value={form.values.title}
            onChange={(e) => form.handleChange('title')(e.target.value)}
            onBlur={form.handleBlur('title')}
            required
          />
          {form.touched.title && form.errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={cc.form.label()}>
            Beschrijving
          </label>
          <textarea
            id="description"
            rows={3}
            className={cc.form.input({ className: 'mt-1' })}
            value={form.values.description}
            onChange={(e) => form.handleChange('description')(e.target.value)}
            onBlur={form.handleBlur('description')}
            placeholder="Optionele beschrijving van het album..."
          />
        </div>

        <div>
          <label htmlFor="order_number" className={cc.form.label()}>
            Volgorde
          </label>
          <input
            type="number"
            id="order_number"
            className={cc.form.input({ className: 'mt-1' })}
            value={form.values.order_number}
            onChange={(e) => form.handleChange('order_number')(parseInt(e.target.value) || 0)}
            onBlur={form.handleBlur('order_number')}
            min="1"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="visible"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700"
            checked={form.values.visible}
            onChange={(e) => form.handleChange('visible')(e.target.checked)}
          />
          <label htmlFor="visible" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Zichtbaar op website
          </label>
        </div>

        {submitError && (
          <div className="rounded-md bg-red-100 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800/50">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">{submitError}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}