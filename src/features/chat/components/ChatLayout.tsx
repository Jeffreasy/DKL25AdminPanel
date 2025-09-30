import { useState } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { ChatWindow } from './ChatWindow'

interface ChatLayoutProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatLayout({ isOpen, onClose }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div className="relative ml-auto w-full max-w-4xl h-full bg-white dark:bg-gray-800 shadow-2xl flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <ChatSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  )
}