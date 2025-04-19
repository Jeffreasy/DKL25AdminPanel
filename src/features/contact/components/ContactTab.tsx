import { MessageItem } from './MessageItem'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../../../types/dashboard'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { EmailDialog } from '../../../components/email/EmailDialog'
import { adminEmailService } from '../../email/adminEmailService'
import { cc } from '../../../styles/shared'

export function ContactTab() {
  const { contactStats, messages, handleUpdate } = useOutletContext<DashboardContext>()
  
  // State for new email dialog
  const [isNewEmailDialogOpen, setIsNewEmailDialogOpen] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string | null>(null);
  // State for suggestion emails
  const [suggestionEmails, setSuggestionEmails] = useState<string[]>([]); 

  // Fetch logged-in user's email and suggestion emails
  useEffect(() => {
    const fetchData = async () => {
      // Fetch user email
      const { data: { user } } = await supabase.auth.getUser();
      setLoggedInUserEmail(user?.email || null);
      
      // Fetch suggestion emails
      const emails = await adminEmailService.fetchAanmeldingenEmails();
      setSuggestionEmails(emails);
    };
    fetchData();
  }, []);

  // Handler for sending a new email (not linked to a specific contact message)
  const handleSendNewEmail = async (data: { to: string; subject: string; body: string; sender: string }) => {
      // NOTE: This function does NOT update any contact message status
      try {
          await adminEmailService.sendMailAsAdmin({
              to: data.to,
              subject: data.subject,
              body: data.body,
              // Force the 'from' address as previously decided
              from: 'info@dekoninklijkeloop.nl' 
          });
          // Optionally: show a success notification to the user
      } catch (error) {
          console.error('Failed to send new email via admin endpoint:', error);
          // Optionally: show an error notification to the user
          throw error; // Re-throw so EmailDialog can potentially catch it too
      }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Quick Stats - Adapted for light/dark theme */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Totaal</dt>
            <dd className="mt-1 text-xl font-medium text-gray-900 dark:text-white">
              {contactStats?.counts.total || 0}
            </dd>
          </div>
          {/* New */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
            <dt className="text-xs text-green-600 dark:text-green-400">Nieuw</dt> {/* Adjusted color */}
            <dd className="mt-1 text-xl font-medium text-gray-900 dark:text-white">
              {contactStats?.counts.new || 0}
            </dd>
          </div>
          {/* In Progress */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
            <dt className="text-xs text-orange-600 dark:text-orange-400">In behandeling</dt> {/* Adjusted color */}
            <dd className="mt-1 text-xl font-medium text-gray-900 dark:text-white">
              {contactStats?.counts.inProgress || 0}
            </dd>
          </div>
          {/* Handled */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
            <dt className="text-xs text-blue-600 dark:text-blue-400">Afgehandeld</dt> {/* Adjusted color */}
            <dd className="mt-1 text-xl font-medium text-gray-900 dark:text-white">
              {contactStats?.counts.handled || 0}
            </dd>
          </div>
        </div>
      </div>

      {/* Messages List - Adapted for light/dark theme */}
      <div className="rounded-lg overflow-hidden p-4 shadow-sm border border-gray-200 dark:border-gray-700 mt-4">
        <div className="px-2 py-3 border-b border-gray-200 dark:border-gray-700 mb-4 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Berichten</h3>
          {/* Add New Email Button */}
          <button 
            type="button"
            className={cc.button.base({ color: 'primary', size: 'sm' })} // Use primary color, small size
            onClick={() => setIsNewEmailDialogOpen(true)}
            disabled={!loggedInUserEmail} // Disable if user email not loaded yet
          >
            Nieuwe Email
          </button>
        </div>
        {/* Add spacing between MessageItems */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Geen berichten gevonden
            </div>
          ) : (
            messages.map((message) => (
              // Pass message and handler to MessageItem
              // MessageItem itself needs to be dark mode compatible
              <MessageItem
                key={message.id}
                message={message}
                onStatusUpdate={handleUpdate}
              />
            ))
          )}
        </div>
      </div>

      {/* Render EmailDialog for composing new emails */}
      {loggedInUserEmail && (
          <EmailDialog
              isOpen={isNewEmailDialogOpen}
              onClose={() => setIsNewEmailDialogOpen(false)}
              initialSenderEmail={loggedInUserEmail}
              onSend={handleSendNewEmail} 
              // Pass suggestion emails
              suggestionEmails={suggestionEmails} 
          />
      )}
    </>
  )
} 