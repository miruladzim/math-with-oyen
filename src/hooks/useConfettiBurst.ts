import { useCallback, useEffect, useRef, useState } from 'react';

export function useConfettiBurst() {
  const [burstKey, setBurstKey] = useState(0);
  const timer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const burst = useCallback(() => {
    clearTimer();
    setBurstKey((key) => key + 1);
  }, [clearTimer]);

  const clear = useCallback(() => {
    clearTimer();
    setBurstKey(0);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  /** @deprecated Use burstKey for Confetti; kept for simple boolean checks. */
  const active = burstKey > 0;

  return { burstKey, active, burst, clear };
}
