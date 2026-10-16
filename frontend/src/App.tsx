import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { Transcript } from './components/Transcript';
import { MessageInput } from './components/MessageInput';
import { Conversation, Message } from './types';
import { ReactionType } from './components/TapbackPicker';
import { usePlatform } from './hooks/usePlatform';

// Initial sample data replicating native macOS Messages
const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Sophie Miller',
    isGroup: false,
    isPinned: true,
    lastMessageText: 'Are we still meeting at 3 PM?',
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [
      {
        id: 'p-1',
        conversationId: 'conv-1',
        userId: 'u-sophie',
        name: 'Sophie Miller',
        phoneNumber: '+1 (555) 234-5678',
        isSelf: false,
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Engineering Team',
    isGroup: true,
    isPinned: true,
    lastMessageText: 'Wails v3 multiplatform builds are looking great! 🚀',
    lastMessageAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isTyping: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [
      {
        id: 'p-2',
        conversationId: 'conv-2',
        userId: 'u-alex',
        name: 'Alex Rivera',
        isSelf: false,
      },
      {
        id: 'p-3',
        conversationId: 'conv-2',
        userId: 'u-jordan',
        name: 'Jordan Lee',
        isSelf: false,
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'David Chen',
    isGroup: false,
    isPinned: false,
    lastMessageText: 'Sounds good, talk to you tomorrow.',
    lastMessageAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [
      {
        id: 'p-4',
        conversationId: 'conv-3',
        userId: 'u-david',
        name: 'David Chen',
        phoneNumber: '+1 (555) 876-5432',
        isSelf: false,
      },
    ],
  },
];

const initialMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      senderId: 'self',
      senderName: 'You',
      text: 'Hey Sophie! Did you get a chance to look at the new design spec?',
      isOutgoing: true,
      status: 'delivered',
      sentAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      reactions: [
        {
          id: 'r-1',
          messageId: 'm-1',
          userId: 'u-sophie',
          reactionType: 'like',
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      senderId: 'u-sophie',
      senderName: 'Sophie Miller',
      text: 'Yes! It looks super clean, exactly like native Messages on macOS.',
      isOutgoing: false,
      status: 'read',
      sentAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      reactions: [],
    },
    {
      id: 'm-3',
      conversationId: 'conv-1',
      senderId: 'u-sophie',
      senderName: 'Sophie Miller',
      text: 'Are we still meeting at 3 PM?',
      isOutgoing: false,
      status: 'read',
      sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      reactions: [],
    },
  ],
  'conv-2': [
    {
      id: 'm-4',
      conversationId: 'conv-2',
      senderId: 'u-alex',
      senderName: 'Alex Rivera',
      text: 'Team, the Wails v3 beta builds are compiling across macOS, Linux, and iOS!',
      isOutgoing: false,
      status: 'read',
      sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      reactions: [
        {
          id: 'r-2',
          messageId: 'm-4',
          userId: 'self',
          reactionType: 'heart',
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'm-5',
      conversationId: 'conv-2',
      senderId: 'self',
      senderName: 'You',
      text: 'Wails v3 multiplatform builds are looking great! 🚀',
      isOutgoing: true,
      status: 'read',
      sentAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      reactions: [],
    },
  ],
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>('conv-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile } = usePlatform();

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const activeMessages = selectedId ? messagesMap[selectedId] || [] : [];

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    // Mark as read locally
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    );
  };

  const handleSendMessage = (text: string) => {
    if (!selectedId) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      conversationId: selectedId,
      senderId: 'self',
      senderName: 'You',
      text,
      isOutgoing: true,
      status: 'sent',
      sentAt: new Date().toISOString(),
      reactions: [],
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessageText: text,
              lastMessageAt: newMessage.sentAt,
            }
          : c,
      ),
    );
  };

  const handleAddReaction = (messageId: string, type: ReactionType) => {
    if (!selectedId) return;
    setMessagesMap((prev) => {
      const msgs = prev[selectedId] || [];
      return {
        ...prev,
        [selectedId]: msgs.map((m) => {
          if (m.id === messageId) {
            const reactions = m.reactions.filter((r) => r.userId !== 'self');
            return {
              ...m,
              reactions: [
                ...reactions,
                {
                  id: `r-${Date.now()}`,
                  messageId,
                  userId: 'self',
                  reactionType: type,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          }
          return m;
        }),
      };
    });
  };

  const handleRemoveReaction = (messageId: string, _type: ReactionType) => {
    if (!selectedId) return;
    setMessagesMap((prev) => {
      const msgs = prev[selectedId] || [];
      return {
        ...prev,
        [selectedId]: msgs.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              reactions: m.reactions.filter((r) => r.userId !== 'self'),
            };
          }
          return m;
        }),
      };
    });
  };

  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-imessage-bg-light dark:bg-imessage-bg-dark font-sans select-none">
      {/* Sidebar: Shown on desktop always; on mobile only when no conversation is selected */}
      {(!isMobile || !selectedId) && (
        <Sidebar
          conversations={filteredConversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          onNewMessage={() => {
            const newId = `conv-${Date.now()}`;
            const newConv: Conversation = {
              id: newId,
              title: 'New Conversation',
              isGroup: false,
              isPinned: false,
              lastMessageText: '',
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              participants: [],
            };
            setConversations([newConv, ...conversations]);
            setSelectedId(newId);
          }}
          onSearch={setSearchQuery}
        />
      )}

      {/* Main Transcript Pane: Shown on desktop always; on mobile only when a conversation is selected */}
      {(!isMobile || selectedId) && (
        <main className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden relative">
          {selectedConversation ? (
            <>
              <ChatHeader
                conversation={selectedConversation}
                isMobile={isMobile}
                onBack={() => setSelectedId(null)}
              />
              <Transcript
                conversation={selectedConversation}
                messages={activeMessages}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
              />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 select-none">
              <span className="text-base font-medium">No Conversation Selected</span>
              <span className="text-xs text-neutral-400 mt-1">
                Choose a conversation from the sidebar or start a new message.
              </span>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
