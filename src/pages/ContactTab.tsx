import { MessageItem } from '../components/MessageItem'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../types/dashboard'

export function ContactTab() {
  const { contactStats, messages, handleUpdate } = useOutletContext<DashboardContext>()
  return (
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

      {/* Messages List - Adapted for light/dark theme */}
      <div className="rounded-lg overflow-hidden p-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-2 py-3 border-b border-gray-200 dark:border-gray-700 mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Berichten</h3>
        </div>
        {/* Removed divide-y */}
        <div> 
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
    </div>
  )
} 