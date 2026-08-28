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
const estimatedQuizMinutes = count => Math.max(10, Math.ceil((count * 1.25) / 5) * 5)
const shuffled = items => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
const prepareQuiz = questions => shuffled(questions).map(question => {
  const choices = shuffled(question.choices.map((choice, index) => ({ choice, correct: index === question.answer })))
  return { ...question, choices: choices.map(item => item.choice), answer: choices.findIndex(item => item.correct) }
})

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
        {view === 'lab' && <PracticeLab track={role} />}
        {view === 'quiz' && <QuizHub track={role} progress={progress} setProgress={setProgress} />}
        {view === 'glossary' && <Glossary track={role} />}
      </main>
    </div>
  </div>
}

const nav = [['roles', BriefcaseBusiness, 'Library'], ['overview', Home, 'Overview'], ['learn', BookOpen, 'Learn'], ['lab', FlaskConical, 'Practice Lab'], ['quiz', ClipboardCheck, 'Quiz'], ['glossary', CircleHelp, 'Glossary']]
function Sidebar({ view, open, navigate }) { return <aside className={`sidebar ${open ? 'open' : ''}`}>
  <div className="brand">Role<span>Prep</span></div>
  <nav>{nav.map(([id, Icon, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={20} />{label}</button>)}</nav>
  <a className="site-return" href="https://hightechstl.com/"><Home size={17} />High-Tech STL home</a>
  <div className="system-status"><i /> <strong>Study data saved</strong><small>Stored only in this browser</small></div>
</aside> }

function Header({ role, score, theme, setTheme, setMenuOpen, reset, navigate }) { return <header>
  <button className="icon-button mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Open navigation"><Menu /></button>
  <button className="role role-switcher" onClick={() => navigate('roles')}><small>Current track · change</small><strong>{role.title}</strong><span>{role.subtitle}</span></button>
  <div className="overall"><label>Overall readiness <b>{score}%</b></label><div className="progress"><i style={{ width: `${score}%` }} /></div></div>
  <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">{theme === 'light' ? <Moon /> : <Sun />}</button>
  <button className="icon-button" onClick={reset} aria-label="Reset progress"><RotateCcw /></button>
</header> }

function TrackCard({ track, selectedRoleId, selectRole }) { const certification = track.type === 'certification'; return <article className={`${track.id === selectedRoleId ? 'selected' : ''} ${certification ? 'certification-card' : ''}`}><div><small>{track.category}</small><h2>{track.title}</h2><strong>{track.subtitle}</strong><p>{track.description}</p><dl><div><dt>Level</dt><dd>{track.level}</dd></div><div><dt>Study time</dt><dd>{track.duration}</dd></div><div><dt>{certification ? 'Practice exam' : 'Modules'}</dt><dd>{certification ? `${track.quizQuestions.length} questions` : track.modules.length}</dd></div></dl>{track.disclaimer ? <p className="track-disclaimer">{track.disclaimer}</p> : null}</div><button className="primary" onClick={() => selectRole(track)}>{track.id === selectedRoleId ? 'Continue this track' : certification ? 'Prepare for this certification' : 'Study this role'} <ChevronRight /></button></article> }
function RoleLibrary({ roles, selectedRoleId, selectRole }) { const roleTracks = roles.filter(track => track.type !== 'certification'); const certifications = roles.filter(track => track.type === 'certification'); return <div className="page role-library"><div className="page-title"><span>One learning platform, many paths</span><h1>Choose a study track</h1><p>Build job-role skills or prepare for an industry certification. Every track has a beginner-first curriculum, practice, glossary, baseline assessment, final assessment, and separate saved progress.</p></div><section className="catalog-section"><div className="catalog-heading"><BriefcaseBusiness /><div><span>CAREER PATHS</span><h2>Role study guides</h2><p>Learn the knowledge, workflows, and communication expected in a specific job.</p></div></div><div className="role-cards">{roleTracks.map(track => <TrackCard key={track.id} track={track} selectedRoleId={selectedRoleId} selectRole={selectRole} />)}</div></section><section className="catalog-section certification-section"><div className="catalog-heading"><ClipboardCheck /><div><span>CREDENTIALS</span><h2>Certification prep</h2><p>Understand the syllabus, practice applying concepts, and measure readiness before exam day.</p></div></div><div className="role-cards certification-cards">{certifications.map(track => <TrackCard key={track.id} track={track} selectedRoleId={selectedRoleId} selectRole={selectRole} />)}</div></section><section className="future-roles"><BookOpen /><div><h2>Built to keep growing</h2><p>New role and certification tracks can join the library while keeping lessons, assessments, practice, terminology, and learner progress separate.</p></div></section></div> }

function Overview({ role, progress, score, navigate, openModule }) {
  const next = role.modules.find(m => !progress.completed.includes(m.id)) || role.modules[0]
  return <div className="page overview-page">
    <section className="hero"><div><h1>{role.heroTitle}</h1><p>{role.heroDescription}</p><div className="circuit" /></div><Readiness score={score} /></section>
    <section className="dashboard-grid">
      <div className="left-flow">
        <article className="continue"><small>Continue learning</small><div className="continue-body"><ServerDiagram /><div><h2>{next.title}</h2><p>{next.summary}</p><button className="primary" onClick={() => openModule(next)}>Continue lesson <ChevronRight size={17} /></button></div></div></article>
        <button className="scenario-callout" onClick={() => navigate('lab')}><CircleHelp /><span><strong>{role.featuredScenario}</strong><small>Think it through before you continue.</small></span><ChevronRight /></button>
        <button className="quiz-callout" onClick={() => navigate('quiz')}><ClipboardCheck /><span><strong>{progress.baseline ? 'Review your quiz results' : 'Start baseline quiz'}</strong><small>{role.quizQuestions.length} questions · about {role.exam?.minutes || estimatedQuizMinutes(role.quizQuestions.length)} min · no pressure</small></span><ChevronRight /></button>
        <DiagnosticConsole consoleData={role.console} />
      </div>
      <LearningPathCompact modules={role.modules} progress={progress} openModule={openModule} navigate={navigate} />
    </section>
  </div>
}

function Readiness({ score }) { return <article className="readiness"><h2>Readiness</h2><div className="gauge" style={{ '--score': `${score * 3.6}deg` }}><div><strong>{score}</strong><span>/100</span></div></div><p><i /> {score < 40 ? 'Building foundations' : score < 75 ? 'Developing confidence' : 'Ready for advanced practice'}</p><small>Lessons + quiz performance</small></article> }
function ServerDiagram() { return <div className="server-diagram" aria-hidden="true"><i /><i /><i /><i /><b /><b /><span /><span /></div> }
function DiagnosticConsole({ consoleData }) { return <article className="console"><small><i /> {consoleData.label || 'DIAGNOSTIC CONSOLE'}</small><code>{consoleData.command}<br />{consoleData.lines.map(line => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</code><aside><b>{consoleData.explanationLabel || 'WHAT THIS MEANS'}</b><p>{consoleData.explanation}</p></aside></article> }

function LearningPathCompact({ modules, progress, openModule, navigate }) { return <aside className="path-compact"><h2>Learning path</h2><div>{modules.map((m, i) => <button key={m.id} onClick={() => openModule(m)} className={progress.completed.includes(m.id) ? 'done' : ''}><span>{progress.completed.includes(m.id) ? <Check size={15} /> : i + 1}</span><b>{m.title}</b></button>)}</div><button className="text-button" onClick={() => navigate('learn')}>View full learning path <ChevronRight size={16} /></button></aside> }

function LearningPath({ role, progress, openModule }) { return <div className="page narrow"><div className="page-title"><span>{role.modules.length} modules · {role.duration}</span><h1>Learning path</h1><p>This track assumes no prior experience. Each chapter builds vocabulary and mental models before moving into worked examples, knowledge checks, practical application, and {role.type === 'certification' ? 'exam recall' : 'interview responses'}.</p></div><div className="module-list">{role.modules.map(m => <button key={m.id} onClick={() => openModule(m)}><span className="module-number">{progress.completed.includes(m.id) ? <Check /> : m.number}</span><div><small>{m.time} · {m.sections.length} teaching sections</small><h2>{m.title}</h2><p>{m.summary}</p></div><ChevronRight /></button>)}</div>{role.disclaimer ? <p className="learning-disclaimer">{role.disclaimer}</p> : null}</div> }

function Lesson({ role, module, progress, completeModule, openModule, navigate }) {
  const index = role.modules.findIndex(m => m.id === module.id); const done = progress.completed.includes(module.id)
  const certification = role.type === 'certification'
  return <div className="page lesson-page"><button className="back" onClick={() => navigate('learn')}>← Learning path</button><div className="lesson-heading"><span>Module {module.number} · {module.time} · Beginner-first</span><h1>{module.title}</h1><p>{module.summary}</p></div><div className="lesson-layout"><article className="lesson-content"><section className="objectives"><h2>By the end, you can…</h2>{module.objectives.map(x => <p key={x}><Check size={17} />{x}</p>)}</section>{module.sections.map((section, i) => <LessonSection key={section.title} section={section} index={i} />)}<section className="terminal"><span>{module.activityLabel || 'TRY THIS COMMAND'}</span><code>{module.command}</code><p>{module.commandNote}</p></section><InterviewQuestion key={module.id} questions={module.interviewQuestions} label={role.promptLabel} instruction={role.promptInstruction} /><div className="lesson-actions"><button className={done ? 'complete done' : 'complete'} onClick={() => completeModule(module.id)}>{done ? <><Check /> Completed</> : 'Mark lesson complete'}</button>{index < role.modules.length - 1 ? <button className="primary" onClick={() => openModule(role.modules[index + 1])}>Next module <ChevronRight /></button> : <button className="primary" onClick={() => navigate('quiz')}>Take final quiz <ChevronRight /></button>}</div></article><aside className="interview-tip"><b>{certification ? 'EXAM LENS' : 'INTERVIEW LENS'}</b><p>{certification ? 'Identify exactly what the question asks, recall the relevant concept, eliminate mismatched choices, and select the best-supported answer.' : 'Structure answers as: protect service → preserve evidence → isolate the fault domain → make one controlled change → validate → document and prevent recurrence.'}</p><hr /><b>HOW TO STUDY</b><p>Read one section, explain it without looking, answer its checkpoint, then compare your wording with the answer.</p></aside></div></div>
}

function LessonSection({ section, index }) { return <section className="lesson-section"><small>{String(index + 1).padStart(2, '0')}</small><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.terms ? <div className="term-list"><h3>Words to know</h3><dl>{section.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></div> : null}{section.steps ? <div className="procedure"><h3>Use this sequence</h3><ol>{section.steps.map(step => <li key={step}>{step}</li>)}</ol></div> : null}<KnowledgeCheck checkpoint={section.checkpoint} /></section> }

function KnowledgeCheck({ checkpoint }) { const [revealed, setRevealed] = useState(false); return <div className="knowledge-check"><span>CHECK YOUR UNDERSTANDING</span><h3>{checkpoint.question}</h3><button type="button" aria-expanded={revealed} onClick={() => setRevealed(value => !value)}>{revealed ? 'Hide answer' : 'Reveal answer'}</button>{revealed ? <p>{checkpoint.answer}</p> : null}</div> }

function InterviewQuestion({ questions, label = 'INTERVIEW QUESTION', instruction = 'Answer aloud using the evidence, risk, isolation, validation, and communication steps from this lesson.' }) {
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
  return <section className="interview-question"><div className="interview-question-copy"><span>{label}</span><h2>{current.question}</h2><p>{instruction}</p><div className="interview-question-controls"><button type="button" className="reveal-example" aria-expanded={showExample} onClick={() => setShowExample(value => !value)}>{showExample ? <EyeOff size={17} /> : <Eye size={17} />}{showExample ? 'Hide example' : 'Reveal example'}</button><button type="button" onClick={chooseAnother}><RotateCcw size={17} /> New question</button></div>{showExample ? <div className="example-answer"><b>Example answer</b><p>{current.example}</p></div> : null}</div></section>
}

function PracticeLab({ track }) { const { scenarios } = track; const [active, setActive] = useState(0); const [reveal, setReveal] = useState(false); const s = scenarios[active]; return <div className="page narrow"><div className="page-title"><span>{track.practiceEyebrow || 'Think like the escalation engineer'}</span><h1>Practice lab</h1><p>{track.practiceIntro || 'Talk through each scenario aloud. Interviewers care about your sequence, safety, evidence, and communication—not just the component you replace.'}</p></div><div className="scenario-tabs">{scenarios.map((x, i) => <button className={active === i ? 'active' : ''} onClick={() => { setActive(i); setReveal(false) }} key={x.title}>{i + 1}. {x.title}</button>)}</div><article className="scenario"><small>{track.type === 'certification' ? 'SERVICE SCENARIO' : 'INCIDENT BRIEF'}</small><h2>{s.title}</h2><p className="prompt">{s.prompt}</p><ol>{s.steps.map(x => <li key={x}>{x}</li>)}</ol><button className="primary" onClick={() => setReveal(v => !v)}>{reveal ? 'Hide coaching notes' : 'Reveal coaching notes'}</button>{reveal && <div className="model"><b>A strong direction</b><p>{s.model}</p></div>}</article></div> }

function QuizHub({ track, progress, setProgress }) { const { quizQuestions: questions, exam } = track; const minutes = exam?.minutes || estimatedQuizMinutes(questions.length); const [mode, setMode] = useState(null); if (mode) return <Quiz questions={questions} mode={mode} finish={(result) => { setProgress(p => ({ ...p, [mode]: result })); setMode(null) }} />; return <div className="page narrow"><div className="page-title"><span>Measure, learn, measure again</span><h1>{exam ? 'Certification assessment' : 'Knowledge check'}</h1><p>This {questions.length}-question assessment samples every module. Use the same concept pool before and after studying; questions and answer positions are randomized for every attempt.</p></div>{exam ? <section className="exam-facts"><div><span>Version</span><strong>{exam.version}</strong></div><div><span>Questions</span><strong>{exam.questions}</strong></div><div><span>Time</span><strong>{exam.minutes} min</strong></div><div><span>Official pass mark</span><strong>{exam.passPercent}%</strong></div><div><span>Format</span><strong>{exam.format}</strong></div></section> : null}<div className="quiz-options"><QuizOption title="Baseline quiz" result={progress.baseline} copy={`Take this before studying. Allow about ${minutes} minutes; guessing is useful because it shows what to prioritize.`} onClick={() => setMode('baseline')} /><QuizOption title="Final quiz" result={progress.final} copy={`Take this after all modules. Allow about ${minutes} minutes and compare your score and confidence.`} onClick={() => setMode('final')} /></div><ScoreMeaning exam={exam} />{track.disclaimer ? <p className="learning-disclaimer">{track.disclaimer}</p> : null}</div> }
function QuizOption({ title, result, copy, onClick }) { return <article><Gauge /><div><h2>{title}</h2><p>{copy}</p>{result && <strong>{result.score} correct · {result.percent}%</strong>}</div><button className="primary" onClick={onClick}>{result ? 'Retake' : 'Start'} <ChevronRight /></button></article> }
function ScoreMeaning({ exam }) { return <section className="score-meaning"><h2>How to read your score</h2>{exam ? <p className="pass-note">The current official pass mark is {exam.passPercent}%. For this study aid, aim for consistent scores of 80% or higher and be able to explain your reasoning.</p> : null}<div><p><b>&lt;40%</b> Start at the beginning. Focus on vocabulary, mental models, and safe sequencing.</p><p><b>40–69%</b> Your foundation is growing. Revisit missed topics and practice the workflows aloud.</p><p><b>70–84%</b> Strong working knowledge. Tighten your reasoning and revisit low-confidence answers.</p><p><b>85–100%</b> Ready for scenario practice. Explain your evidence, tradeoffs, validation, and follow-up.</p></div></section> }
function Quiz({ questions, mode, finish }) { const [quizQuestions] = useState(() => prepareQuiz(questions)); const [at, setAt] = useState(0); const [answers, setAnswers] = useState([]); const [selected, setSelected] = useState(null); const [showWhy, setShowWhy] = useState(false); const q = quizQuestions[at]; const choose = (i) => { if (!showWhy) setSelected(i) }; const next = () => { const updated = [...answers, selected]; if (at === quizQuestions.length - 1) { const score = updated.reduce((n, answer, i) => n + (answer === quizQuestions[i].answer ? 1 : 0), 0); finish({ score, percent: Math.round(score / quizQuestions.length * 100), date: new Date().toISOString() }) } else { setAnswers(updated); setAt(v => v + 1); setSelected(null); setShowWhy(false) } }; return <div className="page quiz-page"><div className="quiz-progress"><span>{mode === 'baseline' ? 'Baseline' : 'Final'} quiz · Question {at + 1} of {quizQuestions.length}</span><div className="progress"><i style={{ width: `${((at + 1) / quizQuestions.length) * 100}%` }} /></div></div><article className="question"><h1>{q.q}</h1><div className="choices">{q.choices.map((c, i) => <button key={c} className={`${selected === i ? 'selected' : ''} ${showWhy && i === q.answer ? 'correct' : ''} ${showWhy && selected === i && i !== q.answer ? 'wrong' : ''}`} onClick={() => choose(i)}><span>{String.fromCharCode(65 + i)}</span>{c}</button>)}</div>{showWhy && <div className="explanation"><b>{selected === q.answer ? 'Correct.' : 'Not quite.'}</b> {q.why}</div>}<button className="primary quiz-next" disabled={selected === null} onClick={() => showWhy ? next() : setShowWhy(true)}>{showWhy ? at === quizQuestions.length - 1 ? 'See results' : 'Next question' : 'Check answer'} <ChevronRight /></button></article></div> }

function Glossary({ track }) { const terms = track.glossary; const [query, setQuery] = useState(''); const filteredTerms = useMemo(() => terms.filter(([a,b]) => `${a} ${b}`.toLowerCase().includes(query.toLowerCase())), [query, terms]); return <div className="page narrow"><div className="page-title"><span>Plain English, fast</span><h1>{track.type === 'certification' ? 'Certification glossary' : 'Role glossary'}</h1><p>Use this as a quick reference while studying or before {track.type === 'certification' ? 'the exam' : 'the interview'}.</p></div><label className="search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search terms and definitions" /></label><dl className="glossary">{filteredTerms.map(([term, def]) => <div key={term}><dt>{term}</dt><dd>{def}</dd></div>)}</dl></div> }

createRoot(document.getElementById('root')).render(<App />)
