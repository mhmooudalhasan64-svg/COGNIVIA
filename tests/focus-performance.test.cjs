const test = require("node:test");
const assert = require("node:assert/strict");
const { readPerformanceStore, saveFocusSession, summarizeFocusSessions } = require("../lib/focus-performance.mjs");

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: (key) => data.has(key) ? data.get(key) : null, setItem: (key, value) => data.set(key, String(value)), get: (key) => data.get(key) };
}
const session = {
  id: "session-1", startedAt: "2026-11-13T10:00:00.000Z", completedAt: "2026-11-13T10:01:00.000Z",
  durationMs: 60000, correctFirstTry: 1, questionCount: 2, accuracy: 50, averageReactionTimeMs: 1200,
  answers: [
    { questionId: "q1", skill: "الانتباه", correctAnswer: "سيارة", attempts: [{ selectedAnswer: "سيارة", isCorrect: true, reactionTimeMs: 1000, attemptNumber: 1 }] },
    { questionId: "q2", skill: "الذاكرة", correctAnswer: "ب", attempts: [
      { selectedAnswer: "أ", isCorrect: false, reactionTimeMs: 1400, attemptNumber: 1 },
      { selectedAnswer: "ب", isCorrect: true, reactionTimeMs: 800, attemptNumber: 2 },
    ] },
  ],
};

test("returns a versioned empty store for a new device", () => {
  assert.deepEqual(readPerformanceStore(memoryStorage()), { schemaVersion: 1, sessions: [] });
});
test("recovers safely from malformed JSON", () => {
  assert.deepEqual(readPerformanceStore(memoryStorage({ "cognivia-performance-v1": "{broken" })), { schemaVersion: 1, sessions: [] });
});
test("saves a session without touching legacy progress", () => {
  const storage = memoryStorage({ "cognivia-progress": '{"points":30,"completed":["memory"]}' });
  assert.equal(saveFocusSession(storage, session), true);
  assert.equal(readPerformanceStore(storage).sessions.length, 1);
  assert.equal(storage.get("cognivia-progress"), '{"points":30,"completed":["memory"]}');
});
test("rejects duplicate session IDs", () => {
  const storage = memoryStorage();
  assert.equal(saveFocusSession(storage, session), true);
  assert.equal(saveFocusSession(storage, session), false);
  assert.equal(readPerformanceStore(storage).sessions.length, 1);
});
test("summarizes accuracy and response time from first attempts only", () => {
  assert.deepEqual(summarizeFocusSessions([session]), { sessionCount: 1, questionCount: 2, correctFirstTry: 1, accuracy: 50, averageReactionTimeMs: 1200 });
});
test("returns zero metrics for empty or invalid sessions", () => {
  const empty = { sessionCount: 0, questionCount: 0, correctFirstTry: 0, accuracy: 0, averageReactionTimeMs: 0 };
  assert.deepEqual(summarizeFocusSessions([]), empty);
  assert.deepEqual(summarizeFocusSessions([null, {}]), empty);
});
