import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chatService'

export function useChat() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
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

  return {
    // State
    channels,
    messages,
    onlineUsers,
    activeChannelId,
    loading: {
      channels: channelsLoading,
      messages: messagesLoading,
      sending: sendMessageMutation.isPending
    },

    // Actions
    selectChannel,
    sendMessage,
    createChannel,
    joinChannel
  }
}