import { useCallback, useEffect, useState } from 'react';
import { playPop } from '../../lib/audio';

interface UseTapGridOptions {
  itemCount: number;
  resetKey?: string | number;
  disabled?: boolean;
  onToggle?: (tapped: Set<number>) => void;
}

export function useTapGrid({ itemCount, resetKey = 0, disabled, onToggle }: UseTapGridOptions) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());

  useEffect(() => {
    setTapped(new Set());
  }, [resetKey, itemCount]);

  const toggleTap = useCallback(
    (index: number) => {
      if (disabled) return;
      playPop();
      setTapped((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        onToggle?.(next);
        return next;
      });
    },
    [disabled, onToggle],
  );

  const clearTapped = useCallback(() => setTapped(new Set()), []);

  return { tapped, toggleTap, clearTapped, tappedCount: tapped.size };
}
