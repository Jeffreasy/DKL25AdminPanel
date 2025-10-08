import { useEffect } from 'react'
import { H1, SmallText } from '../components/typography/typography'
import { UnderConstructionForm } from '../features/under-construction/components/UnderConstructionForm'
import { useNavigationHistory } from '../features/navigation'
import { cc } from '../styles/shared'

export function UnderConstructionPage() {
  const { addToHistory } = useNavigationHistory()

  useEffect(() => {
    addToHistory('Frontend')
  }, [addToHistory])

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