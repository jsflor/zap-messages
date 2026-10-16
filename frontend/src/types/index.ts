export interface Participant {
  id: string;
  conversationId: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  phoneNumber?: string;
  email?: string;
  isSelf: boolean;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  reactionType: 'heart' | 'like' | 'dislike' | 'laugh' | 'emphasize' | 'question';
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  isOutgoing: boolean;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  reactions: Reaction[];
}

export interface Conversation {
  id: string;
  title: string;
  isGroup: boolean;
  isPinned: boolean;
  lastMessageText: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  isTyping?: boolean;
}
