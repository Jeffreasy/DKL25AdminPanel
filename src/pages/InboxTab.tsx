import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { emailService } from '../features/email/emailService'
import type { Email } from '../features/email/types'
import { LoadingSkeleton } from '../components/LoadingSkeleton'

export function InboxTab() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeAccount, setActiveAccount] = useState<'info' | 'inschrijving'>('info')

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true)
      const data = await emailService.getEmailsByAccount(activeAccount)
      setEmails(data)
    } catch (err) {
      setError('Kon emails niet laden')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeAccount])

  useEffect(() => {
    loadEmails()
  }, [loadEmails])

  const handleMarkAsRead = async (emailId: string, read: boolean) => {
    try {
      await emailService.markAsRead(emailId, read)
      loadEmails() // Herlaad de emails om de nieuwe status te tonen
    } catch (err) {
      console.error('Error marking email as read:', err)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Account selector */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveAccount('info')}
            className={`px-4 py-2 rounded-md ${
              activeAccount === 'info'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            info@dekoninklijkeloop.nl
          </button>
          <button
            onClick={() => setActiveAccount('inschrijving')}
            className={`px-4 py-2 rounded-md ${
              activeAccount === 'inschrijving'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            inschrijving@dekoninklijkeloop.nl
          </button>
        </div>
      </div>

      {/* Email list and detail view */}
      <div className="flex h-[calc(100vh-16rem)]">
        {/* Email list */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`
                p-4 border-b border-gray-200 cursor-pointer
                ${!email.read ? 'bg-blue-50' : 'bg-white'}
                ${selectedEmail?.id === email.id ? 'bg-gray-100' : ''}
                hover:bg-gray-50
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">{email.sender}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(email.created_at), 'dd MMM HH:mm', { locale: nl })}
                </span>
              </div>
              <div className="text-sm font-medium mb-1">{email.subject}</div>
              <div className="text-sm text-gray-500 truncate">
                {email.body.substring(0, 100)}...
              </div>
            </div>
          ))}
        </div>

        {/* Email detail view */}
        <div className="w-2/3 p-4 overflow-y-auto">
          {selectedEmail ? (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                  <button
                    onClick={() => handleMarkAsRead(selectedEmail.id, !selectedEmail.read)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Markeer als {selectedEmail.read ? 'ongelezen' : 'gelezen'}
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Van: {selectedEmail.sender}</div>
                  <div>
                    Ontvangen: {format(new Date(selectedEmail.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none mt-6">
                {selectedEmail.html ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                ) : (
                  <pre className="whitespace-pre-wrap">{selectedEmail.body}</pre>
                )}
              </div>
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