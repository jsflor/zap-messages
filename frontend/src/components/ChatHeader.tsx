import { Info, ChevronLeft, Phone, Video } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
  onInfoClick?: () => void;
  isMobile?: boolean;
}

export function ChatHeader({
  conversation,
  onBack,
  onInfoClick,
  isMobile,
}: ChatHeaderProps) {
  const initials = conversation.title
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 border-b border-imessage-divider-light dark:border-imessage-divider-dark px-4 flex items-center justify-between bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md select-none">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile back button */}
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-imessage-blue hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-lg flex items-center gap-0.5"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {/* Contact info centered / left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-400 to-neutral-500 text-white font-medium text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
            {conversation.participants[0]?.avatarUrl ? (
              <img
                src={conversation.participants[0].avatarUrl}
                alt={conversation.title}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{initials || '?'}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {conversation.title}
            </span>
            <span className="text-[11px] text-imessage-subtext-light dark:text-imessage-subtext-dark truncate">
              {conversation.isGroup
                ? `${conversation.participants.length} participants`
                : conversation.participants[0]?.phoneNumber || 'iMessage'}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          title="FaceTime Audio"
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="FaceTime Video"
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onInfoClick}
          title="Conversation Details"
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
