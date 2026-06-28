import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getGameHowTo, getGameTip, getGameWrongHelp, getOyenAskGameHint, type GameHintId } from '../lib/hints';
import { speak } from '../lib/speech';
import { HintButton } from './HintButton';
import { KidHint, type HintMood } from './KidHint';
import styles from './GameCoach.module.css';

interface GameCoachProps {
  game: GameHintId;
  round?: number;
  wrongHelp?: boolean;
  wrongMessage?: string;
}

export function GameCoach({
  game,
  round = 0,
  wrongHelp = false,
  wrongMessage,
}: GameCoachProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(true);
  const [oyenAskMessage, setOyenAskMessage] = useState<string | null>(null);
  const oyenAskCount = useRef(0);

  const tip = useMemo(() => getGameTip(language, game, round), [game, language, round]);
  const howTo = useMemo(() => getGameHowTo(language, game), [game, language]);

  useEffect(() => {
    oyenAskCount.current = 0;
    setOyenAskMessage(null);
  }, [round, game]);

  const coachMessage = useMemo(() => {
    if (oyenAskMessage) return oyenAskMessage;
    if (wrongHelp) return wrongMessage ?? getGameWrongHelp(language, game);
    if (round === 0) return `${howTo} ${tip}`;
    return tip;
  }, [game, howTo, language, oyenAskMessage, round, tip, wrongHelp, wrongMessage]);

  const coachMood: HintMood = oyenAskMessage ? 'think' : wrongHelp ? 'encourage' : round === 0 ? 'idle' : 'think';
  const coachVariant = oyenAskMessage ? 'tip' : wrongHelp ? 'help' : round === 0 ? 'howTo' : 'tip';

  const revealExtraHint = useCallback(() => {
    const message = getOyenAskGameHint(language, game, oyenAskCount.current);
    oyenAskCount.current += 1;
    setOyenAskMessage(message);
    speak(message);
  }, [game, language]);

  return (
    <div className={styles.coach}>
      {open ? (
        <KidHint
          mood={coachMood}
          variant={coachVariant}
          message={coachMessage}
          compact
          live="polite"
        />
      ) : null}

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? t('hints.hideHelp') : t('hints.showHelp')} {open ? '▲' : '▼'}
        </button>
        <HintButton onClick={revealExtraHint} compact />
      </div>
    </div>
  );
}
