import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageTransition } from './components/PageTransition';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';

export function App() {
  return (
    <ProgressProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Layout>
            <PageTransition />
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </ProgressProvider>
  );
}
