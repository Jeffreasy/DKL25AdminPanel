import { createContext, useContext } from 'react'
import { useChat as useChatHook } from './hooks/useChat'

const ChatContext = createContext<ReturnType<typeof useChatHook> | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChatHook()
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
