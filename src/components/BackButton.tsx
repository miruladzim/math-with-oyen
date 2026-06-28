import { Link } from 'react-router-dom';
import styles from './BackButton.module.css';

interface BackButtonProps {
  label: string;
  onClick?: () => void;
  to?: string;
}

export function BackButton({ label, onClick, to }: BackButtonProps) {
  const className = styles.backBtn;

  if (to) {
    return (
      <Link to={to} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}
