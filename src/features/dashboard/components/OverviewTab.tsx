import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../../../types/dashboard'
// Import necessary icons
import {
  UsersIcon, 
  ChatBubbleLeftEllipsisIcon, 
  EnvelopeOpenIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'

export function OverviewTab() {
  const { stats, contactStats } = useOutletContext<DashboardContext>() // Destructure contactStats as well
  
  // Add a check for data availability to prevent errors during initial load
  if (!stats || !contactStats) {
    return <div>Loading stats...</div>; // Or a proper loading skeleton
  }

  return (
    <div className="space-y-6">
      {/* START: Copied Statistieken Grid from DashboardPage.tsx */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card: Aanmeldingen */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Aanmeldingen
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {stats.totaal}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card: Berichten Totaal */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Berichten Totaal
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {contactStats.counts.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card: Nieuwe berichten */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeOpenIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> 
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Nieuwe berichten
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {contactStats.counts.new}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card: Gem. reactietijd */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Gem. reactietijd
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {/* Check if avgResponseTime exists before rounding */}
                    {typeof contactStats.avgResponseTime === 'number' ? `${Math.round(contactStats.avgResponseTime)} min` : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* END: Copied Statistieken Grid */}
      
      {/* Original Stats Grid (Now just Roles) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> {/* Adjusted grid columns */} 
        {/* Roles */}
        {Object.entries(stats.rollen).map(([rol, aantal]) => (
          <div key={rol} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">{rol}</h3>
            <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{String(aantal)}</p>
          </div>
        ))}
      </div>

      {/* Detailed Stats (Afstanden, Ondersteuning) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distances */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Afstanden</h3>
          <div className="space-y-2">
            {Object.entries(stats.afstanden).map(([afstand, aantal]) => (
              <div key={afstand} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{afstand}</span>
                <span className="text-gray-900 dark:text-white font-medium">{String(aantal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Ondersteuning</h3>
          <div className="space-y-2">
            {Object.entries(stats.ondersteuning).map(([type, aantal]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{type}</span>
                <span className="text-gray-900 dark:text-white font-medium">{String(aantal)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 