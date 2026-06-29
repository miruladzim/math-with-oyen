/** Short viewports (phones, small tablets) where play UI should fit without scrolling. */
export function isCompactPlayViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-height: 820px)').matches;
}
