import { loadProgress, updateSettings } from './progress';

export type SfxId =
  | 'correct'
  | 'wrong'
  | 'success'
  | 'tap'
  | 'pop'
  | 'splash'
  | 'rocket'
  | 'crystal'
  | 'cardFlip'
  | 'streak';

export type AmbientContext = 'practice' | 'games' | 'lab';

const SFX_VOLUME = 0.32;
const MUSIC_VOLUME = 0.15;
const MUSIC_FADE_IN_S = 0.8;
const MUSIC_FADE_OUT_S = 0.4;

let sfxEnabled = loadProgress().settings.soundEnabled;
let musicEnabled = loadProgress().settings.musicEnabled ?? true;

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;

let ambientContext: AmbientContext | null = null;
let ambientLoop: { stop: () => void } | null = null;
let ambientPaused = false;
let unlockBound = false;

function prefersReducedStimulation(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-motion')
  );
}

function ensureGraph(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(audioContext.destination);

    sfxGain = audioContext.createGain();
    sfxGain.gain.value = SFX_VOLUME;
    sfxGain.connect(masterGain);

    musicGain = audioContext.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(masterGain);
  }
  return audioContext;
}

function getSfxDestination(): GainNode | null {
  ensureGraph();
  return sfxGain;
}

function getMusicDestination(): GainNode | null {
  ensureGraph();
  return musicGain;
}

export function isSoundEnabled(): boolean {
  return sfxEnabled;
}

export function isMusicEnabled(): boolean {
  return musicEnabled;
}

export function setSoundEnabled(value: boolean): void {
  sfxEnabled = value;
  updateSettings(loadProgress(), { soundEnabled: value });
}

export function setMusicEnabled(value: boolean): void {
  musicEnabled = value;
  updateSettings(loadProgress(), { musicEnabled: value });
  if (!value) {
    stopAmbient();
  } else if (ambientContext && !prefersReducedStimulation()) {
    startAmbient(ambientContext);
  }
}

export async function unlockAudio(): Promise<void> {
  try {
    const ctx = ensureGraph();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  } catch {
    // Audio may be blocked until user interaction
  }
}

export function bindAudioUnlock(): void {
  if (unlockBound || typeof document === 'undefined') return;
  unlockBound = true;

  const unlock = () => {
    void unlockAudio();
  };

  document.addEventListener('pointerdown', unlock, { once: false, passive: true });
  document.addEventListener('keydown', unlock, { once: false, passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAmbient();
    } else if (ambientContext && musicEnabled && !prefersReducedStimulation()) {
      resumeAmbient();
    }
  });
}

function duckMusic(): void {
  if (!musicGain || !audioContext || !musicEnabled) return;
  const now = audioContext.currentTime;
  const gain = musicGain.gain;
  const current = gain.value;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(current, now);
  gain.linearRampToValueAtTime(Math.max(current * 0.55, 0.02), now + 0.05);
  gain.linearRampToValueAtTime(MUSIC_VOLUME, now + 0.22);
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.22,
  delay = 0,
): void {
  if (!sfxEnabled) return;

  try {
    const ctx = ensureGraph();
    const dest = getSfxDestination();
    if (!dest) return;

    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(dest);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);

    duckMusic();
  } catch {
    // ignore
  }
}

function playNoiseBurst(duration: number, volume = 0.08): void {
  if (!sfxEnabled) return;

  try {
    const ctx = ensureGraph();
    const dest = getSfxDestination();
    if (!dest) return;

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;

    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start();
    duckMusic();
  } catch {
    // ignore
  }
}

function playAmbientPluck(frequency: number, type: OscillatorType, volume: number): void {
  if (!musicEnabled || !musicGain) return;

  try {
    const ctx = ensureGraph();
    const dest = getMusicDestination();
    if (!dest) return;

    const start = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

    oscillator.connect(gain);
    gain.connect(dest);
    oscillator.start(start);
    oscillator.stop(start + 0.6);
  } catch {
    // ignore
  }
}

const AMBIENT_PATTERNS: Record<
  AmbientContext,
  { notes: number[]; bpm: number; wave: OscillatorType; pluckVol: number }
> = {
  practice: { notes: [261.63, 329.63, 392, 329.63], bpm: 72, wave: 'sine', pluckVol: 0.07 },
  games: { notes: [392, 493.88, 587.33, 659.25], bpm: 108, wave: 'triangle', pluckVol: 0.08 },
  lab: { notes: [349.23, 440, 523.25, 440], bpm: 92, wave: 'sine', pluckVol: 0.075 },
};

function createAmbientLoop(context: AmbientContext): { stop: () => void } {
  const pattern = AMBIENT_PATTERNS[context];
  let step = 0;
  let stopped = false;
  let timeoutId: number | null = null;

  const tick = () => {
    if (stopped || ambientPaused || !musicEnabled) return;
    const freq = pattern.notes[step % pattern.notes.length];
    playAmbientPluck(freq, pattern.wave, pattern.pluckVol);
    step += 1;
    timeoutId = window.setTimeout(tick, (60 / pattern.bpm) * 1000);
  };

  tick();

  return {
    stop: () => {
      stopped = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    },
  };
}

