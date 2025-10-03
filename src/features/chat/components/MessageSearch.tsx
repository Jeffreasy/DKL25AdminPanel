import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { chatService } from '../services/chatService'
import type { MessageSearchResult } from '../types'

interface MessageSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelectMessage?: (message: MessageSearchResult) => void
}

export function MessageSearch({ isOpen, onClose, onSelectMessage }: MessageSearchProps) {
  const [query, setQuery] = useState('')

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['chat-search', query],
    queryFn: () => chatService.searchMessages(query),
    enabled: query.length > 2,
    staleTime: 30000
  })

  const handleSelectMessage = (message: MessageSearchResult) => {
    onSelectMessage?.(message)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Berichten zoeken
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek in berichten..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {query.length < 3 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Typ minstens 3 karakters om te zoeken</p>
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-64"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Geen berichten gevonden voor "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {(message.user_full_name || message.user_email || '?')[0].toUpperCase()}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {message.user_full_name || message.user_email}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          in #{message.channel_name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(message.created_at).toLocaleDateString('nl-NL')}
                        </span>
                      </div>

                      <div className="text-gray-700 dark:text-gray-300 line-clamp-2">
                        {message.content || (message.file_name ? `[${message.message_type}] ${message.file_name}` : '[Bericht]')}
                      </div>

                      {/* File indicator */}
                      {message.file_url && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          📎 {message.file_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}