import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService, chatRealtime } from '../services/chatService'
import type { TypingIndicator, ChatUserPresence } from '../types'

export function useChat() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<{ [channelId: string]: TypingIndicator[] }>({})
  const [userPresence, setUserPresence] = useState<{ [userId: string]: ChatUserPresence }>({})
  const queryClient = useQueryClient()

  // Fetch channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['chat-channels'],
    queryFn: chatService.getChannels,
    refetchInterval: 30000
  })

  // Fetch messages for active channel
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', activeChannelId],
    queryFn: () => activeChannelId ? chatService.getMessages(activeChannelId) : Promise.resolve([]),
    enabled: !!activeChannelId
  })

  // Fetch online users
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['chat-online-users'],
    queryFn: chatService.getOnlineUsers,
    refetchInterval: 10000
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeChannelId] })
    }
  })

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: chatService.createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] })
    }
  })

  // Join channel mutation
  const joinChannelMutation = useMutation({
    mutationFn: chatService.joinChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] })
    }
  })

  const selectChannel = (channelId: string) => {
    setActiveChannelId(channelId)
    // Mark as read
    chatService.markChannelAsRead(channelId).catch(console.error)
  }

  const sendMessage = (channelId: string, content: string) => {
    sendMessageMutation.mutate({
      channel_id: channelId,
      content
    })
  }

  const createChannel = (name: string, type: 'public' | 'private' = 'public') => {
    createChannelMutation.mutate({
      name,
      type
    })
  }

  const joinChannel = (channelId: string) => {
    joinChannelMutation.mutate(channelId)
  }

  // Typing functions
  const startTyping = useCallback((channelId: string) => {
    if (activeChannelId === channelId) {
      chatService.startTyping(channelId).catch(console.error)
    }
  }, [activeChannelId])

  const stopTyping = useCallback((channelId: string) => {
    if (activeChannelId === channelId) {
      chatService.stopTyping(channelId).catch(console.error)
    }
  }, [activeChannelId])

  // Real-time subscriptions
  useEffect(() => {
    if (!activeChannelId) return

    // Subscribe to typing indicators
    const typingSubscription = chatRealtime.subscribeToTyping(activeChannelId, (typingUsers) => {
      setTypingUsers(prev => ({
        ...prev,
        [activeChannelId]: typingUsers
      }))
    })

    // Subscribe to presence updates
    const presenceSubscription = chatRealtime.subscribeToPresence((presence) => {
      setUserPresence(prev => ({
        ...prev,
        [presence.user_id]: presence
      }))
    })

    return () => {
      typingSubscription.unsubscribe()
      presenceSubscription.unsubscribe()
    }
  }, [activeChannelId])

  return {
    // State
    channels,
    messages,
    onlineUsers,
    activeChannelId,
    typingUsers: typingUsers[activeChannelId || ''] || [],
    userPresence,
    loading: {
      channels: channelsLoading,
      messages: messagesLoading,
      sending: sendMessageMutation.isPending
    },

    // Actions
    selectChannel,
    sendMessage,
    createChannel,
    joinChannel,
    startTyping,
    stopTyping
  }
}