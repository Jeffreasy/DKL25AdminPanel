import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography/typography'
import { NewsletterList } from '../features/newsletter/components/NewsletterList'
import { NewsletterHistory } from '../features/newsletter/components/NewsletterHistory'
import { NewsletterEditor } from '../features/newsletter/components/NewsletterEditor'
import type { Newsletter, CreateNewsletterData } from '../features/newsletter/types'
import { createNewsletter, updateNewsletter } from '../features/newsletter/services/newsletterService'
import { useNavigationHistory } from '../features/navigation'
import { usePermissions } from '../hooks/usePermissions'
import { cc } from '../styles/shared'
import { toast } from 'react-hot-toast'

export function NewsletterManagementPage() {
  const { hasPermission } = usePermissions()
  const [activeTab, setActiveTab] = useState<'newsletters' | 'history'>('newsletters')
  const [showForm, setShowForm] = useState(false)
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | undefined>()
  const { addToHistory } = useNavigationHistory()

  const canReadNewsletter = hasPermission('newsletter', 'read')
  const canWriteNewsletter = hasPermission('newsletter', 'write')

  useEffect(() => {
    addToHistory('Nieuwsbrieven')
  }, [addToHistory])

  if (!canReadNewsletter) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Geen Toegang</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Je hebt geen toestemming om nieuwsbrieven te beheren.
          </p>
        </div>
      </div>
    )
  }

  const handleCreate = () => {
    setEditingNewsletter(undefined)
    setShowForm(true)
  }

  const handleEdit = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter)
    setShowForm(true)
  }

  const handleFormComplete = async (data: CreateNewsletterData) => {
    try {
      if (editingNewsletter) {
        await updateNewsletter(editingNewsletter.id, data)
        toast.success('Nieuwsbrief succesvol bijgewerkt.')
      } else {
        await createNewsletter(data)
        toast.success('Nieuwsbrief succesvol aangemaakt.')
      }
      setShowForm(false)
      setEditingNewsletter(undefined)
      // The list components will refresh themselves
    } catch (error) {
      console.error('Error saving newsletter:', error)
      toast.error('Fout bij het opslaan van de nieuwsbrief.')
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingNewsletter(undefined)
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6 flex justify-between items-center`}>
          <div>
            <H1 className="mb-1">Nieuwsbrieven</H1>
            <SmallText>
              Beheer en verzend nieuwsbrieven • E-mails worden verzonden vanaf nieuwsbrief@dekoninklijkeloop.nl
            </SmallText>
          </div>
          {activeTab === 'newsletters' && canWriteNewsletter && (
            <button
              onClick={handleCreate}
              className={cc.button.base({ color: 'primary', className: `flex items-center ${cc.spacing.gap.sm}` })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nieuwsbrief Aanmaken</span>
              <span className="sm:hidden">Aanmaken</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-full">
          <button
            onClick={() => setActiveTab('newsletters')}
            className={`flex-1 ${cc.spacing.px.sm} ${cc.spacing.py.sm} text-sm font-medium rounded-md ${cc.transition.colors} ${
              activeTab === 'newsletters'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Nieuwsbrieven
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 ${cc.spacing.px.sm} ${cc.spacing.py.sm} text-sm font-medium rounded-md ${cc.transition.colors} ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Geschiedenis
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={cc.spacing.container.md}>
          {activeTab === 'newsletters' ? (
            <NewsletterList onEdit={handleEdit} onCreate={handleCreate} />
          ) : (
            <NewsletterHistory />
          )}
        </div>
      </div>

      {/* Modal for form */}
      {showForm && (
        <NewsletterEditor
          newsletter={editingNewsletter}
          onComplete={handleFormComplete}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}