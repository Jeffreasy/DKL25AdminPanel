import { useOutletContext } from 'react-router-dom'
import type { DashboardContext } from '../../../types/dashboard'
import { cc } from '../../../styles/shared'
import { useLiveTotalSteps } from '../../steps/hooks'

export function OverviewTab() {
  const { stats, contactStats } = useOutletContext<DashboardContext>()
  const { totalSteps, loading: stepsLoading } = useLiveTotalSteps(30000)
  
  if (!stats || !contactStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Main Statistics Grid */}
      <div className={`${cc.grid.stats()} ${cc.spacing.gap.xl}`}>
        {/* Aanmeldingen */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Aanmeldingen</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totaal}</p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Berichten Totaal */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Berichten Totaal</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{contactStats.counts.total}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Nieuwe Berichten */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nieuwe Berichten</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{contactStats.counts.new}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Gem. Reactietijd */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${cc.hover.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Gem. Reactietijd</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {typeof contactStats.avgResponseTime === 'number' 
                  ? `${Math.round(contactStats.avgResponseTime)}h` 
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Total Steps Counter */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 rounded-lg shadow-lg border border-green-200 dark:border-green-700 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Totaal Gewandelde Stappen</h3>
                  <p className="text-sm text-green-100 dark:text-green-200 mt-1">Door alle deelnemers samen</p>
                </div>
              </div>
              <div className="mt-4">
                {stepsLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="text-white">Laden...</p>
                  </div>
                ) : (
                  <p className="text-5xl font-bold text-white tracking-tight">
                    {totalSteps.toLocaleString('nl-NL')}
                  </p>
                )}
                <p className="text-sm text-green-100 dark:text-green-200 mt-2">
                  🚶 Elke stap telt mee voor ons doel!
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-9xl opacity-20">🚶</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rollen Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600">
          <h3 className="text-lg font-semibold text-white">Aanmeldingen per Rol</h3>
          <p className="text-sm text-indigo-100 dark:text-indigo-200 mt-1">Verdeling van deelnemers, begeleiders en vrijwilligers</p>
        </div>
        <div className="p-6">
          <div className={`${cc.grid.threeCol()} gap-6`}>
            {Object.entries(stats.rollen).map(([rol, aantal]) => (
              <div key={rol} className="text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{String(aantal)}</p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{rol}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className={`${cc.grid.responsive()} gap-6`}>
        {/* Afstanden */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Afstanden</h3>
            </div>
          </div>
          <div className={cc.spacing.container.md}>
            <div className={cc.spacing.section.xs}>
              {Object.entries(stats.afstanden).map(([afstand, aantal]) => {
                const percentage = stats.totaal > 0 ? (Number(aantal) / stats.totaal * 100).toFixed(0) : 0
                return (
                  <div key={afstand}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{afstand}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{String(aantal)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full ${cc.transition.slower}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Ondersteuning */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ondersteuning</h3>
            </div>
          </div>
          <div className={cc.spacing.container.md}>
            <div className={cc.spacing.section.xs}>
              {Object.entries(stats.ondersteuning).map(([type, aantal]) => {
                const percentage = stats.totaal > 0 ? (Number(aantal) / stats.totaal * 100).toFixed(0) : 0
                const bgColor = type === 'Ja'
                  ? 'bg-green-600 dark:bg-green-500' 
                  : type === 'Nee' 
                  ? 'bg-red-600 dark:bg-red-500' 
                  : 'bg-orange-600 dark:bg-orange-500'
                
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{String(aantal)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${bgColor} h-2 rounded-full ${cc.transition.slower}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600">
          <h3 className="text-lg font-semibold text-white">Contact Berichten</h3>
          <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">Status overzicht van contactformulier berichten</p>
        </div>
        <div className="p-6">
          <div className={`${cc.grid.threeCol()} gap-6`}>
            {/* Nieuw */}
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{contactStats.counts.new}</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Nieuw</p>
            </div>

            {/* In Progress */}
            <div className="text-center">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-10 h-10 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{contactStats.counts.inProgress}</p>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">In behandeling</p>
            </div>

            {/* Handled */}
            <div className="text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{contactStats.counts.handled}</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Afgehandeld</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Berichten Activiteit</h3>
          </div>
        </div>
        <div className="p-6">
          <div className={`${cc.grid.threeCol()} gap-6`}>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Vandaag</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{contactStats.messagesByPeriod.daily}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Deze Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{contactStats.messagesByPeriod.weekly}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Deze Maand</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{contactStats.messagesByPeriod.monthly}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}