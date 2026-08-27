import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BookOpen, BriefcaseBusiness, Check, ChevronRight, CircleHelp, ClipboardCheck, Eye, EyeOff, FlaskConical, Gauge, Home, Menu, Moon, RotateCcw, Search, Sun, X } from 'lucide-react'
import { getRole, roleCatalog } from './roles'
import './styles.css'
import './interview-question.css'
import './curriculum.css'

const STORE = 'roleprep-progress-v2'
const LEGACY_STORE = 'infraprep-progress-v1'
const emptyRoleProgress = { completed: [], baseline: null, final: null }
const defaultState = { selectedRoleId: roleCatalog[0].id, roles: {}, theme: 'light' }

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null')
    if (saved) return { ...defaultState, ...saved }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORE) || 'null')
    if (legacy) return { ...defaultState, theme: legacy.theme || 'light', roles: { [roleCatalog[0].id]: { ...emptyRoleProgress, ...legacy } } }
    return defaultState
  } catch { return defaultState }
}

function App() {
  const [appState, setAppState] = useState(loadProgress)
  const role = getRole(appState.selectedRoleId)
  const progress = { ...emptyRoleProgress, ...appState.roles[role.id] }
  const [view, setView] = useState('roles')
  const [activeModule, setActiveModule] = useState(role.modules[0])
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(appState)); document.documentElement.dataset.theme = appState.theme }, [appState])
  const setProgress = updater => setAppState(current => {
    const currentProgress = { ...emptyRoleProgress, ...current.roles[role.id] }
    const nextProgress = typeof updater === 'function' ? updater(currentProgress) : updater
    return { ...current, roles: { ...current.roles, [role.id]: nextProgress } }
  })
  const score = Math.round((progress.completed.length / role.modules.length) * 70 + ((progress.final?.score || progress.baseline?.score || 0) / role.quizQuestions.length) * 30)
  const navigate = (next) => { setView(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openModule = (mod) => { setActiveModule(mod); navigate('lesson') }
  const selectRole = selected => { setAppState(current => ({ ...current, selectedRoleId: selected.id })); setActiveModule(selected.modules[0]); navigate('overview') }
  const completeModule = (id) => setProgress(p => ({ ...p, completed: p.completed.includes(id) ? p.completed : [...p.completed, id] }))
  const reset = () => { if (confirm(`Reset progress for ${role.title}?`)) setProgress(emptyRoleProgress) }
  return <div className="app-shell">
    <Sidebar view={view} open={menuOpen} navigate={navigate} />
    <div className="main-shell">
      <Header role={role} score={score} theme={appState.theme} setTheme={theme => setAppState(current => ({ ...current, theme }))} setMenuOpen={setMenuOpen} reset={reset} navigate={navigate} />
      <main>
        {view === 'roles' && <RoleLibrary roles={roleCatalog} selectedRoleId={role.id} selectRole={selectRole} />}
        {view === 'overview' && <Overview role={role} progress={progress} score={score} navigate={navigate} openModule={openModule} />}
        {view === 'learn' && <LearningPath role={role} progress={progress} openModule={openModule} />}
        {view === 'lesson' && <Lesson role={role} module={activeModule} progress={progress} completeModule={completeModule} openModule={openModule} navigate={navigate} />}
        {view === 'lab' && <PracticeLab scenarios={role.scenarios} />}
        {view === 'quiz' && <QuizHub questions={role.quizQuestions} progress={progress} setProgress={setProgress} />}
        {view === 'glossary' && <Glossary terms={role.glossary} />}
      </main>
    </div>
  </div>
}

const nav = [['roles', BriefcaseBusiness, 'Roles'], ['overview', Home, 'Overview'], ['learn', BookOpen, 'Learn'], ['lab', FlaskConical, 'Practice Lab'], ['quiz', ClipboardCheck, 'Quiz'], ['glossary', CircleHelp, 'Glossary']]
function Sidebar({ view, open, navigate }) { return <aside className={`sidebar ${open ? 'open' : ''}`}>
  <div className="brand">Role<span>Prep</span></div>
  <nav>{nav.map(([id, Icon, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={20} />{label}</button>)}</nav>
  <div className="rack-marks" aria-hidden="true">{[42,36,30,24,18,12,6].map(n => <span key={n}>{n}U</span>)}</div>
  <a className="site-return" href="https://hightechstl.com/"><Home size={17} />High-Tech STL home</a>
  <div className="system-status"><i /> <strong>Study data saved</strong><small>Stored only in this browser</small></div>
</aside> }

function Header({ role, score, theme, setTheme, setMenuOpen, reset, navigate }) { return <header>
  <button className="icon-button mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Open navigation"><Menu /></button>
  <button className="role role-switcher" onClick={() => navigate('roles')}><small>Current role · change</small><strong>{role.title}</strong><span>{role.subtitle}</span></button>
  <div className="overall"><label>Overall readiness <b>{score}%</b></label><div className="progress"><i style={{ width: `${score}%` }} /></div></div>
  <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">{theme === 'light' ? <Moon /> : <Sun />}</button>
  <button className="icon-button" onClick={reset} aria-label="Reset progress"><RotateCcw /></button>
</header> }

function RoleLibrary({ roles, selectedRoleId, selectRole }) { return <div className="page role-library"><div className="page-title"><span>One learning platform, many career paths</span><h1>Choose a role to study</h1><p>Every role has its own beginner-first curriculum, practice labs, glossary, baseline assessment, final assessment, and saved progress. More role tracks can be added without changing the learning experience.</p></div><div className="role-cards">{roles.map(role => <article key={role.id} className={role.id === selectedRoleId ? 'selected' : ''}><div><small>{role.category}</small><h2>{role.title}</h2><strong>{role.subtitle}</strong><p>{role.description}</p><dl><div><dt>Level</dt><dd>{role.level}</dd></div><div><dt>Study time</dt><dd>{role.duration}</dd></div><div><dt>Modules</dt><dd>{role.modules.length}</dd></div></dl></div><button className="primary" onClick={() => selectRole(role)}>{role.id === selectedRoleId ? 'Continue this role' : 'Study this role'} <ChevronRight /></button></article>)}</div><section className="future-roles"><BriefcaseBusiness /><div><h2>Designed for the roles that come next</h2><p>New tracks will plug into the same catalog while keeping curriculum, quizzes, labs, terminology, and learner progress separate for each role.</p></div></section></div> }

function Overview({ role, progress, score, navigate, openModule }) {
  const next = role.modules.find(m => !progress.completed.includes(m.id)) || role.modules[0]
  return <div className="page overview-page">
    <section className="hero"><div><h1>{role.heroTitle}</h1><p>{role.heroDescription}</p><div className="circuit" /></div><Readiness score={score} /></section>
    <section className="dashboard-grid">
      <div className="left-flow">
        <article className="continue"><small>Continue learning</small><div className="continue-body"><ServerDiagram /><div><h2>{next.title}</h2><p>{next.summary}</p><button className="primary" onClick={() => openModule(next)}>Continue lesson <ChevronRight size={17} /></button></div></div></article>
        <button className="scenario-callout" onClick={() => navigate('lab')}><CircleHelp /><span><strong>{role.featuredScenario}</strong><small>Think it through before you continue.</small></span><ChevronRight /></button>
        <button className="quiz-callout" onClick={() => navigate('quiz')}><ClipboardCheck /><span><strong>{progress.baseline ? 'Review your quiz results' : 'Start baseline quiz'}</strong><small>{role.quizQuestions.length} questions · about 10 min · no pressure</small></span><ChevronRight /></button>
        <DiagnosticConsole consoleData={role.console} />
      </div>
      <LearningPathCompact modules={role.modules} progress={progress} openModule={openModule} navigate={navigate} />
    </section>
  </div>
}

function Readiness({ score }) { return <article className="readiness"><h2>Readiness</h2><div className="gauge" style={{ '--score': `${score * 3.6}deg` }}><div><strong>{score}</strong><span>/100</span></div></div><p><i /> {score < 40 ? 'Building foundations' : score < 75 ? 'Developing confidence' : 'Interview ready'}</p><small>Lessons + quiz performance</small></article> }
function ServerDiagram() { return <div className="server-diagram" aria-hidden="true"><i /><i /><i /><i /><b /><b /><span /><span /></div> }
function DiagnosticConsole({ consoleData }) { return <article className="console"><small><i /> DIAGNOSTIC CONSOLE</small><code>{consoleData.command}<br />{consoleData.lines.map(line => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</code><aside><b>WHAT THIS MEANS</b><p>{consoleData.explanation}</p></aside></article> }

function LearningPathCompact({ modules, progress, openModule, navigate }) { return <aside className="path-compact"><h2>Learning path</h2><div>{modules.map((m, i) => <button key={m.id} onClick={() => openModule(m)} className={progress.completed.includes(m.id) ? 'done' : ''}><span>{progress.completed.includes(m.id) ? <Check size={15} /> : i + 1}</span><b>{m.title}</b></button>)}</div><button className="text-button" onClick={() => navigate('learn')}>View full learning path <ChevronRight size={16} /></button></aside> }

function LearningPath({ role, progress, openModule }) { return <div className="page narrow"><div className="page-title"><span>{role.modules.length} modules · {role.duration}</span><h1>Learning path</h1><p>This track assumes no prior experience. Each chapter builds vocabulary and mental models before teaching tools, diagnostic workflows, worked examples, knowledge checks, and interview responses.</p></div><div className="module-list">{role.modules.map(m => <button key={m.id} onClick={() => openModule(m)}><span className="module-number">{progress.completed.includes(m.id) ? <Check /> : m.number}</span><div><small>{m.time} · {m.sections.length} teaching sections</small><h2>{m.title}</h2><p>{m.summary}</p></div><ChevronRight /></button>)}</div></div> }

function Lesson({ role, module, progress, completeModule, openModule, navigate }) {
  const index = role.modules.findIndex(m => m.id === module.id); const done = progress.completed.includes(module.id)
  return <div className="page lesson-page"><button className="back" onClick={() => navigate('learn')}>← Learning path</button><div className="lesson-heading"><span>Module {module.number} · {module.time} · Beginner-first</span><h1>{module.title}</h1><p>{module.summary}</p></div><div className="lesson-layout"><article className="lesson-content"><section className="objectives"><h2>By the end, you can…</h2>{module.objectives.map(x => <p key={x}><Check size={17} />{x}</p>)}</section>{module.sections.map((section, i) => <LessonSection key={section.title} section={section} index={i} />)}<section className="terminal"><span>TRY THIS COMMAND</span><code>{module.command}</code><p>{module.commandNote}</p></section><InterviewQuestion key={module.id} questions={module.interviewQuestions} /><div className="lesson-actions"><button className={done ? 'complete done' : 'complete'} onClick={() => completeModule(module.id)}>{done ? <><Check /> Completed</> : 'Mark lesson complete'}</button>{index < role.modules.length - 1 ? <button className="primary" onClick={() => openModule(role.modules[index + 1])}>Next module <ChevronRight /></button> : <button className="primary" onClick={() => navigate('quiz')}>Take final quiz <ChevronRight /></button>}</div></article><aside className="interview-tip"><b>INTERVIEW LENS</b><p>Structure answers as: protect service → preserve evidence → isolate the fault domain → make one controlled change → validate → document and prevent recurrence.</p><hr /><b>HOW TO STUDY</b><p>Read one section, explain it without looking, answer its checkpoint, then compare your wording with the answer.</p></aside></div></div>
}

function LessonSection({ section, index }) { return <section className="lesson-section"><small>{String(index + 1).padStart(2, '0')}</small><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.terms ? <div className="term-list"><h3>Words to know</h3><dl>{section.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></div> : null}{section.steps ? <div className="procedure"><h3>Use this sequence</h3><ol>{section.steps.map(step => <li key={step}>{step}</li>)}</ol></div> : null}<KnowledgeCheck checkpoint={section.checkpoint} /></section> }

function KnowledgeCheck({ checkpoint }) { const [revealed, setRevealed] = useState(false); return <div className="knowledge-check"><span>CHECK YOUR UNDERSTANDING</span><h3>{checkpoint.question}</h3><button type="button" aria-expanded={revealed} onClick={() => setRevealed(value => !value)}>{revealed ? 'Hide answer' : 'Reveal answer'}</button>{revealed ? <p>{checkpoint.answer}</p> : null}</div> }

function InterviewQuestion({ questions }) {
  const [questionIndex, setQuestionIndex] = useState(() => Math.floor(Math.random() * questions.length))
  const [showExample, setShowExample] = useState(false)
  const chooseAnother = () => {
    setShowExample(false)
    setQuestionIndex(current => {
      if (questions.length < 2) return current
      const offset = 1 + Math.floor(Math.random() * (questions.length - 1))
      return (current + offset) % questions.length
    })
  }
  const current = questions[questionIndex]
  return <section className="interview-question"><div className="interview-question-copy"><span>INTERVIEW QUESTION</span><h2>{current.question}</h2><p>Answer aloud using the evidence, risk, isolation, validation, and communication steps from this lesson.</p><div className="interview-question-controls"><button type="button" className="reveal-example" aria-expanded={showExample} onClick={() => setShowExample(value => !value)}>{showExample ? <EyeOff size={17} /> : <Eye size={17} />}{showExample ? 'Hide example' : 'Reveal example'}</button><button type="button" onClick={chooseAnother}><RotateCcw size={17} /> New question</button></div>{showExample ? <div className="example-answer"><b>Example answer</b><p>{current.example}</p></div> : null}</div></section>
}

function PracticeLab({ scenarios }) { const [active, setActive] = useState(0); const [reveal, setReveal] = useState(false); const s = scenarios[active]; return <div className="page narrow"><div className="page-title"><span>Think like the escalation engineer</span><h1>Practice lab</h1><p>Talk through each scenario aloud. Interviewers care about your sequence, safety, evidence, and communication—not just the component you replace.</p></div><div className="scenario-tabs">{scenarios.map((x, i) => <button className={active === i ? 'active' : ''} onClick={() => { setActive(i); setReveal(false) }} key={x.title}>{i + 1}. {x.title}</button>)}</div><article className="scenario"><small>INCIDENT BRIEF</small><h2>{s.title}</h2><p className="prompt">{s.prompt}</p><ol>{s.steps.map(x => <li key={x}>{x}</li>)}</ol><button className="primary" onClick={() => setReveal(v => !v)}>{reveal ? 'Hide coaching notes' : 'Reveal coaching notes'}</button>{reveal && <div className="model"><b>A strong direction</b><p>{s.model}</p></div>}</article></div> }

function QuizHub({ questions, progress, setProgress }) { const [mode, setMode] = useState(null); if (mode) return <Quiz questions={questions} mode={mode} finish={(result) => { setProgress(p => ({ ...p, [mode]: result })); setMode(null) }} />; return <div className="page narrow"><div className="page-title"><span>Measure, learn, measure again</span><h1>Knowledge check</h1><p>Use the same question set before and after studying. Your baseline identifies gaps; your final score shows growth.</p></div><div className="quiz-options"><QuizOption title="Baseline quiz" result={progress.baseline} copy="Take this before studying. Guessing is useful—it shows what to prioritize." onClick={() => setMode('baseline')} /><QuizOption title="Final quiz" result={progress.final} copy="Take this after all modules and compare your score and confidence." onClick={() => setMode('final')} /></div><ScoreMeaning /></div> }
function QuizOption({ title, result, copy, onClick }) { return <article><Gauge /><div><h2>{title}</h2><p>{copy}</p>{result && <strong>{result.score} correct · {result.percent}%</strong>}</div><button className="primary" onClick={onClick}>{result ? 'Retake' : 'Start'} <ChevronRight /></button></article> }
function ScoreMeaning() { return <section className="score-meaning"><h2>How to read your score</h2><div><p><b>0–4</b> Start at the beginning. Focus on vocabulary, mental models, and safe sequencing.</p><p><b>5–8</b> Your foundation is growing. Revisit missed topics and practice the workflows aloud.</p><p><b>9–10</b> Strong working knowledge. Tighten your troubleshooting, risk, and communication answers.</p><p><b>11–12</b> Ready for scenario practice. Explain your evidence, tradeoffs, validation, and follow-up.</p></div></section> }
function Quiz({ questions, mode, finish }) { const [at, setAt] = useState(0); const [answers, setAnswers] = useState([]); const [selected, setSelected] = useState(null); const [showWhy, setShowWhy] = useState(false); const q = questions[at]; const choose = (i) => { if (!showWhy) setSelected(i) }; const next = () => { const updated = [...answers, selected]; if (at === questions.length - 1) { const score = updated.reduce((n, answer, i) => n + (answer === questions[i].answer ? 1 : 0), 0); finish({ score, percent: Math.round(score / questions.length * 100), date: new Date().toISOString() }) } else { setAnswers(updated); setAt(v => v + 1); setSelected(null); setShowWhy(false) } }; return <div className="page quiz-page"><div className="quiz-progress"><span>{mode === 'baseline' ? 'Baseline' : 'Final'} quiz · Question {at + 1} of {questions.length}</span><div className="progress"><i style={{ width: `${((at + 1) / questions.length) * 100}%` }} /></div></div><article className="question"><h1>{q.q}</h1><div className="choices">{q.choices.map((c, i) => <button key={c} className={`${selected === i ? 'selected' : ''} ${showWhy && i === q.answer ? 'correct' : ''} ${showWhy && selected === i && i !== q.answer ? 'wrong' : ''}`} onClick={() => choose(i)}><span>{String.fromCharCode(65 + i)}</span>{c}</button>)}</div>{showWhy && <div className="explanation"><b>{selected === q.answer ? 'Correct.' : 'Not quite.'}</b> {q.why}</div>}<button className="primary quiz-next" disabled={selected === null} onClick={() => showWhy ? next() : setShowWhy(true)}>{showWhy ? at === questions.length - 1 ? 'See results' : 'Next question' : 'Check answer'} <ChevronRight /></button></article></div> }

function Glossary({ terms }) { const [query, setQuery] = useState(''); const filteredTerms = useMemo(() => terms.filter(([a,b]) => `${a} ${b}`.toLowerCase().includes(query.toLowerCase())), [query, terms]); return <div className="page narrow"><div className="page-title"><span>Plain English, fast</span><h1>Role glossary</h1><p>Use this as a quick reference while studying or before the interview.</p></div><label className="search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search terms and definitions" /></label><dl className="glossary">{filteredTerms.map(([term, def]) => <div key={term}><dt>{term}</dt><dd>{def}</dd></div>)}</dl></div> }

createRoot(document.getElementById('root')).render(<App />)
