import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../../../components/BigButton';
import { VictoryScreen } from '../../../components/VictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildSortSquadChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { LabShell } from '../../LabShell';
import { DragTile } from '../../components/DragTile';
import stage from '../../labStage.module.css';
import styles from './SortSquad.module.css';

interface SortSquadProps {
  onExit: () => void;
}

export function SortSquad({ onExit }: SortSquadProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('sortSquad');
  const session = useLabSession({ modeId: 'sortSquad', progress, setProgress });
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildSortSquadChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setSelectedCard(null);
    setAssignments({});
    setMistakeIdx(0);
  }, [challenge.id]);

  const unassigned = challenge.cards.filter((card) => !assignments[card.id]);

  const assignToBin = (binId: string) => {
    if (!selectedCard || session.locked) return;
    setAssignments((prev) => ({ ...prev, [selectedCard]: binId }));
    setSelectedCard(null);
  };

  const onSubmit = () => {
    if (session.locked || unassigned.length > 0) return;
    const allCorrect = challenge.cards.every((card) => assignments[card.id] === card.binId);
    if (allCorrect) {
      session.handleCorrect(t('common.correct'), challenge.explanation);
    } else {
      session.handleWrong(
        t('common.notQuite'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
      setAssignments({});
      setSelectedCard(null);
    }
  };

  if (session.done) {
    return (
      <VictoryScreen
        title={t('practice.sessionComplete')}
        subtitle={t('lab.victorySub', { correct: session.correct, total: session.rounds })}
        encouragement={t(`victory.${session.encouragementKey}`)}
        stars={session.stars}
        onPlayAgain={session.restart}
        onExit={onExit}
        backLabel={t('lab.backLab')}
      />
    );
  }

  return (
    <LabShell
      modeId="sortSquad"
      emoji={meta.emoji}
      title={t('lab.modes.sortSquad.title')}
      theme={meta.theme}
      round={session.round}
      rounds={session.rounds}
      score={session.correct}
      combo={session.combo}
      feedback={session.feedback}
      mistakeAlert={session.mistakeAlert}
      wrongHelp={session.wrongHelp}
      challenge={challenge}
      onExit={onExit}
      onDismissFeedback={session.dismissFeedbackPopup}
      confettiKey={session.confetti.burstKey}
    >
      <div className={stage.stage}>
        <div className={stage.bank}>
          {challenge.cards.map((card) => {
            const binId = assignments[card.id];
            return (
              <DragTile
                key={card.id}
                label={binId ? `${card.label} →` : card.label}
                selected={selectedCard === card.id}
                disabled={session.locked}
                onSelect={() => {
                  if (binId) {
                    setAssignments((prev) => {
                      const next = { ...prev };
                      delete next[card.id];
                      return next;
                    });
                    setSelectedCard(card.id);
                    return;
                  }
                  setSelectedCard(selectedCard === card.id ? null : card.id);
                }}
              />
            );
          })}
        </div>
        <div className={styles.bins}>
          {challenge.bins.map((bin) => (
            <button
              key={bin.id}
              type="button"
              className={`${styles.bin} ${selectedCard ? styles.binActive : ''}`}
              onClick={() => assignToBin(bin.id)}
              disabled={!selectedCard || session.locked}
            >
              <span className={styles.binLabel}>{bin.label}</span>
              <div className={styles.binCards}>
                {challenge.cards
                  .filter((card) => assignments[card.id] === bin.id)
                  .map((card) => (
                    <span key={card.id} className={styles.binCard}>
                      {card.label}
                    </span>
                  ))}
              </div>
            </button>
          ))}
        </div>
        <div className={stage.actions}>
          <BigButton onClick={onSubmit} disabled={session.locked || unassigned.length > 0}>
            {t('lab.submit')}
          </BigButton>
        </div>
      </div>
    </LabShell>
  );
}
