import { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { fetchAanmeldingen } from '../features/aanmeldingen/services/aanmeldingenService'
import { fetchMessages, getContactStats } from '../features/contact/services/messageService'
import type { Aanmelding } from '../features/aanmeldingen/types'
import type { ContactMessage, ContactStats } from '../features/contact/types'

interface DashboardStats {
  totaal: number
  rollen: Record<string, number>
  afstanden: Record<string, number>
  ondersteuning: Record<string, number>
}

const tabs = [
  { id: 'overzicht', label: 'Volledig overzicht', path: '/dashboard' },
  { id: 'aanmeldingen', label: 'Aanmeldingen', path: '/dashboard/aanmeldingen' },
  { id: 'contact', label: 'Contact', path: '/dashboard/contact' },
  { id: 'inbox', label: 'Email Inbox', path: '/dashboard/inbox' }
]

export function DashboardPage() {
  const location = useLocation()
  const [stats, setStats] = useState<DashboardStats>({
    totaal: 0,
    rollen: {},
    afstanden: {},
    ondersteuning: {}
  })
  
  const [contactStats, setContactStats] = useState<ContactStats>({
    counts: { 
      total: 0, 
      new: 0,
      inProgress: 0,
      handled: 0 
    },
    avgResponseTime: 0,
    messagesByPeriod: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  })

  const [aanmeldingen, setAanmeldingen] = useState<Aanmelding[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])

  const loadStats = useCallback(async () => {
    try {
      const { data, error } = await fetchAanmeldingen()
      if (error) throw error
      
      const newStats: DashboardStats = {
        totaal: data.length,
        rollen: {
          Deelnemer: data.filter(i => i.rol === 'Deelnemer').length,
          Begeleider: data.filter(i => i.rol === 'Begeleider').length,
          Vrijwilliger: data.filter(i => i.rol === 'Vrijwilliger').length
        },
        afstanden: {
          '2.5 KM': data.filter(i => i.afstand === '2.5 KM').length,
          '6 KM': data.filter(i => i.afstand === '6 KM').length,
          '10 KM': data.filter(i => i.afstand === '10 KM').length,
          '15 KM': data.filter(i => i.afstand === '15 KM').length
        },
        ondersteuning: {
          Ja: data.filter(i => i.ondersteuning === 'Ja').length,
          Nee: data.filter(i => i.ondersteuning === 'Nee').length,
          Anders: data.filter(i => i.ondersteuning === 'Anders').length
        }
      }
      
      setStats(newStats)
      setAanmeldingen(data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }, [])

  const loadMessages = useCallback(async () => {
    try {
      const [messagesResult, statsResult] = await Promise.all([
        fetchMessages(),
        getContactStats()
      ])
      
      if (messagesResult.error) throw messagesResult.error
      if (statsResult.error) throw statsResult.error
      
      setMessages(messagesResult.data)
      if (statsResult.data) {
        setContactStats(statsResult.data)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }, [])

  useEffect(() => {
    loadStats()
    loadMessages()
  }, [loadStats, loadMessages])

  const handleUpdate = useCallback(() => {
    loadStats()
    loadMessages()
  }, [loadStats, loadMessages])

  const currentPath = location.pathname

  return (
    <div className="space-y-6">
      {/* Tab navigatie */}
      <div className="bg-white shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4">
            {tabs.map(tab => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) => `
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive 
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                end={tab.path === '/dashboard'}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Alleen statistieken tonen op de overzicht pagina */}
      {currentPath === '/dashboard' && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aanmeldingen
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totaal}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Berichten
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {contactStats.counts.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Nieuwe berichten
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {contactStats.counts.new}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Gem. reactietijd
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round(contactStats.avgResponseTime)} min
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content voor de huidige tab */}
      <Outlet context={{ 
        stats,
        contactStats,
        aanmeldingen,
        messages,
        handleUpdate 
      }} />
    </div>
  )
}