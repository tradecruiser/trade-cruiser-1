import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import styles from './BenchmarkMap.module.css'

// Chapter 5 — Crude Oil Markets · the three benchmarks
const MARKERS = {
  wti:   { name: 'WTI',          color: '#F4A124', x: 145, y: 128, region: 'Cushing · New York' },
  brent: { name: 'Brent',        color: '#4DAA57', x: 352, y: 84,  region: 'North Sea · London' },
  dubai: { name: 'Dubai / Oman', color: '#9B2FC7', x: 442, y: 150, region: 'Middle East · Asia' },
}

const ROUNDS = [
  { clue: 'Light, sweet crude physically delivered into tanks at Cushing, Oklahoma.', answer: 'wti',   why: 'WTI is the US benchmark — light, sweet and delivered at Cushing, the most liquid single crude contract.' },
  { clue: 'The global benchmark and the US EIA’s primary price reference, settled on ICE in London.', answer: 'brent', why: 'Brent references most internationally-traded oil and is now the EIA’s primary price reference.' },
  { clue: 'A heavier, sour marker pricing most crude that flows east to Asian refiners.', answer: 'dubai', why: 'Dubai/Oman is the Middle East sour marker for the largest physical export flows, east of Suez.' },
  { clue: 'Quoted off the North Sea — the marker most international cargoes price against.', answer: 'brent', why: 'Brent is anchored in the North Sea and settled on ICE in London.' },
  { clue: 'Traded on CME/NYMEX, the deepest single-crude futures market in the world.', answer: 'wti', why: 'WTI trades on CME/NYMEX in New York — the deepest energy derivatives complex.' },
  { clue: 'The marker for the largest seaborne crude export flows on earth, into Asia.', answer: 'dubai', why: 'Dubai/Oman prices the huge Middle East-to-Asia crude flows.' },
  { clue: 'A US Gulf Coast cargo prices at a premium or discount to this marker.', answer: 'wti', why: 'US grades price as differentials to WTI, reflecting their quality and location.' },
]

const CONTINENTS = [
  'M70,70 C110,52 200,58 210,96 C218,128 165,158 130,160 C92,162 55,108 70,70 Z',
  'M165,180 C195,175 222,200 214,245 C205,295 178,315 165,300 C148,282 150,205 165,180 Z',
  'M330,70 C375,60 426,95 421,150 C416,215 384,272 356,258 C326,242 318,150 322,100 C326,82 325,72 330,70 Z',
  'M420,62 C490,46 600,58 615,98 C625,132 560,160 480,156 C435,153 398,92 420,62 Z',
  'M565,225 C592,218 628,230 624,256 C620,284 588,288 570,279 C552,270 548,234 565,225 Z',
]

const gradeFor = (p) => p >= 85 ? 'Sharp read' : p >= 70 ? 'Solid desk' : p >= 50 ? 'Getting there' : 'Keep studying'

function WorldMap({ onPick, answered, correctId, wrongId }) {
  return (
    <svg viewBox="0 0 690 320" className={styles.map} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="690" height="320" rx="14" className={styles.sea} />
      {[80, 160, 240].map((y) => <line key={y} x1="0" y1={y} x2="690" y2={y} className={styles.grat} />)}
      {[170, 340, 510].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="320" className={styles.grat} />)}
      {CONTINENTS.map((d, i) => <path key={i} d={d} className={styles.land} />)}

      {Object.entries(MARKERS).map(([id, m]) => {
        const isCorrect = answered && id === correctId
        const isWrong = wrongId === id
        return (
          <g key={id} className={`${styles.hotspot} ${isWrong ? styles.hsWrong : ''}`}
            onClick={() => onPick(id)} role="button">
            {!answered && <circle cx={m.x} cy={m.y} r="16" className={styles.pulse} />}
            <circle cx={m.x} cy={m.y} r="9"
              fill={isCorrect ? m.color : 'var(--color-surface)'}
              stroke={isCorrect ? m.color : 'var(--color-text-muted)'} strokeWidth="2.5" />
            {isCorrect && (
              <text x={m.x} y={m.y - 16} textAnchor="middle" className={styles.hsLabel} fill={m.color}>{m.name}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function BenchmarkMap() {
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState(null)
  const [wrongId, setWrongId] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [done, setDone] = useState(false)

  const round = ROUNDS[idx]
  const correct = guess === round.answer

  function pick(id) {
    if (guess !== null) return
    setGuess(id); setAnswered((a) => a + 1)
    if (id === round.answer) {
      setScore((s) => s + 1)
      setStreak((st) => { const n = st + 1; setBest((b) => Math.max(b, n)); return n })
    } else { setStreak(0); setWrongId(id); setTimeout(() => setWrongId(null), 650) }
  }
  function next() {
    if (idx + 1 >= ROUNDS.length) { setDone(true); return }
    setIdx((i) => i + 1); setGuess(null); setWrongId(null)
  }
  function playAgain() {
    setIdx(0); setGuess(null); setWrongId(null); setScore(0); setAnswered(0); setStreak(0); setBest(0); setDone(false)
  }

  const pct = answered ? Math.round((score / answered) * 100) : 0

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 5 · Simulator</p>
          <h1>Benchmark Map</h1>
          <p className={styles.lede}>
            Three benchmarks price the world — Brent, WTI and Dubai/Oman — and every cargo is a
            differential to one of them. Read the clue and tap the marker on the map.
          </p>
        </header>

        <section className={styles.mapCard}>
          <WorldMap onPick={done ? () => {} : pick} answered={guess !== null} correctId={round?.answer} wrongId={wrongId} />
          <div className={styles.legend}>
            {Object.values(MARKERS).map((m) => (
              <span key={m.name} className={styles.legendItem}>
                <span className={styles.dot} style={{ background: m.color }} />{m.name}<em>{m.region}</em>
              </span>
            ))}
          </div>
        </section>

        <section className={styles.scoreboard}>
          <div className={styles.scoreItem}><span>Accuracy</span><strong>{pct}%</strong><em>{score}/{answered}</em></div>
          <div className={styles.scoreItem}><span>Streak</span><strong>{streak}</strong><em>best {best}</em></div>
          <div className={styles.scoreItem}><span>Progress</span><strong>{done ? ROUNDS.length : idx + 1}/{ROUNDS.length}</strong><em>clues</em></div>
        </section>

        {!done ? (
          <section className={styles.stage}>
            <p className={styles.clueLabel}>The clue</p>
            <h2 className={styles.clue}>{round.clue}</h2>
            {guess !== null && (
              <div className={styles.reveal}>
                <span className={`${styles.verdict} ${correct ? styles.vRight : styles.vWrong}`}
                  style={{ color: MARKERS[round.answer].color }}>
                  {correct ? 'Correct — ' : 'It’s '}{MARKERS[round.answer].name}
                </span>
                <p className={styles.why}>{round.why}</p>
                <button className={styles.nextBtn} onClick={next}>
                  {idx + 1 >= ROUNDS.length ? 'See results' : 'Next clue'} →
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(pct)}</span>
            <span className={styles.finalScore}>{score} / {ROUNDS.length}</span>
            <span className={styles.finalSub}>{pct}% placed correctly · best streak {best}</span>
            <button className={styles.nextBtn} onClick={playAgain}><RotateCcw size={15} /> Play again</button>
          </section>
        )}
      </div>
    </div>
  )
}
