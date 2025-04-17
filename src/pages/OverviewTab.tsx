import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../types/dashboard'

export function OverviewTab() {
  const { stats } = useOutletContext<DashboardContext>()
  return (
    <div className="space-y-6">
      {/* Stats Grid - Adapted for light/dark theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Totaal aanmeldingen</h3>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{stats.totaal}</p>
        </div>
        
        {/* Roles */}
        {Object.entries(stats.rollen).map(([rol, aantal]) => (
          <div key={rol} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">{rol}</h3>
            <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{String(aantal)}</p>
          </div>
        ))}
      </div>

      {/* Detailed Stats - Adapted for light/dark theme */}
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