import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Check, X, RotateCcw } from 'lucide-react'
import styles from './MarketMover.module.css'

// Headlines drawn from Chapter 6 — "What Affects the Market"
const HEADLINES = [
  { id: 1,  cat: 'Supply',      text: 'OPEC+ announces a surprise 2 mb/d production cut.',           dir: 'up',   mag: 6, why: 'Less oil tightens the balance. With demand inelastic, price — not consumption — does the adjusting.' },
  { id: 2,  cat: 'Supply',      text: 'US shale output sets a record near 13.6 mb/d.',               dir: 'down', mag: 5, why: 'The US swing producer floods the market with barrels, loosening the global balance and capping price.' },
  { id: 3,  cat: 'Geopolitics', text: 'Transit through the Strait of Hormuz is halted.',             dir: 'up',   mag: 8, why: 'Roughly 20% of the world’s oil moves through Hormuz. Losing it spikes the risk premium — Brent jumped toward $138 in 2026.' },
  { id: 4,  cat: 'Inventories', text: 'The EIA reports a surprise build in crude stocks.',           dir: 'down', mag: 3, why: 'Rising inventories show supply outpacing demand — the clearest real-time read that the market is loosening.' },
  { id: 5,  cat: 'Inventories', text: 'US weekly data shows an unexpected large draw.',              dir: 'up',   mag: 3, why: 'Falling stocks mean demand is outpacing supply. A surprise draw can move price within seconds.' },
  { id: 6,  cat: 'Macro',       text: 'The US dollar strengthens sharply.',                          dir: 'down', mag: 2, why: 'Crude is priced in USD. A stronger dollar makes oil costlier for the rest of the world, weighing on demand.' },
  { id: 7,  cat: 'Demand',      text: 'A global recession warning hits manufacturing data.',         dir: 'down', mag: 6, why: 'Oil demand tracks the economy. Recession fears alone can sink price — the barrel is a growth barometer.' },
  { id: 8,  cat: 'Weather',     text: 'A deep winter freeze grips the US Gulf Coast.',               dir: 'up',   mag: 4, why: 'A cold snap spikes heating demand and freezes off Gulf production at once — tightening both sides.' },
  { id: 9,  cat: 'Supply',      text: 'Saudi Arabia taps spare capacity to cover an outage.',        dir: 'down', mag: 2, why: 'Spare capacity is the market’s shock absorber. Bringing it online replaces lost barrels and calms price.' },
  { id: 10, cat: 'Inventories', text: 'The US releases barrels from the Strategic Petroleum Reserve.', dir: 'down', mag: 3, why: 'Government stockpiles can be released to blunt a supply shock, adding supply and easing price.' },
  { id: 11, cat: 'Sentiment',   text: 'A crowded long unwinds as funds rush for the exit.',          dir: 'down', mag: 5, why: 'Paper money moves price. When bullish positioning grows crowded, the unwind can be as violent as the rally.' },
  { id: 12, cat: 'Weather',     text: 'Forecasters predict a mild winter across the hemisphere.',    dir: 'down', mag: 3, why: 'Weaker heating demand loosens the balance for winter fuels, pulling price down.' },
  { id: 13, cat: 'Geopolitics', text: 'A ceasefire eases tensions near a key chokepoint.',           dir: 'down', mag: 4, why: 'Markets price the probability of disruption. As the threat fades, the risk premium unwinds.' },
  { id: 14, cat: 'Demand',      text: 'China and India post stronger-than-expected growth.',         dir: 'up',   mag: 4, why: 'Demand growth now comes overwhelmingly from Asia. Stronger activity there lifts oil consumption.' },
]

const CAT_COLOR = {
  Supply: '#F4A124', Demand: '#4DAA57', Inventories: '#2D2D32',
  Geopolitics: '#9B2FC7', Macro: '#2D2D32', Weather: '#4DAA57', Sentiment: '#9B2FC7',
}

const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

const gradeFor = (pct) =>
  pct >= 85 ? 'Sharp read' : pct >= 70 ? 'Solid desk' : pct >= 50 ? 'Mixed signals' : 'Chasing headlines'

