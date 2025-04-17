import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography'
import { PartnersOverview } from '../features/partners/PartnersOverview'
import { PartnerForm } from '../features/partners/components/PartnerForm'
import { useNavigationHistory } from '../contexts/navigation/useNavigationHistory'
import { componentClasses as cc } from '../styles/shared'

export function PartnerManagementPage() {
  const [showAddPartner, setShowAddPartner] = useState(false)
  const { addToHistory } = useNavigationHistory()

  useEffect(() => {
    addToHistory('Partners')
  }, [addToHistory])

  return (
    <div className="space-y-6">
      {/* Header - Adapted for dark mode */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <H1 className="mb-1">Partners</H1>
            <SmallText>
              Beheer de partners van de Koninklijke Loop
            </SmallText>
          </div>
          <button
            onClick={() => setShowAddPartner(true)}
            className={`${cc.button.primary} flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Partner Toevoegen</span>
            <span className="sm:hidden">Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Content - Adapted for dark mode */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <PartnersOverview />
      </div>

      {/* Modal for new partner */}
      {showAddPartner && (
        <PartnerForm
          onComplete={() => {
            setShowAddPartner(false)
            // TODO: Refresh list
          }}
          onCancel={() => setShowAddPartner(false)}
        />
      )}
    </div>
  )
} 