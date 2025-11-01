import { useEffect } from 'react'
import { H1, SmallText } from '../components/typography/typography'
import { UnderConstructionForm } from '../features/under-construction/components/UnderConstructionForm'
import { useNavigationHistory } from '../features/navigation'
import { usePermissions } from '../hooks/usePermissions'
import { cc } from '../styles/shared'

export function UnderConstructionPage() {
  const { hasPermission } = usePermissions()
  const { addToHistory } = useNavigationHistory()

  const canManageFrontend = hasPermission('admin', 'access')

  useEffect(() => {
    addToHistory('Frontend')
  }, [addToHistory])

  if (!canManageFrontend) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Geen Toegang</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Je hebt geen toestemming om de frontend onder constructie pagina te beheren. Alleen admins hebben toegang.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6`}>
          <H1 className="mb-1">Frontend</H1>
          <SmallText>
            Beheer de onder constructie pagina van de frontend website
          </SmallText>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={cc.spacing.container.md}>
          <UnderConstructionForm />
        </div>
      </div>
    </div>
  )
}