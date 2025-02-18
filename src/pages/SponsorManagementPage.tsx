import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography'
import { SponsorGrid } from '../features/sponsors/components'
import { SponsorForm } from '../features/sponsors/components/SponsorForm'
import { useNavigationHistory } from '../contexts/navigation/useNavigationHistory'

export function SponsorManagementPage() {
  const [showForm, setShowForm] = useState(false)
  const { addToHistory } = useNavigationHistory()

  useEffect(() => {
    addToHistory('Sponsors')
  }, [addToHistory])

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Sponsor Toevoegen</span>
            <span className="sm:hidden">Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <SponsorGrid />
      </div>

      {/* Modal voor nieuwe sponsor */}
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