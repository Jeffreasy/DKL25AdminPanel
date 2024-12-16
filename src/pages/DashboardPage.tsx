import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/supabaseClient'

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

interface OndersteuningDetail {
  naam: string
  bijzonderheden: string
  email: string
  telefoon: string | null
  rol: string
  afstand: string
}

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('berichten')
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [inschrijvingen, setInschrijvingen] = useState<Inschrijving[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedType, setSelectedType] = useState<'Ja' | 'Anders' | null>(null)
  const [detailsData, setDetailsData] = useState<OndersteuningDetail[]>([])

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

  const handleShowDetails = (type: 'Ja' | 'Anders') => {
    const details = inschrijvingen
      .filter(i => i.ondersteuning === type && i.bijzonderheden)
      .map(i => ({
        naam: i.naam,
        bijzonderheden: i.bijzonderheden,
        email: i.email,
        telefoon: i.telefoon,
        rol: i.rol,
        afstand: i.afstand
      }))
    
    setDetailsData(details)
    setSelectedType(type)
    setShowDetailsModal(true)
  }

  const MessagesTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          {messages.filter(m => m.status === 'ongelezen').length} ongelezen berichten
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {messages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Geen contactberichten gevonden
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id}
                className={`p-6 ${message.status === 'gelezen' ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {message.naam}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {message.email} {message.telefoon && `• ${message.telefoon}`}
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      {message.bericht}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(message.aangemaakt_op).toLocaleString('nl-NL')}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMessageRead(message.id, message.status)}
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      message.status === 'gelezen'
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {message.status === 'gelezen' ? 'Gelezen' : 'Markeer als gelezen'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const InschrijvingenTab = () => {
    const stats = {
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
    }

    return (
      <div>
        {/* Statistieken Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-yellow-600">Nieuw</span>
                <span className="font-medium">{stats.status.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Goedgekeurd</span>
                <span className="font-medium">{stats.status.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Afgewezen</span>
                <span className="font-medium">{stats.status.rejected}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Rollen</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Deelnemers</span>
                <span className="font-medium">{stats.rollen.Deelnemer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Begeleiders</span>
                <span className="font-medium">{stats.rollen.Begeleider}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Vrijwilligers</span>
                <span className="font-medium">{stats.rollen.Vrijwilliger}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Afstanden</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>2.5 KM</span>
                <span className="font-medium">{stats.afstanden['2.5 KM']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>6 KM</span>
                <span className="font-medium">{stats.afstanden['6 KM']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>10 KM</span>
                <span className="font-medium">{stats.afstanden['10 KM']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>15 KM</span>
                <span className="font-medium">{stats.afstanden['15 KM']}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Ondersteuning</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleShowDetails('Ja')}
                className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors"
              >
                <span>Nodig</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.ondersteuning.Ja}</span>
                  {stats.ondersteuning.Ja > 0 && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
              
              <div className="flex justify-between items-center p-2">
                <span>Niet nodig</span>
                <span className="font-medium">{stats.ondersteuning.Nee}</span>
              </div>

              <button
                onClick={() => handleShowDetails('Anders')}
                className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors"
              >
                <span>Anders</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.ondersteuning.Anders}</span>
                  {stats.ondersteuning.Anders > 0 && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Details {selectedType === 'Ja' ? 'Ondersteuning Nodig' : 'Andere Ondersteuning'}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
                <div className="space-y-4">
                  {detailsData.map((detail, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{detail.naam}</h4>
                        <span className="text-sm text-gray-500">{detail.rol}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {detail.email} {detail.telefoon && `• ${detail.telefoon}`}
                      </div>
                      <div className="text-sm mb-2">
                        <span className="font-medium">Afstand:</span> {detail.afstand}
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {detail.bijzonderheden}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            {inschrijvingen.filter(i => i.status === 'pending').length} nieuwe inschrijvingen
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {inschrijvingen.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Geen inschrijvingen gevonden
              </div>
            ) : (
              inschrijvingen.map((inschrijving) => (
                <div 
                  key={inschrijving.id}
                  className={`p-6 ${
                    inschrijving.status === 'pending' 
                      ? 'bg-yellow-50' 
                      : inschrijving.status === 'approved'
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {inschrijving.naam}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        {inschrijving.email} {inschrijving.telefoon && `• ${inschrijving.telefoon}`}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Rol:</span> {inschrijving.rol}
                        </div>
                        <div>
                          <span className="font-medium">Afstand:</span> {inschrijving.afstand}
                        </div>
                        <div>
                          <span className="font-medium">Ondersteuning:</span> {inschrijving.ondersteuning}
                        </div>
                      </div>
                      {inschrijving.bijzonderheden && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Bijzonderheden:</span> {inschrijving.bijzonderheden}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(inschrijving.created_at).toLocaleString('nl-NL')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {inschrijving.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateInschrijvingStatus(inschrijving.id, 'approved')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200"
                          >
                            Goedkeuren
                          </button>
                          <button
                            onClick={() => updateInschrijvingStatus(inschrijving.id, 'rejected')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200"
                          >
                            Afwijzen
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center p-8">Laden...</div>

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('berichten')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'berichten'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Berichten
          </button>
          <button
            onClick={() => setActiveTab('inschrijvingen')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inschrijvingen'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inschrijvingen
          </button>
        </nav>
      </div>

      {activeTab === 'berichten' ? <MessagesTab /> : <InschrijvingenTab />}
    </div>
  )
} 