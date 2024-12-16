import { useState } from 'react'
import { H1, SmallText } from '../components/typography'
import { PartnersOverview } from '../features/partners/PartnersOverview'
import { PartnerForm } from '../features/partners/components/PartnerForm'

export function PartnerManagementPage() {
  const [showAddPartner, setShowAddPartner] = useState(false)

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-screen-safe sm:max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <H1>Nieuwe Partner</H1>
              <button
                onClick={() => setShowAddPartner(false)}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <PartnerForm
                onComplete={() => {
                  setShowAddPartner(false)
                  // Hier kunnen we de lijst refreshen
                }}
                onCancel={() => setShowAddPartner(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 