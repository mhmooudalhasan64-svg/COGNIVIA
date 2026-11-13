"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Activity = { id: string; title: string; description: string; icon: string; skill: string; level: string; duration: string };
const activities: Activity[] = [
  { id:"memory", title:"ذاكرة الأرقام", description:"تذكّر تسلسلاً رقمياً ثم أجب عن السؤال.", icon:"🧠", skill:"الذاكرة", level:"سهل", duration:"3 دقائق" },
  { id:"focus", title:"التركيز البصري", description:"اكتشف الشكل المختلف وسط مجموعة من الرموز.", icon:"🔎", skill:"الانتباه", level:"سهل", duration:"2 دقائق" },
  { id:"letters", title:"تمييز الحروف", description:"تعرّف إلى الحروف المتشابهة بصرياً.", icon:"🔤", skill:"اللغة", level:"سهل", duration:"3 دقائق" },
  { id:"words", title:"الكلمات والمعاني", description:"اربط المفردة بمعناها أو ضدّها الصحيح.", icon:"🧩", skill:"اللغة", level:"متوسط", duration:"4 دقائق" },
  { id:"math", title:"الحساب الذهني", description:"حل عمليات حسابية قصيرة خطوة بخطوة.", icon:"🧮", skill:"الحساب", level:"سهل", duration:"3 دقائق" },
  { id:"daily", title:"التحدي اليومي", description:"مهمة يومية قصيرة لتنشيط مهاراتك.", icon:"🏆", skill:"تحديات", level:"متجدد", duration:"5 دقائق" },
];
const categories = ["الكل","الذاكرة","الانتباه","اللغة","الحساب","تحديات"];

