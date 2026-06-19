import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Ship, Anchor } from 'lucide-react'
import styles from './ArbitrageRun.module.css'

// Chapter 12 — Geographical Spread Trading
// The whole trade lives in one inequality: profit exists only while spread > freight.
const VOL = 50_000 // barrels per cargo

const TRADES = [
  { product: 'Diesel',   from: 'US Gulf Coast', to: 'NW Europe · ARA', buy: 88, sell: 95,   freight: 4.0, note: 'A wide transatlantic gap easily clears the freight — the arb is open.' },
  { product: 'Gasoline', from: 'NW Europe · ARA', to: 'Singapore',      buy: 92, sell: 95,   freight: 5.0, note: 'A $3 spread cannot cover $5 of freight east — shipping would lose money.' },
  { product: 'Jet fuel', from: 'Middle East',    to: 'Singapore',       buy: 90, sell: 96,   freight: 3.0, note: 'Short haul, wide spread: $6 over $3 freight leaves a clean $3/bbl.' },
  { product: 'Gasoline', from: 'US Gulf Coast',  to: 'Latin America',   buy: 91, sell: 94,   freight: 2.0, note: 'A modest spread, but cheap nearby freight keeps the arb just open.' },
  { product: 'WTI crude',from: 'US (WTI)',       to: 'Europe (Brent)',  buy: 86, sell: 89,   freight: 4.0, note: 'The Brent–WTI gap is too thin to cover the voyage — the transatlantic arb is shut.' },
  { product: 'Diesel',   from: 'Singapore',      to: 'NW Europe · ARA', buy: 89, sell: 97,   freight: 6.0, note: 'A long East–West haul, but an $8 spread still beats $6 freight.' },
  { product: 'Gasoline', from: 'NW Europe · ARA',to: 'Singapore',       buy: 90, sell: 97,   freight: 8.0, note: 'Freight just spiked to $8 on scarce vessels — it slams a $7 spread shut.' },
  { product: 'Fuel oil', from: 'US Gulf Coast',  to: 'Singapore',       buy: 85, sell: 94,   freight: 7.0, note: 'The longest haul on the board, but a $9 spread clears even $7 freight.' },
]

const gradeFor = (p) => p >= 90 ? 'Arb desk lead' : p >= 75 ? 'Sharp router' : p >= 55 ? 'Getting there' : 'Keep studying'

const fmt = (v) => {
  const sign = v < 0 ? '−' : '+'
  const abs = Math.abs(v)
  return abs >= 1000 ? `${sign}$${(abs / 1000).toFixed(0)}k` : `${sign}$${abs.toFixed(0)}`
}

function WindowBar({ spread, freight }) {
  const max = Math.max(spread, freight) * 1.25
  const H = 90
  const spreadH = (spread / max) * H
  const freightY = H - (freight / max) * H
  const open = spread > freight
  return (
    <svg viewBox="0 0 260 120" className={styles.windowSvg}>
      <line x1="20" y1={H} x2="240" y2={H} className={styles.baseLine} />
      {/* spread bar */}
      <rect x="60" y={H - spreadH} width="80" height={spreadH}
        rx="4" fill={open ? 'var(--color-green)' : '#E05555'} />
      <text x="100" y={H - spreadH - 6} textAnchor="middle" className={styles.barLabel}>spread ${spread}</text>
      {/* freight line */}
      <line x1="20" y1={freightY} x2="240" y2={freightY} className={styles.freightLine} />
      <text x="240" y={freightY - 5} textAnchor="end" className={styles.freightLabel}>freight ${freight}</text>
    </svg>
  )
}

