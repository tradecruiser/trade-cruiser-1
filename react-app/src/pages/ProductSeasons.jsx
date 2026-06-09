import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react'
import styles from './ProductSeasons.module.css'

// Chapter 7 — Oil Product Markets · seasonal demand
const PRODUCTS = {
  gasoline:  { name: 'Gasoline',  sub: 'summer driving', color: '#4DAA57' },
  distillate: { name: 'Distillate', sub: 'diesel & heating', color: '#F4A124' },
  jet:       { name: 'Jet',       sub: 'air travel', color: '#9B2FC7' },
  fueloil:   { name: 'Fuel oil',  sub: 'ships & power', color: '#2D2D32' },
}

const ROUNDS = [
  { prompt: 'Peak summer driving season across the northern hemisphere.', answer: 'gasoline',   why: 'Gasoline is the single largest product, and demand climbs into the summer driving season.' },
  { prompt: 'A deep winter cold snap sends heating demand soaring.',       answer: 'distillate', why: 'Heating oil is a middle distillate — demand for winter fuels peaks in the cold months.' },
  { prompt: 'A record summer for international air travel.',               answer: 'jet',        why: 'Jet fuel is tied to air travel; its demand swings with the travel season, peaking in summer.' },
  { prompt: 'A booming economy lifts freight, trucking and industry.',     answer: 'distillate', why: 'Diesel and gasoil are the industrial barometer — distillate demand leads when the economy accelerates.' },
  { prompt: 'Ocean-going ships need bunker fuel, all year round.',         answer: 'fueloil',    why: 'Fuel oil is the heavy residue at the bottom of the barrel, burned by ships and some power plants.' },
  { prompt: 'Northern-hemisphere winter: homes crank up the heat.',        answer: 'distillate', why: 'Heating fuels run on a winter calendar — the mirror image of gasoline.' },
  { prompt: 'A holiday air-travel peak fills the skies.',                  answer: 'jet',        why: 'Jet demand spikes with travel peaks — a close cousin of diesel, but driven by flights, not freight.' },
]

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
// relative demand curves across 12 months
const curve = (peak, amp, base) => MONTHS.map((_, m) => base + amp * Math.cos((2 * Math.PI * (m - peak)) / 12))
const CURVES = {
  gasoline:  curve(6.5, 0.40, 0.50),
  distillate: curve(0.0, 0.40, 0.50),
  jet:       curve(7.0, 0.30, 0.45),
}

const gradeFor = (p) => p >= 85 ? 'Sharp read' : p >= 70 ? 'Solid desk' : p >= 50 ? 'Getting there' : 'Keep studying'

function SeasonChart({ highlight }) {
  const W = 480, H = 150, pad = 18
  const x = (m) => pad + (m / 11) * (W - 2 * pad)
  const y = (v) => H - pad - v * (H - 2 * pad)
  const path = (arr) => arr.map((v, m) => `${m === 0 ? 'M' : 'L'} ${x(m).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} preserveAspectRatio="xMidYMid meet">
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--color-border)" />
      {Object.entries(CURVES).map(([id, arr]) => {
        const dim = highlight && highlight !== id
        return (
          <path key={id} d={path(arr)} fill="none"
            stroke={PRODUCTS[id].color} strokeWidth={highlight === id ? 3.5 : 2.5}
            opacity={dim ? 0.18 : 1} strokeLinecap="round" strokeLinejoin="round" />
        )
      })}
      {MONTHS.map((mo, m) => (
        <text key={m} x={x(m)} y={H - 4} textAnchor="middle" className={styles.axisTxt}>{mo}</text>
      ))}
    </svg>
  )
}

export default function ProductSeasons() {
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [done, setDone] = useState(false)

  const round = ROUNDS[idx]
  const correct = guess !== null && guess === round.answer

  function pick(id) {
    if (guess !== null) return
    setGuess(id); setAnswered((a) => a + 1)
    if (id === round.answer) {
      setScore((s) => s + 1)
      setStreak((st) => { const n = st + 1; setBest((b) => Math.max(b, n)); return n })
    } else setStreak(0)
  }
  function next() {
    if (idx + 1 >= ROUNDS.length) { setDone(true); return }
    setIdx((i) => i + 1); setGuess(null)
  }
  function playAgain() {
    setIdx(0); setGuess(null); setScore(0); setAnswered(0); setStreak(0); setBest(0); setDone(false)
  }

  const pct = answered ? Math.round((score / answered) * 100) : 0

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 7 · Simulator</p>
          <h1>Product Seasons</h1>
          <p className={styles.lede}>
            Each refined fuel runs on its own calendar — gasoline through summer, heating through
            winter, jet with the travel season. Read the moment and call the product in peak demand.
          </p>
        </header>

        <section className={styles.chartCard}>
          <SeasonChart highlight={guess ? round.answer : null} />
          <div className={styles.legend}>
            {['gasoline', 'distillate', 'jet'].map((id) => (
              <span key={id} className={styles.legendItem}>
                <span className={styles.dot} style={{ background: PRODUCTS[id].color }} />{PRODUCTS[id].name}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.scoreboard}>
          <div className={styles.scoreItem}><span>Accuracy</span><strong>{pct}%</strong><em>{score}/{answered}</em></div>
          <div className={styles.scoreItem}><span>Streak</span><strong>{streak}</strong><em>best {best}</em></div>
          <div className={styles.scoreItem}><span>Progress</span><strong>{done ? ROUNDS.length : idx + 1}/{ROUNDS.length}</strong><em>scenarios</em></div>
        </section>

        {!done ? (
          <section className={styles.stage}>
            <h2 className={styles.prompt}>{round.prompt}</h2>

            <div className={styles.choices}>
              {Object.entries(PRODUCTS).map(([id, p]) => {
                const picked = guess === id
                const isAnswer = guess !== null && id === round.answer
                const cls = guess === null ? '' : isAnswer ? styles.right : (picked ? styles.wrong : styles.faded)
                return (
                  <button key={id} className={`${styles.choice} ${cls}`} onClick={() => pick(id)} disabled={guess !== null}
                    style={{ '--pc': p.color }}>
                    <span className={styles.cDot} style={{ background: p.color }} />
                    <span className={styles.cName}>{p.name}</span>
                    <span className={styles.cSub}>{p.sub}</span>
                    {guess !== null && isAnswer && <Check size={15} className={styles.cIcon} />}
                    {picked && !isAnswer && <X size={15} className={styles.cIcon} />}
                  </button>
                )
              })}
            </div>

            {guess !== null && (
              <div className={styles.reveal}>
                <span className={`${styles.verdict} ${correct ? styles.vRight : styles.vWrong}`}>
                  {correct ? 'Correct' : `It's ${PRODUCTS[round.answer].name}`}
                </span>
                <p className={styles.why}>{round.why}</p>
                <button className={styles.nextBtn} onClick={next}>
                  {idx + 1 >= ROUNDS.length ? 'See results' : 'Next scenario'} →
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(pct)}</span>
            <span className={styles.finalScore}>{score} / {ROUNDS.length}</span>
            <span className={styles.finalSub}>{pct}% called correctly · best streak {best}</span>
            <button className={styles.nextBtn} onClick={playAgain}><RotateCcw size={15} /> Play again</button>
          </section>
        )}
      </div>
    </div>
  )
}
