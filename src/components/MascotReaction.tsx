import { KidHint, type HintMood } from './KidHint';

interface MascotReactionProps {
  mood: HintMood;
  message: string;
}

export function MascotReaction({ mood, message }: MascotReactionProps) {
  return (
    <KidHint
      mood={mood}
      variant={mood === 'happy' ? 'encourage' : mood === 'think' ? 'tip' : 'help'}
      message={message}
      live="polite"
    />
  );
}
