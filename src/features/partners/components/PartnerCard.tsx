import { useState } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { H3, SmallText } from '../../../components/typography'
import { PartnerForm } from './PartnerForm'
import type { Database } from '../../../types/supabase'

type Partner = Database['public']['Tables']['partners']['Row']

interface PartnerCardProps {
  partner: Partner
  onUpdate: () => void
}

export function PartnerCard({ partner, onUpdate }: PartnerCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const toggleVisibility = async () => {
    try {
      setIsUpdating(true)
      const { error } = await supabase
        .from('partners')
        .update({ visible: !partner.visible })
        .eq('id', partner.id)

      if (error) throw error
      onUpdate()
    } catch (err) {
      console.error('Error updating partner:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const getTierColor = (tier: Partner['tier']) => {
    switch (tier) {
      case 'gold':
        return 'text-yellow-600 bg-yellow-50'
      case 'silver':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-amber-700 bg-amber-50'
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Logo */}
          <div className="aspect-video w-full bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {partner.logo ? (
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="w-full h-full object-contain p-2"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-logo.png'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <H3>{partner.name}</H3>
                {partner.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {partner.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(partner.tier)}`}>
                  {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
                </span>
                <button
                  onClick={toggleVisibility}
                  disabled={isUpdating}
                  className={`p-2 rounded-full transition-colors ${
                    partner.visible
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={partner.visible ? 'Partner is zichtbaar' : 'Partner is verborgen'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {partner.visible ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website bezoeken
                  </a>
                )}
                <SmallText>
                  Partner sinds: {new Date(partner.since).toLocaleDateString('nl-NL')}
                </SmallText>
              </div>
              <SmallText>
                Volgorde: {partner.order_number}
              </SmallText>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-screen-safe sm:max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <H3>Partner Bewerken</H3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <PartnerForm
                partner={partner}
                onComplete={() => {
                  setShowEdit(false)
                  onUpdate()
                }}
                onCancel={() => setShowEdit(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
} 