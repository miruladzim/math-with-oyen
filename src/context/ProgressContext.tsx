import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadProgress,
  saveProgress,
  setGradeLevel as saveGrade,
  setStudentName as saveStudentName,
  updateSettings,
} from '../lib/progress';
import type { AppProgress, AppSettings, GradeLevel } from '../lib/types';

interface ProgressContextValue {
  progress: AppProgress;
  setProgress: (progress: AppProgress) => void;
  gradeLevel: GradeLevel;
  setGradeLevel: (grade: GradeLevel) => void;
  studentName: string;
  setStudentName: (name: string) => void;
  refreshProgress: () => void;
  patchSettings: (settings: Partial<AppSettings>) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgressState] = useState<AppProgress>(() => loadProgress());

  const setProgress = useCallback((next: AppProgress) => {
    saveProgress(next);
    setProgressState(next);
  }, []);

  const setGradeLevel = useCallback((grade: GradeLevel) => {
    setProgressState((prev) => saveGrade(prev, grade));
  }, []);

  const setStudentName = useCallback((name: string) => {
    setProgressState((prev) => saveStudentName(prev, name));
  }, []);

  const refreshProgress = useCallback(() => {
    setProgressState(loadProgress());
  }, []);

  const patchSettings = useCallback((settings: Partial<AppSettings>) => {
    setProgressState((prev) => updateSettings(prev, settings));
  }, []);

  const value = useMemo(
    () => ({
      progress,
      setProgress,
      gradeLevel: progress.gradeLevel,
      setGradeLevel,
      studentName: progress.studentName,
      setStudentName,
      refreshProgress,
      patchSettings,
    }),
    [progress, setProgress, setGradeLevel, setStudentName, refreshProgress, patchSettings],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
