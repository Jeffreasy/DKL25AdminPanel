import { RegistrationItem } from '../components/RegistrationItem'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../types/dashboard'

export function AanmeldingenTab() {
  const { stats, aanmeldingen, handleUpdate } = useOutletContext<DashboardContext>()
  return (
    <div className="space-y-4">
      {/* Quick Stats - Adapted for light theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(stats.rollen).map(([rol, aantal]) => (
          <div key={rol} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
            <dt className="text-xs text-gray-500 dark:text-gray-400">{rol}</dt>
            <dd className="mt-1 text-xl font-medium text-gray-900 dark:text-white">{aantal}</dd>
          </div>
        ))}
      </div>

      {/* Aanmeldingen List Container (already light/dark compatible) */}
      <div className="rounded-lg overflow-hidden p-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-2 py-3 border-b border-gray-200 dark:border-gray-700 mb-4"> 
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Aanmeldingen</h3> 
        </div>
        <div> 
          {aanmeldingen.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Geen aanmeldingen gevonden
            </div>
          ) : (
            aanmeldingen.map((aanmelding) => (
              <RegistrationItem
                key={aanmelding.id}
                registration={aanmelding}
                onStatusUpdate={handleUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 