import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, CheckCircle2, Circle } from 'lucide-react'
import styles from './ExposureTracker.module.css'

// Chapter 16 — Understanding Exposure in Physical Trading
// A cargo lands with a web of price exposures. Place the hedge that neutralises each layer.
const LAYERS = [
  { key: 'FLAT',      name: 'Flat price',  sub: 'ICE Brent / WTI' },
  { key: 'BASIS',     name: 'Basis · DFL', sub: 'Dated vs ICE' },
  { key: 'STRUCTURE', name: 'Structure',   sub: 'calendar spread' },
  { key: 'CRACK',     name: 'Crack',       sub: 'product vs crude' },
]

const SCENARIOS = [
  {
    deal: 'Buy 500,000 bbl crude · floating, priced on monthly-average Dated Brent',
    tag: 'Crude · Dated-priced',
    inPlay: ['FLAT', 'BASIS'],
    steps: [
      {
        layer: 'FLAT',
        prompt: 'You are LONG 500 lots of flat price on a floating-price crude buy. What is your first hedge?',
        options: [
          { label: 'Sell 500 ICE Brent futures', correct: true, explain: 'Selling 500 ICE lots neutralises the flat price. But the cargo prices on Dated, not ICE — so a residual Dated–ICE (DFL) basis now opens up.' },
          { label: 'Buy 500 ICE Brent futures', explain: 'Buying futures doubles your long — flat-price exposure grows instead of closing.' },
          { label: 'Sell a gasoil crack', explain: 'This is a crude cargo with no product leg — a crack hedge only opens a new, unrelated exposure.' },
        ],
      },
      {
        layer: 'BASIS',
        prompt: 'Flat price is flat — but hedging with ICE left you LONG the DFL (Dated–ICE). How do you close it?',
        options: [
          { label: 'Sell 500 DFL', correct: true, explain: 'Selling the DFL locks the Dated–ICE differential. Flat price and basis are now both flat — a single-month crude cargo carries no structure or crack.' },
          { label: 'Sell 500 more ICE futures', explain: 'You are already flat on flat price — more ICE just creates a short flat-price position.' },
          { label: 'Buy 500 DFL', explain: 'You are already long the DFL; buying more widens the basis exposure.' },
        ],
      },
    ],
  },
  {
    deal: 'Buy gasoil cargo (Nov) · re-sold as a Dec cargo · flat price already hedged on futures',
    tag: 'Product · month mismatch',
    inPlay: ['STRUCTURE', 'CRACK'],
    steps: [
      {
        layer: 'STRUCTURE',
        prompt: 'Flat price is hedged, but you bought Nov and sold Dec — a month mismatch. What neutralises it?',
        options: [
          { label: 'Trade the Nov/Dec calendar spread', correct: true, explain: 'You are long Nov / short Dec. The offsetting calendar spread flattens the structure (calendar) risk — independent of the flat price.' },
          { label: 'Sell more ICE futures', explain: 'Flat price is already flat — adding futures does nothing to the month-to-month spread.' },
          { label: 'Sell a DFL', explain: 'A DFL hedges the Dated–ICE basis, not a month-to-month structure mismatch.' },
        ],
      },
      {
        layer: 'CRACK',
        prompt: 'Structure is flat. This is a gasoil cargo priced against crude — one layer remains. Which?',
        options: [
          { label: 'Sell the gasoil crack', correct: true, explain: 'The product-vs-crude margin (gasoil crack) is open from purchase to sale. Selling the crack locks the refining margin — the book is now flat on every layer.' },
          { label: 'Buy a calendar spread', explain: 'Structure is already flat — a calendar trade re-opens month risk.' },
          { label: 'Sell a DFL', explain: 'The DFL covers Dated–ICE basis, not the product–crude crack.' },
        ],
      },
    ],
  },
]

const TOTAL_STEPS = SCENARIOS.reduce((n, s) => n + s.steps.length, 0)
const gradeFor = (p) => p >= 90 ? 'Desk standard' : p >= 70 ? 'Sharp risk eye' : p >= 50 ? 'Getting there' : 'Keep studying'

