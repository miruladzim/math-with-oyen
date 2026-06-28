import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';
import { Lab } from './pages/Lab';
import { Games } from './pages/Games';
import { Home } from './pages/Home';
import { Practice } from './pages/Practice';
import { ProgressPage } from './pages/Progress';
import { Teacher } from './pages/Teacher';

export function App() {
  return (
    <ProgressProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/games" element={<Games />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/teacher" element={<Teacher />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </ProgressProvider>
  );
}
