import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Switch as HeadlessSwitch } from '@headlessui/react'
import { cl } from '../styles/shared'

export function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme()
  const [success, setSuccess] = useState<string | null>(null)

  const handleThemeChange = () => {
    toggleTheme()
    setSuccess('Thema succesvol bijgewerkt')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Instellingen
          </h3>
          
          {success && (
            <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800/50">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Schakel tussen licht en donker thema
                </p>
              </div>
              <HeadlessSwitch
                checked={isDarkMode}
                onChange={handleThemeChange}
                className={cl(
                  isDarkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                )}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={cl(
                    isDarkMode ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </HeadlessSwitch>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Notificaties
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Notificatie instellingen komen binnenkort beschikbaar
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Taal
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Taal instellingen komen binnenkort beschikbaar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 