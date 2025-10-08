import { useEffect, useState } from 'react'
import { fetchNewsletters } from '../services/newsletterService'
import type { Newsletter } from '../types'
import { cc } from '../../../styles/shared'
import { formatDistanceToNow, format } from 'date-fns'
import { nl } from 'date-fns/locale'

export function NewsletterHistory() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNewsletters = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { newsletters: data } = await fetchNewsletters()
      // Filter only sent newsletters
      const sentNewsletters = data.filter(n => n.sent_at)
      setNewsletters(sentNewsletters)
    } catch (err) {
      console.error('Error fetching newsletters:', err)
      setError('Fout bij het ophalen van verzonden nieuwsbrieven.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNewsletters()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    )
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verzonden Nieuwsbrieven</h2>

      {newsletters.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Geen verzonden nieuwsbrieven gevonden.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Onderwerp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Verzonden op
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aangemaakt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {newsletters.map((newsletter) => (
                <tr key={newsletter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {newsletter.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {newsletter.sent_at ? (
                      <>
                        <div>{format(new Date(newsletter.sent_at), 'dd-MM-yyyy HH:mm', { locale: nl })}</div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(newsletter.sent_at), { addSuffix: true, locale: nl })}
                        </div>
                      </>
                    ) : (
                      'Onbekend'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDistanceToNow(new Date(newsletter.created_at), { addSuffix: true, locale: nl })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}