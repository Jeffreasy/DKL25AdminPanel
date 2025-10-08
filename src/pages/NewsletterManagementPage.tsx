import { useState, useEffect } from 'react'
import { H1, SmallText } from '../components/typography/typography'
import { NewsletterList } from '../features/newsletter/components/NewsletterList'
import { NewsletterHistory } from '../features/newsletter/components/NewsletterHistory'
import { NewsletterEditor } from '../features/newsletter/components/NewsletterEditor'
import type { Newsletter, CreateNewsletterData } from '../features/newsletter/types'
import { createNewsletter, updateNewsletter } from '../features/newsletter/services/newsletterService'
import { useNavigationHistory } from '../features/navigation'
import { cc } from '../styles/shared'
import { toast } from 'react-hot-toast'

export function NewsletterManagementPage() {
  const [activeTab, setActiveTab] = useState<'newsletters' | 'history'>('newsletters')
  const [showForm, setShowForm] = useState(false)
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | undefined>()
  const { addToHistory } = useNavigationHistory()

  useEffect(() => {
    addToHistory('Nieuwsbrieven')
  }, [addToHistory])

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
          {activeTab === 'newsletters' && (
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