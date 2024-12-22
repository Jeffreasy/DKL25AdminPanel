import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography'
import { PartnersOverview } from '../features/partners/PartnersOverview'
import { PartnerForm } from '../features/partners/components/PartnerForm'
import { useNavigationHistory } from '../contexts/NavigationHistoryContext'

export function PartnerManagementPage() {
  const [showAddPartner, setShowAddPartner] = useState(false)
  const { addToHistory } = useNavigationHistory()

  useEffect(() => {
    addToHistory('Partners')
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <H1 className="mb-1">Partners</H1>
            <SmallText>
              Beheer de partners van de Koninklijke Loop
            </SmallText>
          </div>
          <button
            onClick={() => setShowAddPartner(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Partner Toevoegen</span>
            <span className="sm:hidden">Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <PartnersOverview />
      </div>

      {/* Modal voor nieuwe partner */}
      {showAddPartner && (
        <PartnerForm
          onComplete={() => {
            setShowAddPartner(false)
            // Hier kunnen we de lijst refreshen
          }}
          onCancel={() => setShowAddPartner(false)}
        />
      )}
    </div>
  )
} 