import type { Email } from '../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cl } from '../../../styles/shared' // Import cl if needed

interface EmailDetailProps {
  email: Email
}

export default function EmailDetail({ email }: EmailDetailProps) {
  return (
    // Replace Card with div, apply border, rounded corners, flex layout
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header Section - Add more padding */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Subject - Slightly smaller on mobile */}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {email.subject}
        </h2>
        
        {/* Meta Info - Grouped */}
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Van:</strong> {email.sender}
          </p>
          {/* To (if available) */}
          {email.metadata?.['delivered-to'] && (
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Aan:</strong> {email.metadata['delivered-to']}
            </p>
          )}
          {/* Reply-To (if available) */}
          {email.metadata?.['reply-to'] && (
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Antwoorden aan:</strong> {email.metadata['reply-to']}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Datum:</strong> 
            {format(new Date(email.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
          </p>
        </div>
      </div>
      
      {/* Body Section - More padding */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1">
        {/* Always try rendering the html field. 
            Backend should provide decoded & sanitized content here. 
            Plain text will render as plain text within the div. */}
        <div
          className="prose prose-sm dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:max-w-full prose-img:h-auto leading-relaxed"
          // Use html field, default to empty string if null/undefined
          dangerouslySetInnerHTML={{ __html: email.html || '' }} 
        />
      </div>
    </div>
  )
} 