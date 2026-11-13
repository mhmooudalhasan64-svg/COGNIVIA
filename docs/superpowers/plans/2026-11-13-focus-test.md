# وضع التركيز المستقل Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an independent, measurable focus-training flow to COGNIVIA and expose its session analytics to parents without changing existing activities.

**Architecture:** Put versioned local persistence and pure aggregation helpers in a small utility module; build the standalone client route on top of that contract; add a separate analytics section to the existing parent dashboard. Keep the current progress key and static-export configuration unchanged.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, browser localStorage, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-13-focus-test-design.md`

## Global Constraints
- Preserve every existing activity and its current scoring behavior.
- Keep `output: "export"` and `trailingSlash: true`; do not add server routes.
- Store performance data under `cognivia-performance-v1`; do not mutate `cognivia-progress`.
- No personal child identifiers and no medical/diagnostic claims.
- Focus sessions award no points in this iteration.
- Do not deploy to production.

## Review Focus
- Malformed or partially written localStorage JSON must return a safe empty schema without crashing.
- Existing legacy progress data must remain byte-for-byte untouched by focus-session writes.
- Rapid repeated clicks or completion after refresh must not persist a session twice.
- Timer behavior must remain non-negative when a tab is backgrounded or the device clock changes.
- Parent analytics must handle empty sessions and malformed individual records without NaN or rendering failure.

---

### Task 1: Versioned performance store and tests

**Files:**
- Create: `lib/focus-performance.mjs`
- Create: `lib/focus-performance.d.mts`
- Create: `tests/focus-performance.test.cjs`
- Modify: `package.json` (add `test:focus` script)

**Interfaces:**
- Produces `readPerformanceStore(storage)`, `saveFocusSession(storage, session)`, and `summarizeFocusSessions(sessions)`.
- Store schema: `{ schemaVersion: 1, sessions: FocusSession[] }`.
- `saveFocusSession(storage, session): boolean` returns `false` when the session ID already exists and otherwise writes once and returns `true`.
- A session contains a unique `id`, ISO `startedAt`/`completedAt`, `durationMs`, `correctFirstTry` (count), `questionCount`, `accuracy` (0–100 percentage based on first attempts), `averageReactionTimeMs` (mean first-attempt response time), and answer records with `questionId`, `skill`, `correctAnswer`, and an `attempts[]` list containing `selectedAnswer`, `isCorrect`, `reactionTimeMs`, and `attemptNumber`.

- [ ] **Step 1: Write failing tests** in `tests/focus-performance.test.cjs` for safe empty reads, malformed JSON, saving a new session, duplicate-ID rejection, legacy-key isolation, first-try accuracy aggregation, and empty summaries.
- [ ] **Step 2: Run the tests to verify failure.** Run: `npm run test:focus`. Expected: FAIL because the module exports do not exist yet.
- [ ] **Step 3: Implement the pure store helpers** in `lib/focus-performance.mjs`; keep storage injectable so Node tests need no browser globals. Add matching declarations in `lib/focus-performance.d.mts`. Ignore malformed individual sessions during summaries; return zero-valued metrics for an empty or unusable list.
- [ ] **Step 4: Run tests.** Run: `npm run test:focus`. Expected: all focused tests PASS.
- [ ] **Step 5: Run typecheck.** Run: `npm run typecheck`. Expected: exit code 0.

### Task 2: Independent focus-test route and home entry

**Files:**
- Create: `app/focus-test/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes the Task 1 `saveFocusSession` contract and `FocusSession` type.
- Exposes the static route `/focus-test/`; no server dependencies.

- [ ] **Step 1: Implement a five-question Arabic multiple-choice flow** with two attempts maximum per question, first-attempt correctness tracking, clear feedback, next-question/completion states, and keyboard-accessible answer controls.
- [ ] **Step 2: Start each attempt timer with `performance.now()` when the question/attempt is presented; record non-negative elapsed time per attempt and ISO wall-clock timestamps separately. The first-attempt metrics remain the basis for accuracy and average response time.
- [ ] **Step 3: Persist a completed session once using a stable session ID; guard duplicate completion and show a useful storage-error message if persistence fails.**
- [ ] **Step 4: Add a distinct “وضع التركيز” navigation entry and prominent home card linking to `/focus-test/`; do not alter existing activity handlers or scoring.**
- [ ] **Step 5: Run `npm run typecheck` and `npm run build`.** Expected: both exit 0 and the static export includes `focus-test/index.html`.

### Task 3: Parent analytics

**Files:**
- Modify: `app/parent/page.tsx`

**Interfaces:**
- Consumes `readPerformanceStore` and `summarizeFocusSessions` from Task 1.
- Reads only the independent performance key; existing parent progress metrics remain unchanged.

- [ ] **Step 1: Add a focus analytics section** showing session count, total questions, first-attempt accuracy, average response time, and a recent-session list.
- [ ] **Step 2: Add empty and invalid-data states** and label all metrics as local, non-diagnostic training indicators.
- [ ] **Step 3: Run `npm run test:focus`, `npm run typecheck`, and `npm run build`.** Expected: all tests pass, both commands exit 0, and all existing routes remain in the export.

