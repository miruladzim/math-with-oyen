import { useCallback, useState } from 'react';
import { speak } from '../lib/speech';

export function useHintButton(onReveal: () => string) {
  const [revealedMessage, setRevealedMessage] = useState<string | null>(null);

  const revealHint = useCallback(() => {
    const message = onReveal();
    setRevealedMessage(message);
    speak(message);
  }, [onReveal]);

  const resetHint = useCallback(() => {
    setRevealedMessage(null);
  }, []);

  return {
    revealed: revealedMessage !== null,
    revealedMessage,
    revealHint,
    resetHint,
  };
}
