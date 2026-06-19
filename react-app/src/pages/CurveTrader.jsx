import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react'
import styles from './CurveTrader.module.css'

// Chapter 14 — Calendar Spread Trading · trade the slope of the forward curve
// Spread = near (M1) − far (M6). Buy the spread → bet the front strengthens (toward backwardation).
const VOL = 10_000 // barrels
const MONTHS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6']

const ROUNDS = [
  {
    news: 'US crude inventories surge to a record and storage tanks keep filling.',
    before: [85, 86, 87, 88, 89, 90],
    after:  [83, 85, 87, 89, 91, 93],
    why: 'A supply glut deepens the contango — the front weakens against the back, so selling the spread paid.',
  },
  {
    news: 'A surprise refinery outage sparks a scramble for prompt barrels.',
    before: [92, 91, 90, 89, 88, 87],
    after:  [96, 93, 91, 89, 88, 87],
    why: 'Prompt scarcity drives the curve deeper into backwardation — the front strengthens, so buying the spread won.',
  },
  {
    news: 'OPEC+ signals deeper cuts ahead, tightening near-term supply.',
    before: [88, 88.5, 89, 89.5, 90, 90.5],
    after:  [91, 90.2, 90, 90, 90, 90],
    why: 'Expected tightness lifts the front relative to the back — the mild contango flips toward backwardation. Buy the spread.',
  },
  {
    news: 'Recession fears hit demand and prompt buyers step away.',
    before: [95, 93, 91, 90, 89, 88],
    after:  [90, 90, 90, 89.5, 89, 88],
    why: 'A demand scare softens the front — the backwardation flattens toward contango, rewarding a sold spread.',
  },
  {
    news: 'Floating storage is maxed out and cash-and-carry arbs are exhausted.',
    before: [84, 86, 88, 89, 90, 91],
    after:  [88, 89, 89.5, 90, 90.5, 91],
    why: 'With tanks full the contango can not widen further — the front firms and the curve flattens. Buy the spread.',
  },
  {
    news: 'A new wave of shale supply builds a glut at the prompt.',
    before: [94, 92, 90, 89, 88, 87],
    after:  [89, 89, 89, 88.5, 88, 87],
    why: 'Fresh prompt supply collapses the backwardation toward contango — selling the spread was the call.',
  },
]

const spreadOf = (arr) => arr[0] - arr[arr.length - 1] // near − far
const shapeOf = (s) => (s > 0.5 ? 'Backwardation' : s < -0.5 ? 'Contango' : 'Flat')
const gradeFor = (p) => p >= 90 ? 'Curve master' : p >= 75 ? 'Sharp read' : p >= 55 ? 'Getting there' : 'Keep studying'

const fmt = (v) => {
  const sign = v < 0 ? '−' : '+'
  const abs = Math.abs(v)
  return abs >= 1000 ? `${sign}$${(abs / 1000).toFixed(0)}k` : `${sign}$${abs.toFixed(0)}`
}

// ── Chart ─────────────────────────────────────────────
const CW = 560, CH = 240, PAD_L = 36, PAD_R = 20, PAD_T = 18, PAD_B = 30

function ForwardCurve({ before, after, revealed }) {
  const all = revealed ? [...before, ...after] : before
  const lo = Math.min(...all) - 1.5
  const hi = Math.max(...all) + 1.5
  const x = (i) => PAD_L + (i / (MONTHS.length - 1)) * (CW - PAD_L - PAD_R)
  const y = (v) => PAD_T + (1 - (v - lo) / (hi - lo)) * (CH - PAD_T - PAD_B)
  const path = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className={styles.chart} preserveAspectRatio="xMidYMid meet">
      {/* y gridlines */}
      {[lo, (lo + hi) / 2, hi].map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={y(v)} x2={CW - PAD_R} y2={y(v)} className={styles.grid} />
          <text x={PAD_L - 6} y={y(v) + 3} textAnchor="end" className={styles.axisNote}>${v.toFixed(0)}</text>
        </g>
      ))}
      {/* x labels */}
      {MONTHS.map((m, i) => (
        <text key={m} x={x(i)} y={CH - PAD_B + 18} textAnchor="middle" className={styles.axisNote}>{m}</text>
      ))}

      {/* before curve */}
      <path d={path(before)} className={`${styles.curveBefore} ${revealed ? styles.curveFaded : ''}`} />
      {before.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" className={`${styles.dotBefore} ${revealed ? styles.curveFaded : ''}`} />)}

      {/* after curve */}
      {revealed && (
        <>
          <path d={path(after)} className={styles.curveAfter} />
          {after.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" className={styles.dotAfter} />)}
        </>
      )}
    </svg>
  )
}

