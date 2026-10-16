import { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Mic } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (onTyping) {
      onTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setText('');
    if (onTyping) onTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="p-3 border-t border-imessage-divider-light dark:border-imessage-divider-dark bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md">
      <div className="flex items-end gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-2.5 py-1.5 border border-neutral-200/60 dark:border-neutral-700/60 focus-within:ring-2 focus-within:ring-imessage-blue/40 transition-all">
        {/* Attachment + Button */}
        <button
          type="button"
          title="Add attachment"
          className="p-1 rounded-full text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="iMessage"
          disabled={disabled}
          className="flex-1 bg-transparent resize-none outline-none text-[15px] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 max-h-28 py-1 leading-relaxed"
        />

        {/* Action Button: Mic when empty -> Blue Arrow when text exists */}
        <button
          type="button"
          onClick={hasText ? handleSend : undefined}
          title={hasText ? 'Send Message' : 'Voice Message'}
          className={`p-1.5 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
            hasText
              ? 'bg-imessage-blue text-white hover:bg-imessage-blue-dark scale-100'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          {hasText ? (
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
