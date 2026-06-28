import type { ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { Confetti } from '../components/Confetti';
import { GameFeedbackPopup, type GameFeedback } from '../components/GameFeedbackPopup';
import { GameHUD } from '../components/GameHUD';
import { GamePrompt } from '../components/GamePrompt';
import { MistakeAlert } from './components/MistakeAlert';
import { LabCoach } from './components/LabCoach';
import { StepGuide } from './components/StepGuide';
import { useLanguage } from '../context/LanguageContext';
import type { LabModeId } from '../lib/types';
import type { LabChallengeBase } from '../lib/lab/challenges/types';
import shared from '../games/shared.module.css';
import styles from './LabShell.module.css';

type PromptTheme = 'sky' | 'space' | 'ocean' | 'cave' | 'kitchen' | 'arcade';

const THEME_MAP: Record<string, PromptTheme> = {
  path: 'sky',
  workshop: 'arcade',
  scale: 'kitchen',
  studio: 'arcade',
  sort: 'ocean',
  steps: 'space',
};

interface LabShellProps {
  modeId: LabModeId;
  emoji: string;
  title: string;
  theme: string;
  round: number;
  rounds: number;
  score: number;
  combo: number;
  feedback: GameFeedback | null;
  mistakeAlert: string | null;
  wrongHelp: boolean;
  challenge: LabChallengeBase | null;
  onDismissFeedback: () => void;
  onExit: () => void;
  children: ReactNode;
  confettiKey: number;
}

export function LabShell({
  modeId,
  emoji,
  title,
  theme,
  round,
  rounds,
  score,
  combo,
  feedback,
  mistakeAlert,
  wrongHelp,
  challenge,
  onDismissFeedback,
  onExit,
  children,
  confettiKey,
}: LabShellProps) {
  const { t } = useLanguage();
  const promptTheme = THEME_MAP[theme] ?? 'arcade';

  return (
    <div className={shared.shell}>
      <BackButton label={t('lab.backLab')} onClick={onExit} />
      <Confetti burstKey={confettiKey} count={30} />
      <GameHUD
        icon={emoji}
        label={title}
        current={round + 1}
        total={rounds}
        score={score}
        combo={combo}
      />
      {challenge ? (
        <div className={styles.pedagogy}>
          <StepGuide
            steps={challenge.steps}
            title={t('lab.stepGuide')}
            toggleLabel={t('lab.stepGuide')}
          />
          <LabCoach mode={modeId} round={round} wrongHelp={wrongHelp} />
        </div>
      ) : (
        <LabCoach mode={modeId} round={round} wrongHelp={wrongHelp} />
      )}
      {mistakeAlert ? <MistakeAlert message={mistakeAlert} /> : null}
      {feedback ? (
        <GameFeedbackPopup feedback={feedback} onDismiss={onDismissFeedback} />
      ) : null}
      <div className={styles.workBlock}>
        {challenge ? (
          <GamePrompt icon={emoji} label={title} theme={promptTheme} variant="questionOnly">
            {challenge.prompt}
          </GamePrompt>
        ) : null}
        <div className={styles.solverWrap}>{children}</div>
      </div>
    </div>
  );
}
