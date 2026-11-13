"use client";

import { useEffect, useRef, useState } from "react";
import { saveFocusSession, type FocusAnswer, type FocusSession } from "@/lib/focus-performance.mjs";

const questions = [
  { id: "different-word", skill: "الانتباه", prompt: "أي كلمة تختلف عن بقية الكلمات؟", hint: "تفاحة · برتقالة · سيارة · موزة", options: ["تفاحة", "سيارة", "موزة", "برتقالة"], correct: "سيارة" },
  { id: "letter-match", skill: "اللغة", prompt: "اختر الحرف (ب).", hint: "انتبه إلى شكل الحرف قبل الاختيار.", options: ["ت", "ث", "ب", "ن"], correct: "ب" },
  { id: "mental-math", skill: "الحساب", prompt: "كم يساوي ٣ + ٤؟", hint: "فكّر بهدوء قبل الإجابة.", options: ["٦", "٧", "٨", "٩"], correct: "٧" },
  { id: "number-memory", skill: "الذاكرة", prompt: "ما الرقم الذي كان في منتصف التسلسل؟", hint: "٢ — ٥ — ٨", options: ["٢", "٥", "٨", "٣"], correct: "٥" },
  { id: "visual-pattern", skill: "الانتباه", prompt: "اختر الشكل المختلف.", hint: "○　○　△　○", options: ["○", "△", "□", "◇"], correct: "△" },
] as const;

function newSessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `focus-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function FocusTestPage() {
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<FocusAnswer["attempts"]>([]);
  const [answers, setAnswers] = useState<FocusAnswer[]>([]);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const [retry, setRetry] = useState(false);
  const [session, setSession] = useState<FocusSession | null>(null);
  const [saveError, setSaveError] = useState("");
  const timer = useRef(0);
  const sessionTimer = useRef(0);
  const startIso = useRef(new Date().toISOString());
  const sessionId = useRef(newSessionId());
  const saved = useRef(false);
  const pendingSession = useRef<FocusSession | null>(null);
  const question = questions[index];
  const attemptNumber = attempts.length + 1;

  useEffect(() => {
    timer.current = performance.now();
    if (index === 0 && attempts.length === 0 && answers.length === 0) sessionTimer.current = timer.current;
  }, [index, attempts.length, retry]);

  function choose(value: string) {
    if (locked || retry) return;
    const attempt = { selectedAnswer: value, isCorrect: value === question.correct, reactionTimeMs: Math.max(0, Math.round(performance.now() - timer.current)), attemptNumber };
    const next = [...attempts, attempt];
    setAttempts(next);
    if (attempt.isCorrect) {
      setFeedback(attemptNumber === 1 ? "إجابة صحيحة من المحاولة الأولى." : "أحسنت، وصلت إلى الإجابة الصحيحة.");
      setLocked(true);
    } else if (attemptNumber === 1) {
      setFeedback("ليست هذه الإجابة. خذ وقتك وحاول مرة أخرى.");
      setRetry(true);
    } else {
      setFeedback("انتهت محاولتا هذا السؤال. انتقل إلى السؤال التالي.");
      setLocked(true);
    }
  }

  function persist(finalAnswers: FocusAnswer[]) {
    if (saved.current) return;
    const completed = pendingSession.current ?? (() => {
      const first = finalAnswers.map((item) => item.attempts[0]).filter(Boolean);
      const correct = first.filter((item) => item.isCorrect).length;
      const times = first.map((item) => item.reactionTimeMs).filter(Number.isFinite);
      return {
        id: sessionId.current, startedAt: startIso.current, completedAt: new Date().toISOString(),
        durationMs: Math.max(0, Math.round(performance.now() - sessionTimer.current)),
        correctFirstTry: correct, questionCount: finalAnswers.length,
        accuracy: finalAnswers.length ? Math.round(correct / finalAnswers.length * 100) : 0,
        averageReactionTimeMs: times.length ? Math.round(times.reduce((sum, n) => sum + n, 0) / times.length) : 0,
        answers: finalAnswers,
      } satisfies FocusSession;
    })();
    pendingSession.current = completed;
    try {
      if (!saveFocusSession(window.localStorage, completed)) throw new Error("duplicate");
      saved.current = true;
      pendingSession.current = null;
      setSession(completed);
      setSaveError("");
    } catch {
      setSaveError("تعذّر حفظ الجلسة على هذا الجهاز. تحقق من مساحة التخزين ثم أعد المحاولة.");
    }
  }

  function next() {
    if (!locked) return;
    const record: FocusAnswer = { questionId: question.id, skill: question.skill, correctAnswer: question.correct, attempts };
    const nextAnswers = [...answers, record];
    setAnswers(nextAnswers);
    if (index === questions.length - 1) { persist(nextAnswers); return; }
    setIndex((value) => value + 1);
    setAttempts([]);
    setLocked(false);
    setRetry(false);
    setFeedback("");
  }

  function restart() {
    setIndex(0); setAttempts([]); setAnswers([]); setFeedback(""); setLocked(false); setRetry(false);
    setSession(null); setSaveError(""); saved.current = false; pendingSession.current = null; startIso.current = new Date().toISOString(); sessionTimer.current = performance.now(); sessionId.current = newSessionId();
  }

  return <main className="focus-shell" dir="rtl">
    <header className="focus-topbar">
      <a href="/" className="focus-brand"><span className="focus-brand-mark">C</span><span><b>COGNIVIA</b><small>مساحة التركيز الهادئ</small></span></a>
      <a href="/parent/" className="focus-parent-link">متابعة ولي الأمر</a>
    </header>
    <section className="focus-content">
      {!session ? <>
        <div className="focus-intro"><span className="focus-kicker">FOCUS SESSION</span><h1>خذ وقتك، وركّز على سؤال واحد</h1><p>تدريب قصير لممارسة الانتباه والذاكرة. لا يوجد توقيت تنافسي، ويمكنك التفكير بهدوء.</p></div>
        <div className="focus-progress-row"><span>السؤال {index + 1} من {questions.length}</span><span>{Math.round(index / questions.length * 100)}% مكتمل</span></div>
        <div className="focus-progress-track"><span style={{ width: `${index / questions.length * 100}%` }} /></div>
        <section className="focus-question-card" aria-live="polite">
          <div className="focus-question-meta"><span>{question.skill}</span><span>المحاولة {Math.min(attemptNumber, 2)} من 2</span></div>
          <h2>{question.prompt}</h2><p className="focus-instruction">{question.hint}</p>
          <div className="focus-options">{question.options.map((option) => <button key={option} className="focus-option" onClick={() => choose(option)} disabled={locked || retry}>{option}</button>)}</div>
          <p className="focus-feedback" role="status">{feedback || "اختر إجابة واحدة عندما تكون مستعداً."}</p>
          {retry && <button className="focus-primary" onClick={() => { setRetry(false); setFeedback("محاولة ثانية — ركّز واختر إجابتك."); }}>حاول مرة أخرى</button>}
          {locked && <button className="focus-primary" onClick={next}>{index === questions.length - 1 ? "إنهاء الجلسة" : "السؤال التالي ←"}</button>}
        </section>
        <p className="focus-privacy-note">تُحفظ النتائج على هذا الجهاز فقط. المؤشرات للتدريب والمتابعة التعليمية وليست تشخيصاً طبياً.</p>
      </> : <section className="focus-complete-card">
        <span className="focus-kicker">SESSION COMPLETE</span><div className="focus-complete-mark">✓</div>
        <h1>أكملت جلسة التركيز</h1><p>أحسنت. كل محاولة فرصة جديدة للتعلّم.</p>
        <div className="focus-result-grid">
          <div><strong>{session.accuracy}%</strong><span>دقة المحاولة الأولى</span></div>
          <div><strong>{session.correctFirstTry}/{session.questionCount}</strong><span>إجابات صحيحة من أول مرة</span></div>
          <div><strong>{(session.averageReactionTimeMs / 1000).toFixed(1)} ث</strong><span>متوسط زمن الاستجابة</span></div>
        </div>
        <p className="focus-feedback">تم حفظ نتائجك على هذا الجهاز.</p><button className="focus-primary" onClick={restart}>بدء جلسة جديدة</button>
      </section>}
      {saveError && <p className="focus-save-error" role="alert">{saveError}<button onClick={() => pendingSession.current && persist(pendingSession.current.answers)}>إعادة الحفظ</button></p>}
    </section>
    <footer className="focus-footer"><span>COGNIVIA © 2026</span><span>تدريب تعليمي غير تشخيصي</span></footer>
  </main>;
}