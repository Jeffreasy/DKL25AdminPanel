import { useState } from 'react'
import type { ContactMessage } from './../types'
import { updateMessageStatus } from './../services/messageService'
import { adminEmailService } from '../../email/adminEmailService'
import { cc, cl } from '../../../styles/shared'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { EmailDialog } from '../../../components/email/EmailDialog'
import { CheckCircleIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

interface MessageItemProps {
  message: ContactMessage
  onStatusUpdate: () => void
}

export function MessageItem({ message, onStatusUpdate }: MessageItemProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)

  const handleStatusUpdate = async () => {
    if (message.status === 'afgehandeld') return
    const newStatus = message.status === 'nieuw' ? 'in_behandeling' : 'afgehandeld'
    const { error } = await updateMessageStatus(message.id, newStatus)
    if (!error) {
      onStatusUpdate()
    }
  }

  const handleSendEmail = async (data: { subject: string; body: string }) => {
    try {
      await adminEmailService.sendMailAsAdmin({
        to: message.email,
        subject: data.subject,
        body: data.body
      })
      await updateMessageStatus(message.id, 'afgehandeld')
      onStatusUpdate()
    } catch (error) {
      console.error('Failed to send email via admin endpoint:', error)
      throw error
    }
  }

  return (
    <div className={cc.listItem.container()}>
      <div className={cc.listItem.content()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {message.naam}
          </h3>
          <p className="ml-2 mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(message.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
          </p>
        </div>
        <div className="mt-2 text-gray-700 dark:text-gray-200">{message.email}</div>
        <div className="mt-2 text-gray-700 dark:text-gray-200">{message.bericht}</div>
        <div className="mt-2 text-gray-700 dark:text-gray-200">
          {message.behandeld_door && (
            <span>
              Afgehandeld door {message.behandeld_door} op {format(new Date(message.behandeld_op!), 'dd MMMM yyyy HH:mm', { locale: nl })}
            </span>
          )}
        </div>
        <div className="mt-2 text-gray-700 dark:text-gray-200">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
            <div className="flex items-center space-x-2">
              {message.status === 'nieuw' && (
                <span className={cc.badge({ color: 'green', className: 'inline-flex items-center gap-1' })}>
                  <EnvelopeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Nieuw
                </span>
              )}
              {message.status === 'in_behandeling' && (
                <span className={cc.badge({ color: 'orange', className: 'inline-flex items-center gap-1' })}>
                  <ArrowPathIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  In behandeling
                </span>
              )}
              {message.status === 'afgehandeld' && (
                <span className={cc.badge({ color: 'blue', className: 'inline-flex items-center gap-1' })}>
                  <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Afgehandeld
                </span>
              )}
            </div>
          </dd>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <button
            onClick={() => setIsEmailDialogOpen(true)}
            className={cc.button.base({ color: 'primary' })}
          >
            Beantwoorden
          </button>
          {message.status !== 'afgehandeld' && (
            <button
              onClick={handleStatusUpdate}
              className={cc.button.base({ color: 'secondary' })}
            >
              {message.status === 'nieuw' ? 'In behandeling nemen' : 'Markeren als afgehandeld'}
            </button>
          )}
        </div>
      </div>
      
      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        recipient={{
          email: message.email,
          name: message.naam
        }}
        onSend={handleSendEmail}
      />
    </div>
  )
} 