export default function CurveTrader() {
  const order = useMemo(() => [...ROUNDS].sort(() => Math.random() - 0.5), [])
  const [idx, setIdx] = useState(0)
  const [pos, setPos] = useState(null) // 'buy' | 'sell'
  const [pnl, setPnl] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const r = order[idx]
  const oldSpread = spreadOf(r.before)
  const newSpread = spreadOf(r.after)
  const dSpread = newSpread - oldSpread
  const decided = pos !== null
  const dir = pos === 'buy' ? 1 : -1
  const roundPnl = decided ? dSpread * dir * VOL : 0
  const wasCorrect = decided && roundPnl > 0

  function decide(p) {
    if (decided) return
    setPos(p)
    const rp = dSpread * (p === 'buy' ? 1 : -1) * VOL
    setPnl((x) => x + rp)
    if (rp > 0) setCorrectCount((c) => c + 1)
  }
  function next() {
    if (idx + 1 >= order.length) { setDone(true); return }
    setIdx((i) => i + 1); setPos(null)
  }
  function playAgain() {
    setIdx(0); setPos(null); setPnl(0); setCorrectCount(0); setDone(false)
  }

  const seen = idx + (decided ? 1 : 0)
  const acc = seen ? Math.round((correctCount / seen) * 100) : 0

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 14 · Simulator</p>
          <h1>Curve Trader</h1>
          <p className={styles.lede}>
            You do not trade the level of oil — you trade the shape of the curve. Read the term structure,
            then buy or sell the M1–M6 spread on where you think the slope is heading.
          </p>
        </header>

        <section className={styles.scoreboard}>
          <div className={styles.scoreItem}><span>P&amp;L</span>
            <strong style={{ color: pnl < 0 ? '#E05555' : pnl > 0 ? 'var(--color-green)' : 'var(--color-text)' }}>{fmt(pnl)}</strong>
            <em>on {VOL.toLocaleString()} bbl</em></div>
          <div className={styles.scoreItem}><span>Accuracy</span><strong>{acc}%</strong><em>{correctCount}/{seen}</em></div>
          <div className={styles.scoreItem}><span>Progress</span><strong>{done ? order.length : idx + 1}/{order.length}</strong><em>curves</em></div>
        </section>

        {!done ? (
          <section className={styles.stage}>
            <div className={styles.chartCard}>
              <div className={styles.chartHead}>
                <span className={styles.shapeBadge} data-shape={shapeOf(oldSpread)}>
                  {shapeOf(oldSpread)}
                </span>
                <span className={styles.spreadNow}>M1–M6 spread <strong>{oldSpread >= 0 ? '+' : '−'}${Math.abs(oldSpread).toFixed(1)}</strong></span>
                {decided && <span className={styles.legendAfter}>after event</span>}
              </div>
              <ForwardCurve before={r.before} after={r.after} revealed={decided} />
            </div>

            <div className={styles.news}>
              <span className={styles.newsTag}>MARKET WIRE</span>
              <p>{r.news}</p>
            </div>

            {!decided ? (
              <div className={styles.actions}>
                <button className={`${styles.actBtn} ${styles.actBuy}`} onClick={() => decide('buy')}>
                  <TrendingUp size={16} /> Buy the spread
                  <em>front strengthens · toward backwardation</em>
                </button>
                <button className={`${styles.actBtn} ${styles.actSell}`} onClick={() => decide('sell')}>
                  <TrendingDown size={16} /> Sell the spread
                  <em>front weakens · toward contango</em>
                </button>
              </div>
            ) : (
              <div className={styles.reveal}>
                <span className={styles.verdict} style={{ color: wasCorrect ? 'var(--color-green)' : '#E05555' }}>
                  {wasCorrect ? 'Right way round' : 'Wrong side'} — spread moved {dSpread >= 0 ? '+' : '−'}${Math.abs(dSpread).toFixed(1)} to {newSpread >= 0 ? '+' : '−'}${Math.abs(newSpread).toFixed(1)} · this trade settles {fmt(roundPnl)}
                </span>
                <p className={styles.why}>{r.why}</p>
                <button className={styles.nextBtn} onClick={next}>
                  {idx + 1 >= order.length ? 'See results' : 'Next curve'} →
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(acc)}</span>
            <span className={styles.finalScore}>{fmt(pnl)}</span>
            <span className={styles.finalSub}>{acc}% of curves read right · {correctCount}/{order.length} correct</span>
            <button className={styles.nextBtn} onClick={playAgain}><RotateCcw size={15} /> Trade again</button>
          </section>
        )}
      </div>
    </div>
  )
}
