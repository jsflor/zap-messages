import { Conversation } from '../types';

interface PinnedSectionProps {
  pinnedConversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PinnedSection({
  pinnedConversations,
  selectedId,
  onSelect,
}: PinnedSectionProps) {
  if (pinnedConversations.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-imessage-divider-light dark:border-imessage-divider-dark">
      <div className="grid grid-cols-3 gap-3">
        {pinnedConversations.map((conv) => {
          const isSelected = conv.id === selectedId;
          const initials = conv.title
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`flex flex-col items-center group relative p-1.5 rounded-xl transition-colors ${
                isSelected
                  ? 'bg-imessage-blue/10 dark:bg-imessage-blue/20'
                  : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {/* Avatar Container */}
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm bg-gradient-to-tr from-neutral-400 to-neutral-500">
                {conv.participants[0]?.avatarUrl ? (
                  <img
                    src={conv.participants[0].avatarUrl}
                    alt={conv.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials || '?'}</span>
                )}

                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-imessage-blue text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900">
                    {conv.unreadCount}
                  </span>
                )}

                {/* Live typing indicator overlay */}
                {conv.isTyping && (
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-800 rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-0.5 border border-neutral-200 dark:border-neutral-700">
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full typing-dot"></span>
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full typing-dot"></span>
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full typing-dot"></span>
                  </div>
                )}
              </div>

              {/* Title label */}
              <span className="mt-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[72px] text-center">
                {conv.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
