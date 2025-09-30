import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChatLayout } from '../../features/chat/components/ChatLayout'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export function MainLayout() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 relative overflow-hidden">
          <Header />
          <main className="p-2 sm:p-4">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-40"
        title="Open Team Chat"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <ChatLayout isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <div id="mantine-modal-root" />
    </div>
  )
}