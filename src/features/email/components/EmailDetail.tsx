import type { Email } from '../types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cc } from '../../../styles/shared'

interface EmailDetailProps {
  email: Email
}

export default function EmailDetail({ email }: EmailDetailProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header Section */}
      <div className={`${cc.spacing.container.sm} sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0`}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {email.subject}
        </h2>
        
        {/* Meta Info */}
        <div className={`${cc.spacing.section.xs} text-xs sm:text-sm`}>
          <p className="text-gray-700 dark:text-gray-300">
            <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Van:</strong> {email.sender}
          </p>
          {email.metadata?.['delivered-to'] && (
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="font-medium text-gray-800 dark:text-gray-200 w-[90px] inline-block">Aan:</strong> {email.metadata['delivered-to']}
            </p>
          )}
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
      
      {/* Body Section */}
      <div className={`${cc.spacing.container.sm} sm:p-6 overflow-y-auto flex-1`}>
        <div
          className="prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:max-w-full prose-img:h-auto leading-relaxed"
          dangerouslySetInnerHTML={{ __html: email.html || '' }}
        />
      </div>
    </div>
  )
}