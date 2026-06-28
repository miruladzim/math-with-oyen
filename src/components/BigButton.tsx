import { Link } from 'react-router-dom';
import styles from './BigButton.module.css';

interface BigButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'success';
  fullWidth?: boolean;
  small?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}

export function BigButton({
  children,
  onClick,
  to,
  variant = 'primary',
  fullWidth,
  small,
  disabled,
  type = 'button',
  ariaLabel,
}: BigButtonProps) {
  const className = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    small ? styles.small : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
