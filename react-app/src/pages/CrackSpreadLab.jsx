import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import styles from './CrackSpreadLab.module.css'

const GAL_PER_BBL = 42
const BBL_PER_LOT = 1000

// Benchmark ratios — crude in, gasoline + distillate out (from Chapter 11)
const RATIOS = {
  '3-2-1': { c: 3, g: 2, d: 1 },
  '5-3-2': { c: 5, g: 3, d: 2 },
  '1-1':   { c: 1, g: 1, d: 0 }, // single gasoline crack
}

// Preset market states — absolute prices (crude $/bbl, gas & distillate $/gal)
const SCENARIOS = [
  { id: 'normal', label: 'Normal',          crude: 90,  gas: 2.50, dist: 3.00 },
  { id: 'outage', label: 'Refinery outage', crude: 90,  gas: 2.95, dist: 3.60 },
  { id: 'spike',  label: 'Crude spike',     crude: 104, gas: 2.62, dist: 3.14 },
  { id: 'demand', label: 'Demand collapse', crude: 86,  gas: 2.10, dist: 2.55 },
  { id: 'diesel', label: '2022 diesel squeeze', crude: 98,  gas: 2.95, dist: 5.50 },
  { id: 'hormuz', label: '2026 Hormuz squeeze', crude: 118, gas: 4.20, dist: 5.00 },
]

