import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography/typography'
import { PartnersOverview } from '../features/partners/PartnersOverview'
import { PartnerForm } from '../features/partners/components/PartnerForm'
import { useNavigationHistory } from '../features/navigation'
import { cc } from '../styles/shared'
import { usePermissions } from '../hooks/usePermissions'

export function PartnerManagementPage() {
  const { hasPermission } = usePermissions()
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { addToHistory } = useNavigationHistory()

  const canReadPartners = hasPermission('partner', 'read')
  const canWritePartners = hasPermission('partner', 'write')

  useEffect(() => {
    addToHistory('Partners')
  }, [addToHistory])

  if (!canReadPartners) {
    return (
      <div className="p-6">
        <div className="text-center">
          <H1>Geen toegang</H1>
          <SmallText>U heeft geen toestemming om partners te beheren.</SmallText>
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
            <H1 className="mb-1">Partners</H1>
            <SmallText>
              Beheer de partners van de Koninklijke Loop
            </SmallText>
          </div>
          {canWritePartners && (
            <button
              onClick={() => setShowAddPartner(true)}
              className={cc.button.base({ color: 'primary', className: `flex items-center ${cc.spacing.gap.sm}` })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Partner Toevoegen</span>
              <span className="sm:hidden">Toevoegen</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <PartnersOverview key={refreshTrigger} />
      </div>

      {/* Modal for new partner */}
      {showAddPartner && (
        <PartnerForm
          onComplete={() => {
            setShowAddPartner(false)
            setRefreshTrigger(prev => prev + 1) // Refresh partner list
          }}
          onCancel={() => setShowAddPartner(false)}
        />
      )}
    </div>
  )
} 