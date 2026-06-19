import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import styles from './CrudeClassifier.module.css'

// Chapter 2 — Physical Characteristics of Crude Oil
// Classify each crude by API gravity (light/heavy) and sulfur (sweet/sour).
// Thresholds from the deck: light ≥ 31° API, sweet < 1.0% sulfur.
const QUADRANTS = {
  LS: { name: 'Light sweet', color: '#4DAA57', note: 'premium · easy to refine' },
  LO: { name: 'Light sour',  color: '#F4A124', note: 'light, but needs treating' },
  HW: { name: 'Heavy sweet', color: '#2C9C8F', note: 'dense, but clean' },
  HS: { name: 'Heavy sour',  color: '#E05555', note: 'discount · hard to refine' },
}

const SAMPLES = [
  { name: 'WTI',         api: 39.6, sulfur: 0.24, q: 'LS' },
  { name: 'Brent',       api: 38.3, sulfur: 0.37, q: 'LS' },
  { name: 'Bonny Light', api: 33.4, sulfur: 0.16, q: 'LS' },
  { name: 'Arab Light',  api: 33.0, sulfur: 1.80, q: 'LO' },
  { name: 'Oman',        api: 33.3, sulfur: 1.20, q: 'LO' },
  { name: 'Kirkuk',      api: 35.1, sulfur: 2.00, q: 'LO' },
  { name: 'Maya',        api: 21.8, sulfur: 3.30, q: 'HS' },
  { name: 'WCS',         api: 20.5, sulfur: 3.50, q: 'HS' },
  { name: 'Arab Heavy',  api: 27.4, sulfur: 2.80, q: 'HS' },
  { name: 'Duri',        api: 20.8, sulfur: 0.18, q: 'HW' },
  { name: 'Doba',        api: 21.1, sulfur: 0.10, q: 'HW' },
  { name: 'Dalia',       api: 23.6, sulfur: 0.45, q: 'HW' },
]

// ── Map geometry ──────────────────────────────────────
const MW = 600, MH = 300, ML = 44, MR = 16, MT = 16, MB = 34
const API_MIN = 12, API_MAX = 44, S_MIN = 0, S_MAX = 4
const API_SPLIT = 31, S_SPLIT = 1.0

const xFor = (api) => ML + ((api - API_MIN) / (API_MAX - API_MIN)) * (MW - ML - MR)
const yFor = (s)   => MT + (1 - s / (S_MAX - S_MIN)) * (MH - MT - MB)

const xSplit = xFor(API_SPLIT)
const ySplit = yFor(S_SPLIT)

const gradeFor = (p) => p >= 90 ? 'Master assayer' : p >= 75 ? 'Sharp eye' : p >= 55 ? 'Getting there' : 'Keep studying'

function ClassMap({ placed, current, answered }) {
  return (
    <svg viewBox={`0 0 ${MW} ${MH}`} className={styles.map} preserveAspectRatio="xMidYMid meet">
      {/* quadrant tints */}
      <rect x={ML} y={MT} width={xSplit - ML} height={ySplit - MT} fill="rgba(224,85,85,0.07)" />
      <rect x={xSplit} y={MT} width={MW - MR - xSplit} height={ySplit - MT} fill="rgba(244,161,36,0.07)" />
      <rect x={ML} y={ySplit} width={xSplit - ML} height={MH - MB - ySplit} fill="rgba(44,156,143,0.07)" />
      <rect x={xSplit} y={ySplit} width={MW - MR - xSplit} height={MH - MB - ySplit} fill="rgba(77,170,87,0.07)" />

      {/* split lines */}
      <line x1={xSplit} y1={MT} x2={xSplit} y2={MH - MB} className={styles.split} />
      <line x1={ML} y1={ySplit} x2={MW - MR} y2={ySplit} className={styles.split} />

      {/* quadrant labels */}
      <text x={ML + 8} y={MT + 16} className={styles.qLabel} fill={QUADRANTS.HS.color}>HEAVY SOUR</text>
      <text x={MW - MR - 8} y={MT + 16} textAnchor="end" className={styles.qLabel} fill={QUADRANTS.LO.color}>LIGHT SOUR</text>
      <text x={ML + 8} y={MH - MB - 8} className={styles.qLabel} fill={QUADRANTS.HW.color}>HEAVY SWEET</text>
      <text x={MW - MR - 8} y={MH - MB - 8} textAnchor="end" className={styles.qLabel} fill={QUADRANTS.LS.color}>LIGHT SWEET</text>

      {/* axes */}
      <text x={(ML + MW - MR) / 2} y={MH - 6} textAnchor="middle" className={styles.axis}>heavier ← API gravity → lighter</text>
      <text x={12} y={(MT + MH - MB) / 2} textAnchor="middle" className={styles.axis}
        transform={`rotate(-90 12 ${(MT + MH - MB) / 2})`}>sweet ← sulfur → sour</text>

      {/* placed samples */}
      {placed.map((p) => (
        <g key={p.name}>
          <circle cx={xFor(p.api)} cy={yFor(p.sulfur)} r="5" fill={QUADRANTS[p.q].color} />
          <text x={xFor(p.api)} y={yFor(p.sulfur) - 8} textAnchor="middle" className={styles.dotLabel}>{p.name}</text>
        </g>
      ))}

      {/* current sample — ghost position revealed only after answering */}
      {current && answered && (
        <circle cx={xFor(current.api)} cy={yFor(current.sulfur)} r="7"
          fill="none" stroke={QUADRANTS[current.q].color} strokeWidth="2.5" className={styles.ghost} />
      )}
    </svg>
  )
}

