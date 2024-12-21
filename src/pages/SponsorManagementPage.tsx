import { useState } from 'react'
import { H1, SmallText } from '../components/typography'
import { SponsorGrid, SponsorForm } from '../features/sponsors/components'

export function SponsorManagementPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <H1 className="mb-1">Sponsors</H1>
            <SmallText>
              Beheer de sponsors van de Koninklijke Loop
            </SmallText>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nieuwe sponsor
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <SponsorGrid key={refreshKey} />
      </div>

      {/* Form Modal */}
      {showForm && (
        <SponsorForm
          onComplete={() => {
            setShowForm(false)
            setRefreshKey(prev => prev + 1)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 