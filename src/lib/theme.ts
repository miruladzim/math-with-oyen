export function applyDarkMode(enabled: boolean): void {
  document.documentElement.classList.toggle('dark', enabled);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  themeMeta?.setAttribute('content', enabled ? '#0f172a' : '#6366f1');
}