export default function ExposureTracker() {
  const [scenIdx, setScenIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [resolved, setResolved] = useState([])      // layer keys resolved in current scenario
  const [picked, setPicked] = useState(null)        // index of correct pick once solved
  const [wrong, setWrong] = useState([])            // wrong option indices for current step
  const [firstTryCount, setFirstTryCount] = useState(0)
  const [done, setDone] = useState(false)

  const scen = SCENARIOS[scenIdx]
  const step = scen.steps[stepIdx]
  const solved = picked !== null

  function statusOf(key) {
    if (!scen.inPlay.includes(key)) return 'na'
    if (resolved.includes(key)) return 'flat'
    return 'open'
  }

  function pick(i) {
    if (solved) return
    const opt = step.options[i]
    if (opt.correct) {
      setPicked(i)
      setResolved((r) => [...r, step.layer])
      if (wrong.length === 0) setFirstTryCount((c) => c + 1)
    } else {
      if (!wrong.includes(i)) setWrong((w) => [...w, i])
    }
  }

  function next() {
    if (stepIdx + 1 < scen.steps.length) {
      setStepIdx((s) => s + 1)
    } else if (scenIdx + 1 < SCENARIOS.length) {
      setScenIdx((s) => s + 1); setStepIdx(0); setResolved([])
    } else {
      setDone(true); return
    }
    setPicked(null); setWrong([])
  }

  function restart() {
    setScenIdx(0); setStepIdx(0); setResolved([]); setPicked(null); setWrong([]); setFirstTryCount(0); setDone(false)
  }

  const pct = Math.round((firstTryCount / TOTAL_STEPS) * 100)
  const allFlat = scen.inPlay.every((k) => resolved.includes(k) || (step.layer === k && solved))

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 16 · Simulator</p>
          <h1>Exposure Tracker</h1>
          <p className={styles.lede}>
            You cannot hedge what you cannot measure. A cargo lands carrying a web of price risk —
            flat price, basis, structure and crack. Identify each open layer and place the hedge that closes it.
          </p>
        </header>

        {/* ── Exposure ledger ── */}
        <section className={styles.ledger}>
          {LAYERS.map((L) => {
            const st = statusOf(L.key)
            return (
              <div key={L.key} className={`${styles.layer} ${styles['layer_' + st]}`}>
                <div className={styles.layerIcon}>
                  {st === 'flat' ? <CheckCircle2 size={16} /> : st === 'open' ? <Circle size={16} /> : <Circle size={16} />}
                </div>
                <div className={styles.layerText}>
                  <strong>{L.name}</strong>
                  <em>{L.sub}</em>
                </div>
                <span className={styles.layerStatus}>
                  {st === 'flat' ? 'Flat' : st === 'open' ? 'Open' : '—'}
                </span>
              </div>
            )
          })}
        </section>

        {!done ? (
          <section className={styles.stage}>
            <div className={styles.dealCard}>
              <span className={styles.dealTag}>{scen.tag}</span>
              <p className={styles.deal}>{scen.deal}</p>
            </div>

            <p className={styles.stepLabel}>Hedge {scenIdx * 2 + stepIdx + 1} of {TOTAL_STEPS}</p>
            <h2 className={styles.prompt}>{step.prompt}</h2>

            <div className={styles.options}>
              {step.options.map((opt, i) => {
                let cls = styles.option
                if (solved && i === picked) cls = `${styles.option} ${styles.optionCorrect}`
                else if (wrong.includes(i)) cls = `${styles.option} ${styles.optionWrong}`
                return (
                  <button key={i} className={cls} onClick={() => pick(i)} disabled={solved || wrong.includes(i)}>
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {(solved || wrong.length > 0) && (
              <div className={styles.reveal}>
                <p className={styles.why}>
                  {solved ? step.options[picked].explain : step.options[wrong[wrong.length - 1]].explain}
                </p>
                {solved && (
                  <>
                    {allFlat && stepIdx + 1 >= scen.steps.length && (
                      <span className={styles.flatBanner}>
                        <CheckCircle2 size={15} /> Cargo fully hedged — flat on every layer in play
                      </span>
                    )}
                    <button className={styles.nextBtn} onClick={next}>
                      {scenIdx + 1 >= SCENARIOS.length && stepIdx + 1 >= scen.steps.length ? 'See results' : 'Next hedge'} →
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(pct)}</span>
            <span className={styles.finalScore}>{firstTryCount} / {TOTAL_STEPS}</span>
            <span className={styles.finalSub}>{pct}% of layers hedged first time · both cargoes flattened</span>
            <button className={styles.nextBtn} onClick={restart}><RotateCcw size={15} /> Run again</button>
          </section>
        )}
      </div>
    </div>
  )
}
