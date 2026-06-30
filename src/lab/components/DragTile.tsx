import { playTap } from '../../lib/audio';
import styles from './DragTile.module.css';

interface DragTileProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function DragTile({ label, selected, disabled, onSelect }: DragTileProps) {
  return (
    <button
      type="button"
      className={`${styles.tile} ${selected ? styles.selected : ''}`}
      onClick={() => {
        if (!disabled) playTap();
        onSelect();
      }}
      disabled={disabled}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
