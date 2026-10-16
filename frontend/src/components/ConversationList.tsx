import { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    const isYesterday =
      date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-transparent">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        const initials = conv.title
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`px-3 py-2.5 mx-2 my-0.5 rounded-lg flex items-center gap-3 cursor-pointer select-none transition-colors ${
              isSelected
                ? 'bg-imessage-blue text-white'
                : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {/* Unread blue dot indicator */}
            <div className="w-2 flex items-center justify-center">
              {conv.unreadCount > 0 && !isSelected && (
                <div className="w-2 h-2 rounded-full bg-imessage-blue" />
              )}
            </div>

            {/* Avatar */}
            <div
              className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-medium text-sm text-white ${
                isSelected
                  ? 'bg-white/20'
                  : 'bg-gradient-to-tr from-neutral-400 to-neutral-500'
              }`}
            >
              {conv.participants[0]?.avatarUrl ? (
                <img
                  src={conv.participants[0].avatarUrl}
                  alt={conv.title}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{initials || '?'}</span>
              )}
            </div>

            {/* Text details */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={`text-[15px] font-semibold truncate ${
                    isSelected ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {conv.title}
                </span>
                <span
                  className={`text-xs ml-2 flex-shrink-0 ${
                    isSelected
                      ? 'text-white/80'
                      : 'text-imessage-subtext-light dark:text-imessage-subtext-dark'
                  }`}
                >
                  {formatTime(conv.lastMessageAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p
                  className={`text-[13px] truncate line-clamp-2 leading-tight ${
                    isSelected
                      ? 'text-white/90'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {conv.isTyping ? (
                    <span className="italic">Typing...</span>
                  ) : (
                    conv.lastMessageText || 'No messages'
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
