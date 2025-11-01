import type { Email } from '../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cc } from '../../../styles/shared'

interface EmailDetailProps {
  email: Email
}

/**
 * EmailDetail Component
 *
 * Optimized for displaying decoded emails from the backend:
 * - Handles properly decoded UTF-8 content (no more =92, =85 artifacts)
 * - Displays multipart MIME emails correctly
 * - Shows converted charsets (Windows-1252, ISO-8859-1, etc.)
 * - Renders clean HTML without MIME boundaries
 */
export default function EmailDetail({ email }: EmailDetailProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header Section */}
      <div className={`${cc.spacing.container.sm} sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0`}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 break-words">
          {email.subject}
        </h2>
        
        {/* Meta Info */}
        <div className={`${cc.spacing.section.xs} text-xs sm:text-sm`}>
          <p className="text-gray-700 dark:text-gray-300 break-words">
            <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Van:</strong>
            <span className="ml-1">{email.sender}</span>
          </p>
          {email.to && (
            <p className="text-gray-700 dark:text-gray-300 break-words">
              <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Aan:</strong>
              <span className="ml-1">{email.to}</span>
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400">
            <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Ontvangen:</strong>
            <span className="ml-1">{format(new Date(email.received_at), 'dd MMMM yyyy HH:mm', { locale: nl })}</span>
          </p>
          {email.content_type && (
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Type:</strong>
              <span className="ml-1 font-mono">{email.content_type}</span>
            </p>
          )}
        </div>
      </div>
      
      {/* Body Section - Optimized for decoded content */}
      <div className={`${cc.spacing.container.sm} sm:p-6 overflow-y-auto flex-1`}>
        <div
          className="
            prose prose-sm dark:prose-invert max-w-none
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-a:underline hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300
            prose-img:max-w-full prose-img:h-auto prose-img:rounded-md
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900
            prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-900
            prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            leading-relaxed
            break-words
          "
          dangerouslySetInnerHTML={{ __html: email.html || '<p class="text-gray-500 dark:text-gray-400 italic">Geen inhoud beschikbaar</p>' }}
        />
      </div>
    </div>
  )
}