export default function Home() {
  const [points,setPoints] = useState(0);
  const [completed,setCompleted] = useState<string[]>([]);
  const [selected,setSelected] = useState<Activity|null>(null);
  const [feedback,setFeedback] = useState("");
  const [selectedChoice,setSelectedChoice] = useState<string | null>(null);
  const [choiceCorrect,setChoiceCorrect] = useState<boolean | null>(null);
  const [round,setRound] = useState(0);
  const [category,setCategory] = useState("الكل");
  const [email,setEmail] = useState("");
  const [userEmail,setUserEmail] = useState("");
  const [authMessage,setAuthMessage] = useState("");
  const [showAccount,setShowAccount] = useState(false);
  const [memoryShown,setMemoryShown] = useState(true);

  useEffect(()=>{
    const supabase=getSupabaseBrowserClient();
    if(!supabase) return;
    supabase.auth.getSession().then(({data})=>setUserEmail(data.session?.user.email||""));
    const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>setUserEmail(session?.user.email||""));
    return ()=>listener.subscription.unsubscribe();
  },[]);
  useEffect(()=>{
    try {
      const saved=JSON.parse(localStorage.getItem("cognivia-progress")||"{}");
      setPoints(Number(saved.points)||0);
      setCompleted(Array.isArray(saved.completed)?saved.completed:[]);
    } catch { /* ignore invalid local progress */ }
  },[]);

  const filtered=useMemo(()=>activities.filter(a=>category==="الكل"||a.skill===category),[category]);
  const currentSequence=round%2===0?["3","7","1"]:["4","8","2"];
  const memoryAnswer=currentSequence[1];

  async function sendMagicLink(){
    const supabase=getSupabaseBrowserClient();
    if(!supabase){setAuthMessage("إعداد الاتصال السحابي غير مكتمل بعد.");return;}
    if(!email.trim()){setAuthMessage("أدخل بريدك الإلكتروني أولاً.");return;}
    const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});
    setAuthMessage(error?"تعذّر إرسال الرابط. تحقق من إعدادات البريد في Supabase.":"أرسلنا رابط تسجيل الدخول إلى بريدك.");
  }
  async function signOut(){
    const supabase=getSupabaseBrowserClient();
    if(supabase) await supabase.auth.signOut();
    setAuthMessage("تم تسجيل الخروج.");
  }
  function finishActivity(id:string,earned=10){
    if(completed.includes(id)){setFeedback("أنجزت هذا النشاط من قبل. جرّب نشاطاً آخر.");return;}
    const next=[...completed,id], nextPoints=points+earned;
    setCompleted(next);setPoints(nextPoints);
    localStorage.setItem("cognivia-progress",JSON.stringify({points:nextPoints,completed:next}));
    setFeedback("أحسنت! إجابة صحيحة، أُضيفت النقاط إلى رصيدك.");
  }
  function openActivity(a:Activity){
    setSelected(a);setFeedback("");setSelectedChoice(null);setChoiceCorrect(null);setRound(v=>v+1);setMemoryShown(true);
  }
  function backToDashboard(){setSelected(null);setFeedback("");setSelectedChoice(null);setChoiceCorrect(null);}

  return <main className="app-shell" dir="rtl">
    <aside className="sidebar">
      <div className="brand-lockup"><div className="brand-emblem">C</div><div><div className="brand-title">COGNIVIA</div><div className="brand-caption">SMART LEARNING SYSTEM</div></div></div>
      <div className="side-label">مساحة التعلّم</div>
      <button className="side-link active" onClick={backToDashboard}><span>⌂</span> الرئيسية</button>
      <button className="side-link" onClick={()=>{setCategory("الكل");document.getElementById("activities")?.scrollIntoView({behavior:"smooth"});}}><span>▦</span> الأنشطة التعليمية</button>
      <button className="side-link" onClick={()=>{setCategory("تحديات");document.getElementById("activities")?.scrollIntoView({behavior:"smooth"});}}><span>✦</span> التحديات اليومية</button>
      <a className="side-link focus-side-link" href="/focus-test/"><span>◎</span> وضع التركيز</a>
      <button className="side-link" onClick={()=>setShowAccount(v=>!v)}><span>◉</span> حساب المتعلّم</button>
      <button className="side-link" onClick={()=>{window.location.href="/parent";}}><span>▤</span> لوحة ولي الأمر</button>
      <div className="sidebar-bottom"><div className="system-indicator"><i/> النظام التعليمي جاهز</div><div className="sidebar-version">COGNIVIA CORE · 0.2</div></div>
    </aside>

    <section className="main-area">
      <header className="topbar">
        <div><div className="breadcrumb">COGNIVIA <span>/</span> لوحة التعلّم</div><div className="topbar-title">مساحة المتعلّم</div></div>
        <div className="top-actions"><div className="online-pill"><i/> بيئة تدريب تفاعلية</div><button className="profile-button" onClick={()=>setShowAccount(v=>!v)} aria-label="الحساب">م</button></div>
      </header>

      {showAccount&&<section className="account-panel">
        <div className="account-heading"><div><b>حساب المتعلّم</b><small>{userEmail||"الدخول بالبريد الإلكتروني"}</small></div><button className="close-button" onClick={()=>setShowAccount(false)}>×</button></div>
        {userEmail?<button className="outline-button" onClick={signOut}>تسجيل الخروج</button>:<div className="auth-row"><input aria-label="البريد الإلكتروني" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني"/><button className="primary-button" onClick={sendMagicLink}>إرسال رابط الدخول</button></div>}
        {authMessage&&<p className="auth-message">{authMessage}</p>}
        <small className="muted">تسجيل الدخول السحابي يحتاج إعداد مفاتيح Supabase في الاستضافة.</small>
      </section>}

      {!selected?<>
        <section className="welcome-hero">
          <div className="hero-grid"/>
          <div className="hero-copy"><div className="hero-eyebrow-row"><span className="hero-mascot" aria-hidden="true">🦉</span><div><div className="eyebrow"><span/> SMART EDUCATION PLATFORM</div><span className="hero-kid-label">نتعلّم ونلعب كل يوم</span></div></div><h1>أهلاً بك في <em>COGNIVIA</em></h1><p>طوّر مهاراتك، اكتشف قدراتك، وتقدّم خطوة جديدة كل يوم من خلال تجارب تعليمية تفاعلية.</p><div className="hero-actions"><button className="hero-button" onClick={()=>document.getElementById("activities")?.scrollIntoView({behavior:"smooth"})}>ابدأ التعلّم <span>←</span></button><a className="hero-button focus-hero-button" href="/focus-test/">وضع التركيز <span>◎</span></a></div></div>
          <div className="hero-floating-shapes" aria-hidden="true"><span>✦</span><i/><b/><em/></div><div className="hero-orbit"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core">C<span>+</span></div><div className="orbit-dot dot-one"/><div className="orbit-dot dot-two"/></div>
          <div className="hero-code">COGNITIVE<br/>DEVELOPMENT<br/><b>ENGINE</b></div>
        </section>

        <section className="metrics-row">
          <div className="metric-card"><div className="metric-icon">✧</div><div><strong>{points}</strong><small>إجمالي النقاط</small></div><span className="metric-foot">POINTS</span></div>
          <div className="metric-card"><div className="metric-icon">✓</div><div><strong>{completed.length}</strong><small>أنشطة مكتملة</small></div><span className="metric-foot">COMPLETED</span></div>
          <div className="metric-card"><div className="metric-icon">◈</div><div><strong>{activities.length}</strong><small>أنشطة متاحة</small></div><span className="metric-foot">ACTIVITIES</span></div>
          <div className="metric-card progress-metric"><div className="metric-icon">↗</div><div><strong>{Math.round(completed.length/activities.length*100)}<small className="percent">%</small></strong><small>معدل الإنجاز</small></div><div className="mini-progress"><i style={{width:(completed.length/activities.length*100)+"%"}}/></div></div>
        </section>

        <section className="section-block" id="activities">
          <div className="section-heading"><div><div className="eyebrow">LEARNING MODULES</div><h2>هيا نكتشف ونتعلّم!</h2><p>اختر لعبة تعليمية وابدأ مغامرتك.</p></div><div className="module-count">06 <span>MODULES</span></div></div>
          <div className="category-bar">{categories.map(c=><button key={c} className={category===c?"category active-category":"category"} onClick={()=>setCategory(c)}>{c}</button>)}</div>
          <div className="activity-grid">{filtered.map((a,index)=><button className="activity-card" key={a.id} onClick={()=>openActivity(a)}>
            <div className="card-topline"><span className="card-index">0{index+1}</span><span className="card-symbol">{a.icon}</span></div>
            <div className="card-category">{a.skill}</div><h3>{a.title}</h3><p>{a.description}</p>
            <div className="card-footer"><span>{a.level}</span><span>{a.duration}</span><b>{completed.includes(a.id)?"✓ مكتمل":"ابدأ النشاط ←"}</b></div>
          </button>)}</div>
        </section>
        <section className="bottom-panels">
          <div className="info-panel daily-panel"><div className="panel-kicker">DAILY MISSION</div><div className="daily-content"><div className="daily-symbol">🌈</div><div><h3>تحدّيك اليومي بانتظارك</h3><p>نشاط قصير يساعدك على المحافظة على الاستمرارية.</p><button className="text-button" onClick={()=>openActivity(activities[5])}>عرض التحدي ←</button></div></div></div>
          <div className="info-panel safety-panel"><div className="panel-kicker">LEARNING ENVIRONMENT</div><h3>تعلّم وفق وتيرتك</h3><p>أنشطة تعليمية داعمة، وليست أداة للتشخيص الطبي أو بديلاً عن تقييم المختصين.</p></div>
        </section>
      </>:<section className="exercise-workspace">
        <button className="back-link" onClick={backToDashboard}>← العودة إلى لوحة التعلّم</button>
        <div className="exercise-header"><div><div className="eyebrow">{selected.skill.toUpperCase()} · TRAINING MODULE</div><h1>{selected.title}</h1><p>{selected.description}</p></div><div className="exercise-level">{selected.level}<small>مستوى النشاط</small></div></div>
        <div className="exercise-stage">
          {selected.id==="memory"?<>
            <div className="stage-illustration" aria-hidden="true">🧠 <span>✦</span></div><div className="stage-kicker">MEMORY SEQUENCE</div><h2>تذكّر تسلسل الأرقام</h2><p>انظر إلى الأرقام، احتفظ بها في ذاكرتك، ثم أجب عن السؤال.</p>
            {memoryShown?<div className="number-sequence">{currentSequence.map((n,i)=><span key={i}>{n}</span>)}</div>:<div className="number-sequence hidden-sequence">؟　؟　؟</div>}
            <button className="primary-button" onClick={()=>setMemoryShown(v=>!v)}>{memoryShown?"إخفاء الأرقام":"إظهار الأرقام"}</button>
            <div className="question-label">ما الرقم الموجود في المنتصف؟</div>
            <div className="answer-row">{["1","2","3","4","7","8"].map(v=><button className={`answer-button${selectedChoice===v?(choiceCorrect?" answer-correct":" answer-wrong"):""}`} key={v} onClick={()=>{setSelectedChoice(v);setChoiceCorrect(v===memoryAnswer);v===memoryAnswer?finishActivity("memory"):setFeedback("حاول مجدداً. تذكّر الرقم الأوسط في التسلسل.");}}>{v}</button>)}</div>
          </>:selected.id==="focus"?<>
            <div className="stage-illustration" aria-hidden="true">🔍 <span>✧</span></div><div className="stage-kicker">VISUAL ATTENTION</div><h2>اكتشف الشكل المختلف</h2><p>اختر الشكل الذي يختلف عن بقية الأشكال.</p>
            <div className="shape-row">{["○","○","○","◇","○","○"].map((v,i)=><button key={i} className={`shape-button${selectedChoice===String(i)?(choiceCorrect?" answer-correct":" answer-wrong"):""}`} onClick={()=>{setSelectedChoice(String(i));setChoiceCorrect(i===3);i===3?finishActivity("focus"):setFeedback("هذا الشكل يشبه البقية. تابع البحث.");}}>{v}</button>)}</div>
          </>:<>
            <div className="stage-illustration" aria-hidden="true">🎨 <span>✦</span></div><div className="stage-kicker">INTERACTIVE EXERCISE</div><h2>{selected.id==="math"?"حل العملية الحسابية":selected.id==="letters"?"اختر الحرف المطلوب":selected.id==="words"?"اختر المعنى الصحيح":"أنجز المهمة اليومية"}</h2>
            <p>{selected.id==="math"?"كم يساوي 4 + 4؟":selected.id==="letters"?"اختر حرف (ت) من بين الحروف التالية.":selected.id==="words"?"ما الكلمة التي تعاكس معنى «حزن»؟":"أكمل التحدي اليومي لتحصل على نقاط إضافية."}</p>
            <div className="answer-row">{(selected.id==="math"?["7","8","9","10"]:selected.id==="letters"?["ب","ت","ث","ن"]:selected.id==="words"?["فرح","حزن","سرعة","هدوء"]:["ابدأ التحدي"]).map(v=><button key={v} className={`answer-button${selectedChoice===v?(choiceCorrect?" answer-correct":" answer-wrong"):""}`} onClick={()=>{const ok=selected.id==="math"?v==="8":selected.id==="letters"?v==="ت":selected.id==="words"?v==="فرح":true;setSelectedChoice(v);setChoiceCorrect(ok);ok?finishActivity(selected.id,selected.id==="daily"?15:10):setFeedback("ليست الإجابة الصحيحة. خذ وقتك وحاول مجدداً.");}}>{v}</button>)}</div>
          </>}
          <div className="feedback-message" role="status">{feedback}</div>
        </div>
      </section>}
      <footer className="app-footer"><span>COGNIVIA © 2026</span><span>SMART LEARNING · HUMAN POTENTIAL</span><span>الإصدار التجريبي 0.2</span></footer>
    </section>
  </main>;
}
