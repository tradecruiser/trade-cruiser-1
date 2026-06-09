import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Check, RotateCcw } from 'lucide-react'
import styles from './MarginCallSimulator.module.css'

// ICE Brent-style contract & illustrative clearing-house margins (Chapter 9)
const CONTRACT = 1000        // barrels per lot
const IM_PER_LOT = 6000      // initial margin posted to open
const MM_PER_LOT = 4500      // maintenance margin — the call line

const STEPS = [
  { n: 1, label: 'Initial margin',  desc: 'Post collateral up front to open the position.' },
  { n: 2, label: 'Mark-to-market',  desc: 'The position is revalued at each settlement price.' },
  { n: 3, label: 'Variation margin', desc: 'The losing side pays the winning side daily.' },
  { n: 4, label: 'Default contained', desc: 'Fall below the call line and you top up or close.' },
]

const fmt0 = (n) => Math.round(n).toLocaleString('en-US')
const money = (n) => (n < 0 ? '−$' : '$') + fmt0(Math.abs(n))
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export default function MarginCallSimulator() {
  const [phase, setPhase] = useState('setup') // setup | live | closed
  const [side, setSide] = useState('long')
  const [lots, setLots] = useState(5)
  const [entry, setEntry] = useState(80)
  const [price, setPrice] = useState(80)
  const [posted, setPosted] = useState(0)
  const [log, setLog] = useState([])
  const [result, setResult] = useState(null)

  const dir = side === 'long' ? 1 : -1
  const n = Math.max(1, Math.round(lots || 1))
  const imTotal = IM_PER_LOT * n
  const mmTotal = MM_PER_LOT * n
  const notional = entry * CONTRACT * n
  const pnl = (price - entry) * dir * CONTRACT * n
  const equity = posted + pnl

  const status =
    equity <= 0 ? 'blown'
    : equity < mmTotal ? 'call'
    : equity < imTotal ? 'warn'
    : 'ok'

  const pushLog = (text, tone = 'info') =>
    setLog((l) => [{ id: Date.now() + Math.random(), text, tone }, ...l])

  function openPosition() {
    setPosted(imTotal)
    setPrice(entry)
    setResult(null)
    setLog([])
    setPhase('live')
    pushLog(`Opened ${n} ${side === 'long' ? 'long' : 'short'} Brent lot${n > 1 ? 's' : ''} at $${fmt0(entry)} · posted ${money(imTotal)} initial margin`, 'good')
  }

  function shock(adverse) {
    setPrice((p) => clamp(+(p - dir * adverse).toFixed(2), entry - 30, entry + 30))
  }

  function meetCall() {
    const add = imTotal - equity
    setPosted((p) => p + add)
    pushLog(`Margin call met — posted ${money(add)} variation margin to restore initial margin`, 'warn')
  }

  function closeOut(forced) {
    setResult({
      forced,
      realized: pnl,
      totalPosted: posted,
      shortfall: equity < 0 ? -equity : 0,
      exit: price,
    })
    setPhase('closed')
    pushLog(
      forced
        ? `Liquidated by the clearer at $${fmt0(price)} · realised ${money(pnl)}`
        : `Closed at $${fmt0(price)} · realised ${money(pnl)}`,
      pnl >= 0 ? 'good' : 'danger'
    )
  }

  function reset() {
    setPhase('setup'); setPosted(0); setPrice(entry); setLog([]); setResult(null)
  }

  // gauge geometry
  const scaleMax = imTotal * 1.25
  const pct = (v) => clamp(v / scaleMax, 0, 1) * 100
  const fillPct = pct(Math.max(equity, 0))
  const mmPct = pct(mmTotal)
  const imPct = pct(imTotal)

  const statusMeta = {
    ok:    { label: 'Healthy',      color: '#2E8B45' },
    warn:  { label: 'Buffer eroding', color: '#D98324' },
    call:  { label: 'Margin call',  color: '#C0392B' },
    blown: { label: 'Liquidation',  color: '#C0392B' },
  }[status]

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}>
          <ArrowLeft size={15} /> Simulators
        </Link>

        <header className={styles.header}>
          <p className="label">Chapter 9 · Simulator</p>
          <h1>Margin Call Simulator</h1>
          <p className={styles.lede}>
            Open a leveraged Brent futures position, then watch the clearing house mark it to
            market. As the price moves against you, your margin erodes — cross the call line and
            you must post more or be liquidated.
          </p>
        </header>

        {/* How margin works — the 4 steps from the deck */}
        <section className={styles.steps}>
          {STEPS.map((s) => (
            <div key={s.n} className={styles.stepChip}>
              <span className={styles.stepNum}>{s.n}</span>
              <div>
                <span className={styles.stepLabel}>{s.label}</span>
                <span className={styles.stepDesc}>{s.desc}</span>
              </div>
            </div>
          ))}
        </section>

        {phase === 'setup' ? (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Set up the position</h2>
            <div className={styles.setupGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Side</span>
                <div className={styles.sideToggle}>
                  <button className={`${styles.sideBtn} ${side === 'long' ? styles.sideActive : ''}`} onClick={() => setSide('long')}>
                    Long<span>profit if price rises</span>
                  </button>
                  <button className={`${styles.sideBtn} ${side === 'short' ? styles.sideActive : ''}`} onClick={() => setSide('short')}>
                    Short<span>profit if price falls</span>
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Lots <em>(1 = {fmt0(CONTRACT)} bbl)</em></span>
                <input type="number" min={1} max={100} value={lots}
                  onChange={(e) => setLots(e.target.value === '' ? '' : parseInt(e.target.value || '1', 10))}
                  className={styles.input} />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Entry price <em>($/bbl)</em></span>
                <input type="number" min={20} max={200} step={0.5} value={entry}
                  onChange={(e) => { const v = parseFloat(e.target.value || '80'); setEntry(v); setPrice(v) }}
                  className={styles.input} />
              </div>
            </div>

            <div className={styles.reqRow}>
              <div className={styles.reqItem}><span>Notional</span><strong>{money(notional)}</strong></div>
              <div className={styles.reqItem}><span>Initial margin</span><strong>{money(imTotal)}</strong></div>
              <div className={styles.reqItem}><span>Maintenance (call line)</span><strong>{money(mmTotal)}</strong></div>
              <div className={styles.reqItem}><span>Leverage</span><strong>{(notional / imTotal).toFixed(1)}×</strong></div>
            </div>

            <button className={styles.primaryBtn} onClick={openPosition}>
              Open position · post {money(imTotal)}
            </button>
          </section>
        ) : (
          <>
            <div className={styles.liveGrid}>
              {/* Market */}
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>Settlement price</h2>
                <div className={styles.priceHead}>
                  <span className={styles.priceBig}>${price.toFixed(2)}<span className={styles.unit}>/bbl</span></span>
                  <span className={`${styles.pnlTag} ${pnl >= 0 ? styles.pos : styles.neg}`}>
                    {pnl >= 0 ? 'Profit ' : 'Loss '}{money(pnl)}
                  </span>
                </div>
                <input
                  type="range" min={entry - 20} max={entry + 20} step={0.5} value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  disabled={phase === 'closed'}
                  className={styles.slider}
                  style={{ accentColor: pnl >= 0 ? '#2E8B45' : '#C0392B' }}
                />
                <div className={styles.entryMark}>Entry ${fmt0(entry)} · {side} {n} lot{n > 1 ? 's' : ''}</div>

                {phase === 'live' && (
                  <div className={styles.shocks}>
                    <button onClick={() => shock(3)}>Adverse −$3</button>
                    <button onClick={() => shock(8)}>Adverse −$8</button>
                    <button onClick={() => shock(-4)}>Relief +$4</button>
                    <button onClick={() => setPrice(entry)}>Reset price</button>
                  </div>
                )}
              </section>

              {/* Margin account */}
              <section className={styles.panel}>
                <div className={styles.acctHead}>
                  <h2 className={styles.panelTitle}>Margin account</h2>
                  <span className={styles.statusBadge} style={{ backgroundColor: statusMeta.color }}>
                    {statusMeta.label}
                  </span>
                </div>

                <span className={styles.equity} style={{ color: status === 'ok' ? 'var(--color-text)' : statusMeta.color }}>
                  {money(Math.max(equity, 0))}
                </span>
                <span className={styles.equityCap}>account equity</span>

                <div className={styles.gauge}>
                  <div className={styles.gaugeFill} style={{ width: `${fillPct}%`, backgroundColor: statusMeta.color }} />
                  <div className={styles.gaugeMark} style={{ left: `${mmPct}%` }} data-label="call line" />
                  <div className={styles.gaugeMark} style={{ left: `${imPct}%` }} data-label="initial" />
                </div>

                <div className={styles.breakdown}>
                  <div><span>Collateral posted</span><strong>{money(posted)}</strong></div>
                  <div><span>Open P&amp;L</span><strong className={pnl >= 0 ? styles.posTxt : styles.negTxt}>{money(pnl)}</strong></div>
                  <div><span>Maintenance req.</span><strong>{money(mmTotal)}</strong></div>
                </div>
              </section>
            </div>

            {/* Call / terminal callouts */}
            {phase === 'live' && status === 'call' && (
              <section className={`${styles.callout} ${styles.calloutDanger}`}>
                <AlertTriangle size={20} />
                <div className={styles.calloutBody}>
                  <strong>Margin call.</strong> Equity {money(equity)} is below the {money(mmTotal)} maintenance line.
                  Post {money(imTotal - equity)} to restore initial margin, or close the position.
                </div>
                <div className={styles.calloutActions}>
                  <button className={styles.meetBtn} onClick={meetCall}><Check size={14} /> Meet call</button>
                  <button className={styles.liqBtn} onClick={() => closeOut(true)}>Liquidate</button>
                </div>
              </section>
            )}

            {phase === 'live' && status === 'blown' && (
              <section className={`${styles.callout} ${styles.calloutDanger}`}>
                <AlertTriangle size={20} />
                <div className={styles.calloutBody}>
                  <strong>Wiped out.</strong> Losses have exhausted your posted collateral. The clearing
                  house closes you out to contain the default.
                </div>
                <div className={styles.calloutActions}>
                  <button className={styles.liqBtn} onClick={() => closeOut(true)}>Acknowledge liquidation</button>
                </div>
              </section>
            )}

            {phase === 'live' && (status === 'ok' || status === 'warn') && (
              <div className={styles.liveActions}>
                <button className={styles.ghostBtn} onClick={() => closeOut(false)}>Close position</button>
                <button className={styles.ghostBtn} onClick={reset}><RotateCcw size={13} /> Reset</button>
              </div>
            )}

            {phase === 'closed' && result && (
              <section className={`${styles.callout} ${result.realized >= 0 ? styles.calloutGood : styles.calloutDanger}`}>
                <div className={styles.calloutBody}>
                  <strong>{result.forced ? 'Position liquidated' : 'Position closed'} at ${fmt0(result.exit)}.</strong>{' '}
                  Realised {result.realized >= 0 ? 'profit' : 'loss'} of {money(result.realized)} on {money(result.totalPosted)} posted.
                  {result.shortfall > 0 && <> Losses exceeded your margin by {money(result.shortfall)} — a debt the clearer pursues.</>}
                </div>
                <div className={styles.calloutActions}>
                  <button className={styles.meetBtn} onClick={reset}><RotateCcw size={14} /> New position</button>
                </div>
              </section>
            )}

            {/* Event log */}
            {log.length > 0 && (
              <section className={styles.logPanel}>
                <span className={styles.miniLabel}>Account activity</span>
                <ul className={styles.log}>
                  {log.map((e) => (
                    <li key={e.id} className={styles[`tone_${e.tone}`]}>{e.text}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