function fadeMusicTo(target: number, duration: number): void {
  if (!musicGain || !audioContext) return;
  const now = audioContext.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(musicGain.gain.value, now);
  musicGain.gain.linearRampToValueAtTime(target, now + duration);
}

export function startAmbient(context: AmbientContext): void {
  if (prefersReducedStimulation()) {
    ambientContext = context;
    return;
  }

  ambientContext = context;
  if (!musicEnabled) return;

  void unlockAudio();

  if (ambientLoop && ambientContext !== context) {
    stopAmbientImmediate();
  }

  if (ambientLoop) {
    ambientPaused = false;
    fadeMusicTo(MUSIC_VOLUME, MUSIC_FADE_IN_S);
    return;
  }

  ambientPaused = false;
  ambientLoop = createAmbientLoop(context);
  fadeMusicTo(MUSIC_VOLUME, MUSIC_FADE_IN_S);
}

function stopAmbientImmediate(): void {
  ambientLoop?.stop();
  ambientLoop = null;
  fadeMusicTo(0, 0.01);
}

export function stopAmbient(): void {
  ambientPaused = false;
  const loop = ambientLoop;
  ambientLoop = null;
  ambientContext = null;
  fadeMusicTo(0, MUSIC_FADE_OUT_S);
  window.setTimeout(() => loop?.stop(), MUSIC_FADE_OUT_S * 1000 + 50);
}

function pauseAmbient(): void {
  if (!ambientLoop) return;
  ambientPaused = true;
  fadeMusicTo(0, 0.2);
}

function resumeAmbient(): void {
  if (!ambientContext || !ambientLoop) return;
  ambientPaused = false;
  fadeMusicTo(MUSIC_VOLUME, MUSIC_FADE_IN_S);
}

export function playSfx(id: SfxId): void {
  if (!sfxEnabled) return;
  void unlockAudio();

  switch (id) {
    case 'correct':
      playTone(523.25, 0.12, 'sine', 0.24);
      playTone(659.25, 0.16, 'sine', 0.22, 0.09);
      playTone(783.99, 0.2, 'triangle', 0.18, 0.18);
      break;
    case 'wrong':
      playTone(233.08, 0.14, 'triangle', 0.2);
      playTone(196, 0.22, 'sawtooth', 0.14, 0.1);
      break;
    case 'success':
      playTone(523.25, 0.1, 'sine', 0.22);
      playTone(659.25, 0.1, 'sine', 0.22, 0.1);
      playTone(783.99, 0.1, 'sine', 0.22, 0.2);
      playTone(1046.5, 0.28, 'triangle', 0.2, 0.3);
      break;
    case 'tap':
      playTone(880, 0.05, 'square', 0.1);
      break;
    case 'pop':
      playTone(520, 0.06, 'square', 0.16);
      playTone(760, 0.05, 'square', 0.12, 0.03);
      playNoiseBurst(0.04, 0.05);
      break;
    case 'splash':
      playNoiseBurst(0.12, 0.1);
      playTone(330, 0.14, 'sine', 0.14);
      playTone(220, 0.18, 'sine', 0.1, 0.08);
      break;
    case 'rocket':
      playNoiseBurst(0.08, 0.06);
      playTone(196, 0.2, 'sawtooth', 0.12);
      playTone(392, 0.25, 'triangle', 0.16, 0.12);
      break;
    case 'crystal':
      playTone(740, 0.1, 'sine', 0.2);
      playTone(988, 0.12, 'sine', 0.18, 0.08);
      playTone(1174.66, 0.16, 'triangle', 0.14, 0.16);
      break;
    case 'cardFlip':
      playTone(420, 0.05, 'triangle', 0.1);
      playTone(640, 0.04, 'square', 0.08, 0.02);
      break;
    case 'streak':
      playTone(659.25, 0.08, 'square', 0.14);
      playTone(783.99, 0.1, 'square', 0.16, 0.07);
      playTone(987.77, 0.14, 'triangle', 0.18, 0.14);
      break;
    default:
      break;
  }
}

export function playCorrect(): void {
  playSfx('correct');
}

export function playIncorrect(): void {
  playSfx('wrong');
}

export function playSuccess(): void {
  playSfx('success');
}

export function playPop(): void {
  playSfx('pop');
}

export function playSplash(): void {
  playSfx('splash');
}

export function playCrystal(): void {
  playSfx('crystal');
}

export function playRocket(): void {
  playSfx('rocket');
}

export function playTap(): void {
  playSfx('tap');
}

export function playCardFlip(): void {
  playSfx('cardFlip');
}

export function playStreak(): void {
  playSfx('streak');
}

bindAudioUnlock();
