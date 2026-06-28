import { loadProgress, updateSettings } from './progress';
import type { Language } from './i18n/types';

let enabled = loadProgress().settings.speechEnabled;
let speechLang: Language = loadProgress().settings.language ?? 'en';

export function isSpeechEnabled(): boolean {
  return enabled;
}

export function setSpeechEnabled(value: boolean): void {
  enabled = value;
  const progress = loadProgress();
  updateSettings(progress, { speechEnabled: value });
}

export function setSpeechLanguage(lang: Language): void {
  speechLang = lang;
}

export function speak(text: string): void {
  if (!enabled || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang === 'ms' ? 'ms-MY' : 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
