import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, ShieldOff } from 'lucide-react'
import styles from './HedgeExpose.module.css'

// Chapter 1 — Introduction to Oil Trading · the hedge that locks the margin
const BUY    = 90        // cargo bought at $90 / bbl
const VOL    = 100_000   // barrels in the cargo
const MARGIN = 1.5       // commercial margin earned for sourcing & moving the cargo, $/bbl

const PRICE_MIN = 70
const PRICE_MAX = 110

const SCENARIOS = [
  { label: 'Price crash', price: 76 },
  { label: 'Flat market', price: 90 },
  { label: 'Price spike', price: 104 },
]

function fmtMoney(v) {
  const sign = v < 0 ? '−' : v > 0 ? '+' : ''
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(0)}k`
  return `${sign}$${abs.toFixed(0)}`
}

// ── Payoff chart ──────────────────────────────────────────
const CW = 600, CH = 260, PAD_L = 16, PAD_R = 16, PAD_T = 18, PAD_B = 28
const PNL_MAX = (PRICE_MAX - BUY) * VOL + MARGIN * VOL   // top of y-axis
const PNL_MIN = (PRICE_MIN - BUY) * VOL + MARGIN * VOL   // bottom

const xFor = (p)   => PAD_L + ((p - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * (CW - PAD_L - PAD_R)
const yFor = (pnl) => PAD_T + (1 - (pnl - PNL_MIN) / (PNL_MAX - PNL_MIN)) * (CH - PAD_T - PAD_B)

const unhedgedPnl = (p) => MARGIN * VOL + (p - BUY) * VOL
const hedgedPnl   = ()  => MARGIN * VOL

function PayoffChart({ price, hedged }) {
  const yZero = yFor(0)
  const xBuy  = xFor(BUY)

  const unhedgedLine = `M ${xFor(PRICE_MIN)} ${yFor(unhedgedPnl(PRICE_MIN))} L ${xFor(PRICE_MAX)} ${yFor(unhedgedPnl(PRICE_MAX))}`
  const hedgedLine   = `M ${xFor(PRICE_MIN)} ${yFor(hedgedPnl())} L ${xFor(PRICE_MAX)} ${yFor(hedgedPnl())}`

  const curPnl = hedged ? hedgedPnl() : unhedgedPnl(price)

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className={styles.chart} preserveAspectRatio="xMidYMid meet">
      {/* zero P&L baseline */}
      <line x1={PAD_L} y1={yZero} x2={CW - PAD_R} y2={yZero} className={styles.axisZero} />
      <text x={PAD_L + 2} y={yZero - 5} className={styles.axisNote}>P&amp;L = 0</text>

      {/* buy-price guide */}
      <line x1={xBuy} y1={PAD_T} x2={xBuy} y2={CH - PAD_B} className={styles.guide} />
      <text x={xBuy} y={CH - PAD_B + 18} textAnchor="middle" className={styles.axisNote}>buy ${BUY}</text>

      {/* x-axis ends */}
      <text x={xFor(PRICE_MIN)} y={CH - PAD_B + 18} textAnchor="start" className={styles.axisNote}>${PRICE_MIN}</text>
      <text x={xFor(PRICE_MAX)} y={CH - PAD_B + 18} textAnchor="end" className={styles.axisNote}>${PRICE_MAX}</text>

      {/* unhedged (exposed) line */}
      <path d={unhedgedLine} className={`${styles.lineUnhedged} ${hedged ? styles.lineFaded : ''}`} />
      {/* hedged (flat) line */}
      <path d={hedgedLine} className={`${styles.lineHedged} ${hedged ? '' : styles.lineFaded}`} />

      {/* current position marker */}
      <line x1={xFor(price)} y1={PAD_T} x2={xFor(price)} y2={CH - PAD_B} className={styles.marker} />
      <circle cx={xFor(price)} cy={yFor(curPnl)} r="6"
        fill={hedged ? 'var(--color-green)' : (curPnl < 0 ? '#E05555' : 'var(--color-orange)')} />
    </svg>
  )
}

export default function HedgeExpose() {
  const [hedged, setHedged] = useState(false)
  const [price, setPrice]   = useState(BUY)

  const physical  = (price - BUY) * VOL + MARGIN * VOL   // cargo sold at market, plus the margin earned
  const financial = hedged ? (BUY - price) * VOL : 0     // short futures gains when price falls
  const net       = physical + financial

  const exposed = !hedged
  const priceMove = price - BUY

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 1 · Simulator</p>
          <h1>Hedge or Expose</h1>
          <p className={styles.lede}>
            You buy a {VOL.toLocaleString()}-barrel cargo at ${BUY} and earn a ${MARGIN.toFixed(2)}/bbl
            commercial margin for moving it. Weeks pass at sea while the price runs free. Flip the hedge
            on and off, move the market, and watch what survives.
          </p>
        </header>

        {/* ── Controls ── */}
        <section className={styles.controls}>
          <div className={styles.hedgeToggle}>
            <button
              className={`${styles.toggleBtn} ${!hedged ? styles.toggleActiveOff : ''}`}
              onClick={() => setHedged(false)}>
              <ShieldOff size={15} /> Unhedged
            </button>
            <button
              className={`${styles.toggleBtn} ${hedged ? styles.toggleActiveOn : ''}`}
              onClick={() => setHedged(true)}>
              <Shield size={15} /> Hedged
            </button>
          </div>

          <div className={styles.sliderRow}>
            <div className={styles.sliderHead}>
              <span>Market price at delivery</span>
              <strong>${price}/bbl</strong>
            </div>
            <input
              type="range" min={PRICE_MIN} max={PRICE_MAX} step={1} value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.scenarios}>
              {SCENARIOS.map(s => (
                <button key={s.label} className={styles.scenarioBtn} onClick={() => setPrice(s.price)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── P&L cards ── */}
        <section className={styles.legs}>
          <div className={styles.leg}>
            <span className={styles.legLabel}>Physical leg</span>
            <strong className={styles.legValue} style={{ color: physical < 0 ? '#E05555' : 'var(--color-text)' }}>
              {fmtMoney(physical)}
            </strong>
            <em className={styles.legNote}>cargo sold at ${price} + margin</em>
          </div>
          <div className={styles.legPlus}>+</div>
          <div className={styles.leg}>
            <span className={styles.legLabel}>Financial leg</span>
            <strong className={styles.legValue} style={{ color: financial < 0 ? '#E05555' : financial > 0 ? 'var(--color-green)' : 'var(--color-text-muted)' }}>
              {hedged ? fmtMoney(financial) : '—'}
            </strong>
            <em className={styles.legNote}>{hedged ? `short futures at $${BUY}` : 'no hedge in place'}</em>
          </div>
          <div className={styles.legEquals}>=</div>
          <div className={`${styles.leg} ${styles.legNet} ${exposed ? styles.legNetExposed : styles.legNetProtected}`}>
            <span className={styles.legLabel}>Net result</span>
            <strong className={styles.legValue}>{fmtMoney(net)}</strong>
            <em className={styles.legNote}>{exposed ? 'exposed to price' : 'margin locked'}</em>
          </div>
        </section>

        {/* ── Chart ── */}
        <section className={styles.chartCard}>
          <div className={styles.chartHead}>
            <span className={styles.chartTitle}>Net P&amp;L vs market price</span>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}><i className={styles.swatchOrange} /> Unhedged</span>
              <span className={styles.legendItem}><i className={styles.swatchGreen} /> Hedged</span>
            </div>
          </div>
          <PayoffChart price={price} hedged={hedged} />
        </section>

        {/* ── Verdict ── */}
        <section className={`${styles.verdict} ${exposed ? styles.verdictExposed : styles.verdictProtected}`}>
          {exposed ? (
            <p>
              <strong>Exposed.</strong> A ${Math.abs(priceMove)} {priceMove < 0 ? 'drop' : priceMove > 0 ? 'rise' : 'move'} swings
              your result by {fmtMoney(priceMove * VOL)} — a thin ${MARGIN.toFixed(2)}/bbl margin is wiped out by the price you cannot control.
            </p>
          ) : (
            <p>
              <strong>Protected.</strong> The short futures gain exactly offsets the loss on the barrel.
              Whatever the market does, you keep the {fmtMoney(MARGIN * VOL)} margin you earned from moving the oil — not a price bet.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
