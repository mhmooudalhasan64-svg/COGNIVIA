export const PERFORMANCE_STORAGE_KEY = "cognivia-performance-v1";
const EMPTY_STORE = { schemaVersion: 1, sessions: [] };
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isValidSession = (session) => isRecord(session) && typeof session.id === "string" && session.id.length > 0 && Array.isArray(session.answers) && Number.isFinite(session.durationMs) && session.durationMs >= 0;

export function readPerformanceStore(storage) {
  try {
    const raw = storage?.getItem(PERFORMANCE_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STORE, sessions: [] };
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !Array.isArray(parsed.sessions)) return { ...EMPTY_STORE, sessions: [] };
    return { schemaVersion: 1, sessions: parsed.sessions.filter(isValidSession) };
  } catch {
    return { ...EMPTY_STORE, sessions: [] };
  }
}

export function saveFocusSession(storage, session) {
  if (!storage || !isValidSession(session)) throw new TypeError("Invalid focus session or storage.");
  const store = readPerformanceStore(storage);
  if (store.sessions.some((item) => item.id === session.id)) return false;
  storage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, sessions: [...store.sessions, session] }));
  return true;
}

export function summarizeFocusSessions(sessions) {
  const validSessions = Array.isArray(sessions) ? sessions.filter(isValidSession) : [];
  let questionCount = 0, correctFirstTry = 0, responseTimeTotal = 0, responseTimeCount = 0;
  for (const session of validSessions) {
    for (const answer of session.answers) {
      if (!isRecord(answer) || !Array.isArray(answer.attempts)) continue;
      const first = answer.attempts.find((attempt) => isRecord(attempt) && attempt.attemptNumber === 1);
      if (!first || typeof first.isCorrect !== "boolean") continue;
      questionCount += 1;
      if (first.isCorrect) correctFirstTry += 1;
      if (Number.isFinite(first.reactionTimeMs) && first.reactionTimeMs >= 0) {
        responseTimeTotal += first.reactionTimeMs;
        responseTimeCount += 1;
      }
    }
  }
  return {
    sessionCount: validSessions.length,
    questionCount,
    correctFirstTry,
    accuracy: questionCount ? Math.round(correctFirstTry / questionCount * 100) : 0,
    averageReactionTimeMs: responseTimeCount ? Math.round(responseTimeTotal / responseTimeCount) : 0,
  };
}
