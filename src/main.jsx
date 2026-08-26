import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BookOpen, Check, ChevronRight, CircleHelp, ClipboardCheck, FlaskConical, Gauge, Home, Menu, Moon, RotateCcw, Search, Sun, X } from 'lucide-react'
import { glossary, modules, quizQuestions, scenarios } from './content'
import './styles.css'

const STORE = 'infraprep-progress-v1'
const defaultState = { completed: [], baseline: null, final: null, notes: {}, theme: 'light' }

function loadProgress() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORE) || '{}') } } catch { return defaultState }
}

function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [view, setView] = useState('overview')
  const [activeModule, setActiveModule] = useState(modules[0])
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(progress)); document.documentElement.dataset.theme = progress.theme }, [progress])
  const score = Math.round((progress.completed.length / modules.length) * 70 + ((progress.final?.score || progress.baseline?.score || 0) / quizQuestions.length) * 30)
  const navigate = (next) => { setView(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openModule = (mod) => { setActiveModule(mod); navigate('lesson') }
  const updateNote = (id, note) => setProgress(p => ({ ...p, notes: { ...p.notes, [id]: note } }))
  const completeModule = (id) => setProgress(p => ({ ...p, completed: p.completed.includes(id) ? p.completed : [...p.completed, id] }))
  const reset = () => { if (confirm('Reset all lesson and quiz progress?')) setProgress({ ...defaultState, theme: progress.theme }) }
  return <div className="app-shell">
    <Sidebar view={view} open={menuOpen} navigate={navigate} />
    <div className="main-shell">
      <Header score={score} progress={progress} setProgress={setProgress} setMenuOpen={setMenuOpen} reset={reset} />
      <main>
        {view === 'overview' && <Overview progress={progress} score={score} navigate={navigate} openModule={openModule} />}
        {view === 'learn' && <LearningPath progress={progress} openModule={openModule} />}
        {view === 'lesson' && <Lesson module={activeModule} progress={progress} updateNote={updateNote} completeModule={completeModule} openModule={openModule} navigate={navigate} />}
        {view === 'lab' && <PracticeLab />}
        {view === 'quiz' && <QuizHub progress={progress} setProgress={setProgress} />}
        {view === 'glossary' && <Glossary />}
      </main>
    </div>
  </div>
}

const nav = [['overview', Home, 'Overview'], ['learn', BookOpen, 'Learn'], ['lab', FlaskConical, 'Practice Lab'], ['quiz', ClipboardCheck, 'Quiz'], ['glossary', CircleHelp, 'Glossary']]
function Sidebar({ view, open, navigate }) { return <aside className={`sidebar ${open ? 'open' : ''}`}>
  <div className="brand">Infra<span>Prep</span></div>
  <nav>{nav.map(([id, Icon, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={20} />{label}</button>)}</nav>
  <div className="rack-marks" aria-hidden="true">{[42,36,30,24,18,12,6].map(n => <span key={n}>{n}U</span>)}</div>
  <div className="system-status"><i /> <strong>Study data saved</strong><small>Stored only in this browser</small></div>
</aside> }

function Header({ score, progress, setProgress, setMenuOpen, reset }) { return <header>
  <button className="icon-button mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Open navigation"><Menu /></button>
  <div className="role"><small>Current role</small><strong>IT Infrastructure Engineer</strong><span>RMA & Hardware Diagnostics</span></div>
  <div className="overall"><label>Overall readiness <b>{score}%</b></label><div className="progress"><i style={{ width: `${score}%` }} /></div></div>
  <button className="icon-button" onClick={() => setProgress(p => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }))} aria-label="Toggle theme">{progress.theme === 'light' ? <Moon /> : <Sun />}</button>
  <button className="icon-button" onClick={reset} aria-label="Reset progress"><RotateCcw /></button>
</header> }

function Overview({ progress, score, navigate, openModule }) {
  const next = modules.find(m => !progress.completed.includes(m.id)) || modules[0]
  return <div className="page overview-page">
    <section className="hero"><div><h1>Build confidence<br />from the rack <em>up.</em></h1><p>Practical, step-by-step learning for hardware diagnostics interviews. Understand how systems work, practice what matters, and walk in ready.</p><div className="circuit" /></div><Readiness score={score} /></section>
    <section className="dashboard-grid">
      <div className="left-flow">
        <article className="continue"><small>Continue learning</small><div className="continue-body"><ServerDiagram /><div><h2>{next.title}</h2><p>{next.summary}</p><button className="primary" onClick={() => openModule(next)}>Continue lesson <ChevronRight size={17} /></button></div></div></article>
        <button className="scenario-callout" onClick={() => navigate('lab')}><CircleHelp /><span><strong>Corrected ECC errors are rising on DIMM A1. What do you check first?</strong><small>Think it through before you continue.</small></span><ChevronRight /></button>
        <button className="quiz-callout" onClick={() => navigate('quiz')}><ClipboardCheck /><span><strong>{progress.baseline ? 'Review your quiz results' : 'Start baseline quiz'}</strong><small>12 questions · about 10 min · no pressure</small></span><ChevronRight /></button>
        <DiagnosticConsole />
      </div>
      <LearningPathCompact progress={progress} openModule={openModule} navigate={navigate} />
    </section>
  </div>
}

function Readiness({ score }) { return <article className="readiness"><h2>Readiness</h2><div className="gauge" style={{ '--score': `${score * 3.6}deg` }}><div><strong>{score}</strong><span>/100</span></div></div><p><i /> {score < 40 ? 'Building foundations' : score < 75 ? 'Developing confidence' : 'Interview ready'}</p><small>Lessons + quiz performance</small></article> }
function ServerDiagram() { return <div className="server-diagram" aria-hidden="true"><i /><i /><i /><i /><b /><b /><span /><span /></div> }
function DiagnosticConsole() { return <article className="console"><small><i /> DIAGNOSTIC CONSOLE</small><code>$ ipmitool sel list | grep -i ecc | tail -n 5<br />08/26 09:21:33 | MEM | Corrected ECC | DIMM A1<br />08/26 09:58:12 | MEM | Corrected ECC | DIMM A1<br />08/26 10:32:47 | MEM | Corrected ECC | DIMM A1</code><aside><b>WHAT THIS MEANS</b><p>Corrected errors were repaired, but a rising count warrants investigation.</p></aside></article> }

function LearningPathCompact({ progress, openModule, navigate }) { return <aside className="path-compact"><h2>Learning path</h2><div>{modules.map((m, i) => <button key={m.id} onClick={() => openModule(m)} className={progress.completed.includes(m.id) ? 'done' : ''}><span>{progress.completed.includes(m.id) ? <Check size={15} /> : i + 1}</span><b>{m.title}</b></button>)}</div><button className="text-button" onClick={() => navigate('learn')}>View full learning path <ChevronRight size={16} /></button></aside> }

function LearningPath({ progress, openModule }) { return <div className="page narrow"><div className="page-title"><span>Eight modules · about five hours</span><h1>Learning path</h1><p>Start with the physical system, then learn to diagnose evidence and own the RMA outcome. Every lesson includes plain-language explanations, commands, and interview prompts.</p></div><div className="module-list">{modules.map(m => <button key={m.id} onClick={() => openModule(m)}><span className="module-number">{progress.completed.includes(m.id) ? <Check /> : m.number}</span><div><small>{m.time}</small><h2>{m.title}</h2><p>{m.summary}</p></div><ChevronRight /></button>)}</div></div> }

function Lesson({ module, progress, updateNote, completeModule, openModule, navigate }) {
  const index = modules.findIndex(m => m.id === module.id); const done = progress.completed.includes(module.id)
  return <div className="page lesson-page"><button className="back" onClick={() => navigate('learn')}>← Learning path</button><div className="lesson-heading"><span>Module {module.number} · {module.time}</span><h1>{module.title}</h1><p>{module.summary}</p></div><div className="lesson-layout"><article className="lesson-content"><section className="objectives"><h2>By the end, you can…</h2>{module.objectives.map(x => <p key={x}><Check size={17} />{x}</p>)}</section>{module.sections.map((s, i) => <section key={s.title} className="lesson-section"><small>0{i + 1}</small><h2>{s.title}</h2><p>{s.body}</p></section>)}<section className="terminal"><span>TRY THIS COMMAND</span><code>{module.command}</code><p>{module.commandNote}</p></section><section className="notes"><h2>Your interview notes</h2><textarea value={progress.notes[module.id] || ''} onChange={e => updateNote(module.id, e.target.value)} placeholder="Rewrite the core idea in your own words. What would you say in an interview?" /></section><div className="lesson-actions"><button className={done ? 'complete done' : 'complete'} onClick={() => completeModule(module.id)}>{done ? <><Check /> Completed</> : 'Mark lesson complete'}</button>{index < modules.length - 1 ? <button className="primary" onClick={() => openModule(modules[index + 1])}>Next module <ChevronRight /></button> : <button className="primary" onClick={() => navigate('quiz')}>Take final quiz <ChevronRight /></button>}</div></article><aside className="interview-tip"><b>INTERVIEW LENS</b><p>Structure answers as: protect service → preserve evidence → isolate the fault domain → make one controlled change → validate → document and prevent recurrence.</p></aside></div></div>
}

function PracticeLab() { const [active, setActive] = useState(0); const [reveal, setReveal] = useState(false); const s = scenarios[active]; return <div className="page narrow"><div className="page-title"><span>Think like the escalation engineer</span><h1>Practice lab</h1><p>Talk through each scenario aloud. Interviewers care about your sequence, safety, evidence, and communication—not just the component you replace.</p></div><div className="scenario-tabs">{scenarios.map((x, i) => <button className={active === i ? 'active' : ''} onClick={() => { setActive(i); setReveal(false) }} key={x.title}>{i + 1}. {x.title}</button>)}</div><article className="scenario"><small>INCIDENT BRIEF</small><h2>{s.title}</h2><p className="prompt">{s.prompt}</p><ol>{s.steps.map(x => <li key={x}>{x}</li>)}</ol><button className="primary" onClick={() => setReveal(v => !v)}>{reveal ? 'Hide coaching notes' : 'Reveal coaching notes'}</button>{reveal && <div className="model"><b>A strong direction</b><p>{s.model}</p></div>}</article></div> }

function QuizHub({ progress, setProgress }) { const [mode, setMode] = useState(null); if (mode) return <Quiz mode={mode} finish={(result) => { setProgress(p => ({ ...p, [mode]: result })); setMode(null) }} />; return <div className="page narrow"><div className="page-title"><span>Measure, learn, measure again</span><h1>Knowledge check</h1><p>Use the same question set before and after studying. Your baseline identifies gaps; your final score shows growth.</p></div><div className="quiz-options"><QuizOption title="Baseline quiz" result={progress.baseline} copy="Take this before studying. Guessing is useful—it shows what to prioritize." onClick={() => setMode('baseline')} /><QuizOption title="Final quiz" result={progress.final} copy="Take this after all eight modules and compare your score and confidence." onClick={() => setMode('final')} /></div><ScoreMeaning /></div> }
function QuizOption({ title, result, copy, onClick }) { return <article><Gauge /><div><h2>{title}</h2><p>{copy}</p>{result && <strong>{result.score}/{quizQuestions.length} · {Math.round(result.score / quizQuestions.length * 100)}%</strong>}</div><button className="primary" onClick={onClick}>{result ? 'Retake' : 'Start'} <ChevronRight /></button></article> }
function ScoreMeaning() { return <section className="score-meaning"><h2>How to read your score</h2><div><p><b>0–4</b> Start with modules 1–3. Focus on vocabulary and safe sequencing.</p><p><b>5–8</b> Your foundation is growing. Practice fault-domain reasoning and tools.</p><p><b>9–10</b> Strong working knowledge. Tighten vendor, metrics, and RCA answers.</p><p><b>11–12</b> Ready for scenario practice. Explain tradeoffs, evidence, and risk aloud.</p></div></section> }
function Quiz({ mode, finish }) { const [at, setAt] = useState(0); const [answers, setAnswers] = useState([]); const [selected, setSelected] = useState(null); const [showWhy, setShowWhy] = useState(false); const q = quizQuestions[at]; const choose = (i) => { if (!showWhy) setSelected(i) }; const next = () => { const updated = [...answers, selected]; if (at === quizQuestions.length - 1) finish({ score: updated.reduce((n, a, i) => n + (a === quizQuestions[i].answer ? 1 : 0), 0), date: new Date().toISOString() }); else { setAnswers(updated); setAt(v => v + 1); setSelected(null); setShowWhy(false) } }; return <div className="page quiz-page"><div className="quiz-progress"><span>{mode === 'baseline' ? 'Baseline' : 'Final'} quiz · Question {at + 1} of {quizQuestions.length}</span><div className="progress"><i style={{ width: `${((at + 1) / quizQuestions.length) * 100}%` }} /></div></div><article className="question"><h1>{q.q}</h1><div className="choices">{q.choices.map((c, i) => <button key={c} className={`${selected === i ? 'selected' : ''} ${showWhy && i === q.answer ? 'correct' : ''} ${showWhy && selected === i && i !== q.answer ? 'wrong' : ''}`} onClick={() => choose(i)}><span>{String.fromCharCode(65 + i)}</span>{c}</button>)}</div>{showWhy && <div className="explanation"><b>{selected === q.answer ? 'Correct.' : 'Not quite.'}</b> {q.why}</div>}<button className="primary quiz-next" disabled={selected === null} onClick={() => showWhy ? next() : setShowWhy(true)}>{showWhy ? at === quizQuestions.length - 1 ? 'See results' : 'Next question' : 'Check answer'} <ChevronRight /></button></article></div> }

function Glossary() { const [query, setQuery] = useState(''); const terms = useMemo(() => glossary.filter(([a,b]) => `${a} ${b}`.toLowerCase().includes(query.toLowerCase())), [query]); return <div className="page narrow"><div className="page-title"><span>Plain English, fast</span><h1>Hardware glossary</h1><p>Use this as a quick reference while studying or before the interview.</p></div><label className="search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search terms and definitions" /></label><dl className="glossary">{terms.map(([term, def]) => <div key={term}><dt>{term}</dt><dd>{def}</dd></div>)}</dl></div> }

createRoot(document.getElementById('root')).render(<App />)
