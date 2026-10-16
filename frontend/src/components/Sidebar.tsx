import { useState } from 'react';
import { Search, SquarePen, X } from 'lucide-react';
import { Conversation } from '../types';
import { PinnedSection } from './PinnedSection';
import { ConversationList } from './ConversationList';

interface SidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewMessage: () => void;
  onSearch: (query: string) => void;
}

export function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onNewMessage,
  onSearch,
}: SidebarProps) {
  const [query, setQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const pinned = conversations.filter((c) => c.isPinned);
  const unpinned = conversations.filter((c) => !c.isPinned);

  return (
    <aside className="w-80 md:w-72 lg:w-80 h-full flex flex-col border-r border-imessage-divider-light dark:border-imessage-divider-dark bg-imessage-sidebar-light dark:bg-imessage-sidebar-dark vibrancy-sidebar select-none">
      {/* Window Controls Space & Header */}
      <div className="pt-8 px-3.5 pb-2.5 flex items-center gap-2">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={handleSearchChange}
            className="w-full pl-8 pr-7 py-1 bg-imessage-search-light dark:bg-imessage-search-dark text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 rounded-lg text-sm outline-none focus:ring-2 focus:ring-imessage-blue/50 transition-all"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* New Compose Button */}
        <button
          onClick={onNewMessage}
          title="New Message"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors"
        >
          <SquarePen className="w-5 h-5 text-imessage-blue" />
        </button>
      </div>

      {/* Pinned Section */}
      {!query && (
        <PinnedSection
          pinnedConversations={pinned}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}

      {/* Main Conversation List */}
      <ConversationList
        conversations={query ? conversations : unpinned}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </aside>
  );
}
