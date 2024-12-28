import type { ContactMessage } from '../features/contact/types'
import { updateMessageStatus } from '../features/contact/services/messageService'
import { componentClasses as cc } from '../styles/shared'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface MessageItemProps {
  message: ContactMessage
  onStatusUpdate: () => void
}

export function MessageItem({ message, onStatusUpdate }: MessageItemProps) {
  const handleStatusUpdate = async () => {
    if (message.status === 'afgehandeld') return
    
    const newStatus = message.status === 'nieuw' ? 'in_behandeling' : 'afgehandeld'
    const { error } = await updateMessageStatus(message.id, newStatus)
    if (!error) {
      onStatusUpdate()
    }
  }

  const getStatusBadgeClass = () => {
    switch (message.status) {
      case 'nieuw': return 'bg-green-100 text-green-800'
      case 'in_behandeling': return 'bg-orange-100 text-orange-800'
      case 'afgehandeld': return 'bg-blue-100 text-blue-800'
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
          <p className="mt-2 text-gray-700">{message.bericht}</p>
          <p className={cc.listItem.metadata}>
            Ontvangen op {format(new Date(message.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
          </p>
          {message.behandeld_door && (
            <p className={cc.listItem.metadata}>
              Afgehandeld door {message.behandeld_door} op {format(new Date(message.behandeld_op!), 'dd MMMM yyyy HH:mm', { locale: nl })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {message.email_verzonden && (
            <span className="text-sm text-gray-500">
              Email verzonden op {format(new Date(message.email_verzonden_op!), 'dd MMMM yyyy HH:mm', { locale: nl })}
            </span>
          )}
          {message.status !== 'afgehandeld' && (
            <button
              onClick={handleStatusUpdate}
              className={cc.button.primary}
            >
              {message.status === 'nieuw' ? 'In behandeling nemen' : 'Markeren als afgehandeld'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 