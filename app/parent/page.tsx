"use client";

import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cognivia-progress") || "{}") as Progress;
      setProgress({ points: Number(saved.points) || 0, completed: Array.isArray(saved.completed) ? saved.completed : [] });
    } catch {
      setProgress({ points: 0, completed: [] });
    }
    setReady(true);
  }, []);

  const completed = useMemo(() => new Set(progress.completed || []), [progress.completed]);
  const percentage = Math.round((completed.size / activities.length) * 100);

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
        @media(max-width:600px){.parent-metrics{grid-template-columns:1fr}.parent-hero{padding:22px}.parent-hero h1{font-size:22px}.topbar{gap:8px}.parent-back{white-space:nowrap;font-size:10px;padding:8px}}
      `}</style>
    </main>
  );
}
