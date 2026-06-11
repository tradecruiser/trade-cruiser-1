import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react'
import styles from './RefineryFlow.module.css'

const STAGES = [
  { label: 'Distillation', sub: 'Separate by boiling point' },
  { label: 'Conversion',   sub: 'Break heavy into light'    },
  { label: 'Treatment',    sub: 'Remove impurities'         },
]

const QUESTIONS = [
  // Stage 0 — Distillation
  {
    stage: 0,
    q: 'A vapour condenses at 80 °C inside the distillation column. Which fraction is it?',
    options: ['Naphtha · 30–110 °C', 'LPG · < 30 °C', 'Kerosene · 150–250 °C', 'Gas oil · 250–350 °C'],
    answer: 0,
    why: 'At 80 °C the vapour sits squarely in the naphtha cut (30–110 °C), drawn off in the upper-middle section of the column.',
  },
  {
    stage: 0,
    q: 'What does distillation change chemically in the crude it processes?',
    options: [
      'Nothing — it only sorts molecules already present',
      'It cracks large chains into lighter products',
      'It removes sulfur and nitrogen compounds',
      'It raises the octane number of naphtha',
    ],
    answer: 0,
    why: 'Distillation is purely physical separation by boiling point. No molecular chemistry occurs — conversion units do the actual breaking.',
  },
  {
    stage: 0,
    q: 'Which fraction exits at the very top of the atmospheric distillation column?',
    options: [
      'Refinery gas · LPG (< 30 °C)',
      'Naphtha (30–110 °C)',
      'Kerosene (150–250 °C)',
      'Atmospheric residue (> 350 °C)',
    ],
    answer: 0,
    why: 'The lightest molecules rise highest before condensing. LPG gases — propane and butane — exit the top below 30 °C.',
  },
  {
    stage: 0,
    q: 'Why is a vacuum distillation column run after the atmospheric one?',
    options: [
      'Lower pressure lets the heavy residue release more gas oil without overheating',
      'It removes sulfur from kerosene before it is sold',
      'It raises the octane number of naphtha streams',
      'It converts the residue into gasoline and LPG',
    ],
    answer: 0,
    why: 'Under vacuum the boiling point drops, recovering more gas oil cleanly. At normal pressure the residue would need so much heat it would crack uncontrollably and foul the column.',
  },
  // Stage 1 — Conversion
  {
    stage: 1,
    q: 'Which unit uses a hot powdered catalyst to crack heavy gas oil into gasoline and LPG?',
    options: ['Catalytic cracker (FCC)', 'Hydrocracker', 'Coker', 'Reformer & alkylation'],
    answer: 0,
    why: 'The FCC uses a fluidised bed of hot catalyst to crack gas oil — the workhorse of conversion in most gasoline-focused refineries.',
  },
  {
    stage: 1,
    q: 'A refinery must process the very heaviest vacuum residue and still yield light products. Which unit?',
    options: ['Coker', 'FCC', 'Hydrocracker', 'Atmospheric distillation'],
    answer: 0,
    why: 'The coker attacks the heaviest, dirtiest residue — breaking it into lighter products and leaving solid petroleum coke behind. It is the deepest conversion of all.',
  },
  {
    stage: 1,
    q: 'What is the commercial logic of conversion for a refiner?',
    options: [
      'Buy discounted heavy crude and still produce a high-value light product slate',
      'Remove sulfur from product streams before they are sold',
      'Blend streams to hit exact finished-fuel specifications',
      'Recover more LPG from the distillation column',
    ],
    answer: 0,
    why: 'Conversion lets a refiner pay the heavy-sour discount on crude and crack it into premium-priced gasoline and diesel — that gap is the heart of refining economics.',
  },
  {
    stage: 1,
    q: 'A refinery has a Nelson Complexity Index of 11. How would you classify it?',
    options: [
      'Deep conversion — runs crackers and cokers on heavy-sour crude',
      'Hydroskimming — distillation and treating only, needs light-sweet crude',
      'Simple fractionator — no conversion capacity at all',
      'Vacuum-only plant — skips the atmospheric column',
    ],
    answer: 0,
    why: 'NCI 10–12+ signals deep conversion. NCI 1–4 is hydroskimming. Higher complexity means more freedom on crude slate and structurally wider margins.',
  },
  // Stage 2 — Treatment
  {
    stage: 2,
    q: 'What does a hydrotreater remove from raw distillation cuts?',
    options: [
      'Sulfur, nitrogen and metals',
      'Heavy wax molecules and residue',
      'Carbon residue and ash',
      'Aromatics that lower octane',
    ],
    answer: 0,
    why: 'The hydrotreater adds hydrogen under pressure to strip sulfur (released as H₂S), nitrogen and metals — turning a raw cut into an on-spec, legally saleable fuel.',
  },
  {
    stage: 2,
    q: 'Why does treatment exist as a mandatory step rather than being optional?',
    options: [
      'Ever-tighter sulfur regulations make treatment what keeps products legal to sell',
      'Distillation columns cannot run above 30 % sulfur content',
      'Crackers require fully clean feedstock or they foul immediately',
      'Treatment raises the boiling point needed for safe tanker transport',
    ],
    answer: 0,
    why: 'Tighter sulfur caps on diesel, marine fuel and gasoline mean a refinery that skips treatment cannot legally sell its products in most markets.',
  },
  {
    stage: 2,
    q: 'A blender mixes reformate, FCC gasoline, alkylate and butane. What is the target output?',
    options: [
      'Finished gasoline meeting a 95 RON and sulfur specification',
      'Low-sulfur marine fuel oil (VLSFO)',
      'Jet fuel meeting freeze-point and flash-point specs',
      'Ultra-low-sulfur diesel (ULSD)',
    ],
    answer: 0,
    why: 'Reformate (octane backbone), FCC gasoline (volume), alkylate (clean octane boost) and butane (vapour-pressure control) are the classic blend recipe for on-spec finished gasoline.',
  },
]

