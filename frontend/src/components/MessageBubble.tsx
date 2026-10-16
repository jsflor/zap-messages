import { useState } from 'react';
import { Message, Reaction } from '../types';
import { TapbackPicker, ReactionType } from './TapbackPicker';
import { Heart, ThumbsUp, ThumbsDown, Smile, AlertCircle, HelpCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isFirstInCluster: boolean;
  isLastInCluster: boolean;
  showSenderName: boolean;
  onAddReaction: (messageId: string, type: ReactionType) => void;
  onRemoveReaction: (messageId: string, type: ReactionType) => void;
}

export function MessageBubble({
  message,
  isFirstInCluster,
  isLastInCluster,
  showSenderName,
  onAddReaction,
  onRemoveReaction,
}: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false);

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />;
      case 'like':
        return <ThumbsUp className="w-3.5 h-3.5 fill-neutral-700 dark:fill-neutral-300 text-neutral-700 dark:text-neutral-300" />;
      case 'dislike':
        return <ThumbsDown className="w-3.5 h-3.5 fill-neutral-700 dark:fill-neutral-300 text-neutral-700 dark:text-neutral-300" />;
      case 'laugh':
        return <Smile className="w-3.5 h-3.5 text-amber-500" />;
      case 'emphasize':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      case 'question':
        return <HelpCircle className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleSelectReaction = (type: ReactionType) => {
    const existing = message.reactions?.find((r) => r.userId === 'self' && r.reactionType === type);
    if (existing) {
      onRemoveReaction(message.id, type);
    } else {
      onAddReaction(message.id, type);
    }
    setShowPicker(false);
  };

  const selfReaction = message.reactions?.find((r) => r.userId === 'self');

  return (
    <div
      className={`flex flex-col group relative select-text ${
        message.isOutgoing ? 'items-end' : 'items-start'
      } ${isFirstInCluster ? 'mt-2.5' : 'mt-0.5'}`}
    >
      {/* Sender name for group chats */}
      {showSenderName && isFirstInCluster && !message.isOutgoing && (
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 ml-3 mb-1">
          {message.senderName}
        </span>
      )}

      {/* Bubble Container */}
      <div className="relative max-w-[70%]">
        {/* Tapback Popover */}
        {showPicker && (
          <div
            className={`absolute z-30 -top-12 ${
              message.isOutgoing ? 'right-0' : 'left-0'
            }`}
          >
            <TapbackPicker
              onSelectReaction={handleSelectReaction}
              onClose={() => setShowPicker(false)}
              activeReaction={selfReaction?.reactionType as ReactionType}
            />
          </div>
        )}

        {/* Bubble */}
        <div
          onDoubleClick={() => setShowPicker(!showPicker)}
          className={`px-3.5 py-2 rounded-bubble text-[15px] leading-relaxed break-words shadow-sm transition-all relative ${
            message.isOutgoing
              ? `bg-gradient-to-b from-imessage-blue to-imessage-blue-dark text-white ${
                  isLastInCluster ? 'bubble-tail-outgoing' : ''
                }`
              : `bg-imessage-bubble-gray-light dark:bg-imessage-bubble-gray-dark text-neutral-900 dark:text-neutral-100 ${
                  isLastInCluster ? 'bubble-tail-incoming' : ''
                }`
          }`}
        >
          {message.text}
        </div>

        {/* Reactions Docked Pill */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            onClick={() => setShowPicker(!showPicker)}
            className={`absolute -top-3 z-10 flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-tapback cursor-pointer hover:scale-105 transition-transform ${
              message.isOutgoing ? '-left-2' : '-right-2'
            }`}
          >
            {message.reactions.map((r: Reaction, idx: number) => (
              <span key={r.id || idx}>{getReactionIcon(r.reactionType)}</span>
            ))}
          </div>
        )}
      </div>

      {/* Delivery / Read Status below cluster end */}
      {message.isOutgoing && isLastInCluster && (
        <span className="text-[11px] text-imessage-subtext-light dark:text-imessage-subtext-dark mt-1 mr-1">
          {message.status === 'read'
            ? 'Read'
            : message.status === 'delivered'
            ? 'Delivered'
            : message.status === 'pending'
            ? 'Sending...'
            : 'Sent'}
        </span>
      )}
    </div>
  );
}
