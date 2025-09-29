import { useEffect } from 'react'
import { H1, SmallText } from '../components/typography'
import { UnderConstructionForm } from '../features/under-construction/components/UnderConstructionForm'
import { useNavigationHistory } from '../contexts/navigation/useNavigationHistory'

export function UnderConstructionPage() {
  const { addToHistory } = useNavigationHistory()

  useEffect(() => {
    addToHistory('Frontend')
  }, [addToHistory])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6">
          <H1 className="mb-1">Frontend</H1>
          <SmallText>
            Beheer de onder constructie pagina van de frontend website
          </SmallText>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <UnderConstructionForm />
        </div>
      </div>
    </div>
  )
}