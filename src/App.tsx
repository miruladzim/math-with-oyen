import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageTransition } from './components/PageTransition';
import { LanguageProvider } from './context/LanguageContext';
import { ProgressProvider } from './context/ProgressContext';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  return (
    <ProgressProvider>
      <LanguageProvider>
        <BrowserRouter basename={routerBasename || undefined}>
          <Layout>
            <PageTransition />
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </ProgressProvider>
  );
}
