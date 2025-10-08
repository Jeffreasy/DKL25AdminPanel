import { useState, useEffect } from 'react'
import type { ContactMessage, ContactStatus } from './../types'
import { updateMessageStatus } from './../services/messageService'
import { adminEmailService } from '../../email/adminEmailService'
import { supabase } from '../../../lib/supabase'
import { cc } from '../../../styles/shared'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { EmailDialog } from '../../../components/email/EmailDialog'

interface MessageItemProps {
  message: ContactMessage
  onStatusUpdate: () => void
}

export function MessageItem({ message, onStatusUpdate }: MessageItemProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [senderEmail, setSenderEmail] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

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
      await adminEmailService.sendMailAsAdmin({
        to: message.email,
        subject: data.subject,
        body: data.body,
        from: 'info@dekoninklijkeloop.nl'
      })
      await updateMessageStatus(message.id, 'afgehandeld')
      onStatusUpdate()
    } catch (error) {
      console.error('Failed to send email via admin endpoint:', error)
      throw error
    }
  }

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case 'nieuw':
        return 'green'
      case 'in_behandeling':
        return 'orange'
      case 'afgehandeld':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = (status: ContactStatus) => {
    switch (status) {
      case 'nieuw':
        return 'Nieuw'
      case 'in_behandeling':
        return 'In behandeling'
      case 'afgehandeld':
        return 'Afgehandeld'
      default:
        return status
    }
  }

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${cc.hover.card}`}>
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">{message.naam}</h3>
                <span className={cc.badge({ color: getStatusColor(message.status) })}>
                  {getStatusLabel(message.status)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-indigo-100 dark:text-indigo-200">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {message.email}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(new Date(message.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`bg-white/20 hover:bg-white/30 rounded-lg p-2 ${cc.transition.colors}`}
            >
              <svg 
                className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Subject (if exists) */}
          {message.onderwerp && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Onderwerp</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{message.onderwerp}</p>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bericht</p>
            <p className={`text-sm text-gray-700 dark:text-gray-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {message.bericht}
            </p>
            {!isExpanded && message.bericht.length > 150 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-1"
              >
                Lees meer...
              </button>
            )}
          </div>

          {/* Handled Info */}
          {message.behandeld_door && message.behandeld_op && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Afgehandeld door {message.behandeld_door}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                    {format(new Date(message.behandeld_op), 'dd MMMM yyyy HH:mm', { locale: nl })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Status wijzigen
                </label>
                <select
                  value={message.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as ContactStatus)}
                  className={cc.form.select({ className: 'text-sm' })}
                >
                  <option value="nieuw">Nieuw</option>
                  <option value="in_behandeling">In behandeling</option>
                  <option value="afgehandeld">Afgehandeld</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEmailDialogOpen(true)}
                  className={cc.button.base({ color: 'primary', className: 'flex-1 gap-2' })}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Beantwoorden
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Footer (when collapsed) */}
        {!isExpanded && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cc.badge({ color: getStatusColor(message.status) })}>
                {getStatusLabel(message.status)}
              </span>
            </div>
            <button
              onClick={() => setIsEmailDialogOpen(true)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 ${cc.transition.colors}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Beantwoorden
            </button>
          </div>
        )}
      </div>
      
      {/* Email Dialog */}
      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        recipient={{
          email: message.email,
          name: message.naam
        }}
        initialSenderEmail={senderEmail || 'info@dekoninklijkeloop.nl'}
        onSend={handleSendEmail}
      />
    </>
  )
}