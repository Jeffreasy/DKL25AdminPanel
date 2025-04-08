import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Switch } from '@mantine/core'

export function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme()
  const [success, setSuccess] = useState<string | null>(null)

  const handleThemeChange = () => {
    toggleTheme()
    setSuccess('Thema succesvol bijgewerkt')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className={`max-w-2xl mx-auto ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Instellingen
          </h3>
          
          {success && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
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
              <Switch
                checked={isDarkMode}
                onChange={handleThemeChange}
                color="indigo"
                size="md"
                label={isDarkMode ? 'Aan' : 'Uit'}
              />
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