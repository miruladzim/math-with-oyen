import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getLabHowTo, getLabTip, getLabWrongHelp, getOyenAskLabHint } from '../../lib/hints';
import { speak } from '../../lib/speech';
import { HintButton } from '../../components/HintButton';
import { KidHint, type HintMood } from '../../components/KidHint';
import type { LabModeId } from '../../lib/types';
import styles from './LabCoach.module.css';

interface LabCoachProps {
  mode: LabModeId;
  round?: number;
  wrongHelp?: boolean;
}

export function LabCoach({ mode, round = 0, wrongHelp = false }: LabCoachProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(true);
  const [oyenAskMessage, setOyenAskMessage] = useState<string | null>(null);
  const oyenAskCount = useRef(0);

  useEffect(() => {
    oyenAskCount.current = 0;
    setOyenAskMessage(null);
  }, [round, mode]);

  const howTo = useMemo(() => getLabHowTo(language, mode), [language, mode]);
  const tip = useMemo(() => getLabTip(language, mode, round), [language, mode, round]);

  const coachMessage = useMemo(() => {
    if (oyenAskMessage) return oyenAskMessage;
    if (wrongHelp) return getLabWrongHelp(language, mode);
    if (round === 0) return `${howTo} ${tip}`;
    return tip;
  }, [howTo, language, mode, oyenAskMessage, round, tip, wrongHelp]);

  const coachMood: HintMood = oyenAskMessage ? 'think' : wrongHelp ? 'encourage' : round === 0 ? 'idle' : 'think';
  const coachVariant = oyenAskMessage ? 'tip' : wrongHelp ? 'help' : round === 0 ? 'howTo' : 'tip';

  const revealExtraHint = useCallback(() => {
    const message = getOyenAskLabHint(language, mode, oyenAskCount.current);
    oyenAskCount.current += 1;
    setOyenAskMessage(message);
    speak(message);
  }, [language, mode]);

  return (
    <div className={styles.coach}>
      {open ? (
        <KidHint mood={coachMood} variant={coachVariant} message={coachMessage} live="polite" />
      ) : null}
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? t('hints.hideHelp') : t('hints.showHelp')} {open ? '▲' : '▼'}
        </button>
        <HintButton onClick={revealExtraHint} />
      </div>
    </div>
  );
}
