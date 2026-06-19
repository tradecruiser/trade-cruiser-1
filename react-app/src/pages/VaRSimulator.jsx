import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react'
import styles from './VaRSimulator.module.css'

// Chapter 15 — Introduction to Risk Management · sizing a position against a VaR limit
const PRICE = 85          // $/bbl
const LIMIT = 5_000_000   // desk 1-day VaR limit, $
const Z = { 95: 1.645, 99: 2.326 }

function fmtMoney(v) {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`
  return `$${v.toFixed(0)}`
}

// ── Distribution chart ────────────────────────────────
const CW = 560, CH = 210, PAD_B = 28, AMP = 150, MIDY = CH - PAD_B
const gauss = (u) => Math.exp(-0.5 * u * u)

function DistChart({ sd, z }) {
  const xPix = (u) => 30 + ((u + 4) / 8) * (CW - 60)   // u in [-4, 4] sd units
  const yPix = (h) => MIDY - h * AMP
  const N = 96
  const us = Array.from({ length: N + 1 }, (_, i) => -4 + (8 * i) / N)

  const curve = us.map((u, i) => `${i === 0 ? 'M' : 'L'} ${xPix(u).toFixed(1)} ${yPix(gauss(u)).toFixed(1)}`).join(' ')

  // worst-tail area: u < -z
  const tailUs = us.filter((u) => u <= -z)
  const tail = tailUs.length
    ? `M ${xPix(tailUs[0])} ${MIDY} ` +
      tailUs.map((u) => `L ${xPix(u).toFixed(1)} ${yPix(gauss(u)).toFixed(1)}`).join(' ') +
      ` L ${xPix(-z).toFixed(1)} ${MIDY} Z`
    : ''

  const varX = xPix(-z)

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className={styles.chart} preserveAspectRatio="xMidYMid meet">
      <line x1="30" y1={MIDY} x2={CW - 30} y2={MIDY} className={styles.axis} />
      {tail && <path d={tail} className={styles.tail} />}
      <path d={curve} className={styles.curve} />
      <line x1={varX} y1={yPix(gauss(z)) - 6} x2={varX} y2={MIDY} className={styles.varLine} />
      <text x={varX} y={yPix(gauss(z)) - 12} textAnchor="middle" className={styles.varLabel}>VaR</text>
      <text x={xPix(-3.4)} y={MIDY + 18} textAnchor="middle" className={styles.tailNote}>worst {Math.round((1 - (z === Z[95] ? 0.95 : 0.99)) * 100)}%</text>
      <text x="30" y={MIDY + 18} textAnchor="start" className={styles.axisNote}>loss</text>
      <text x={CW - 30} y={MIDY + 18} textAnchor="end" className={styles.axisNote}>gain</text>
      <text x={(CW) / 2} y={MIDY + 18} textAnchor="middle" className={styles.axisNote}>daily P&amp;L distribution · 1 sd = {fmtMoney(sd)}</text>
    </svg>
  )
}

export default function VaRSimulator() {
  const [barrels, setBarrels] = useState(1_000_000)
  const [vol, setVol] = useState(2.5)       // daily volatility, %
  const [conf, setConf] = useState(95)

  const z = Z[conf]
  const exposure = barrels * PRICE
  const sd = exposure * (vol / 100)          // 1-day P&L standard deviation
  const varValue = sd * z                    // 1-day VaR at the chosen confidence
  const util = varValue / LIMIT
  const breached = varValue > LIMIT

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 15 · Simulator</p>
          <h1>VaR Simulator</h1>
          <p className={styles.lede}>
            Risk management means measuring before you act. Size a Brent position, set the market’s
            volatility, and watch the 1-day Value-at-Risk move against your desk limit of {fmtMoney(LIMIT)}.
          </p>
        </header>

        {/* ── Controls ── */}
        <section className={styles.controls}>
          <div className={styles.sliderRow}>
            <div className={styles.sliderHead}>
              <span>Position size</span>
              <strong>{(barrels / 1000).toLocaleString()}k bbl</strong>
            </div>
            <input type="range" min={100_000} max={2_000_000} step={50_000} value={barrels}
              onChange={(e) => setBarrels(Number(e.target.value))} className={styles.slider} />
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHead}>
              <span>Daily volatility</span>
              <strong>{vol.toFixed(1)}%</strong>
            </div>
            <input type="range" min={1} max={5} step={0.1} value={vol}
              onChange={(e) => setVol(Number(e.target.value))} className={styles.slider} />
          </div>

          <div className={styles.confRow}>
            <span className={styles.confLabel}>Confidence</span>
            <div className={styles.confToggle}>
              {[95, 99].map((c) => (
                <button key={c} className={`${styles.confBtn} ${conf === c ? styles.confActive : ''}`}
                  onClick={() => setConf(c)}>{c}%</button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Readouts ── */}
        <section className={styles.stats}>
          <div className={styles.stat}><span>Exposure</span><strong>{fmtMoney(exposure)}</strong><em>{(barrels / 1000).toLocaleString()}k bbl × ${PRICE}</em></div>
          <div className={styles.stat}><span>1-day VaR ({conf}%)</span><strong style={{ color: breached ? '#E05555' : 'var(--color-text)' }}>{fmtMoney(varValue)}</strong><em>= exposure × {vol}% × {z}</em></div>
          <div className={styles.stat}><span>Limit usage</span><strong style={{ color: breached ? '#E05555' : 'var(--color-green)' }}>{Math.round(util * 100)}%</strong><em>of {fmtMoney(LIMIT)}</em></div>
        </section>

        {/* ── Utilisation bar ── */}
        <section className={styles.utilCard}>
          <div className={styles.utilTrack}>
            <div className={styles.utilFill} style={{ width: `${Math.min(util, 1) * 100}%`, background: breached ? '#E05555' : util > 0.8 ? 'var(--color-orange)' : 'var(--color-green)' }} />
            <div className={styles.utilLimit} />
          </div>
          <div className={styles.utilLabels}><span>0</span><span className={styles.utilLimitLabel}>limit {fmtMoney(LIMIT)}</span></div>
        </section>

        {/* ── Distribution ── */}
        <section className={styles.chartCard}>
          <DistChart sd={sd} z={z} />
        </section>

        {/* ── Verdict ── */}
        <section className={`${styles.verdict} ${breached ? styles.verdictBreach : styles.verdictOk}`}>
          {breached ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
          <p>
            {breached ? (
              <><strong>Limit breached.</strong> A 1-day VaR of {fmtMoney(varValue)} exceeds the {fmtMoney(LIMIT)} desk limit — cut the position or hedge it down. Remember: VaR is the loss you would not expect to exceed {conf} days in 100. A tail event can still run past it.</>
            ) : (
              <><strong>Within limit.</strong> You are using {Math.round(util * 100)}% of the desk’s risk budget. On a normal day you would not expect to lose more than {fmtMoney(varValue)} — but VaR measures the ordinary, not the {conf === 95 ? 'worst 5%' : 'worst 1%'} tail beyond it.</>
            )}
          </p>
        </section>
      </div>
    </div>
  )
}