function gradeFor(pct) {
  if (pct === 100) return 'Perfect run'
  if (pct >= 82)  return 'Sharp desk'
  if (pct >= 64)  return 'Solid read'
  if (pct >= 45)  return 'Getting there'
  return 'Keep studying'
}

export default function RefineryFlow() {
  const [qGlobal, setQGlobal]     = useState(0)
  const [selected, setSelected]   = useState(null)
  const [results, setResults]     = useState(Array(QUESTIONS.length).fill(null))
  const [stageDone, setStageDone] = useState(false)
  const [done, setDone]           = useState(false)

  const q         = QUESTIONS[qGlobal]
  const stageIdx  = q ? q.stage : 2
  const isCorrect = selected === q?.answer

  const stageStartIdx = QUESTIONS.findIndex(qq => qq.stage === stageIdx)
  const qWithinStage  = qGlobal - stageStartIdx
  const stageQsCount  = QUESTIONS.filter(qq => qq.stage === stageIdx).length

  const answered = results.filter(r => r !== null).length
  const correct  = results.filter(r => r === true).length
  const pct      = answered ? Math.round(correct / answered * 100) : 0

  const stageStats = STAGES.map((_, si) => {
    const start = QUESTIONS.findIndex(qq => qq.stage === si)
    const qs    = QUESTIONS.filter(qq => qq.stage === si)
    const c     = qs.filter((_, qi) => results[start + qi] === true).length
    const a     = qs.filter((_, qi) => results[start + qi] !== null).length
    return { correct: c, answered: a, total: qs.length }
  })

  function pick(optIdx) {
    if (selected !== null) return
    setSelected(optIdx)
    setResults(r => r.map((v, i) => i === qGlobal ? (optIdx === q.answer) : v))
  }

  function next() {
    const nextG = qGlobal + 1
    if (nextG >= QUESTIONS.length) { setDone(true); return }
    if (QUESTIONS[nextG].stage !== q.stage) { setStageDone(true); return }
    setQGlobal(nextG)
    setSelected(null)
  }

  function continueStage() {
    setQGlobal(g => g + 1)
    setSelected(null)
    setStageDone(false)
  }

  function restart() {
    setQGlobal(0); setSelected(null)
    setResults(Array(QUESTIONS.length).fill(null))
    setStageDone(false); setDone(false)
  }

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 4 · Simulator</p>
          <h1>Refinery Flow</h1>
          <p className={styles.lede}>
            One stream of crude enters — three processes later a slate of finished fuels exits.
            Walk the barrel through each stage and prove you know what happens at every step.
          </p>
        </header>

        {/* ── Pipeline indicator ── */}
        <div className={styles.pipeline}>
          {STAGES.map((s, i) => {
            const isActive  = !done && !stageDone && i === stageIdx
            const isDone    = done || i < stageIdx || (i === stageIdx && stageDone)
            return (
              <div key={s.label} className={styles.pipeWrap}>
                <div className={`${styles.pipeStep} ${isActive ? styles.pipeActive : ''} ${isDone ? styles.pipeDone : ''}`}>
                  <span className={styles.pipeNum}>{isDone ? '✓' : i + 1}</span>
                  <div className={styles.pipeInfo}>
                    <strong>{s.label}</strong>
                    <em>{s.sub}</em>
                  </div>
                </div>
                {i < STAGES.length - 1 && <ChevronRight size={13} className={styles.pipeArrow} />}
              </div>
            )
          })}
        </div>

        {/* ── Scoreboard ── */}
        <div className={styles.scoreboard}>
          <div className={styles.scoreItem}>
            <span>Accuracy</span><strong>{pct}%</strong><em>{correct}/{answered}</em>
          </div>
          <div className={styles.scoreItem}>
            <span>Stage</span>
            <strong>{done ? STAGES.length : stageIdx + 1}/{STAGES.length}</strong>
            <em>{done ? 'all complete' : STAGES[stageIdx].label.toLowerCase()}</em>
          </div>
          <div className={styles.scoreItem}>
            <span>Question</span>
            <strong>{done ? QUESTIONS.length : qGlobal + 1}/{QUESTIONS.length}</strong>
            <em>total</em>
          </div>
        </div>

        {/* ── Main panel ── */}
        {done ? (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(pct)}</span>
            <span className={styles.finalScore}>{correct} / {QUESTIONS.length}</span>
            <span className={styles.finalSub}>{pct}% correct across all three refinery stages</span>

            <div className={styles.breakdown}>
              {STAGES.map((s, i) => (
                <div key={s.label} className={styles.breakItem}>
                  <span className={styles.breakLabel}>{s.label}</span>
                  <span className={styles.breakScore}>{stageStats[i].correct}/{stageStats[i].total}</span>
                </div>
              ))}
            </div>

            <button className={styles.nextBtn} onClick={restart}><RotateCcw size={15} /> Run again</button>
          </section>

        ) : stageDone ? (
          <section className={styles.stageDoneCard}>
            <span className={styles.stageDonePill}>Stage {stageIdx + 1} complete</span>
            <h2 className={styles.stageDoneTitle}>{STAGES[stageIdx].label}</h2>
            <p className={styles.stageDoneSub}>{stageStats[stageIdx].correct} / {stageStats[stageIdx].total} correct</p>
            <p className={styles.stageDoneDesc}>
              {stageIdx === 0 && 'The column separates — now the real value gets added.'}
              {stageIdx === 1 && 'Conversion is done — one final step before the barrel is sellable.'}
            </p>
            <button className={styles.nextBtn} onClick={continueStage}>
              Next: {STAGES[stageIdx + 1].label} →
            </button>
          </section>

        ) : (
          <section className={styles.stage}>
            <p className={styles.stageLabel}>
              Stage {stageIdx + 1} · {STAGES[stageIdx].label.toUpperCase()}
              &nbsp;·&nbsp; {qWithinStage + 1} of {stageQsCount}
            </p>
            <h2 className={styles.question}>{q.q}</h2>

            <div className={styles.options}>
              {q.options.map((opt, i) => {
                let cls = styles.option
                if (selected !== null) {
                  if (i === q.answer)             cls = `${styles.option} ${styles.optionCorrect}`
                  else if (i === selected && !isCorrect) cls = `${styles.option} ${styles.optionWrong}`
                }
                return (
                  <button key={i} className={cls} onClick={() => pick(i)} disabled={selected !== null}>
                    <span className={styles.optIdx}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <div className={styles.reveal}>
                <span className={styles.verdict} style={{ color: isCorrect ? 'var(--color-green)' : '#E05555' }}>
                  {isCorrect ? 'Correct' : 'Incorrect'} — {q.options[q.answer]}
                </span>
                <p className={styles.why}>{q.why}</p>
                <button className={styles.nextBtn} onClick={next}>
                  {qGlobal + 1 >= QUESTIONS.length ? 'See results' : 'Continue →'}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
