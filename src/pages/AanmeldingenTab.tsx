import { RegistrationItem } from '../components/RegistrationItem'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../types/dashboard'

export function AanmeldingenTab() {
  const { stats, aanmeldingen, handleUpdate } = useOutletContext<DashboardContext>()
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(stats.rollen).map(([rol, aantal]) => (
          <div key={rol} className="bg-[#1B2B3A] rounded-lg px-4 py-3">
            <dt className="text-xs text-gray-400">{rol}</dt>
            <dd className="mt-1 text-xl font-medium text-white">{aantal}</dd>
          </div>
        ))}
      </div>

      {/* Aanmeldingen List */}
      <div className="bg-[#1B2B3A] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-sm font-medium text-white">Aanmeldingen</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {aanmeldingen.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              Geen aanmeldingen gevonden
            </div>
          ) : (
            aanmeldingen.map((aanmelding) => (
              <div key={aanmelding.id} className="px-4">
                <RegistrationItem
                  registration={aanmelding}
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