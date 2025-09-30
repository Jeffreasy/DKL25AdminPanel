import { useState } from 'react'
import { useChat } from '../hooks/useChat'
import { Bars3Icon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface ChatWindowProps {
  onToggleSidebar: () => void
  onClose: () => void
}

export function ChatWindow({ onToggleSidebar, onClose }: ChatWindowProps) {
  const { channels, messages, activeChannelId, sendMessage, loading } = useChat()
  const [messageInput, setMessageInput] = useState('')

  const activeChannel = channels.find(c => c.id === activeChannelId)

  const handleSendMessage = () => {
    if (messageInput.trim() && activeChannelId) {
      sendMessage(activeChannelId, messageInput.trim())
      setMessageInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          {activeChannel ? (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {activeChannel.type === 'public' ? '#' : '🔒'} {activeChannel.name}
              </h3>
              {activeChannel.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeChannel.description}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Selecteer een kanaal
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kies een kanaal uit de zijbalk om te beginnen met chatten
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading.messages ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs lg:max-w-md px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              💬
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeChannel ? 'Geen berichten nog' : 'Selecteer een kanaal'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeChannel
                ? 'Wees de eerste die een bericht stuurt!'
                : 'Kies een kanaal om te beginnen met chatten'
              }
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {(message.user?.full_name || message.user?.email || '?')[0].toUpperCase()}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {message.user?.full_name || message.user?.email || 'Onbekend'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.created_at).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="text-gray-900 dark:text-white break-words">
                  {message.content}
                </div>

                {/* File attachment */}
                {message.file_url && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                        📎
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {message.file_name || 'Bijlage'}
                        </p>
                        {message.file_size && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(message.file_size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        )}
                      </div>
                      <a
                        href={message.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      {activeChannel && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Bericht naar #${activeChannel.name}...`}
              className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || loading.sending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
            >
              {loading.sending ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PaperAirplaneIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Verstuur</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}