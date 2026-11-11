"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Activity = { id: string; title: string; description: string; icon: string; skill: string };
const activities: Activity[] = [
  { id: "memory", title: "ذاكرة الأرقام", description: "تدرّب على تذكّر تسلسل الأرقام خطوة بخطوة.", icon: "▦", skill: "الذاكرة" },
  { id: "focus", title: "التركيز البصري", description: "ابحث عن الرمز المختلف بين مجموعة رموز.", icon: "◎", skill: "الانتباه" },
  { id: "letters", title: "تمييز الحروف", description: "تعرّف إلى الحرف المطلوب بين خيارات متعددة.", icon: "أ", skill: "اللغة" },
  { id: "words", title: "كلمات ومعانٍ", description: "اربط الكلمة بمعناها الصحيح.", icon: "文", skill: "اللغة" },
  { id: "math", title: "الحساب الأساسي", description: "حل مسائل جمع قصيرة بمستويات متدرجة.", icon: "＋", skill: "الحساب" },
  { id: "daily", title: "التحدي اليومي", description: "أنجز نشاطاً قصيراً واجمع نقاطك اليومية.", icon: "✦", skill: "تحديات" },
];

export default function Home() {
  const [points, setPoints] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [feedback, setFeedback] = useState("");
  const [round, setRound] = useState(0);
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email || ""));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email || ""));
      return () => listener.subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cognivia-progress") || "{}");
      setPoints(Number(saved.points) || 0);
      setCompleted(Array.isArray(saved.completed) ? saved.completed : []);
    } catch { /* start with clean progress if local data is invalid */ }
  }, []);

  async function sendMagicLink() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setAuthMessage("أضف مفاتيح Supabase إلى إعدادات الاستضافة لتفعيل الحسابات."); return; }
    if (!email.trim()) { setAuthMessage("أدخل بريدك الإلكتروني أولاً."); return; }
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin } });
    setAuthMessage(error ? "تعذّر إرسال رابط الدخول. تحقق من إعدادات Supabase." : "تم إرسال رابط الدخول إلى بريدك الإلكتروني.");
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setAuthMessage("تم تسجيل الخروج.");
  }

  function finishActivity(id: string, earned = 10) {
    const next = Array.from(new Set([...completed, id]));
    const nextPoints = points + earned;
    setCompleted(next);
    setPoints(nextPoints);
    localStorage.setItem("cognivia-progress", JSON.stringify({ points: nextPoints, completed: next }));
    setFeedback("أحسنت! أُضيفت نقاط النشاط إلى رصيدك.");
  }

  function openActivity(activity: Activity) {
    setSelected(activity);
    setFeedback("");
    setRound((v) => v + 1);
  }

  const choices = selected?.id === "letters" ? ["ب", "ت", "ث", "ن"] :
    selected?.id === "words" ? ["فرح", "حزن", "سرعة", "هدوء"] :
    selected?.id === "math" ? ["7", "8", "9", "10"] : [];

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div><div className="brand-name">COGNIVIA</div><div className="brand-sub">منصة تعليمية تفاعلية</div></div>
        </div>
        <div className="pill">نسخة تجريبية · الإصدار 0.1</div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">LEARN · PRACTICE · GROW</div>
          <h1>كل خطوة صغيرة، تصنع تقدّماً كبيراً.</h1>
          <p>مساحة تعليمية هادئة تساعدك على تدريب الذاكرة والانتباه واللغة والحساب من خلال أنشطة قصيرة وتفاعلية.</p>
        </div>
      </section>

      <section className="panel" aria-label="حساب المتعلم">
        <h3>حساب المتعلّم</h3>
        {userEmail ? (
          <><p>تم تسجيل الدخول باستخدام {userEmail}</p><button className="action" onClick={signOut}>تسجيل الخروج</button></>
        ) : (
          <><p>يمكن تفعيل الدخول بالبريد الإلكتروني بعد ربط مشروع Supabase.</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
              <input aria-label="البريد الإلكتروني" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="البريد الإلكتروني" style={{minWidth:220,flex:1,padding:12,borderRadius:10,border:"1px solid var(--line)",background:"#071a2d",color:"var(--text)"}} />
              <button className="action" onClick={sendMagicLink}>إرسال رابط الدخول</button>
            </div>
          </>
        )}
        {authMessage && <p role="status" style={{marginTop:10,color:"var(--cyan)"}}>{authMessage}</p>}
      </section>

      <section className="stats" aria-label="ملخص التقدم">
        <div className="stat"><strong>{points}</strong><span>النقاط المكتسبة</span></div>
        <div className="stat"><strong>{completed.length}</strong><span>الأنشطة المكتملة</span></div>
        <div className="stat"><strong>{activities.length}</strong><span>الأنشطة المتاحة</span></div>
      </section>

      <div className="section-head">
        <div><h2>مساحة التعلّم</h2><p>اختر نشاطاً وابدأ التدريب بالوتيرة المناسبة لك.</p></div>
      </div>

      {!selected ? (
        <section className="grid">
          {activities.map((activity) => (
            <button className="activity" key={activity.id} onClick={() => openActivity(activity)}>
              <span className="activity-icon">{activity.icon}</span>
              <strong>{activity.title}</strong>
              <small>{activity.description}</small>
              <span className="tag">{completed.includes(activity.id) ? "✓ مكتمل سابقاً" : activity.skill}</span>
            </button>
          ))}
        </section>
      ) : (
        <section className="game">
          <button className="back" onClick={() => { setSelected(null); setFeedback(""); }}>العودة إلى الأنشطة ←</button>
          <div className="eyebrow" style={{marginTop:22}}>{selected.skill}</div>
          <h2>{selected.title}</h2>
          {selected.id === "memory" ? (
            <>
              <p>تذكّر هذا التسلسل ثم اضغط «إظهار السؤال» لاختبار ذاكرتك.</p>
              <div style={{fontSize:30,letterSpacing:8,color:"var(--cyan)",margin:"22px 0"}}>{round % 2 ? "4 · 8 · 2" : "3 · 7 · 1"}</div>
              <button className="action" onClick={() => setFeedback("ما الرقم الأوسط في التسلسل؟")}>إظهار السؤال</button>
              {["7","8","2"].map((v) => <button className="choice" key={v} onClick={() => v === (round % 2 ? "8" : "7") ? finishActivity("memory") : setFeedback("حاول مرة أخرى، خذ وقتك.")}>{v}</button>)}
            </>
          ) : selected.id === "focus" ? (
            <>
              <p>اختر الرمز المختلف في المجموعة التالية.</p>
              <div style={{fontSize:28,letterSpacing:12,color:"var(--cyan)",margin:"22px 0"}}>○ ○ ○ ◇ ○ ○</div>
              <button className="action" onClick={() => finishActivity("focus")}>الرمز المختلف هو ◇</button>
              <button className="choice" onClick={() => setFeedback("جرّب البحث عن الشكل الذي يختلف عن البقية.")}>أحتاج تلميحاً</button>
            </>
          ) : (
            <>
              <p>{selected.id === "math" ? "كم يساوي 4 + 4؟" : selected.id === "letters" ? "اختر حرف (ت)." : selected.id === "words" ? "ما عكس كلمة «حزن»؟" : "أكمل نشاطاً قصيراً لتحصل على نقاطك."}</p>
              {choices.map((choice) => (
                <button className="choice" key={choice} onClick={() => {
                  const correct = selected.id === "math" ? choice === "8" : selected.id === "letters" ? choice === "ت" : choice === "فرح";
                  if (correct) finishActivity(selected.id); else setFeedback("ليست الإجابة الصحيحة. حاول مرة أخرى.");
                }}>{choice}</button>
              ))}
              {selected.id === "daily" && <button className="action" onClick={() => finishActivity("daily", 15)}>إنهاء التحدي اليومي</button>}
            </>
          )}
          <div className="feedback" role="status">{feedback}</div>
        </section>
      )}

      <section className="panel">
        <h3>مساحة آمنة للتعلّم</h3>
        <p>هذه الأنشطة تدريبية وتعليمية، وليست أداة للتشخيص الطبي أو بديلاً عن تقييم المختصين. التقدّم المحفوظ في هذه النسخة موجود على هذا الجهاز فقط.</p>
      </section>
      <footer className="footer">COGNIVIA © 2026 · التعلّم رحلة، ونحن نرافقك في كل خطوة.</footer>
    </main>
  );
}
