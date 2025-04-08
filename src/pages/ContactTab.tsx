import { MessageItem } from '../components/MessageItem'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../types/dashboard'

export function ContactTab() {
  const { contactStats, messages, handleUpdate } = useOutletContext<DashboardContext>()
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1B2B3A] rounded-lg px-4 py-3">
          <dt className="text-xs text-gray-400">Totaal</dt>
          <dd className="mt-1 text-xl font-medium text-white">
            {contactStats?.counts.total || 0}
          </dd>
        </div>
        <div className="bg-[#1B2B3A] rounded-lg px-4 py-3">
          <dt className="text-xs text-green-400">Nieuw</dt>
          <dd className="mt-1 text-xl font-medium text-white">
            {contactStats?.counts.new || 0}
          </dd>
        </div>
        <div className="bg-[#1B2B3A] rounded-lg px-4 py-3">
          <dt className="text-xs text-orange-400">In behandeling</dt>
          <dd className="mt-1 text-xl font-medium text-white">
            {contactStats?.counts.inProgress || 0}
          </dd>
        </div>
        <div className="bg-[#1B2B3A] rounded-lg px-4 py-3">
          <dt className="text-xs text-blue-400">Afgehandeld</dt>
          <dd className="mt-1 text-xl font-medium text-white">
            {contactStats?.counts.handled || 0}
          </dd>
        </div>
      </div>

      {/* Messages List - Zonder filters */}
      <div className="bg-[#1B2B3A] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-sm font-medium text-white">Berichten</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {messages.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              Geen berichten gevonden
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="px-4">
                <MessageItem
                  message={message}
                  onStatusUpdate={handleUpdate}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 