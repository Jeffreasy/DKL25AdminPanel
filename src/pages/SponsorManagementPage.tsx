import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography/typography'
import { SponsorGrid } from '../features/sponsors/components'
import { SponsorForm } from '../features/sponsors/components/SponsorForm'
import { useNavigationHistory } from '../features/navigation'
import { cc } from '../styles/shared'
import { usePermissions } from '../hooks/usePermissions'

export function SponsorManagementPage() {
  const { hasPermission } = usePermissions()
  const [showForm, setShowForm] = useState(false)
  const { addToHistory } = useNavigationHistory()

  const canReadSponsors = hasPermission('sponsor', 'read')
  const canWriteSponsors = hasPermission('sponsor', 'write')

  useEffect(() => {
    addToHistory('Sponsors')
  }, [addToHistory])

  if (!canReadSponsors) {
    return (
      <div className="p-6">
        <div className="text-center">
          <H1>Geen toegang</H1>
          <SmallText>U heeft geen toestemming om sponsors te beheren.</SmallText>
        </div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6 flex justify-between items-center`}>
          <div>
            <H1 className="mb-1">Sponsors</H1>
            <SmallText>
              Beheer de sponsors van de Koninklijke Loop
            </SmallText>
          </div>
          {canWriteSponsors && (
            <button
              onClick={() => setShowForm(true)}
              className={cc.button.base({ color: 'primary', className: `flex items-center ${cc.spacing.gap.sm}` })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Sponsor Toevoegen</span>
              <span className="sm:hidden">Toevoegen</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <SponsorGrid />
      </div>

      {/* Modal for new sponsor */}
      {showForm && (
        <SponsorForm
          onComplete={() => {
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 