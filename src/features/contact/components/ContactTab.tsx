import { MessageItem } from './MessageItem'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../../../types/dashboard'
import { useState, useEffect } from 'react'
import { supabase } from '../../../api/client/supabase'
import { EmailDialog } from '../../email/components/EmailDialog'
import { adminEmailService } from '../../email/adminEmailService'
import { cc } from '../../../styles/shared'
import { usePermissions } from '../../../hooks/usePermissions'

export function ContactTab() {
  const { contactStats, messages, handleUpdate } = useOutletContext<DashboardContext>()
  const { hasPermission } = usePermissions()
  const [isNewEmailDialogOpen, setIsNewEmailDialogOpen] = useState(false)
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string | null>(null)
  const [suggestionEmails, setSuggestionEmails] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'nieuw' | 'in_behandeling' | 'afgehandeld'>('all')

  const canReadContacts = hasPermission('contact', 'read')
  const canSendAdminEmail = hasPermission('admin_email', 'send')

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.bericht.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setLoggedInUserEmail(user?.email || null);
      
      const emails = await adminEmailService.fetchAanmeldingenEmails();
      setSuggestionEmails(emails);
    };
    fetchData();
  }, []);

  const handleSendNewEmail = async (data: { to: string; subject: string; body: string; sender: string }) => {
    try {
      await adminEmailService.sendMailAsAdmin({
        to: data.to,
        subject: data.subject,
        body: data.body,
        from: 'info@dekoninklijkeloop.nl' 
      });
    } catch (error) {
      console.error('Failed to send new email via admin endpoint:', error);
      throw error;
    }
  };

  if (!canReadContacts) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Geen Toegang</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Je hebt geen toestemming om contactberichten te bekijken.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Statistics Cards */}
      <div className={`${cc.grid.stats()} gap-4`}>
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Totaal</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contactStats?.counts.total || 0}
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Nieuw</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contactStats?.counts.new || 0}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">In behandeling</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contactStats?.counts.inProgress || 0}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Afgehandeld</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contactStats?.counts.handled || 0}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contactberichten</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredMessages.length} {filteredMessages.length === 1 ? 'bericht' : 'berichten'}
              </p>
            </div>
            {canSendAdminEmail && (
              <button
                type="button"
                className={cc.button.base({ color: 'primary', className: 'gap-2' })}
                onClick={() => setIsNewEmailDialogOpen(true)}
                disabled={!loggedInUserEmail}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nieuwe Email
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Zoek berichten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${cc.transition.colors} ${
                  filterStatus === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setFilterStatus('nieuw')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${cc.transition.colors} ${
                  filterStatus === 'nieuw'
                    ? 'bg-green-600 dark:bg-green-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Nieuw
              </button>
              <button
                onClick={() => setFilterStatus('in_behandeling')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${cc.transition.colors} ${
                  filterStatus === 'in_behandeling'
                    ? 'bg-orange-600 dark:bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                In behandeling
              </button>
              <button
                onClick={() => setFilterStatus('afgehandeld')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${cc.transition.colors} ${
                  filterStatus === 'afgehandeld'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Afgehandeld
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="p-6">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Geen berichten gevonden</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Probeer een andere zoekopdracht of filter' 
                  : 'Er zijn nog geen contactberichten ontvangen'}
              </p>
            </div>
          ) : (
            <div className={cc.spacing.section.sm}>
              {filteredMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  onStatusUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Dialog */}
      {loggedInUserEmail && (
        <EmailDialog
          isOpen={isNewEmailDialogOpen}
          onClose={() => setIsNewEmailDialogOpen(false)}
          initialSenderEmail={loggedInUserEmail}
          onSend={handleSendNewEmail} 
          suggestionEmails={suggestionEmails} 
        />
      )}
    </div>
  )
}