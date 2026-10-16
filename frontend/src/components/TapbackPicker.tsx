import { Heart, ThumbsUp, ThumbsDown, Smile, AlertCircle, HelpCircle } from 'lucide-react';

export type ReactionType = 'heart' | 'like' | 'dislike' | 'laugh' | 'emphasize' | 'question';

interface TapbackPickerProps {
  onSelectReaction: (type: ReactionType) => void;
  onClose: () => void;
  activeReaction?: ReactionType;
}

export function TapbackPicker({
  onSelectReaction,
  activeReaction,
}: TapbackPickerProps) {
  const options: { type: ReactionType; icon: React.ReactNode; label: string }[] = [
    { type: 'heart', icon: <Heart className="w-5 h-5 fill-red-500 text-red-500" />, label: 'Love' },
    { type: 'like', icon: <ThumbsUp className="w-5 h-5 fill-neutral-700 dark:fill-neutral-300 text-neutral-700 dark:text-neutral-300" />, label: 'Like' },
    { type: 'dislike', icon: <ThumbsDown className="w-5 h-5 fill-neutral-700 dark:fill-neutral-300 text-neutral-700 dark:text-neutral-300" />, label: 'Dislike' },
    { type: 'laugh', icon: <Smile className="w-5 h-5 text-amber-500" />, label: 'Laugh' },
    { type: 'emphasize', icon: <AlertCircle className="w-5 h-5 text-red-500 font-bold" />, label: 'Emphasize' },
    { type: 'question', icon: <HelpCircle className="w-5 h-5 text-blue-500" />, label: 'Question' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-md rounded-full shadow-tapback border border-neutral-200/60 dark:border-neutral-700/60">
      {options.map((opt) => {
        const isActive = activeReaction === opt.type;
        return (
          <button
            key={opt.type}
            onClick={() => onSelectReaction(opt.type)}
            title={opt.label}
            className={`p-1.5 rounded-full hover:scale-125 transition-transform flex items-center justify-center ${
              isActive
                ? 'bg-neutral-200 dark:bg-neutral-700 ring-2 ring-imessage-blue'
                : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'
            }`}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}
