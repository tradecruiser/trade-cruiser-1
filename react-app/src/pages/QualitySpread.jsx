import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import styles from './QualitySpread.module.css'

// Chapter 13 — Product Quality Spread Trading · the Hi-5 sulfur spread (VLSFO − HSFO)
// P&L is the change in the spread, not the flat price — flat moves cancel across the two legs.
const VLSFO_BASE = 550   // $/tonne — clean, low-sulfur marine fuel
const HSFO_BASE  = 400   // $/tonne — dirty, high-sulfur fuel oil
const SPREAD_BASE = VLSFO_BASE - HSFO_BASE // $150/t
const VOL = 5_000        // tonnes — a marine fuel barge

const SCENARIOS = [
  { label: 'IMO tightens rules', flat: 10,  spread: 60,  note: 'A stricter sulfur cap lifts clean VLSFO and leaves dirty HSFO behind — the premium widens.' },
  { label: 'Covid demand crash', flat: -40, spread: -105, note: 'Shipping demand collapses and the Hi-5 premium falls toward $45/t — the spread craters even as both grades drop.' },
  { label: 'Flat market rally',  flat: 40,  spread: 0,   note: 'Both grades rally together. The legs offset exactly — flat price cancels and your spread P&L is untouched.' },
  { label: 'Scrubber build-out', flat: -5,  spread: -35, note: 'More ships fit scrubbers and burn cheap HSFO, lifting its price and narrowing the quality premium.' },
]

