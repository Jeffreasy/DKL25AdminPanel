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
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {/* Subject */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {email.subject}
        </h2>
        
        {/* From / Date Row */}
        <div className="flex justify-between items-center mb-1">
          {/* From */}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="font-medium text-gray-800 dark:text-gray-200">Van:</strong> {email.sender}
          </p>
          {/* Date */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(email.created_at), 'dd MMMM yyyy HH:mm', { locale: nl })}
          </p>
        </div>
        
        {/* To (if available) */}
        {email.metadata && email.metadata['delivered-to'] && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            <strong className="font-medium text-gray-800 dark:text-gray-200">Aan:</strong> {email.metadata['delivered-to']}
          </p>
        )}
        
        {/* Reply-To (if available) */}
        {email.metadata && email.metadata['reply-to'] && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="font-medium text-gray-800 dark:text-gray-200">Antwoorden aan:</strong> {email.metadata['reply-to']}
          </p>
        )}
      </div>
      
      {/* Divider is implicitly handled by the border-b above and padding below */}
      
      {/* Body Section */}
      <div className="p-6 overflow-y-auto flex-1">
        {email.html ? (
          // Apply prose for basic HTML styling if needed, or style specific elements
          // Backend service (`VITE_EMAIL_API_URL`) now sanitizes HTML before storing.
          <div
            className="prose prose-sm dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:max-w-full prose-img:h-auto"
            dangerouslySetInnerHTML={{ __html: email.html }}
          />
        ) : (
          // Use pre for plain text to preserve whitespace
          <pre className="whitespace-pre-wrap break-words font-sans text-sm text-gray-800 dark:text-gray-200 m-0">
            {email.body}
          </pre>
        )}
      </div>
    </div>
  )
} 