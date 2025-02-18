import { useState, useEffect, useCallback } from 'react'
import { H1, SmallText, ErrorText } from '../components/typography'
import { OverviewTab } from '../features/dashboard/tabs/OverviewTab'
import { AanmeldingenTab } from '../features/dashboard/tabs/AanmeldingenTab'
import { ContactTab } from '../features/dashboard/tabs/ContactTab'
import { fetchAanmeldingen } from '../features/aanmeldingen/services/aanmeldingenService'
import { fetchMessages, getContactStats } from '../features/contact/services/messageService'
import type { Aanmelding } from '../features/aanmeldingen/types'
import type { ContactMessage, ContactStats } from '../features/contact/types'
import { InboxTab } from '../features/dashboard/tabs/InboxTab'

type TabType = 'overzicht' | 'aanmeldingen' | 'contact' | 'inbox'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overzicht')
  const [aanmeldingen, setAanmeldingen] = useState<Aanmelding[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [contactStats, setContactStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (activeTab === 'contact') {
        const [messagesResult, statsResult] = await Promise.all([
          fetchMessages(),
          getContactStats()
        ])
        if (messagesResult.error) throw messagesResult.error
        if (statsResult.error) throw statsResult.error
        
        setMessages(messagesResult.data)
        setContactStats(statsResult.data)
      } else {
        const { data, error } = await fetchAanmeldingen()
        if (error) throw error
        setAanmeldingen(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Er ging iets mis bij het ophalen van de gegevens'))
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  const calculateStats = () => ({
    totaal: aanmeldingen.length,
    rollen: {
      Deelnemer: aanmeldingen.filter(i => i.rol === 'Deelnemer').length,
      Begeleider: aanmeldingen.filter(i => i.rol === 'Begeleider').length,
      Vrijwilliger: aanmeldingen.filter(i => i.rol === 'Vrijwilliger').length
    },
    afstanden: {
      '2.5 KM': aanmeldingen.filter(i => i.afstand === '2.5 KM').length,
      '6 KM': aanmeldingen.filter(i => i.afstand === '6 KM').length,
      '10 KM': aanmeldingen.filter(i => i.afstand === '10 KM').length,
      '15 KM': aanmeldingen.filter(i => i.afstand === '15 KM').length
    },
    ondersteuning: {
      Ja: aanmeldingen.filter(i => i.ondersteuning === 'Ja').length,
      Nee: aanmeldingen.filter(i => i.ondersteuning === 'Nee').length,
      Anders: aanmeldingen.filter(i => i.ondersteuning === 'Anders').length
    }
  })

  const renderTabs = () => (
    <nav className="border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-start -mb-px space-x-8">
          {[
            { id: 'overzicht', name: 'Volledig overzicht' },
            { id: 'aanmeldingen', name: 'Aanmeldingen' },
            { id: 'contact', name: 'Contact' },
            { id: 'inbox', name: 'Email Inbox' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                h-full px-2 text-sm font-medium border-b-2 
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-md bg-red-50 p-3">
          <ErrorText>{error.message}</ErrorText>
        </div>
      )
    }

    switch (activeTab) {
      case 'overzicht':
        return <OverviewTab stats={calculateStats()} />
      case 'aanmeldingen':
        return <AanmeldingenTab stats={calculateStats()} aanmeldingen={aanmeldingen} onUpdate={loadData} />
      case 'contact':
        return <ContactTab stats={contactStats} messages={messages} onUpdate={loadData} />
      case 'inbox':
        return <InboxTab />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <H1>Dashboard</H1>
          <SmallText>Beheer hier alle aspecten van DKL25</SmallText>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {renderTabs()}
            <div className="mt-4">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 