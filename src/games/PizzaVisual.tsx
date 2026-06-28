import styles from './PizzaVisual.module.css';

interface PizzaVisualProps {
  denom: number;
  filled: boolean[];
  onToggle: (index: number) => void;
  disabled?: boolean;
}

export function PizzaVisual({ denom, filled, onToggle, disabled }: PizzaVisualProps) {
  const cx = 130;
  const cy = 130;
  const outerR = 120;
  const innerR = 18;

  function slicePath(index: number): string {
    const angleStart = (index / denom) * 2 * Math.PI - Math.PI / 2;
    const angleEnd = ((index + 1) / denom) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + outerR * Math.cos(angleStart);
    const y1 = cy + outerR * Math.sin(angleStart);
    const x2 = cx + outerR * Math.cos(angleEnd);
    const y2 = cy + outerR * Math.sin(angleEnd);
    const xi = cx + innerR * Math.cos(angleEnd);
    const yi = cy + innerR * Math.sin(angleEnd);
    const xi2 = cx + innerR * Math.cos(angleStart);
    const yi2 = cy + innerR * Math.sin(angleStart);
    const large = angleEnd - angleStart > Math.PI ? 1 : 0;
    return `M ${xi2} ${yi2} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${xi} ${yi} A ${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z`;
  }

  const toppings = [
    { cx: 80, cy: 70, r: 5 },
    { cx: 170, cy: 90, r: 4 },
    { cx: 100, cy: 170, r: 5 },
    { cx: 160, cy: 160, r: 4 },
  ];

  return (
    <div className={styles.pizzaWrap} role="group" aria-label="Interactive pizza slices">
      <svg className={styles.pizzaSvg} viewBox="0 0 260 260">
        <circle cx={cx} cy={cy} r={outerR + 4} fill="#d97706" />
        {filled.map((isFilled, i) => (
          <path
            key={i}
            d={slicePath(i)}
            fill={isFilled ? '#ef4444' : '#fcd34d'}
            className={`${styles.sliceBtn} ${isFilled ? styles.sliceFilled : styles.sliceEmpty}`}
            onClick={() => !disabled && onToggle(i)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Slice ${i + 1}, ${isFilled ? 'topped' : 'plain'}`}
            aria-pressed={isFilled}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && onToggle(i)}
          />
        ))}
        {filled.map(
          (isFilled, i) =>
            isFilled && (
              <circle
                key={`t-${i}`}
                {...toppings[i % toppings.length]}
                className={styles.crumb}
              />
            ),
        )}
        <circle cx={cx} cy={cy} r={innerR} className={styles.center} />
      </svg>
    </div>
  );
}
