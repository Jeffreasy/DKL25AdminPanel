import { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { fetchAanmeldingen } from '../features/aanmeldingen/services/aanmeldingenService'
import { fetchMessages, getContactStats } from '../features/contact/services/messageService'
import type { Aanmelding } from '../features/aanmeldingen/types'
import type { ContactMessage, ContactStats } from '../features/contact/types'
import { UserManagementPage } from './UserManagementPage'

interface DashboardStats {
  totaal: number
  rollen: Record<string, number>
  afstanden: Record<string, number>
  ondersteuning: Record<string, number>
}

const tabs = [
  { id: 'overzicht', label: 'Volledig overzicht', path: '' },
  { id: 'aanmeldingen', label: 'Aanmeldingen', path: 'aanmeldingen' },
  { id: 'contact', label: 'Contact', path: 'contact' },
  { id: 'inbox', label: 'Email Inbox', path: 'inbox' },
  { id: 'users', label: 'Gebruikers', path: 'users' }
]

export function DashboardPage() {
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
      const { data, error } = await fetchAanmeldingen(100, 0)
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

  return (
    <div className="space-y-6">
      {/* Tab navigatie - Adjusted for dark mode */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-4 overflow-x-auto">
            {tabs.map(tab => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) => `
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive 
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                end={tab.path === ''}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Content voor de huidige tab (Outlet) */}
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
