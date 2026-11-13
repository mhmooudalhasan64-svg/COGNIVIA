export interface FocusAttempt { selectedAnswer: string; isCorrect: boolean; reactionTimeMs: number; attemptNumber: number; }
export interface FocusAnswer { questionId: string; skill: string; correctAnswer: string; attempts: FocusAttempt[]; }
export interface FocusSession {
  id: string; startedAt: string; completedAt: string; durationMs: number;
  correctFirstTry: number; questionCount: number; accuracy: number;
  averageReactionTimeMs: number; answers: FocusAnswer[];
}
export interface FocusPerformanceStore { schemaVersion: 1; sessions: FocusSession[]; }
export interface FocusPerformanceSummary {
  sessionCount: number; questionCount: number; correctFirstTry: number; accuracy: number; averageReactionTimeMs: number;
}
export const PERFORMANCE_STORAGE_KEY: "cognivia-performance-v1";
export function readPerformanceStore(storage: Pick<Storage, "getItem">): FocusPerformanceStore;
export function saveFocusSession(storage: Pick<Storage, "getItem" | "setItem">, session: FocusSession): boolean;
export function summarizeFocusSessions(sessions: unknown[]): FocusPerformanceSummary;
