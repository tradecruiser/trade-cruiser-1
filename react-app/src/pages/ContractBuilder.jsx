import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import styles from './ContractBuilder.module.css'

// Chapter 10 — Flat Price Trading & Financial Contracts
const CONTRACT = 1000 // bbl per lot

const INSTRUMENTS = {
  forward: {
    label: 'Forward', tag: 'The original contract',
    facts: [
      ['Venue', 'Private & bilateral (OTC)'],
      ['Counterparty', 'Exposed to the other side'],
      ['Settlement', 'At maturity — no daily margin'],
      ['Edge', 'Precise fit & flexibility'],
    ],
  },
  future: {
    label: 'Future', tag: 'The standardized contract',
    facts: [
      ['Venue', 'Public & exchange-traded (ICE/CME)'],
      ['Counterparty', 'Clearing-house guarantee + margin'],
      ['Settlement', 'Marked to market daily'],
      ['Edge', 'Ease, speed, safety & liquidity'],
    ],
  },
  swap: {
    label: 'Swap', tag: 'Exchanging price streams',
    facts: [
      ['Venue', 'OTC — many now centrally cleared'],
      ['Counterparty', 'Bilateral / cleared'],
      ['Settlement', 'Cash — fixed vs floating difference'],
      ['Best for', 'Hedging a cost over a period'],
    ],
  },
}

const fmt0 = (n) => Math.round(n).toLocaleString('en-US')
const money = (n) => (n < 0 ? '−$' : '$') + fmt0(Math.abs(n))
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/* ── Payoff / effective-cost chart ──────────────── */
function Chart({ instr, price, market, dir, vol, pMin, pMax }) {
  const W = 360, H = 200, pad = 26
  const xOf = (p) => pad + ((p - pMin) / (pMax - pMin)) * (W - 2 * pad)

  if (instr === 'swap') {
    const yOf = (v) => H - pad - ((v - pMin) / (pMax - pMin)) * (H - 2 * pad)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} preserveAspectRatio="xMidYMid meet">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--color-border)" />
        {/* unhedged: cost = market price (diagonal) */}
        <line x1={xOf(pMin)} y1={yOf(pMin)} x2={xOf(pMax)} y2={yOf(pMax)} stroke="var(--color-dark)" strokeWidth="2.5" strokeDasharray="5 4" opacity="0.55" />
        {/* hedged: flat at fixed price */}
        <line x1={xOf(pMin)} y1={yOf(price)} x2={xOf(pMax)} y2={yOf(price)} stroke="var(--color-accent)" strokeWidth="3" />
        <circle cx={xOf(market)} cy={yOf(price)} r="5" fill="var(--color-accent)" />
        <circle cx={xOf(market)} cy={yOf(market)} r="4" fill="var(--color-dark)" opacity="0.6" />
        <text x={W - pad} y={yOf(price) - 8} textAnchor="end" className={styles.chartTag} fill="var(--color-accent)">hedged ${fmt0(price)}</text>
        <text x={pad} y={yOf(pMax) + 4} className={styles.chartTag} fill="var(--color-dark)">unhedged</text>
      </svg>
    )
  }

  const yMax = (pMax - price) >= (price - pMin) ? (pMax - price) * vol : (price - pMin) * vol || vol
  const span = Math.max(Math.abs((pMax - price) * vol), Math.abs((pMin - price) * vol), 1)
  const yOf = (v) => H / 2 - (v / span) * (H / 2 - pad)
  const payoff = (s) => (s - price) * dir * vol
  const color = dir > 0 ? 'var(--color-green)' : 'var(--color-orange)'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} preserveAspectRatio="xMidYMid meet">
      <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="var(--color-border)" />
      <line x1={xOf(price)} y1={pad} x2={xOf(price)} y2={H - pad} stroke="var(--color-border)" strokeDasharray="4 4" />
      <line x1={xOf(pMin)} y1={yOf(payoff(pMin))} x2={xOf(pMax)} y2={yOf(payoff(pMax))} stroke={color} strokeWidth="3" />
      <circle cx={xOf(market)} cy={yOf(payoff(market))} r="5" fill={color} />
      <text x={xOf(price)} y={H - pad + 14} textAnchor="middle" className={styles.chartTag} fill="var(--color-text-muted)">${fmt0(price)}</text>
      <text x={W - pad} y={16} textAnchor="end" className={styles.chartTag} fill="var(--color-text-muted)">profit ↑</text>
    </svg>
  )
}

