import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Terminal } from 'lucide-react'
import styles from './TerminologyTrainer.module.css'

// Chapter 3 — Trading Terminology · match the scenario to the right term
const QUESTIONS = [
  {
    scenario: 'You expect Brent to rally on tomorrow’s OPEC meeting, so you buy futures now.',
    options: ['Going long', 'Going short', 'Hitting the bid', 'Indicative price'],
    answer: 0,
    def: 'Buying because you are bullish puts you long — you own the position and profit if the price rises.',
  },
  {
    scenario: 'A producer sells futures against crude still in the ground to lock in today’s price.',
    options: ['Going short', 'Going long', 'Lifting the offer', 'Slippage'],
    answer: 0,
    def: 'Selling a contract you will deliver later is going short — the natural hedge for a producer who is long real barrels.',
  },
  {
    scenario: 'The screen reads Brent 89.95 / 90.05 and you want to buy immediately.',
    options: ['Lift the offer at 90.05', 'Hit the bid at 89.95', 'Deal at the 90.00 mid', 'Pay the 0.10 spread only'],
    answer: 0,
    def: 'The offer (ask) is the lowest price a seller will accept. To buy right now you lift the offer — here, 90.05.',
  },
  {
    scenario: 'On that same 89.95 / 90.05 quote, what is the 0.10 gap between the two prices called?',
    options: ['The bid–offer spread', 'The slippage', 'The Value at Risk', 'The open interest'],
    answer: 0,
    def: 'The bid–offer spread is the cost of trading instantly — razor-thin in liquid markets, wide in thin ones.',
  },
  {
    scenario: 'You hold a 100,000-barrel long and the flat price moves $1.',
    options: ['Your P&L changes by $100,000', 'Your P&L changes by $1,000', 'Your P&L changes by $10,000', 'Your P&L is unchanged'],
    answer: 0,
    def: 'Exposure ≈ position size × price change. 100,000 bbl × $1 = $100,000 gained or lost per dollar move.',
  },
  {
    scenario: 'You sent an order intending 90.00 but, in a fast market, it filled at 90.08.',
    options: ['Slippage of 0.08', 'A 0.08 bid–offer spread', 'An indicative price', 'A limit fill'],
    answer: 0,
    def: 'Slippage is the gap between the price you expected and the price you actually got — worst in fast or thin markets.',
  },
  {
    scenario: 'Half a million lots changed hands across today’s session.',
    options: ['Traded volume', 'Open interest', 'Value at Risk', 'Net exposure'],
    answer: 0,
    def: 'Volume counts every trade done in a period — a flow that resets each day and measures turnover.',
  },
  {
    scenario: 'Overnight, the number of contracts still open and not yet closed rises sharply.',
    options: ['Open interest is rising', 'Volume is rising', 'Slippage is rising', 'The spread is widening'],
    answer: 0,
    def: 'Open interest counts positions not yet closed — a stock, not a flow. Rising OI signals new money entering the market.',
  },
  {
    scenario: 'You want to execute right now at the best price available, accepting whatever the market offers.',
    options: ['A market order', 'A limit order', 'A stop order', 'A stop-limit order'],
    answer: 0,
    def: 'A market order trades for speed — filled fast, but you accept whatever price the market gives.',
  },
  {
    scenario: 'You will only trade at your set price or better, even if that means not getting filled.',
    options: ['A limit order', 'A market order', 'A stop order', 'A firm price'],
    answer: 0,
    def: 'A limit order trades for price — you control the level, but the trade may never fill.',
  },
  {
    scenario: 'You place an order that becomes a market order once the price hits your trigger, to cap a loss.',
    options: ['A stop order', 'A limit order', 'A market order', 'An indicative quote'],
    answer: 0,
    def: 'A stop is for protection — it activates at your trigger and is used to cap a loss or enter on a breakout.',
  },
  {
    scenario: 'A broker shows a quote “for information only” — roughly where the market is, but you cannot deal on it.',
    options: ['An indicative price', 'A firm price', 'The bid', 'The mid-price'],
    answer: 0,
    def: 'An indicative price is a reference only. A firm price, by contrast, is binding for size — one you can actually trade on.',
  },
  {
    scenario: '“We are 95% confident we will not lose more than $1M in a day.” What is that $1M figure?',
    options: ['Value at Risk (VaR)', 'Gross exposure', 'The bid–offer spread', 'Slippage'],
    answer: 0,
    def: 'VaR puts one number on risk — a horizon, a confidence level and an amount. Its blind spot: it says nothing about how bad the worst 5% can get.',
  },
  {
    scenario: 'A desk adds up its longs and subtracts its shorts to see what it is really betting on.',
    options: ['Net exposure', 'Gross exposure', 'Open interest', 'Traded volume'],
    answer: 0,
    def: 'Net exposure is longs minus shorts — the real directional bet. Gross exposure adds up every position regardless of side.',
  },
]

