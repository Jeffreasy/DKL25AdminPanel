import { useState, useEffect } from 'react'
import type { ContactMessage, ContactStatus } from './../types'
import { updateMessageStatus } from './../services/messageService'
import { adminEmailService } from '../../email/adminEmailService'
import { supabase } from '../../../lib/supabase'
import { cc, cl } from '../../../styles/shared'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { EmailDialog } from '../../../components/email/EmailDialog'
import { CheckCircleIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

// Helper object for styling the select based on status
const statusClasses = {
  nieuw: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700 focus:ring-green-500',
  in_behandeling: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700 focus:ring-orange-500',
  afgehandeld: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 focus:ring-blue-500',
};
const baseSelectClasses = 'appearance-none px-2.5 py-0.5 rounded-md text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800';

interface MessageItemProps {
  message: ContactMessage
  onStatusUpdate: () => void
}

export function MessageItem({ message, onStatusUpdate }: MessageItemProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [senderEmail, setSenderEmail] = useState<string | null>(null)

  // Fetch logged-in user's email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSenderEmail(user?.email || null);
    };
    fetchUserEmail();
  }, []);

  const handleStatusUpdate = async (newStatus: ContactStatus) => {
    if (newStatus === message.status) return;
    
    const { error } = await updateMessageStatus(message.id, newStatus)
    if (!error) {
      onStatusUpdate()
    }
  }

  const handleSendEmail = async (data: { to: string; subject: string; body: string; sender: string }) => {
    try {
      // Pass the selected sender as the 'from' address
      await adminEmailService.sendMailAsAdmin({
        to: message.email,
        subject: data.subject,
        body: data.body,
        from: 'info@dekoninklijkeloop.nl'
      })
      // Optionally: update status only if sent successfully from a specific address?
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
            <select
              value={message.status}
              onChange={(e) => handleStatusUpdate(e.target.value as ContactStatus)}
              className={`${baseSelectClasses} ${statusClasses[message.status]}`}
            >
              <option value="nieuw">Nieuw</option>
              <option value="in_behandeling">In behandeling</option>
              <option value="afgehandeld">Afgehandeld</option>
            </select>
          </dd>
        </div>
        <div className="mt-4 flex flex-col sm:items-start gap-4">
          <button
            onClick={() => setIsEmailDialogOpen(true)}
            className={`${cc.button.base({ color: 'primary' })} w-full sm:w-auto`}
          >
            Beantwoorden
          </button>
        </div>
      </div>
      
      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        recipient={{
          email: message.email,
          name: message.naam
        }}
        initialSenderEmail={senderEmail || 'info@dekoninklijkeloop.nl'}
        onSend={(data: { to: string; subject: string; body: string; sender: string }) => handleSendEmail(data)}
      />
    </div>
  )
} 