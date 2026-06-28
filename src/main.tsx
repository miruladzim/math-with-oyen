import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadProgress } from './lib/progress';
import { applyDarkMode } from './lib/theme';
import './styles/global.css';
import './styles/print.css';

applyDarkMode(loadProgress().settings.darkMode ?? false);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