function fmtMoney(v) {
  const sign = v < 0 ? '−' : v > 0 ? '+' : ''
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(0)}k`
  return `${sign}$${abs.toFixed(0)}`
}

export default function QualitySpread() {
  const [isLong, setIsLong] = useState(true)   // long the spread = long VLSFO, short HSFO
  const [dFlat, setDFlat] = useState(0)
  const [dSpread, setDSpread] = useState(0)

  const dir = isLong ? 1 : -1
  const vlsfo = VLSFO_BASE + dFlat + dSpread / 2
  const hsfo  = HSFO_BASE  + dFlat - dSpread / 2
  const newSpread = vlsfo - hsfo

  const legVlsfo = (vlsfo - VLSFO_BASE) * VOL * dir       // long VLSFO when long the spread
  const legHsfo  = (hsfo - HSFO_BASE) * VOL * (-dir)      // short HSFO when long the spread
  const net      = legVlsfo + legHsfo                     // = dir × dSpread × VOL

  const flatOnly = dSpread === 0 && dFlat !== 0

  function applyScenario(s) { setDFlat(s.flat); setDSpread(s.spread) }
  function reset() { setDFlat(0); setDSpread(0) }

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 13 · Simulator</p>
          <h1>Quality Spread</h1>
          <p className={styles.lede}>
            Trade the Hi-5 marine spread — clean VLSFO against dirty HSFO — on a {VOL.toLocaleString()}-tonne barge.
            Take a side, then move the market and the quality premium. Watch what actually drives your P&amp;L.
          </p>
        </header>

        {/* ── Position toggle ── */}
        <section className={styles.controls}>
          <div className={styles.posToggle}>
            <button className={`${styles.posBtn} ${isLong ? styles.posLong : ''}`} onClick={() => setIsLong(true)}>
              <TrendingUp size={15} /> Long the spread
              <em>long VLSFO · short HSFO</em>
            </button>
            <button className={`${styles.posBtn} ${!isLong ? styles.posShort : ''}`} onClick={() => setIsLong(false)}>
              <TrendingDown size={15} /> Short the spread
              <em>short VLSFO · long HSFO</em>
            </button>
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHead}>
              <span>Flat market move <em>(both grades)</em></span>
              <strong>{dFlat >= 0 ? '+' : '−'}${Math.abs(dFlat)}/t</strong>
            </div>
            <input type="range" min={-50} max={50} step={5} value={dFlat}
              onChange={(e) => setDFlat(Number(e.target.value))} className={styles.slider} />
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHead}>
              <span>Quality premium move <em>(the spread)</em></span>
              <strong>{dSpread >= 0 ? '+' : '−'}${Math.abs(dSpread)}/t</strong>
            </div>
            <input type="range" min={-120} max={120} step={5} value={dSpread}
              onChange={(e) => setDSpread(Number(e.target.value))} className={styles.slider} />
          </div>

          <div className={styles.scenarios}>
            {SCENARIOS.map((s) => (
              <button key={s.label} className={styles.scenarioBtn} onClick={() => applyScenario(s)}>{s.label}</button>
            ))}
            <button className={styles.resetBtn} onClick={reset}>Reset</button>
          </div>
        </section>

        {/* ── Spread readout ── */}
        <section className={styles.spreadCard}>
          <div className={styles.gradeCol}>
            <span className={styles.gradeName}>VLSFO</span>
            <strong className={styles.gradePrice}>${vlsfo.toFixed(0)}</strong>
            <em className={styles.gradeNote}>low-sulfur · clean</em>
          </div>
          <div className={styles.spreadMid}>
            <span className={styles.spreadLabel}>Hi-5 spread</span>
            <strong className={styles.spreadVal}>${newSpread.toFixed(0)}/t</strong>
            <em className={styles.spreadDelta} style={{ color: dSpread > 0 ? 'var(--color-green)' : dSpread < 0 ? '#E05555' : 'var(--color-text-muted)' }}>
              {dSpread === 0 ? 'unchanged' : `${dSpread > 0 ? '+' : '−'}$${Math.abs(dSpread)} vs $${SPREAD_BASE}`}
            </em>
          </div>
          <div className={styles.gradeCol}>
            <span className={styles.gradeName}>HSFO</span>
            <strong className={styles.gradePrice}>${hsfo.toFixed(0)}</strong>
            <em className={styles.gradeNote}>high-sulfur · dirty</em>
          </div>
        </section>

        {/* ── P&L legs ── */}
        <section className={styles.legs}>
          <div className={styles.leg}>
            <span className={styles.legLabel}>VLSFO leg</span>
            <strong className={styles.legValue} style={{ color: legVlsfo < 0 ? '#E05555' : legVlsfo > 0 ? 'var(--color-green)' : 'var(--color-text-muted)' }}>{fmtMoney(legVlsfo)}</strong>
            <em className={styles.legNote}>{isLong ? 'long' : 'short'} VLSFO</em>
          </div>
          <div className={styles.legPlus}>+</div>
          <div className={styles.leg}>
            <span className={styles.legLabel}>HSFO leg</span>
            <strong className={styles.legValue} style={{ color: legHsfo < 0 ? '#E05555' : legHsfo > 0 ? 'var(--color-green)' : 'var(--color-text-muted)' }}>{fmtMoney(legHsfo)}</strong>
            <em className={styles.legNote}>{isLong ? 'short' : 'long'} HSFO</em>
          </div>
          <div className={styles.legEquals}>=</div>
          <div className={`${styles.leg} ${styles.legNet}`} style={{ borderColor: net < 0 ? '#E05555' : net > 0 ? 'var(--color-green)' : 'var(--color-border)' }}>
            <span className={styles.legLabel}>Spread P&amp;L</span>
            <strong className={styles.legValue} style={{ color: net < 0 ? '#E05555' : net > 0 ? 'var(--color-green)' : 'var(--color-text)' }}>{fmtMoney(net)}</strong>
            <em className={styles.legNote}>on {VOL.toLocaleString()} t</em>
          </div>
        </section>

        {/* ── Verdict ── */}
        <section className={`${styles.verdict} ${flatOnly ? styles.verdictFlat : net >= 0 ? styles.verdictGain : styles.verdictLoss}`}>
          {flatOnly ? (
            <p><strong>Flat price cancels.</strong> Both grades moved ${Math.abs(dFlat)}/t together, but the long and short legs offset exactly — your spread P&amp;L is {fmtMoney(net)}. Only the quality premium matters.</p>
          ) : dSpread === 0 && dFlat === 0 ? (
            <p><strong>Set a move.</strong> Drag the quality-premium slider, or fire a scenario, to see how the spread drives your P&amp;L — independent of the flat market.</p>
          ) : (
            <p><strong>{net >= 0 ? 'In the money.' : 'Offside.'}</strong> The premium moved {dSpread >= 0 ? '+' : '−'}${Math.abs(dSpread)}/t and you are {isLong ? 'long' : 'short'} the spread, so the trade settles {fmtMoney(net)}. Your P&amp;L is the change in the spread — the flat market washed out across both legs.</p>
          )}
        </section>
      </div>
    </div>
  )
}