export default function ContractBuilder() {
  const [instr, setInstr] = useState('future')
  const [side, setSide] = useState('long')
  const [price, setPrice] = useState(90)
  const [lots, setLots] = useState(10)
  const [market, setMarket] = useState(90)

  const meta = INSTRUMENTS[instr]
  const vol = Math.max(1, Math.round(lots || 1)) * CONTRACT
  const dir = side === 'long' ? 1 : -1
  const pMin = price - 30, pMax = price + 30
  const mkt = clamp(market, pMin, pMax)

  const payoff = (mkt - price) * dir * vol             // forward / future
  const swapSettle = (mkt - price) * vol               // swap: floating − fixed
  const isSwap = instr === 'swap'

  function changePrice(v) { setPrice(v); setMarket(v) }

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 10 · Simulator</p>
          <h1>Contract Builder</h1>
          <p className={styles.lede}>
            Three instruments turn a price view into a tradable position. Build a forward, a future
            or a swap, move the market, and see exactly how each one pays out.
          </p>
        </header>

        {/* Instrument selector */}
        <div className={styles.tabs}>
          {Object.entries(INSTRUMENTS).map(([key, m]) => (
            <button key={key} className={`${styles.tab} ${instr === key ? styles.tabActive : ''}`} onClick={() => setInstr(key)}>
              <strong>{m.label}</strong><span>{m.tag}</span>
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {/* Build */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Build the contract</h2>

            {!isSwap ? (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Direction</span>
                <div className={styles.sideToggle}>
                  <button className={`${styles.sideBtn} ${side === 'long' ? styles.sideActive : ''}`} onClick={() => setSide('long')}>
                    Long<span>profit if price rises</span>
                  </button>
                  <button className={`${styles.sideBtn} ${side === 'short' ? styles.sideActive : ''}`} onClick={() => setSide('short')}>
                    Short<span>profit if price falls</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.swapNote}>
                You <strong>pay fixed</strong> and <strong>receive floating</strong> — e.g. a refiner
                fixing crude cost. Each period you settle the difference; no barrels move.
              </p>
            )}

            <div className={styles.field}>
              <div className={styles.controlHead}>
                <span className={styles.fieldLabel}>{isSwap ? 'Fixed price' : 'Contract price'}</span>
                <span className={styles.controlValue}>${price.toFixed(2)}<span className={styles.unit}>/bbl</span></span>
              </div>
              <input type="range" min={50} max={130} step={1} value={price} onChange={(e) => changePrice(parseFloat(e.target.value))} className={styles.slider} style={{ accentColor: 'var(--color-accent)' }} />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Volume <em>({fmt0(vol)} bbl)</em></span>
              <input type="number" min={1} max={500} value={lots} onChange={(e) => setLots(e.target.value === '' ? '' : parseInt(e.target.value || '1', 10))} className={styles.input} />
              <span className={styles.hint}>{lots || 1} lot{(lots || 1) > 1 ? 's' : ''} × {fmt0(CONTRACT)} bbl</span>
            </div>

            <div className={styles.field}>
              <div className={styles.controlHead}>
                <span className={styles.fieldLabel}>{isSwap ? 'Market average (floating)' : 'Settlement price'}</span>
                <span className={styles.controlValue}>${mkt.toFixed(2)}<span className={styles.unit}>/bbl</span></span>
              </div>
              <input type="range" min={pMin} max={pMax} step={0.5} value={mkt} onChange={(e) => setMarket(parseFloat(e.target.value))} className={styles.slider}
                style={{ accentColor: isSwap ? 'var(--color-accent)' : (dir > 0 ? 'var(--color-green)' : 'var(--color-orange)') }} />
            </div>
          </section>

          {/* Outcome */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{isSwap ? 'Effective cost vs market' : 'Payoff at settlement'}</h2>
            <Chart instr={instr} price={price} market={mkt} dir={dir} vol={vol} pMin={pMin} pMax={pMax} />

            {!isSwap ? (
              <div className={styles.result}>
                <div>
                  <span className={styles.resultBig} style={{ color: payoff >= 0 ? '#2E8B45' : '#C0392B' }}>{money(payoff)}</span>
                  <span className={styles.resultCap}>{side} · settle ${fmt0(mkt)} vs ${fmt0(price)}</span>
                </div>
                <p className={styles.explain}>
                  {payoff >= 0
                    ? `The market moved in your favour: ${money(Math.abs(payoff))} on ${fmt0(vol)} bbl.`
                    : `The market moved against you: ${money(Math.abs(payoff))} on ${fmt0(vol)} bbl.`}
                  {instr === 'future' && ' As a future, this settles a little each day through margin.'}
                </p>
              </div>
            ) : (
              <div className={styles.result}>
                <div>
                  <span className={styles.resultBig} style={{ color: 'var(--color-accent)' }}>${price.toFixed(2)}<span className={styles.unit}>/bbl</span></span>
                  <span className={styles.resultCap}>effective price — locked, whatever the market</span>
                </div>
                <p className={styles.explain}>
                  Market averaged ${fmt0(mkt)}. The swap settles{' '}
                  <strong style={{ color: swapSettle >= 0 ? '#2E8B45' : '#C0392B' }}>
                    {swapSettle >= 0 ? 'Bank → You' : 'You → Bank'} {money(Math.abs(swapSettle))}
                  </strong>
                  , offsetting your physical cost so the effective price stays near ${fmt0(price)}.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Instrument facts */}
        <section className={styles.facts}>
          <span className={styles.miniLabel}>{meta.label} — at a glance</span>
          <div className={styles.factGrid}>
            {meta.facts.map(([k, v]) => (
              <div key={k} className={styles.factItem}><span>{k}</span><strong>{v}</strong></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
