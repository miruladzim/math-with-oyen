import { useEffect } from 'react';
import { startAmbient, stopAmbient, type AmbientContext } from '../lib/audio';

export function usePlaySessionAudio(context: AmbientContext | null): void {
  useEffect(() => {
    if (!context) return undefined;

    startAmbient(context);
    return () => {
      stopAmbient();
    };
  }, [context]);
}
