import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/supabaseClient'
import { H1, SmallText, ErrorText } from '../components/typography'
import { FilterableList } from '../components/FilterableList'
import { MessageItem } from '../components/MessageItem'
import { StatisticsGrid } from '../components/StatisticsGrid'
import { RegistrationItem } from '../components/RegistrationItem'

interface ContactMessage {
  id: string
  naam: string
  email: string
  telefoon: string | null
  bericht: string
  aangemaakt_op: string
  status: 'ongelezen' | 'gelezen'
  gearchiveerd: boolean
}

interface Inschrijving {
  id: string
  created_at: string
  naam: string
  email: string
  rol: 'Deelnemer' | 'Begeleider' | 'Vrijwilliger'
  telefoon: string | null
  afstand: '2.5 KM' | '6 KM' | '10 KM' | '15 KM'
  ondersteuning: 'Nee' | 'Ja' | 'Anders'
  bijzonderheden: string
  status: 'pending' | 'approved' | 'rejected'
}

type TabType = 'berichten' | 'inschrijvingen'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('berichten')
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [inschrijvingen, setInschrijvingen] = useState<Inschrijving[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'berichten') {
      fetchMessages()
    } else {
      fetchInschrijvingen()
    }
  }, [activeTab])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_berichten')
        .select('*')
        .order('aangemaakt_op', { ascending: false })
        .eq('gearchiveerd', false)

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Er ging iets mis bij het ophalen van de berichten')
    } finally {
      setLoading(false)
    }
  }

  const toggleMessageRead = async (messageId: string, currentStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_berichten')
        .update({ 
          status: currentStatus === 'ongelezen' ? 'gelezen' : 'ongelezen' 
        })
        .eq('id', messageId)

      if (error) throw error
      
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: currentStatus === 'ongelezen' ? 'gelezen' : 'ongelezen' } 
          : msg
      ))
    } catch (err) {
      console.error('Error updating message:', err)
      setError('Er ging iets mis bij het bijwerken van het bericht')
    }
  }

  const fetchInschrijvingen = async () => {
    try {
      const { data, error } = await supabase
        .from('inschrijvingen')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInschrijvingen(data || [])
    } catch (err) {
      console.error('Error fetching inschrijvingen:', err)
      setError('Er ging iets mis bij het ophalen van de inschrijvingen')
    } finally {
      setLoading(false)
    }
  }

  const updateInschrijvingStatus = async (id: string, newStatus: Inschrijving['status']) => {
    try {
      const { error } = await supabase
        .from('inschrijvingen')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      setInschrijvingen(inschrijvingen.map(inschrijving => 
        inschrijving.id === id ? { ...inschrijving, status: newStatus } : inschrijving
      ))
    } catch (err) {
      console.error('Error updating inschrijving:', err)
      setError('Er ging iets mis bij het bijwerken van de inschrijving')
    }
  }

  const calculateStats = () => ({
    totaal: inschrijvingen.length,
    status: {
      pending: inschrijvingen.filter(i => i.status === 'pending').length,
      approved: inschrijvingen.filter(i => i.status === 'approved').length,
      rejected: inschrijvingen.filter(i => i.status === 'rejected').length
    },
    rollen: {
      Deelnemer: inschrijvingen.filter(i => i.rol === 'Deelnemer').length,
      Begeleider: inschrijvingen.filter(i => i.rol === 'Begeleider').length,
      Vrijwilliger: inschrijvingen.filter(i => i.rol === 'Vrijwilliger').length
    },
    afstanden: {
      '2.5 KM': inschrijvingen.filter(i => i.afstand === '2.5 KM').length,
      '6 KM': inschrijvingen.filter(i => i.afstand === '6 KM').length,
      '10 KM': inschrijvingen.filter(i => i.afstand === '10 KM').length,
      '15 KM': inschrijvingen.filter(i => i.afstand === '15 KM').length
    },
    ondersteuning: {
      Ja: inschrijvingen.filter(i => i.ondersteuning === 'Ja').length,
      Nee: inschrijvingen.filter(i => i.ondersteuning === 'Nee').length,
      Anders: inschrijvingen.filter(i => i.ondersteuning === 'Anders').length
    }
  })

  const stats = calculateStats()

  const MessagesTab = () => (
    <FilterableList
      title="Berichten"
      table="contact_berichten"
      queryKey="messages"
      filters={{ gearchiveerd: false }}
      sortOptions={[
        { label: 'Nieuwste eerst', value: { column: 'aangemaakt_op', ascending: false } },
        { label: 'Oudste eerst', value: { column: 'aangemaakt_op', ascending: true } }
      ]}
      renderItem={(message) => (
        <MessageItem
          message={message as ContactMessage}
          onToggleRead={toggleMessageRead}
        />
      )}
    />
  )

  const InschrijvingenTab = () => {
    return (
      <>
        <StatisticsGrid stats={stats} />
        <FilterableList
          title="Inschrijvingen"
          table="inschrijvingen"
          queryKey="registrations"
          sortOptions={[
            { label: 'Nieuwste eerst', value: { column: 'created_at', ascending: false } },
            { label: 'Oudste eerst', value: { column: 'created_at', ascending: true } }
          ]}
          renderItem={(registration) => (
            <RegistrationItem
              registration={registration as Inschrijving}
              onStatusUpdate={updateInschrijvingStatus}
            />
          )}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header met tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <H1 className="mb-1">Dashboard</H1>
          <SmallText>
            Beheer berichten en inschrijvingen
          </SmallText>
        </div>
        
        {/* Tabs - nu meer zichtbaar en klikbaar */}
        <div className="border-b border-gray-200">
          <nav className="px-4 sm:px-6 flex space-x-8">
            <button
              onClick={() => setActiveTab('berichten')}
              className={`py-4 px-1 relative inline-flex items-center gap-2 ${
                activeTab === 'berichten'
                  ? 'border-b-2 border-indigo-500'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <span className={`text-sm font-medium ${
                activeTab === 'berichten'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                Berichten
              </span>
              {messages.filter(m => m.status === 'ongelezen').length > 0 && (
                <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                  {messages.filter(m => m.status === 'ongelezen').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inschrijvingen')}
              className={`py-4 px-1 relative inline-flex items-center gap-2 ${
                activeTab === 'inschrijvingen'
                  ? 'border-b-2 border-indigo-500'
                  : 'border-b-2 border-transparent'
              }`}
            >
              <span className={`text-sm font-medium ${
                activeTab === 'inschrijvingen'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                Inschrijvingen
              </span>
              {inschrijvingen.filter(i => i.status === 'pending').length > 0 && (
                <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                  {inschrijvingen.filter(i => i.status === 'pending').length} nieuw
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <ErrorText>{error}</ErrorText>
                </div>
              </div>
            </div>
          )}

          {/* Tab content */}
          <div className="space-y-6">
            {activeTab === 'berichten' ? (
              <MessagesTab />
            ) : (
              <InschrijvingenTab />
            )}
          </div>
        </>
      )}
    </div>
  )
} 