function MiniScale({ value, min, max, split, leftLabel, rightLabel, color }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const splitPct = ((split - min) / (max - min)) * 100
  return (
    <div className={styles.scale}>
      <div className={styles.scaleLabels}><span>{leftLabel}</span><span>{rightLabel}</span></div>
      <div className={styles.scaleTrack}>
        <div className={styles.scaleSplit} style={{ left: `${splitPct}%` }} />
        <div className={styles.scaleDot} style={{ left: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function CrudeClassifier() {
  const order = useMemo(() => [...SAMPLES].sort(() => Math.random() - 0.5), [])
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [placed, setPlaced] = useState([])
  const [done, setDone] = useState(false)

  const sample = order[idx]
  const correct = guess === sample?.q
  const answered = guess !== null

  function pick(q) {
    if (answered) return
    setGuess(q)
    if (q === sample.q) {
      setScore((s) => s + 1)
      setStreak((st) => { const n = st + 1; setBest((b) => Math.max(b, n)); return n })
    } else {
      setStreak(0)
    }
    setPlaced((p) => [...p, sample])
  }

  function next() {
    if (idx + 1 >= order.length) { setDone(true); return }
    setIdx((i) => i + 1)
    setGuess(null)
  }

  function playAgain() {
    setIdx(0); setGuess(null); setScore(0); setStreak(0); setBest(0); setPlaced([]); setDone(false)
  }

  const pct = (idx + (answered ? 1 : 0)) ? Math.round((score / (idx + (answered ? 1 : 0))) * 100) : 0

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 2 · Simulator</p>
          <h1>Crude Classifier</h1>
          <p className={styles.lede}>
            Two numbers classify almost any barrel: API gravity (light vs heavy) and sulfur (sweet vs sour).
            Read each crude assay and drop it into the right corner of the map.
          </p>
        </header>

        <section className={styles.mapCard}>
          <ClassMap placed={placed} current={answered ? sample : null} answered={answered} />
        </section>

        <section className={styles.scoreboard}>
          <div className={styles.scoreItem}><span>Accuracy</span><strong>{pct}%</strong><em>{score}/{idx + (answered ? 1 : 0)}</em></div>
          <div className={styles.scoreItem}><span>Streak</span><strong>{streak}</strong><em>best {best}</em></div>
          <div className={styles.scoreItem}><span>Progress</span><strong>{done ? order.length : idx + 1}/{order.length}</strong><em>samples</em></div>
        </section>

        {!done ? (
          <section className={styles.stage}>
            <div className={styles.assay}>
              <div className={styles.assayHead}>
                <span className={styles.assayLabel}>Crude sample</span>
                <strong className={styles.assayName}>{sample.name}</strong>
              </div>
              <div className={styles.assayStats}>
                <div className={styles.stat}>
                  <span>API gravity</span><strong>{sample.api.toFixed(1)}°</strong>
                  <MiniScale value={sample.api} min={API_MIN} max={API_MAX} split={API_SPLIT}
                    leftLabel="heavy" rightLabel="light" color="var(--color-text)" />
                </div>
                <div className={styles.stat}>
                  <span>Sulfur</span><strong>{sample.sulfur.toFixed(2)}%</strong>
                  <MiniScale value={sample.sulfur} min={S_MIN} max={S_MAX} split={S_SPLIT}
                    leftLabel="sweet" rightLabel="sour" color="var(--color-text)" />
                </div>
              </div>
            </div>

            <div className={styles.quadGrid}>
              {/* visual order matches the map: HS top-left, LO top-right, HW bottom-left, LS bottom-right */}
              {['HS', 'LO', 'HW', 'LS'].map((q) => {
                let cls = styles.quadBtn
                if (answered) {
                  if (q === sample.q) cls = `${styles.quadBtn} ${styles.quadCorrect}`
                  else if (q === guess) cls = `${styles.quadBtn} ${styles.quadWrong}`
                }
                return (
                  <button key={q} className={cls} onClick={() => pick(q)} disabled={answered}
                    style={answered && q === sample.q ? { borderColor: QUADRANTS[q].color } : undefined}>
                    <span className={styles.quadDot} style={{ background: QUADRANTS[q].color }} />
                    <span className={styles.quadName}>{QUADRANTS[q].name}</span>
                    <span className={styles.quadNote}>{QUADRANTS[q].note}</span>
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className={styles.reveal}>
                <span className={styles.verdict} style={{ color: correct ? 'var(--color-green)' : '#E05555' }}>
                  {correct ? 'Correct' : 'Not quite'} — {sample.name} is {QUADRANTS[sample.q].name.toLowerCase()}
                </span>
                <p className={styles.why}>
                  At {sample.api.toFixed(1)}° API it is {sample.api >= API_SPLIT ? 'light' : 'heavy'},
                  and at {sample.sulfur.toFixed(2)}% sulfur it is {sample.sulfur < S_SPLIT ? 'sweet' : 'sour'} —
                  so it trades at a {sample.q === 'LS' ? 'premium' : sample.q === 'HS' ? 'steep discount' : 'differential'} to benchmark.
                </p>
                <button className={styles.nextBtn} onClick={next}>
                  {idx + 1 >= order.length ? 'See results' : 'Next sample'} →
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(pct)}</span>
            <span className={styles.finalScore}>{score} / {order.length}</span>
            <span className={styles.finalSub}>{pct}% classified correctly · best streak {best}</span>
            <button className={styles.nextBtn} onClick={playAgain}><RotateCcw size={15} /> Play again</button>
          </section>
        )}
      </div>
    </div>
  )
}
