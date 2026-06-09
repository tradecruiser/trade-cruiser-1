import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Shield, TrendingUp, ArrowLeftRight, Scale, Users,
  Landmark, Building2, Gavel, Ship, Check, RotateCcw,
} from 'lucide-react'
import styles from './MarketPlayers.module.css'

// Participants & roles from Chapter 8 — "Introduction to Financial Markets"
const POOL = [
  { id: 'hedger',     name: 'Hedger',        Icon: Shield,         role: 'Locks in a price to remove the risk of an exposure it already has.' },
  { id: 'speculator', name: 'Speculator',    Icon: TrendingUp,     role: 'Takes risk with no underlying exposure, hoping to profit from the move.' },
  { id: 'marketmaker', name: 'Market maker', Icon: ArrowLeftRight, role: 'Quotes both buy and sell, earning the spread and always providing a counterparty.' },
  { id: 'arbitrageur', name: 'Arbitrageur',  Icon: Scale,          role: 'Closes small price gaps between related markets, keeping prices aligned.' },
  { id: 'broker',     name: 'Broker',        Icon: Users,          role: 'Executes client trades for a fee without taking a position itself.' },
  { id: 'clearing',   name: 'Clearing house', Icon: Landmark,      role: 'Guarantees cleared trades and manages the margin that contains defaults.' },
  { id: 'exchange',   name: 'Exchange',      Icon: Building2,      role: 'Lists standardized contracts and hosts transparent public price formation.' },
  { id: 'regulator',  name: 'Regulator',     Icon: Gavel,          role: 'Polices conduct, enforces disclosure and guards against manipulation.' },
  { id: 'tradinghouse', name: 'Trading house', Icon: Ship,         role: 'Moves physical barrels and hedges them — bridging physical and financial.' },
]

const ROUND = 6

const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
const newRound = () => shuffle(POOL).slice(0, ROUND)

const gradeFor = (m) => m === 0 ? 'Flawless desk' : m <= 2 ? 'Sharp read' : m <= 4 ? 'Solid' : 'Keep studying'

export default function MarketPlayers() {
  const [round, setRound] = useState(newRound)
  const [leftOrder, setLeftOrder] = useState(() => shuffle(round))
  const [rightOrder, setRightOrder] = useState(() => shuffle(round))
  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrong, setWrong] = useState(null)
  const [mistakes, setMistakes] = useState(0)

  const done = matched.length === round.length

  function tapLeft(id) {
    if (matched.includes(id)) return
    setSelected(id); setWrong(null)
  }

  function tapRight(id) {
    if (matched.includes(id) || selected == null) return
    if (id === selected) {
      setMatched((m) => [...m, id]); setSelected(null); setWrong(null)
    } else {
      setMistakes((x) => x + 1); setWrong(id)
      setTimeout(() => setWrong(null), 650)
      setSelected(null)
    }
  }

  function playAgain() {
    const r = newRound()
    setRound(r); setLeftOrder(shuffle(r)); setRightOrder(shuffle(r))
    setSelected(null); setMatched([]); setWrong(null); setMistakes(0)
  }

  return (
    <div className="page">
      <div className={styles.lab}>
        <Link to="/simulators" className={styles.back}><ArrowLeft size={15} /> Simulators</Link>

        <header className={styles.header}>
          <p className="label">Chapter 8 · Simulator</p>
          <h1>Market Players</h1>
          <p className={styles.lede}>
            No market is a single crowd — it’s a layered system of players with different goals.
            Match each participant to the role it plays. Tap a player, then tap its role.
          </p>
        </header>

        <div className={styles.scorebar}>
          <span><strong>{matched.length}</strong>/{round.length} matched</span>
          <span><strong>{mistakes}</strong> {mistakes === 1 ? 'mistake' : 'mistakes'}</span>
        </div>

        {!done ? (
          <div className={styles.board}>
            <div className={styles.col}>
              <span className={styles.colLabel}>Participant</span>
              {leftOrder.map(({ id, name, Icon }) => {
                const isMatched = matched.includes(id)
                const isSel = selected === id
                return (
                  <button key={id} disabled={isMatched}
                    className={`${styles.player} ${isMatched ? styles.matched : ''} ${isSel ? styles.selected : ''}`}
                    onClick={() => tapLeft(id)}>
                    <span className={styles.pIcon}><Icon size={16} strokeWidth={1.9} /></span>
                    {name}
                    {isMatched && <Check size={15} className={styles.tick} />}
                  </button>
                )
              })}
            </div>

            <div className={styles.col}>
              <span className={styles.colLabel}>Role</span>
              {rightOrder.map(({ id, role }) => {
                const isMatched = matched.includes(id)
                const isWrong = wrong === id
                return (
                  <button key={id} disabled={isMatched}
                    className={`${styles.role} ${isMatched ? styles.matched : ''} ${isWrong ? styles.wrong : ''}`}
                    onClick={() => tapRight(id)}>
                    {role}
                    {isMatched && <Check size={15} className={styles.tick} />}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <section className={styles.summary}>
            <span className={styles.grade}>{gradeFor(mistakes)}</span>
            <span className={styles.finalScore}>{round.length} matched</span>
            <span className={styles.finalSub}>{mistakes} {mistakes === 1 ? 'mistake' : 'mistakes'} along the way</span>
            <button className={styles.againBtn} onClick={playAgain}><RotateCcw size={15} /> New round</button>
          </section>
        )}
      </div>
    </div>
  )
}
