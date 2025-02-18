import { useState, useEffect, useCallback } from 'react'
import { adminEmailService } from '../adminEmailService'
import type { Email } from '../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { usePageTitle } from '../../../hooks/usePageTitle'

export function EmailInbox() {
  usePageTitle('Email Inbox')
  
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [account, setAccount] = useState<'info' | 'inschrijving'>('info')
  const [unreadCount, setUnreadCount] = useState(0)

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminEmailService.getEmailsByAccount(account)
      setEmails(data)
    } catch (err) {
      setError('Kon emails niet laden')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [account])

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await adminEmailService.getUnreadCount(account)
      setUnreadCount(count)
    } catch (err) {
      console.error('Error loading unread count:', err)
    }
  }, [account])

  useEffect(() => {
    loadEmails()
    loadUnreadCount()
  }, [loadEmails, loadUnreadCount])

  const handleMarkAsRead = useCallback(async (email: Email) => {
    try {
      await adminEmailService.markAsRead(email.id, true)
      setEmails(prevEmails => 
        prevEmails.map(e => e.id === email.id ? { ...e, read: true } : e)
      )
      await loadUnreadCount()
    } catch (err) {
      console.error('Error marking email as read:', err)
    }
  }, [loadUnreadCount])

  if (loading) return <div>Laden...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${account === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setAccount('info')}
          >
            Info ({unreadCount})
          </button>
          <button
            className={`px-4 py-2 rounded ${account === 'inschrijving' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setAccount('inschrijving')}
          >
            Inschrijvingen
          </button>
        </div>
        <button
          onClick={() => loadEmails()}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Vernieuwen
        </button>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Email lijst */}
        <div className="w-1/3 border-r overflow-y-auto">
          {emails.map(email => (
            <div
              key={email.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                !email.read ? 'font-semibold bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedEmail(email)
                if (!email.read) handleMarkAsRead(email)
              }}
            >
              <div className="flex justify-between">
                <span className="text-sm">{email.sender}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(email.created_at), 'dd MMM HH:mm', { locale: nl })}
                </span>
              </div>
              <div className="text-sm truncate">{email.subject}</div>
            </div>
          ))}
        </div>

        {/* Email inhoud */}
        <div className="w-2/3 p-4 overflow-y-auto">
          {selectedEmail ? (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
                <div className="text-sm text-gray-600 mb-1">
                  Van: {selectedEmail.sender}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Ontvangen: {format(new Date(selectedEmail.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
                </div>
              </div>
              
              {/* Email body */}
              {selectedEmail.html ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }} 
                />
              ) : (
                <pre className="whitespace-pre-wrap">{selectedEmail.body}</pre>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              Selecteer een email om te lezen
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 