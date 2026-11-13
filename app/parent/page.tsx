"use client";

import { useEffect, useMemo, useState } from "react";
import { readPerformanceStore, summarizeFocusSessions, type FocusSession } from "@/lib/focus-performance.mjs";

type Progress = { points?: number; completed?: string[] };
const activities = [
  { id: "memory", title: "ذاكرة الأرقام", skill: "الذاكرة" },
  { id: "focus", title: "التركيز البصري", skill: "الانتباه" },
  { id: "letters", title: "تمييز الحروف", skill: "اللغة" },
  { id: "words", title: "الكلمات والمعاني", skill: "اللغة" },
  { id: "math", title: "الحساب الذهني", skill: "الحساب" },
  { id: "daily", title: "التحدي اليومي", skill: "التحديات" },
];

export default function ParentDashboard() {
  const [progress, setProgress] = useState<Progress>({ points: 0, completed: [] });
  const [ready, setReady] = useState(false);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cognivia-progress") || "{}") as Progress;
      setProgress({ points: Number(saved.points) || 0, completed: Array.isArray(saved.completed) ? saved.completed : [] });
    } catch {
      setProgress({ points: 0, completed: [] });
    }
    try {
      setFocusSessions(readPerformanceStore(window.localStorage).sessions);
    } catch {
      setFocusSessions([]);
    }
    setReady(true);
  }, []);

  const completed = useMemo(() => new Set(progress.completed || []), [progress.completed]);
  const percentage = Math.round((completed.size / activities.length) * 100);
  const focusSummary = useMemo(() => summarizeFocusSessions(focusSessions), [focusSessions]);

  return (
    <main className="app-shell" dir="rtl">
      <section className="main-area parent-dashboard">
        <header className="topbar">
          <div>
            <div className="breadcrumb">COGNIVIA <span>/</span> متابعة الأسرة</div>
            <div className="topbar-title">لوحة ولي الأمر</div>
          </div>
          <a className="parent-back" href="/">العودة إلى المنصة ←</a>
        </header>

        <section className="parent-hero">
          <div className="eyebrow">FAMILY PROGRESS OVERVIEW</div>
          <h1>متابعة رحلة التعلّم</h1>
          <p>ملخص مبسّط للأنشطة التي أنجزها الطفل والنقاط التي جمعها.</p>
        </section>

        {!ready ? <p className="parent-note">جارٍ تحميل التقدم…</p> : (
          <>
            <section className="parent-metrics">
              <article className="parent-metric"><span>إجمالي النقاط</span><strong>{progress.points || 0}</strong><small>نقطة تعليمية</small></article>
              <article className="parent-metric"><span>الأنشطة المكتملة</span><strong>{completed.size}</strong><small>من أصل {activities.length} أنشطة</small></article>
              <article className="parent-metric"><span>معدل الإنجاز</span><strong>{percentage}%</strong><small>من الأنشطة المتاحة</small></article>
            </section>

            <section className="parent-panel focus-parent-panel">
              <div className="parent-section-head">
                <div><div className="eyebrow">FOCUS TRAINING ANALYTICS</div><h2>تحليل وضع التركيز</h2></div>
                <a className="focus-parent-open" href="/focus-test/">بدء تدريب جديد ←</a>
              </div>
              <div className="focus-parent-metrics">
                <article><strong>{focusSummary.sessionCount}</strong><span>جلسات مكتملة</span></article>
                <article><strong>{focusSummary.questionCount}</strong><span>أسئلة تمت الإجابة عنها</span></article>
                <article><strong>{focusSummary.accuracy}%</strong><span>دقة المحاولة الأولى</span></article>
                <article><strong>{(focusSummary.averageReactionTimeMs / 1000).toFixed(1)} ث</strong><span>متوسط زمن الاستجابة الأولى</span></article>
              </div>
              {focusSessions.length === 0 ? (
                <p className="focus-parent-empty">لا توجد جلسات تركيز محفوظة بعد. عند إكمال أول جلسة ستظهر نتائجها هنا.</p>
              ) : (
                <div className="focus-session-list">
                  {[...focusSessions].slice(-5).reverse().map((session) => (
                    <div className="focus-session-row" key={session.id}>
                      <span>{new Date(session.completedAt).toLocaleString("ar-SY", { dateStyle: "medium", timeStyle: "short" })}</span>
                      <strong>{session.accuracy}%</strong>
                      <small>{session.correctFirstTry}/{session.questionCount} من أول محاولة</small>
                    </div>
                  ))}
                </div>
              )}
              <p className="focus-parent-disclaimer">هذه مؤشرات تدريبية وصفية محفوظة على هذا الجهاز، ولا تُستخدم لتشخيص اضطراب الانتباه أو أي حالة طبية.</p>
            </section>

            <section className="parent-panel">
              <div className="parent-section-head">
                <div><div className="eyebrow">ACTIVITY TRACKER</div><h2>سجل الأنشطة</h2></div>
                <span className="parent-count">{completed.size}/{activities.length}</span>
              </div>
              <div className="parent-activity-list">
                {activities.map((activity) => {
                  const done = completed.has(activity.id);
                  return (
                    <div className="parent-activity" key={activity.id}>
                      <div className="parent-activity-icon">{done ? "✓" : "○"}</div>
                      <div className="parent-activity-name"><strong>{activity.title}</strong><small>{activity.skill}</small></div>
                      <span className={done ? "parent-status done" : "parent-status"}>{done ? "مكتمل" : "لم يُنجز بعد"}</span>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="parent-note">
              <strong>ملاحظة حول البيانات</strong>
              <p>هذا التقرير يعرض التقدم المحفوظ على هذا الجهاز فقط. مزامنة البيانات بين الأجهزة وحسابات الأسرة ستُفعّل بعد استكمال ربط قاعدة البيانات السحابية.</p>
            </section>
          </>
        )}
        <footer className="app-footer"><span>COGNIVIA © 2026</span><span>متابعة تعليمية للأسرة</span><span>الإصدار التجريبي 0.3</span></footer>
      </section>
      <style jsx>{`
        .parent-dashboard{max-width:1180px;width:100%;margin:0 auto}
        .parent-back{font-size:11px;color:#8bdfff;text-decoration:none;border:1px solid rgba(80,215,255,.25);padding:10px 14px;border-radius:8px}
        .parent-hero{padding:30px;border:1px solid rgba(80,215,255,.22);border-radius:14px;background:linear-gradient(110deg,#0b2b43,#07192b);margin:24px 0}
        .parent-hero h1{font-size:26px;margin:12px 0 8px}.parent-hero p{font-size:12px;color:#9db5c8;margin:0;line-height:1.8}
        .parent-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:20px}
        .parent-metric,.parent-panel,.parent-note{border:1px solid rgba(130,190,224,.15);border-radius:12px;background:linear-gradient(145deg,#0d2942,#081a2c);padding:20px}
        .parent-metric span,.parent-metric small{display:block;color:#8ea9bf;font-size:11px}.parent-metric strong{display:block;color:#eaf4fc;font-size:30px;margin:12px 0 4px}
        .parent-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.parent-section-head h2{font-size:18px;margin:8px 0 0}.parent-count{color:#8bdfff;font-size:12px}
        .parent-activity{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid rgba(130,190,224,.1)}
        .parent-activity-icon{width:32px;height:32px;border:1px solid rgba(80,215,255,.22);border-radius:9px;display:grid;place-items:center;color:#50d7ff}
        .parent-activity-name{flex:1}.parent-activity-name strong,.parent-activity-name small{display:block}.parent-activity-name strong{font-size:12px}.parent-activity-name small{font-size:10px;color:#8ea9bf;margin-top:4px}
        .parent-status{font-size:10px;color:#91aabe}.parent-status.done{color:#70dfb2}
        .parent-note{margin-top:16px}.parent-note strong{font-size:12px;color:#cfe8f7}.parent-note p{font-size:11px;color:#8ea9bf;line-height:1.9;margin:8px 0 0}

        .focus-parent-panel{margin:20px 0}.focus-parent-open{font-size:10px;color:#8bdfff;text-decoration:none;border:1px solid rgba(80,215,255,.2);padding:8px 11px;border-radius:7px;white-space:nowrap}
        .focus-parent-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.focus-parent-metrics article{padding:14px;border:1px solid rgba(130,190,224,.12);border-radius:9px;background:rgba(5,22,37,.35)}.focus-parent-metrics strong,.focus-parent-metrics span{display:block}.focus-parent-metrics strong{font-size:22px;color:#e8f8ff}.focus-parent-metrics span{font-size:9px;color:#8ea9bf;margin-top:5px}
        .focus-parent-empty,.focus-parent-disclaimer{font-size:10px;line-height:1.8;color:#8ea9bf}.focus-parent-disclaimer{margin:15px 0 0}.focus-session-list{margin-top:14px}.focus-session-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid rgba(130,190,224,.1);font-size:10px;color:#91aabe}.focus-session-row strong{margin-right:auto;color:#8bdfff;font-size:13px}.focus-session-row small{color:#8ea9bf}
        @media(max-width:600px){.focus-parent-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.focus-parent-open{font-size:9px;padding:7px}.focus-session-row{flex-wrap:wrap}.focus-session-row small{width:100%}}
        @media(max-width:600px){.parent-metrics{grid-template-columns:1fr}.parent-hero{padding:22px}.parent-hero h1{font-size:22px}.topbar{gap:8px}.parent-back{white-space:nowrap;font-size:10px;padding:8px}}
      `}</style>
    </main>
  );
}
