import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { supabase } from '../../../lib/supabase'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  timestamp: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
}

interface RawEmailEvent {
  id: string
  type: string
  timestamp: string
  from_email: string
  to_email: string
  subject: string
  [key: string]: unknown
}

interface SupabaseEmailEvent {
  id: string
  event_type: string
  email_id: string
  from_email: string
  to_email: string
  subject: string
  status: string
  created_at: string
  message_id: string
  metadata: {
    raw_event: RawEmailEvent
  }
}

interface EmailDetails extends EmailMessage {
  metadata?: {
    raw_event: RawEmailEvent
    headers?: Record<string, string>
    body?: string
  }
}

export function InboxTab() {
  const [loading, setLoading] = useState(true)
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<EmailDetails | null>(null)

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    try {
      setLoading(true)
      
      const { data: supabaseEmails, error: supabaseError } = await supabase
        .from('email_events')
        .select('*, metadata')
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError

      const allEmails = (supabaseEmails || []).map((email: SupabaseEmailEvent) => ({
        id: email.id,
        from: email.from_email,
        to: email.to_email,
        subject: email.subject,
        timestamp: new Date(email.created_at).toISOString(),
        status: email.status as EmailMessage['status'],
        metadata: email.metadata
      }))

      setEmails(allEmails)
    } catch (err) {
      console.error('Failed to load emails:', err)
      setError('Kon emails niet laden')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: EmailMessage['status']) => {
    const styles = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      opened: 'bg-purple-100 text-purple-800',
      clicked: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    return styles[status]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-12rem)] max-w-full">
        <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow px-4 py-5">
            <dt className="text-sm font-medium text-gray-500">Totaal verzonden</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {emails.filter(e => e.status === 'sent').length}
            </dd>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-5">
            <dt className="text-sm font-medium text-gray-500">Afgeleverd</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {emails.filter(e => e.status === 'delivered').length}
            </dd>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-5">
            <dt className="text-sm font-medium text-gray-500">Geopend</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {emails.filter(e => e.status === 'opened').length}
            </dd>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-5">
            <dt className="text-sm font-medium text-gray-500">Gefaald</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {emails.filter(e => e.status === 'failed').length}
            </dd>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-y-auto h-full">
            <ul className="divide-y divide-gray-200">
              {emails.map((email: EmailMessage) => (
                <li 
                  key={email.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {email.subject}
                        </p>
                        <div className="mt-2 flex flex-col sm:flex-row sm:gap-2">
                          <p className="text-sm text-gray-500">
                            Van: {email.from}
                          </p>
                          <p className="text-sm text-gray-500">
                            → Naar: {email.to}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(email.status)}`}>
                          {email.status}
                        </span>
                        <p className="text-sm text-gray-500 whitespace-nowrap">
                          {format(new Date(email.timestamp), 'dd MMM yyyy HH:mm', { locale: nl })}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Transition appear show={!!selectedEmail} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setSelectedEmail(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  {selectedEmail && (
                    <>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        {selectedEmail.subject}
                      </Dialog.Title>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Van:</span>{' '}
                            {selectedEmail.from}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Naar:</span>{' '}
                            {selectedEmail.to}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Datum:</span>{' '}
                            {format(new Date(selectedEmail.timestamp), 'dd MMM yyyy HH:mm', { locale: nl })}
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Status:</span>{' '}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedEmail.status)}`}>
                              {selectedEmail.status}
                            </span>
                          </div>
                        </div>

                        {selectedEmail.metadata?.body && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Inhoud</h4>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedEmail.metadata.body }} />
                          </div>
                        )}

                        {/* Technical Details (collapsible) */}
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium text-gray-500">
                            Technische Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-4 rounded-md overflow-auto">
                            {JSON.stringify(selectedEmail.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setSelectedEmail(null)}
                        >
                          Sluiten
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
} 