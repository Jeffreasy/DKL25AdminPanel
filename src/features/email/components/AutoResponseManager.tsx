import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { emailClient } from '../../../api/client/emailClient'
import type { AutoResponse } from '../types'
import { cc } from '../../../styles/shared'
import { ConfirmDialog, EmptyState, LoadingGrid, Modal } from '../../../components/ui'

interface AutoResponseFormData {
  name: string
  subject: string
  body: string
  trigger_event: 'registration' | 'contact' | 'newsletter'
  is_active: boolean
  template_variables: Record<string, string>
}

export function AutoResponseManager() {
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResponse, setEditingResponse] = useState<AutoResponse | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  })

  const [formData, setFormData] = useState<AutoResponseFormData>({
    name: '',
    subject: '',
    body: '',
    trigger_event: 'contact',
    is_active: true,
    template_variables: {}
  })

  useEffect(() => {
    loadAutoResponses()
  }, [])

  const loadAutoResponses = async () => {
    setLoading(true)
    try {
      const responses = await emailClient.getAutoResponses()
      setAutoResponses(responses)
    } catch (error) {
      // Only show error for non-404 errors (404 means feature not yet implemented)
      if (error instanceof Error && !error.message.includes('404')) {
        console.error('Failed to load autoresponses:', error)
        toast.error('Fout bij laden van autoresponse templates')
      } else {
        console.log('AutoResponse feature not yet available (404)')
        setAutoResponses([]) // Set empty array for 404
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (response?: AutoResponse) => {
    if (response) {
      setEditingResponse(response)
      setFormData({
        name: response.name,
        subject: response.subject,
        body: response.body,
        trigger_event: response.trigger_event,
        is_active: response.is_active,
        template_variables: response.template_variables || {}
      })
    } else {
      setEditingResponse(null)
      setFormData({
        name: '',
        subject: '',
        body: '',
        trigger_event: 'contact',
        is_active: true,
        template_variables: {}
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingResponse(null)
    setFormData({
      name: '',
      subject: '',
      body: '',
      trigger_event: 'contact',
      is_active: true,
      template_variables: {}
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingResponse) {
        await emailClient.updateAutoResponse(editingResponse.id, formData)
        toast.success('AutoResponse template bijgewerkt')
      } else {
        await emailClient.createAutoResponse(formData)
        toast.success('AutoResponse template aangemaakt')
      }
      
      handleCloseModal()
      loadAutoResponses()
    } catch (error) {
      console.error('Failed to save autoresponse:', error)
      toast.error('Fout bij opslaan van autoresponse template')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      await emailClient.deleteAutoResponse(deleteConfirm.id)
      toast.success('AutoResponse template verwijderd')
      loadAutoResponses()
    } catch (error) {
      console.error('Failed to delete autoresponse:', error)
      toast.error('Fout bij verwijderen van autoresponse template')
    } finally {
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  const handleToggleActive = async (response: AutoResponse) => {
    try {
      await emailClient.updateAutoResponse(response.id, {
        is_active: !response.is_active
      })
      toast.success(`Template ${!response.is_active ? 'geactiveerd' : 'gedeactiveerd'}`)
      loadAutoResponses()
    } catch (error) {
      console.error('Failed to toggle autoresponse:', error)
      toast.error('Fout bij wijzigen van status')
    }
  }

  const getTriggerEventLabel = (event: string) => {
    switch (event) {
      case 'registration': return 'Registratie'
      case 'contact': return 'Contact'
      case 'newsletter': return 'Nieuwsbrief'
      default: return event
    }
  }

  return (
    <div className={`${cc.spacing.container.md} bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AutoResponse Templates
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Beheer automatische email templates voor verschillende gebeurtenissen
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={cc.button.base({ color: 'primary' })}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nieuwe Template
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} variant="compact" />
      ) : autoResponses.length === 0 ? (
        <EmptyState
          title="Geen autoresponse templates"
          description="Maak een nieuwe template aan om te beginnen"
        />
      ) : (
        <div className="space-y-4">
          {autoResponses.map((response) => (
            <div
              key={response.id}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${
                response.is_active ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {response.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      response.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {response.is_active ? 'Actief' : 'Inactief'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {getTriggerEventLabel(response.trigger_event)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>Onderwerp:</strong> {response.subject}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {response.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </div>
                <div className={`flex ${cc.spacing.gap.sm} ml-4`}>
                  <button
                    onClick={() => handleToggleActive(response)}
                    className={cc.button.icon({ color: 'secondary' })}
                    title={response.is_active ? 'Deactiveren' : 'Activeren'}
                  >
                    {response.is_active ? (
                      <XCircleIcon className="h-5 w-5" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenModal(response)}
                    className={cc.button.icon({ color: 'secondary' })}
                    title="Bewerken"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: response.id })}
                    className={cc.button.iconDanger()}
                    title="Verwijderen"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingResponse ? 'AutoResponse Bewerken' : 'Nieuwe AutoResponse'}
      >
        <form onSubmit={handleSubmit} className={cc.spacing.section.md}>
          <div className={cc.spacing.section.sm}>
            <label htmlFor="name" className={cc.form.label()}>
              Template Naam *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cc.form.input()}
              placeholder="Bijv. Contact Bevestiging"
            />
          </div>

          <div className={cc.spacing.section.sm}>
            <label htmlFor="trigger_event" className={cc.form.label()}>
              Trigger Event *
            </label>
            <select
              id="trigger_event"
              required
              value={formData.trigger_event}
              onChange={(e) => setFormData({
                ...formData,
                trigger_event: e.target.value as 'registration' | 'contact' | 'newsletter'
              })}
              className={cc.form.input()}
            >
              <option value="contact">Contact</option>
              <option value="registration">Registratie</option>
              <option value="newsletter">Nieuwsbrief</option>
            </select>
          </div>

          <div className={cc.spacing.section.sm}>
            <label htmlFor="subject" className={cc.form.label()}>
              Email Onderwerp *
            </label>
            <input
              type="text"
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={cc.form.input()}
              placeholder="Bijv. Bedankt voor uw bericht"
            />
          </div>

          <div className={cc.spacing.section.sm}>
            <label htmlFor="body" className={cc.form.label()}>
              Email Inhoud * (HTML)
            </label>
            <textarea
              id="body"
              required
              rows={8}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className={cc.form.input()}
              placeholder="<p>Beste {naam},</p><p>Bedankt voor uw bericht...</p>"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Gebruik {'{'}variabele{'}'} voor template variabelen (bijv. {'{'}naam{'}'}, {'{'}email{'}'})
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Template actief
            </label>
          </div>

          <div className={`flex justify-end ${cc.spacing.gap.md} pt-4 border-t border-gray-200 dark:border-gray-700`}>
            <button
              type="button"
              onClick={handleCloseModal}
              className={cc.button.base({ color: 'secondary' })}
            >
              Annuleren
            </button>
            <button
              type="submit"
              className={cc.button.base({ color: 'primary' })}
            >
              {editingResponse ? 'Bijwerken' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="AutoResponse Verwijderen"
        message="Weet je zeker dat je deze autoresponse template wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        confirmText="Verwijderen"
        variant="danger"
      />
    </div>
  )
}

export default AutoResponseManager