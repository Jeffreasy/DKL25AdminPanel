import { useEffect, useState } from 'react'
import { PencilIcon, TrashIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { fetchNewsletters, deleteNewsletter, sendNewsletter } from '../services/newsletterService'
import type { Newsletter } from '../types'
import { getNewsletterStatus } from '../types'
import { cc } from '../../../styles/shared'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import { usePermissions } from '../../../hooks/usePermissions'
import { ConfirmDialog, EmptyState, LoadingGrid } from '../../../components/ui'

interface NewsletterListProps {
  onEdit: (newsletter: Newsletter) => void
  onCreate: () => void
}

export function NewsletterList({ onEdit, onCreate }: NewsletterListProps) {
  const { hasPermission } = usePermissions()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  })
  const [sendConfirm, setSendConfirm] = useState<{ isOpen: boolean; newsletter: Newsletter | null }>({
    isOpen: false,
    newsletter: null
  })

  const canReadNewsletters = hasPermission('newsletter', 'read')
  const canWriteNewsletters = hasPermission('newsletter', 'write')
  const canSendNewsletters = hasPermission('newsletter', 'send')
  const canDeleteNewsletters = hasPermission('newsletter', 'delete')

  const loadNewsletters = async () => {
    if (!canReadNewsletters) {
      setError('Geen toegang tot nieuwsbrieven.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { newsletters: data } = await fetchNewsletters()
      setNewsletters(data)
    } catch (err) {
      console.error('Error fetching newsletters:', err)
      setError('Fout bij het ophalen van nieuwsbrieven.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNewsletters()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      await deleteNewsletter(deleteConfirm.id)
      setNewsletters(prev => prev.filter(n => n.id !== deleteConfirm.id))
      toast.success('Nieuwsbrief succesvol verwijderd.')
    } catch (err) {
      console.error('Error deleting newsletter:', err)
      toast.error('Fout bij het verwijderen van de nieuwsbrief.')
    } finally {
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  const handleSend = (newsletter: Newsletter) => {
    setSendConfirm({ isOpen: true, newsletter })
  }

  const confirmSend = async () => {
    if (!sendConfirm.newsletter) return

    try {
      const result = await sendNewsletter(sendConfirm.newsletter.id)
      if (result.success) {
        await loadNewsletters()
        toast.success(result.message || 'Nieuwsbrief succesvol verzonden.')
      } else {
        toast.error(result.message || 'Fout bij het verzenden van de nieuwsbrief.')
      }
    } catch (err) {
      console.error('Error sending newsletter:', err)
      toast.error('Fout bij het verzenden van de nieuwsbrief.')
    } finally {
      setSendConfirm({ isOpen: false, newsletter: null })
    }
  }

  if (isLoading) {
    return <LoadingGrid count={6} variant="compact" />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-800/80 text-red-700 dark:text-red-100 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.sm}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nieuwsbrieven</h2>
        {canWriteNewsletters && (
          <button
            onClick={onCreate}
            className={cc.button.base({ color: 'primary' })}
          >
            Nieuwe Nieuwsbrief
          </button>
        )}
      </div>

      {newsletters.length === 0 ? (
        <EmptyState
          title="Geen nieuwsbrieven"
          description="Er zijn nog geen nieuwsbrieven aangemaakt. Klik op 'Nieuwe Nieuwsbrief' om te beginnen."
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Onderwerp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aangemaakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {newsletters.map((newsletter) => (
                <tr key={newsletter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {newsletter.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cc.badge({
                        color: getNewsletterStatus(newsletter) === 'sent' ? 'green' : 'orange',
                        className: 'capitalize'
                      })}
                    >
                      {getNewsletterStatus(newsletter) === 'sent' ? 'Verzonden' : 'Concept'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDistanceToNow(new Date(newsletter.created_at), { addSuffix: true, locale: nl })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {canWriteNewsletters && (
                      <button
                        onClick={() => onEdit(newsletter)}
                        className={cc.button.icon({
                          size: 'sm',
                          color: 'secondary'
                        })}
                        disabled={getNewsletterStatus(newsletter) === 'sent'}
                        title={getNewsletterStatus(newsletter) === 'sent' ? 'Verzonden nieuwsbrieven kunnen niet worden bewerkt' : 'Bewerken'}
                      >
                        <PencilIcon className="w-4 h-4 opacity-60 disabled:opacity-40" />
                      </button>
                    )}
                    {getNewsletterStatus(newsletter) === 'draft' && canSendNewsletters && (
                      <button
                        onClick={() => handleSend(newsletter)}
                        className={cc.button.icon({ size: 'sm', color: 'primary' })}
                        title="Verzenden"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                      </button>
                    )}
                    {canDeleteNewsletters && (
                      <button
                        onClick={() => handleDelete(newsletter.id)}
                        className={cc.button.iconDanger({ size: 'sm' })}
                        disabled={getNewsletterStatus(newsletter) === 'sent'}
                        title={getNewsletterStatus(newsletter) === 'sent' ? 'Verzonden nieuwsbrieven kunnen niet worden verwijderd' : 'Verwijderen'}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Nieuwsbrief verwijderen"
        message="Weet je zeker dat je deze nieuwsbrief wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        confirmText="Verwijderen"
        variant="danger"
      />

      <ConfirmDialog
        open={sendConfirm.isOpen}
        onClose={() => setSendConfirm({ isOpen: false, newsletter: null })}
        onConfirm={confirmSend}
        title="Nieuwsbrief verzenden"
        message={`Weet je zeker dat je de nieuwsbrief "${sendConfirm.newsletter?.subject}" wilt verzenden? Deze wordt naar alle abonnees gestuurd.`}
        confirmText="Verzenden"
        variant="warning"
      />
    </div>
  )
}
