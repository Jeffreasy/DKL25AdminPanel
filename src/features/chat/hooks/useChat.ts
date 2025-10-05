import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService, chatRealtime } from '../services/chatService'
import type { CreateChannelRequest, TypingIndicator, ChatUserPresence, ChatChannel, ChannelWithDetails } from '../types'
import { authManager } from '../../../lib/auth'
import { connectWebSocket } from '../services/chatService'

export function useChat() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<{ [channelId: string]: TypingIndicator[] }>({})
  const [userPresence, setUserPresence] = useState<{ [userId: string]: ChatUserPresence }>({})
  const queryClient = useQueryClient()

  // WebSocket connection - only when we have an active channel
  useEffect(() => {
    if (!activeChannelId) return

    const token = authManager.getToken()
    if (!token) return

    const localWs = connectWebSocket(token, activeChannelId)
    return () => {
      localWs.close()
      // Update presence to offline when disconnecting
      chatService.updatePresence('offline').catch(console.error)
    }
  }, [activeChannelId])

  // Update presence to online when authenticated and first loaded
  useEffect(() => {
    const token = authManager.getToken()
    if (token) {
      // Mark user as online on app load
      chatService.updatePresence('online').catch(console.error)
    }
  }, [])

  // Fetch channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['chat-channels'],
    queryFn: chatService.getChannels,
    refetchInterval: 30000
  })

  const { data: publicChannels = [] } = useQuery({
    queryKey: ['public-channels'],
    queryFn: chatService.getPublicChannels,
    refetchInterval: 30000
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['chat-all-users'],
    queryFn: chatService.getAllUsers,
    refetchInterval: 60000
  })

  const { data: participants = [] } = useQuery({
    queryKey: ['channel-participants', activeChannelId],
    queryFn: () => chatService.getChannelParticipants(activeChannelId!),
    enabled: !!activeChannelId
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
  onSuccess: async (newChannel) => {
    queryClient.setQueryData(['chat-channels'], (old: ChannelWithDetails[] | undefined) => [
      ...(old || []),
      { ...newChannel, participants: [], participant_count: 0, unread_count: 0, last_message: undefined }
    ]);
    await joinChannelMutation.mutateAsync(newChannel.id);
    setActiveChannelId(newChannel.id)
  }
})


  // Join channel mutation
  const joinChannelMutation = useMutation({
    mutationFn: chatService.joinChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] })
    }
  })

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: ({messageId, content}: {messageId: string, content: string}) =>
      chatService.editMessage(messageId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeChannelId] })
    }
  })

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: chatService.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeChannelId] })
    }
  })

  const createDirectChannelMutation = useMutation({
    mutationFn: chatService.createDirectChannel,
    onSuccess: (newChannel) => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] })
      setActiveChannelId(newChannel.id)
    }
  })

  const inviteUserToChannelMutation = useMutation({
    mutationFn: ({userId}: {userId: string}) => chatService.inviteUserToChannel(activeChannelId!, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channel-participants', activeChannelId] })
  })

const selectChannel = async (channelId: string) => {
  const isJoined = channels.some(c => c.id === channelId);
  if (!isJoined) {
    await joinChannelMutation.mutateAsync(channelId);
  }
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

  const createChannel = (request: CreateChannelRequest) => {
    createChannelMutation.mutate(request)
  }

  const joinChannel = (channelId: string) => {
    joinChannelMutation.mutate(channelId)
  }

  const createDirectChannel = (userId: string) => {
    createDirectChannelMutation.mutate(userId)
  }

  const inviteUserToChannel = (userId: string) => {
    inviteUserToChannelMutation.mutate({userId})
  }

  const editMessage = (messageId: string, content: string) => {
    editMessageMutation.mutate({messageId, content})
  }

  const deleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate(messageId)
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
    publicChannels,
    messages,
    onlineUsers,
    allUsers,
    participants,
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
    createDirectChannel,
    inviteUserToChannel,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping
  }
}