export default function ArbitrageRun() {
  const order = useMemo(() => [...TRADES].sort(() => Math.random() - 0.5), [])
  const [idx, setIdx] = useState(0)
  const [decision, setDecision] = useState(null) // 'ship' | 'hold'
  const [pnl, setPnl] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const t = order[idx]
  const spread = t.sell - t.buy
  const net = spread - t.freight          // per-barrel margin after freight
  const arbOpen = net > 0
  const shouldShip = arbOpen
  const decided = decision !== null
  const wasCorrect = decided && ((decision === 'ship') === shouldShip)

  function decide(d) {
    if (decided) return
    setDecision(d)
    const right = (d === 'ship') === shouldShip
    if (right) setCorrectCount((c) => c + 1)
    if (d === 'ship') setPnl((p) => p + net * VOL) // realise the trade — gain or loss
  }

  function next() {
    if (idx + 1 >= order.length) { setDone(true); return }
    setIdx((i) => i + 1)
    setDecision(null)
  }

  function playAgain() {
    setIdx(0); setDecision(null); setPnl(0); setCorrectCount(0); setDone(false)
  }

  const seen = idx + (decided ? 1 : 0)
  const acc = seen ? Math.round((correctCount / seen) * 100) : 0

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 12 · Simulator</p>
          <h1>Arbitrage Run</h1>
          <p className={styles.lede}>
            The same barrel is worth different amounts in different places. Buy cheap, ship, sell dear —
            but only when the spread beats the freight. Read each lane and call it.
          </p>
        </header>

        <section className={styles.scoreboard}>
          <div className={styles.scoreItem}><span>Captured P&amp;L</span>
            <strong style={{ color: pnl < 0 ? '#E05555' : pnl > 0 ? 'var(--color-green)' : 'var(--color-text)' }}>{fmt(pnl)}</strong>
            <em>on {VOL.toLocaleString()} bbl cargoes</em>
          </div>
          <div className={styles.scoreItem}><span>Accuracy</span><strong>{acc}%</strong><em>{correctCount}/{seen}</em></div>
          <div className={styles.scoreItem}><span>Progress</span><strong>{done ? order.length : idx + 1}/{order.length}</strong><em>lanes</em></div>
        </section>

        {!done ? (
          <section className={styles.stage}>
            <div className={styles.lane}>
              <div className={styles.hub}>
                <span className={styles.hubTag}>BUY</span>
                <strong className={styles.hubName}>{t.from}</strong>
                <span className={styles.hubPrice}>${t.buy.toFixed(2)}</span>
              </div>
              <div className={styles.leg}>
                <Ship size={18} />
                <span className={styles.freightTag}>freight ${t.freight.toFixed(2)}</span>
                <span className={styles.product}>{t.product}</span>
              </div>
              <div className={styles.hub}>
                <span className={`${styles.hubTag} ${styles.hubTagSell}`}>SELL</span>
                <strong className={styles.hubName}>{t.to}</strong>
                <span className={styles.hubPrice}>${t.sell.toFixed(2)}</span>
              </div>
            </div>

            {!decided ? (
              <div className={styles.actions}>
                <button className={`${styles.actBtn} ${styles.actShip}`} onClick={() => decide('ship')}>
                  <Ship size={16} /> Ship the cargo
                </button>
                <button className={`${styles.actBtn} ${styles.actHold}`} onClick={() => decide('hold')}>
                  <Anchor size={16} /> Stay put
                </button>
              </div>
            ) : (
              <div className={styles.reveal}>
                <div className={styles.windowCard}>
                  <WindowBar spread={spread} freight={t.freight} />
                  <div className={styles.math}>
                    <span>spread <strong>${spread.toFixed(2)}</strong></span>
                    <span>− freight <strong>${t.freight.toFixed(2)}</strong></span>
                    <span className={styles.mathNet}>= net <strong style={{ color: arbOpen ? 'var(--color-green)' : '#E05555' }}>{net >= 0 ? '+' : '−'}${Math.abs(net).toFixed(2)}/bbl</strong></span>
                  </div>
                </div>

                <span className={styles.verdict} style={{ color: wasCorrect ? 'var(--color-green)' : '#E05555' }}>
                  {wasCorrect ? 'Good call' : 'Mis-routed'} — the arb is {arbOpen ? 'OPEN' : 'SHUT'}
                  {decision === 'ship' && `, this cargo settles ${fmt(net * VOL)}`}
                </span>
                <p className={styles.why}>{t.note}</p>
                <button className={styles.nextBtn} onClick={next}>
                  {idx + 1 >= order.length ? 'See results' : 'Next lane'} →
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(acc)}</span>
            <span className={styles.finalScore}>{fmt(pnl)}</span>
            <span className={styles.finalSub}>{acc}% of lanes called right · {correctCount}/{order.length} correct</span>
            <button className={styles.nextBtn} onClick={playAgain}><RotateCcw size={15} /> Run again</button>
          </section>
        )}
      </div>
    </div>
  )
}
