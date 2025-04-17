import { useState } from 'react'
import type { ContactMessage } from '../features/contact/types'
import { updateMessageStatus } from '../features/contact/services/messageService'
import { adminEmailService } from '../features/email/adminEmailService'
import { componentClasses as cc } from '../styles/shared'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { EmailDialog } from './email/EmailDialog'

interface MessageItemProps {
  message: ContactMessage
  onStatusUpdate: () => void
}

export function MessageItem({ message, onStatusUpdate }: MessageItemProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)

  const getStatusBadgeClass = () => {
    switch (message.status) {
      case 'nieuw': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
      case 'in_behandeling': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200'
      case 'afgehandeld': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
    }
  }

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
    <div className={cc.listItem.container}>
      <div className={cc.listItem.content}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cc.listItem.title}>{message.naam}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass()}`}>
              {message.status}
            </span>
          </div>
          <p className={cc.listItem.subtitle}>{message.email}</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{message.bericht}</p>
          <p className={cc.listItem.metadata}>
            Ontvangen op {format(new Date(message.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
          </p>
          {message.behandeld_door && (
            <p className={cc.listItem.metadata}>
              Afgehandeld door {message.behandeld_door} op {format(new Date(message.behandeld_op!), 'dd MMMM yyyy HH:mm', { locale: nl })}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setIsEmailDialogOpen(true)}
            className={cc.button.primary}
          >
            Beantwoorden
          </button>
          {message.status !== 'afgehandeld' && (
            <button
              onClick={handleStatusUpdate}
              className={cc.button.secondary}
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