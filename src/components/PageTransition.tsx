import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { FadeView } from './FadeView';
import { Lab } from '../pages/Lab';
import { Games } from '../pages/Games';
import { Home } from '../pages/Home';
import { Practice } from '../pages/Practice';
import { ProgressPage } from '../pages/Progress';
import { FinalExam } from '../pages/FinalExam';
import { Teacher } from '../pages/Teacher';

export function PageTransition() {
  const location = useLocation();
  const locationKey = location.pathname;

  return (
    <FadeView viewKey={locationKey} scrollTopOnEnter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/games" element={<Games />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/exam" element={<FinalExam />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FadeView>
  );
}