const fmt = (n, d = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
const fmt0 = (n) => Math.round(n).toLocaleString('en-US')

// Crack regime bands — colours & meaning from "Reading the crack"
function getBand(crack) {
  if (crack < 0)  return { label: 'Refining underwater', sub: 'Refiners cut runs',        color: '#C0392B' }
  if (crack < 10) return { label: 'Thin margin',         sub: 'Barely profitable',        color: '#D98324' }
  if (crack < 30) return { label: 'Normal & healthy',    sub: 'Typical operating band',   color: '#4DAA57' }
  if (crack < 80) return { label: 'Tight market',        sub: 'Refiners run flat out',    color: '#F4A124' }
  return            { label: 'Extreme squeeze',          sub: 'Genuine shortage',         color: '#9B2FC7' }
}

/* ── Segmented control ──────────────────────────── */
function Segmented({ options, value, onChange }) {
  return (
    <div className={styles.segmented} role="tablist">
      {options.map(opt => (
        <button
          key={opt}
          role="tab"
          aria-selected={value === opt}
          className={`${styles.segment} ${value === opt ? styles.segmentActive : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/* ── Barrel glyph (crude → products) ────────────── */
function Glyph({ c, g, d }) {
  return (
    <div className={styles.glyph}>
      <div className={styles.glyphGroup}>
        {Array.from({ length: c }).map((_, i) => <span key={`c${i}`} className={styles.barrelCrude} />)}
      </div>
      <ArrowRight size={15} className={styles.glyphArrow} />
      <div className={styles.glyphGroup}>
        {Array.from({ length: g }).map((_, i) => <span key={`g${i}`} className={styles.barrelGas} />)}
        {Array.from({ length: d }).map((_, i) => <span key={`d${i}`} className={styles.barrelDist} />)}
      </div>
    </div>
  )
}

/* ── Price slider ───────────────────────────────── */
function PriceControl({ label, unit, value, min, max, step, onChange, color, perBbl, disabled }) {
  return (
    <div className={`${styles.control} ${disabled ? styles.controlDisabled : ''}`}>
      <div className={styles.controlHead}>
        <span className={styles.controlLabel}>
          <span className={styles.dot} style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className={styles.controlValue}>
          ${fmt(value)}<span className={styles.controlUnit}>/{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ accentColor: color }}
        className={styles.slider}
      />
      {perBbl != null && !disabled && (
        <span className={styles.perBbl}>× 42 gal = ${fmt(perBbl)}/bbl</span>
      )}
    </div>
  )
}

/* ── Stacked bars (products vs crude) ───────────── */
function Bars({ gasVal, distVal, crudeCost }) {
  const productValue = gasVal + distVal
  const max = Math.max(productValue, crudeCost, 1)
  const MAXPX = 200
  const h = v => (v / max) * MAXPX

  return (
    <div className={styles.bars}>
      <div className={styles.barCol}>
        <div className={styles.barStack} style={{ height: MAXPX }}>
          <div className={styles.barSeg} style={{ height: h(distVal), backgroundColor: 'var(--color-orange)' }}>
            {distVal > 0 && h(distVal) > 26 && <span>${fmt0(distVal)}</span>}
          </div>
          <div className={styles.barSeg} style={{ height: h(gasVal), backgroundColor: 'var(--color-green)' }}>
            {h(gasVal) > 26 && <span>${fmt0(gasVal)}</span>}
          </div>
        </div>
        <span className={styles.barLabel}>Products ${fmt0(productValue)}</span>
      </div>

      <span className={styles.barMinus}>−</span>

      <div className={styles.barCol}>
        <div className={styles.barStack} style={{ height: MAXPX }}>
          <div className={styles.barSeg} style={{ height: h(crudeCost), backgroundColor: 'var(--color-dark)' }}>
            {h(crudeCost) > 26 && <span>${fmt0(crudeCost)}</span>}
          </div>
        </div>
        <span className={styles.barLabel}>Crude ${fmt0(crudeCost)}</span>
      </div>
    </div>
  )
}

export default function CrackSpreadLab() {
  const [ratioKey, setRatioKey] = useState('3-2-1')
  const [crude, setCrude] = useState(90)
  const [gas, setGas] = useState(2.50)
  const [dist, setDist] = useState(3.00)
  const [side, setSide] = useState('buy')
  const [lots, setLots] = useState(1)
  const [position, setPosition] = useState(null)

  const { c, g, d } = RATIOS[ratioKey]
  const isSingle = d === 0

  // Core crack maths (Chapter 11 worked example)
  const gasVal   = g * gas * GAL_PER_BBL
  const distVal  = d * dist * GAL_PER_BBL
  const productValue = gasVal + distVal
  const crudeCost = c * crude
  const grossMargin = productValue - crudeCost
  const crack = grossMargin / c

  const band = getBand(crack)

  // Position P&L — 1 spread = 1,000 bbl
  const sideSign = position?.side === 'buy' ? 1 : -1
  const move = position ? crack - position.entry : 0
  const pnl = position ? move * sideSign * position.lots * BBL_PER_LOT : 0

  function applyScenario(s) {
    setCrude(s.crude); setGas(s.gas); setDist(s.dist)
  }

  function enterPosition() {
    setPosition({ side, entry: crack, lots: Math.max(1, Math.round(lots)) })
  }

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}>
          <ArrowLeft size={15} /> Simulators
        </Link>

        <header className={styles.header}>
          <p className="label">Chapter 11 · Simulator</p>
          <h1>Crack Spread Lab</h1>
          <p className={styles.lede}>
            Trade the refining margin — the spread between crude and the products it becomes.
            Set the market, read the crack, then take a position and watch your P&amp;L move.
          </p>
        </header>

        {/* Ratio selector + glyph */}
        <section className={styles.ratioBar}>
          <div>
            <span className={styles.miniLabel}>Crack ratio</span>
            <Segmented options={Object.keys(RATIOS)} value={ratioKey} onChange={setRatioKey} />
          </div>
          <Glyph c={c} g={g} d={d} />
        </section>

        <div className={styles.grid}>
          {/* LEFT — Set the market */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Set the market</h2>

            <PriceControl
              label="Crude (WTI)" unit="bbl" color="var(--color-dark)"
              value={crude} min={40} max={140} step={1} onChange={setCrude}
            />
            <PriceControl
              label="Gasoline (RBOB)" unit="gal" color="var(--color-green)"
              value={gas} min={1} max={5} step={0.05} onChange={setGas}
              perBbl={gas * GAL_PER_BBL}
            />
            <PriceControl
              label="Distillate (ULSD)" unit="gal" color="var(--color-orange)"
              value={dist} min={1} max={6} step={0.05} onChange={setDist}
              perBbl={dist * GAL_PER_BBL} disabled={isSingle}
            />

            <div className={styles.scenarioWrap}>
              <span className={styles.miniLabel}>Scenarios</span>
              <div className={styles.scenarios}>
                {SCENARIOS.map(s => (
                  <button key={s.id} className={styles.scenarioBtn} onClick={() => applyScenario(s)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT — Read the crack */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Read the crack</h2>

            <Bars gasVal={gasVal} distVal={distVal} crudeCost={crudeCost} />

            <div className={styles.crackResult}>
              <div>
                <span className={styles.crackBig} style={{ color: band.color }}>
                  ${fmt(crack)}<span className={styles.crackUnit}>/bbl</span>
                </span>
                <span className={styles.bandBadge} style={{ backgroundColor: band.color }}>
                  {band.label}
                </span>
                <span className={styles.bandSub}>{band.sub}</span>
              </div>
            </div>

            <div className={styles.steps}>
              <div className={styles.step}>
                <span>Product value</span><span>{g}×${fmt0(gas * 42)}{d > 0 ? ` + ${d}×$${fmt0(dist * 42)}` : ''} = ${fmt0(productValue)}</span>
              </div>
              <div className={styles.step}>
                <span>Crude cost</span><span>{c}×${fmt0(crude)} = ${fmt0(crudeCost)}</span>
              </div>
              <div className={styles.step}>
                <span>Gross margin</span><span>${fmt0(productValue)} − ${fmt0(crudeCost)} = ${fmt0(grossMargin)}</span>
              </div>
              <div className={`${styles.step} ${styles.stepFinal}`}>
                <span>Crack ÷ {c} bbl</span><span>${fmt0(grossMargin)} ÷ {c} = ${fmt(crack)}/bbl</span>
              </div>
            </div>
          </section>
        </div>

        {/* Trade the crack */}
        <section className={styles.tradePanel}>
          <h2 className={styles.panelTitle}>Trade the crack</h2>

          <div className={styles.tradeGrid}>
            <div className={styles.sideToggle}>
              <button
                className={`${styles.sideBtn} ${side === 'buy' ? styles.sideActive : ''}`}
                onClick={() => setSide('buy')} disabled={!!position}
              >
                Buy the crack
                <span className={styles.sideHint}>bet the margin widens</span>
              </button>
              <button
                className={`${styles.sideBtn} ${side === 'sell' ? styles.sideActive : ''}`}
                onClick={() => setSide('sell')} disabled={!!position}
              >
                Sell the crack
                <span className={styles.sideHint}>refiner's hedge — lock the margin</span>
              </button>
            </div>

            <div className={styles.legs}>
              <span className={styles.miniLabel}>Position legs</span>
              <div className={styles.legRow}>
                <span className={`${styles.legPill} ${side === 'buy' ? styles.buyPill : styles.sellPill}`}>
                  {side === 'buy' ? 'BUY' : 'SELL'}
                </span>
                {g} gasoline{d > 0 ? ` + ${d} distillate`: ''} futures
              </div>
              <div className={styles.legRow}>
                <span className={`${styles.legPill} ${side === 'buy' ? styles.sellPill : styles.buyPill}`}>
                  {side === 'buy' ? 'SELL' : 'BUY'}
                </span>
                {c} crude futures
              </div>
            </div>

            <div className={styles.lotsBox}>
              <span className={styles.miniLabel}>Spreads (1 = {fmt0(BBL_PER_LOT)} bbl)</span>
              <input
                type="number" min={1} max={500} value={lots}
                onChange={e => setLots(e.target.value === '' ? '' : parseInt(e.target.value || '1', 10))}
                disabled={!!position}
                className={styles.lotsInput}
              />
              {!position
                ? <button className={styles.enterBtn} onClick={enterPosition}>Enter at ${fmt(crack)}</button>
                : <button className={styles.closeBtn} onClick={() => setPosition(null)}>Close position</button>}
            </div>
          </div>

          {position && (
            <div className={styles.pnlPanel}>
              <div className={styles.pnlItem}>
                <span className={styles.miniLabel}>Side</span>
                <span className={styles.pnlVal}>{position.side === 'buy' ? 'Long crack' : 'Short crack'} · {position.lots} spr.</span>
              </div>
              <div className={styles.pnlItem}>
                <span className={styles.miniLabel}>Entry</span>
                <span className={styles.pnlVal}>${fmt(position.entry)}/bbl</span>
              </div>
              <div className={styles.pnlItem}>
                <span className={styles.miniLabel}>Current</span>
                <span className={styles.pnlVal}>${fmt(crack)}/bbl</span>
              </div>
              <div className={styles.pnlItem}>
                <span className={styles.miniLabel}>Move</span>
                <span className={styles.pnlVal}>{move >= 0 ? '+' : '−'}${fmt(Math.abs(move))}/bbl</span>
              </div>
              <div className={`${styles.pnlItem} ${styles.pnlBig}`}>
                <span className={styles.miniLabel}>Open P&amp;L</span>
                <span className={styles.pnlMoney} style={{ color: pnl >= 0 ? '#2E8B45' : '#C0392B' }}>
                  {pnl >= 0 ? '+' : '−'}${fmt0(Math.abs(pnl))}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
