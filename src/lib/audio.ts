import { loadProgress, updateSettings } from './progress';

let enabled = loadProgress().settings.soundEnabled;
let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  const progress = loadProgress();
  updateSettings(progress, { soundEnabled: value });
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
  if (!enabled) return;

  try {
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.15;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio may be blocked until user interaction
  }
}

export function playCorrect(): void {
  playTone(523, 0.15);
  setTimeout(() => playTone(659, 0.2), 100);
}

export function playIncorrect(): void {
  playTone(220, 0.3, 'triangle');
}

export function playSuccess(): void {
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 120);
  setTimeout(() => playTone(784, 0.2), 240);
}

export function playPop(): void {
  playTone(880, 0.08, 'square');
  setTimeout(() => playTone(1100, 0.06, 'square'), 40);
}

export function playSplash(): void {
  playTone(440, 0.1, 'sine');
  setTimeout(() => playTone(330, 0.15, 'sine'), 80);
}

export function playCrystal(): void {
  playTone(740, 0.1);
  setTimeout(() => playTone(988, 0.12), 90);
}