const gradeFor = (p) => p >= 90 ? 'Desk-ready' : p >= 75 ? 'Fluent' : p >= 55 ? 'Getting there' : 'Keep studying'

export default function TerminologyTrainer() {
  const order = useMemo(() => [...QUESTIONS].sort(() => Math.random() - 0.5), [])
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [done, setDone] = useState(false)

  const q = order[idx]
  const answered = guess !== null
  const correct = guess === q?.answer

  function pick(i) {
    if (answered) return
    setGuess(i)
    if (i === q.answer) {
      setScore((s) => s + 1)
      setStreak((st) => { const n = st + 1; setBest((b) => Math.max(b, n)); return n })
    } else {
      setStreak(0)
    }
  }

  function next() {
    if (idx + 1 >= order.length) { setDone(true); return }
    setIdx((i) => i + 1)
    setGuess(null)
  }

  function playAgain() {
    setIdx(0); setGuess(null); setScore(0); setStreak(0); setBest(0); setDone(false)
  }

  const seen = idx + (answered ? 1 : 0)
  const pct = seen ? Math.round((score / seen) * 100) : 0

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 3 · Simulator</p>
          <h1>Terminology Trainer</h1>
          <p className={styles.lede}>
            Misread one term and you misread the trade. Each card drops you into a live desk scenario —
            pick the word a trader would actually use.
          </p>
        </header>

        <section className={styles.scoreboard}>
          <div className={styles.scoreItem}><span>Accuracy</span><strong>{pct}%</strong><em>{score}/{seen}</em></div>
          <div className={styles.scoreItem}><span>Streak</span><strong>{streak}</strong><em>best {best}</em></div>
          <div className={styles.scoreItem}><span>Progress</span><strong>{done ? order.length : idx + 1}/{order.length}</strong><em>scenarios</em></div>
        </section>

        {!done ? (
          <section className={styles.stage}>
            <div className={styles.terminal}>
              <div className={styles.terminalBar}>
                <Terminal size={13} />
                <span>DESK SCENARIO</span>
                <span className={styles.terminalDot} />
              </div>
              <p className={styles.scenario}>{q.scenario}</p>
            </div>

            <div className={styles.options}>
              {q.options.map((opt, i) => {
                let cls = styles.option
                if (answered) {
                  if (i === q.answer) cls = `${styles.option} ${styles.optionCorrect}`
                  else if (i === guess) cls = `${styles.option} ${styles.optionWrong}`
                }
                return (
                  <button key={i} className={cls} onClick={() => pick(i)} disabled={answered}>
                    {opt}
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className={styles.reveal}>
                <span className={styles.verdict} style={{ color: correct ? 'var(--color-green)' : '#E05555' }}>
                  {correct ? 'Correct' : 'Not quite'} — {q.options[q.answer]}
                </span>
                <p className={styles.why}>{q.def}</p>
                <button className={styles.nextBtn} onClick={next}>
                  {idx + 1 >= order.length ? 'See results' : 'Next scenario'} →
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(pct)}</span>
            <span className={styles.finalScore}>{score} / {order.length}</span>
            <span className={styles.finalSub}>{pct}% correct · best streak {best}</span>
            <button className={styles.nextBtn} onClick={playAgain}><RotateCcw size={15} /> Play again</button>
          </section>
        )}
      </div>
    </div>
  )
}
