import { useState } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { PartnerRow, PartnerTier } from '../../../types/partner'

interface PartnerFormProps {
  partner?: PartnerRow
  onComplete: () => void
  onCancel: () => void
}

const TIER_OPTIONS: { value: PartnerTier; label: string }[] = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' }
]

export function PartnerForm({ partner, onComplete, onCancel }: PartnerFormProps) {
  const [name, setName] = useState(partner?.name || '')
  const [description, setDescription] = useState(partner?.description || '')
  const [logo, setLogo] = useState(partner?.logo || '')
  const [website, setWebsite] = useState(partner?.website || '')
  const [since, setSince] = useState(partner?.since || new Date().getFullYear().toString())
  const [tier, setTier] = useState<PartnerTier>(partner?.tier || 'bronze')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validatie
      if (!name || !logo) {
        throw new Error('Vul alle verplichte velden in')
      }

      // Valideer website URL als die is ingevuld
      if (website && !website.match(/^https?:\/\/.+/)) {
        throw new Error('Voer een geldige website URL in (begin met http:// of https://)')
      }

      // Bepaal order_number voor nieuwe partners
      let order_number = partner?.order_number
      if (!order_number) {
        const { data: partners } = await supabase
          .from('partners')
          .select('order_number')
          .order('order_number', { ascending: false })
          .limit(1)
        
        order_number = (partners?.[0]?.order_number || 0) + 1
      }

      // Update of insert partner
      const { error: dbError } = await supabase
        .from('partners')
        .upsert({
          id: partner?.id,
          name,
          description,
          logo,
          website: website || null,
          since,
          tier,
          visible: true,
          order_number,
          updated_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      onComplete()
    } catch (err) {
      console.error('Form error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {partner ? 'Partner Bewerken' : 'Nieuwe Partner'}
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Name Input */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Naam *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Beschrijving
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            {/* Logo URL Input */}
            <div>
              <label 
                htmlFor="logo" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Logo URL *
              </label>
              <input
                type="url"
                id="logo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                required
              />
            </div>

            {/* Website Input */}
            <div>
              <label 
                htmlFor="website" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="https://"
              />
            </div>

            {/* Since Input */}
            <div>
              <label 
                htmlFor="since" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Partner sinds
              </label>
              <input
                type="text"
                id="since"
                value={since}
                onChange={(e) => setSince(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder={new Date().getFullYear().toString()}
              />
            </div>

            {/* Tier Select */}
            <div>
              <label 
                htmlFor="tier" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Niveau
              </label>
              <select
                id="tier"
                value={tier}
                onChange={(e) => setTier(e.target.value as PartnerTier)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                {TIER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              disabled={loading}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Bezig...' : partner ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 