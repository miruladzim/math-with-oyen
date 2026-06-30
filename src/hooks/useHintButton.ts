import { useCallback, useState } from 'react';

export function useHintButton(onReveal: () => string) {
  const [revealedMessage, setRevealedMessage] = useState<string | null>(null);

  const revealHint = useCallback(() => {
    const message = onReveal();
    setRevealedMessage(message);
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
