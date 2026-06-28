import type { ComponentProps } from 'react';
import { VictoryScreen } from '../VictoryScreen';
import { PreschoolVictory } from './PreschoolVictory';

type VictoryScreenProps = ComponentProps<typeof VictoryScreen>;

export function PreschoolVictoryScreen(props: VictoryScreenProps) {
  return (
    <PreschoolVictory>
      <VictoryScreen {...props} />
    </PreschoolVictory>
  );
}