export default function MarketMover() {
  const [deck, setDeck] = useState(() => shuffle(HEADLINES))
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState(null)      // 'up' | 'down' | null
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [brent, setBrent] = useState(80)
  const [done, setDone] = useState(false)

  const current = deck[idx]
  const correct = guess !== null && guess === current.dir

  function makeGuess(dir) {
    if (guess !== null) return
    setGuess(dir)
    setAnswered((a) => a + 1)
    const move = current.dir === 'up' ? current.mag : -current.mag
    setBrent((p) => +(p + move).toFixed(2))
    if (dir === current.dir) {
      setScore((s) => s + 1)
      setStreak((st) => { const n = st + 1; setBest((b) => Math.max(b, n)); return n })
    } else {
      setStreak(0)
    }
  }

  function next() {
    if (idx + 1 >= deck.length) { setDone(true); return }
    setIdx((i) => i + 1)
    setGuess(null)
  }

  function playAgain() {
    setDeck(shuffle(HEADLINES)); setIdx(0); setGuess(null)
    setScore(0); setAnswered(0); setStreak(0); setBest(0); setBrent(80); setDone(false)
  }

  const pct = answered ? Math.round((score / answered) * 100) : 0

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}>
          <ArrowLeft size={15} /> Simulators
        </Link>

        <header className={styles.header}>
          <p className="label">Chapter 6 · Simulator</p>
          <h1>Market Mover</h1>
          <p className={styles.lede}>
            A headline hits the wire. Call the barrel: does Brent rally or sell off? Don’t chase the
            news — read whether each force tightens or loosens the underlying balance.
          </p>
        </header>

        {/* Scoreboard */}
        <section className={styles.scoreboard}>
          <div className={styles.scoreItem}><span>Accuracy</span><strong>{pct}%</strong><em>{score}/{answered}</em></div>
          <div className={styles.scoreItem}><span>Streak</span><strong>{streak}</strong><em>best {best}</em></div>
          <div className={styles.scoreItem}><span>Brent</span><strong className={styles.brent}>${brent.toFixed(2)}</strong><em>simulated</em></div>
          <div className={styles.scoreItem}><span>Progress</span><strong>{done ? deck.length : idx + 1}/{deck.length}</strong><em>headlines</em></div>
        </section>

        {!done ? (
          <section className={styles.stage}>
            <span className={styles.cat} style={{ backgroundColor: CAT_COLOR[current.cat] }}>{current.cat}</span>
            <h2 className={styles.headline}>{current.text}</h2>

            {guess === null ? (
              <div className={styles.choices}>
                <button className={`${styles.choice} ${styles.bull}`} onClick={() => makeGuess('up')}>
                  <TrendingUp size={22} /> Bullish <span>Brent rises</span>
                </button>
                <button className={`${styles.choice} ${styles.bear}`} onClick={() => makeGuess('down')}>
                  <TrendingDown size={22} /> Bearish <span>Brent falls</span>
                </button>
              </div>
            ) : (
              <div className={styles.reveal}>
                <div className={`${styles.verdict} ${correct ? styles.right : styles.wrong}`}>
                  {correct ? <Check size={18} /> : <X size={18} />}
                  {correct ? 'Correct' : 'Missed'}
                  <span className={styles.move} style={{ color: current.dir === 'up' ? '#2E8B45' : '#C0392B' }}>
                    {current.dir === 'up' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    Brent {current.dir === 'up' ? '+' : '−'}${current.mag}
                  </span>
                </div>
                <p className={styles.why}>{current.why}</p>
                <button className={styles.nextBtn} onClick={next}>
                  {idx + 1 >= deck.length ? 'See results' : 'Next headline'} →
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(pct)}</span>
            <span className={styles.finalScore}>{score} / {deck.length}</span>
            <span className={styles.finalSub}>{pct}% of headlines called correctly · best streak {best}</span>
            <button className={styles.nextBtn} onClick={playAgain}><RotateCcw size={15} /> Play again</button>
          </section>
        )}
      </div>
    </div>
  )
}
