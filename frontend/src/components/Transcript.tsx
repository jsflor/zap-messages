import { useEffect, useRef } from 'react';
import { Message, Conversation } from '../types';
import { MessageBubble } from './MessageBubble';
import { ReactionType } from './TapbackPicker';

interface TranscriptProps {
  conversation: Conversation;
  messages: Message[];
  onAddReaction: (messageId: string, type: ReactionType) => void;
  onRemoveReaction: (messageId: string, type: ReactionType) => void;
}

export function Transcript({
  conversation,
  messages,
  onAddReaction,
  onRemoveReaction,
}: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, conversation.isTyping]);

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    const isYesterday =
      date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const shouldShowDate = (currentIdx: number) => {
    if (currentIdx === 0) return true;
    const prevDate = new Date(messages[currentIdx - 1].sentAt).getTime();
    const currDate = new Date(messages[currentIdx].sentAt).getTime();
    // Show separator if more than 30 minutes between messages
    return currDate - prevDate > 30 * 60 * 1000;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col justify-start">
      {messages.map((msg, idx) => {
        const isFirstInCluster =
          idx === 0 ||
          messages[idx - 1].senderId !== msg.senderId ||
          shouldShowDate(idx);

        const isLastInCluster =
          idx === messages.length - 1 ||
          messages[idx + 1].senderId !== msg.senderId ||
          shouldShowDate(idx + 1);

        return (
          <div key={msg.id} className="flex flex-col">
            {shouldShowDate(idx) && (
              <div className="flex items-center justify-center my-3">
                <span className="text-xs font-medium text-imessage-subtext-light dark:text-imessage-subtext-dark select-none">
                  {formatDateSeparator(msg.sentAt)}
                </span>
              </div>
            )}

            <MessageBubble
              message={msg}
              isFirstInCluster={isFirstInCluster}
              isLastInCluster={isLastInCluster}
              showSenderName={conversation.isGroup}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
            />
          </div>
        );
      })}

      {/* Typing Indicator Bubble in Transcript */}
      {conversation.isTyping && (
        <div className="flex items-start mt-2">
          <div className="px-4 py-2.5 rounded-bubble bg-imessage-bubble-gray-light dark:bg-imessage-bubble-gray-dark bubble-tail-incoming shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full typing-dot"></span>
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full typing-dot"></span>
            <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full typing-dot"></span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
