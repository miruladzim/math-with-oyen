import { useEffect, useState } from 'react';
import styles from './Confetti.module.css';

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#14b8a6', '#ef4444', '#a855f7'];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

interface ConfettiProps {
  /** Increment to fire a new burst (games). */
  burstKey?: number;
  /** Legacy: continuous confetti (VictoryScreen). */
  active?: boolean;
  count?: number;
}

export function Confetti({ burstKey = 0, active = false, count = 40 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const trigger = burstKey > 0 ? burstKey : active ? 1 : 0;

  useEffect(() => {
    if (!trigger) {
      setParticles([]);
      return;
    }

    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.4,
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 8,
      })),
    );

    const timer = window.setTimeout(() => setParticles([]), 2200);
    return () => window.clearTimeout(timer);
  }, [trigger, count]);

  if (particles.length === 0) return null;

  return (
    <div className={styles.container} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size * 0.6,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
