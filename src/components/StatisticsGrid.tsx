import { UsersIcon } from '@heroicons/react/24/outline'

interface Stats {
  totaal: number
  rollen: {
    Deelnemer: number
    Begeleider: number
    Vrijwilliger: number
  }
  afstanden: {
    '2.5 KM': number
    '6 KM': number
    '10 KM': number
    '15 KM': number
  }
  ondersteuning: {
    Ja: number
    Nee: number
    Anders: number
  }
}

interface StatisticsGridProps {
  stats: Stats
}

export function StatisticsGrid({ stats }: StatisticsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Totaal */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Totaal aanmeldingen</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.totaal}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Rollen */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rollen</h3>
          <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(stats.rollen).map(([rol, aantal]) => (
              <div key={rol} className="py-2 flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{rol}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{aantal}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Afstanden */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Afstanden</h3>
          <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(stats.afstanden).map(([afstand, aantal]) => (
              <div key={afstand} className="py-2 flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{afstand}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{aantal}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Ondersteuning */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ondersteuning nodig</h3>
          <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(stats.ondersteuning).map(([type, aantal]) => (
              <div key={type} className="py-2 flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{type}</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{aantal}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
} 