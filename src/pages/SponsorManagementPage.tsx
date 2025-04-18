import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography'
import { SponsorGrid } from '../features/sponsors/components'
import { SponsorForm } from '../features/sponsors/components/SponsorForm'
import { useNavigationHistory } from '../contexts/navigation/useNavigationHistory'
import { cc } from '../styles/shared'

export function SponsorManagementPage() {
  const [showForm, setShowForm] = useState(false)
  const { addToHistory } = useNavigationHistory()

  useEffect(() => {
    addToHistory('Sponsors')
  }, [addToHistory])

  return (
    <div className="space-y-6">
      {/* Header - Adapted for dark mode */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            {/* H1 and SmallText now use dark variants internally */}
            <H1 className="mb-1">Sponsors</H1>
            <SmallText>
              Beheer de sponsors van de Koninklijke Loop
            </SmallText>
          </div>
          {/* Button now uses dark variants from shared classes */}
          <button
            onClick={() => setShowForm(true)}
            className={cc.button.base({ color: 'primary', className: "flex items-center gap-2" })}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Sponsor Toevoegen</span>
            <span className="sm:hidden">Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Content - Adapted for dark mode */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
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