import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { isSpeechEnabled, setSpeechEnabled } from '../lib/speech';
import { isMusicEnabled, isSoundEnabled, setMusicEnabled, setSoundEnabled } from '../lib/audio';
import { applyDarkMode } from '../lib/theme';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { LanguageToggle } from './LanguageToggle';
import { OyenAvatar } from './OyenAvatar';
import { SceneBackground } from './SceneBackground';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { progress, setProgress } = useProgress();
  const { t } = useLanguage();
  const displayName = progress.studentName || t('appName');

  useEffect(() => {
    setSpeechEnabled(progress.settings.speechEnabled);
    setSoundEnabled(progress.settings.soundEnabled);
    setMusicEnabled(progress.settings.musicEnabled ?? true);
    applyDarkMode(progress.settings.darkMode ?? false);
  }, [progress.settings]);

  const toggleDarkMode = () => {
    const next = !progress.settings.darkMode;
    applyDarkMode(next);
    setProgress({
      ...progress,
      settings: { ...progress.settings, darkMode: next },
    });
  };

  const toggleSpeech = () => {
    const next = !isSpeechEnabled();
    setSpeechEnabled(next);
    setProgress({
      ...progress,
      settings: { ...progress.settings, speechEnabled: next },
    });
  };

  const toggleSound = () => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    setProgress({
      ...progress,
      settings: { ...progress.settings, soundEnabled: next },
    });
  };

  const toggleMusic = () => {
    const next = !isMusicEnabled();
    setMusicEnabled(next);
    setProgress({
      ...progress,
      settings: { ...progress.settings, musicEnabled: next },
    });
  };

  return (
    <div className={styles.layout}>
      <SceneBackground />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.topBar}>
            <NavLink to="/" className={styles.logo} aria-label={t('nav.homeAria')}>
              <span className={styles.logoMark} aria-hidden="true">
                <OyenAvatar size="sm" />
              </span>
              <span className={styles.logoCopy}>
                <span className={styles.logoTitle}>{displayName}</span>
                {progress.studentName ? (
                  <span className={styles.logoSubtitle}>{t('appName')}</span>
                ) : null}
              </span>
            </NavLink>

            <div className={styles.controls} aria-label={t('toggles.groupAria')}>
              <LanguageToggle compact embedded />
              <span className={styles.controlsDivider} aria-hidden="true" />
              <button
                type="button"
                className={`${styles.controlBtn} ${progress.settings.darkMode ? styles.controlBtnActive : styles.controlBtnMuted}`}
                onClick={toggleDarkMode}
                aria-label={progress.settings.darkMode ? t('toggles.darkOff') : t('toggles.darkOn')}
                aria-pressed={progress.settings.darkMode}
              >
                {progress.settings.darkMode ? '☀️' : '🌙'}
              </button>
              <button
                type="button"
                className={`${styles.controlBtn} ${progress.settings.speechEnabled ? styles.controlBtnActive : styles.controlBtnMuted}`}
                onClick={toggleSpeech}
                aria-label={
                  progress.settings.speechEnabled ? t('toggles.speechOn') : t('toggles.speechOff')
                }
                aria-pressed={progress.settings.speechEnabled}
              >
                🔊
              </button>
              <button
                type="button"
                className={`${styles.controlBtn} ${progress.settings.soundEnabled ? styles.controlBtnActive : styles.controlBtnMuted}`}
                onClick={toggleSound}
                aria-label={
                  progress.settings.soundEnabled ? t('toggles.soundOn') : t('toggles.soundOff')
                }
                aria-pressed={progress.settings.soundEnabled}
              >
                🔔
              </button>
              <button
                type="button"
                className={`${styles.controlBtn} ${(progress.settings.musicEnabled ?? true) ? styles.controlBtnActive : styles.controlBtnMuted}`}
                onClick={toggleMusic}
                aria-label={
                  progress.settings.musicEnabled ?? true
                    ? t('toggles.musicOn')
                    : t('toggles.musicOff')
                }
                aria-pressed={progress.settings.musicEnabled ?? true}
              >
                🎵
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={`${styles.footer} no-print`}>{t('footer')}</footer>
    </div>
  );
}
