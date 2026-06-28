import { useEffect, useRef, useState, type ReactNode } from 'react';

interface FadeViewProps {
  viewKey: string;
  children: ReactNode;
  className?: string;
  scrollTopOnEnter?: boolean;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function FadeView({
  viewKey,
  children,
  className = '',
  scrollTopOnEnter = false,
}: FadeViewProps) {
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [renderedKey, setRenderedKey] = useState(viewKey);
  const [visibleContent, setVisibleContent] = useState(children);
  const contentRef = useRef(children);
  contentRef.current = children;
  const pendingKeyRef = useRef(viewKey);

  const completeTransition = (targetKey: string, scrollTop: boolean) => {
    setRenderedKey(targetKey);
    setVisibleContent(contentRef.current);
    setPhase('in');
    if (scrollTop) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }
  };

  useEffect(() => {
    pendingKeyRef.current = viewKey;

    if (viewKey === renderedKey) {
      return;
    }

    if (prefersReducedMotion()) {
      completeTransition(viewKey, scrollTopOnEnter);
      return;
    }

    setPhase('out');
    const timer = window.setTimeout(() => {
      if (pendingKeyRef.current === viewKey) {
        completeTransition(viewKey, scrollTopOnEnter);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [viewKey, renderedKey, scrollTopOnEnter]);

  const handleAnimationEnd = () => {
    if (phase !== 'out') return;
    completeTransition(pendingKeyRef.current, scrollTopOnEnter);
  };

  const shellClass = [
    'app-fade-shell',
    phase === 'in' ? 'app-fade-in' : 'app-fade-out',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showLiveContent = viewKey === renderedKey && phase === 'in';

  return (
    <div className={shellClass} onAnimationEnd={handleAnimationEnd}>
      {showLiveContent ? children : visibleContent}
    </div>
  );
}
