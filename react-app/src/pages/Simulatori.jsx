import {
  Scale, FlaskConical, GraduationCap, Factory, Map as MapIcon, Newspaper,
  CalendarDays, Users, ArrowLeftRight, FileSignature, LineChart, TrendingUp,
  Layers, Activity, ShieldAlert, Target, Calculator, RefreshCw, Coins, ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './Simulators.module.css'

const simulators = [
  { chapter: 1,  title: 'Hedge or Expose',      type: 'P&L Simulation',     Icon: Scale,         description: 'Run a physical cargo with and without a hedge and watch each P&L react as the flat price moves.' },
  { chapter: 2,  title: 'Crude Classifier',     type: 'Sorting Game',       Icon: FlaskConical,  description: 'Sort crude samples by API gravity and sulfur content into light/heavy and sweet/sour grades.' },
  { chapter: 3,  title: 'Terminology Trainer',  type: 'Quiz',               Icon: GraduationCap, description: 'Match trading terms to live scenarios: long vs short, bid-offer, slippage, open interest, VaR.' },
  { chapter: 4,  title: 'Refinery Flow',        type: 'Process Builder',    Icon: Factory,       description: 'Route a barrel through distillation, conversion, and treatment to build the right product slate.' },
  { chapter: 5,  title: 'Benchmark Map',        type: 'Map Matching',       Icon: MapIcon,       description: 'Place global crude benchmarks — Brent, WTI, Dubai — on the map and match them to their grades.' },
  { chapter: 6,  title: 'Market Mover',         type: 'Prediction Game',    Icon: Newspaper, to: '/simulators/market-mover', description: 'React to breaking headlines — OPEC cuts, outages, inventory builds — and call the price direction.' },
  { chapter: 7,  title: 'Product Seasons',      type: 'Prediction Game',    Icon: CalendarDays, to: '/simulators/product-seasons', description: 'Read the season and call which refined fuel — gasoline, distillate, jet or fuel oil — is in peak demand.' },
  { chapter: 8,  title: 'Market Players',       type: 'Matching Game',      Icon: Users, to: '/simulators/market-players', description: 'Identify each market participant — producer, refiner, hedger, speculator, market maker — by their motive.' },
  { chapter: 9,  title: 'Exchange vs OTC',      type: 'Decision Sim',       Icon: ArrowLeftRight, description: 'Route trades through an exchange and clearing house or OTC, and weigh margin against counterparty risk.' },
  { chapter: 9,  title: 'Margin Call Simulator', type: 'Risk Simulation',   Icon: Coins, to: '/simulators/margin-call', description: 'Hold a leveraged futures position and watch your margin balance erode as prices move against you — top up collateral before the margin call triggers liquidation.' },
  { chapter: 10, title: 'Contract Builder',     type: 'Interactive Builder', Icon: FileSignature, to: '/simulators/contract-builder', description: 'Build and settle futures, forwards, and swaps, then compare how each one pays out at expiry.' },
  { chapter: 11, title: 'Crack Spread Lab',     type: 'P&L Simulation',     Icon: LineChart,     to: '/simulators/crack-spread', description: 'Build a 3-2-1 crack from live crude and product prices, read the refining margin, then buy or sell the spread and track your P&L.' },
  { chapter: 12, title: 'Arbitrage Run',        type: 'P&L Simulation',     Icon: TrendingUp,    description: 'Spot a price gap between two regions, subtract freight, and decide if the arbitrage is worth it.' },
  { chapter: 13, title: 'Quality Spread',       type: 'P&L Simulation',     Icon: Layers,        description: 'Trade the differential between high- and low-sulfur grades as quality premiums move.' },
  { chapter: 14, title: 'Curve Trader',         type: 'Interactive Chart',  Icon: Activity,      description: 'Read the forward curve, trade calendar spreads, and profit from contango and backwardation.' },
  { chapter: 15, title: 'VaR Simulator',        type: 'Risk Simulation',    Icon: ShieldAlert,   description: 'Size your positions against a risk limit and watch Value-at-Risk and the P&L distribution respond.' },
  { chapter: 16, title: 'Exposure Tracker',     type: 'Decision Sim',       Icon: Target,        description: 'A physical deal lands — identify the open price exposure and place the hedge that neutralizes it.' },
  { chapter: 17, title: 'Pricing & Incoterms',  type: 'Interactive Builder', Icon: Calculator,   description: 'Build a pricing formula and pick the Incoterm, then see where cost and risk pass to the buyer.' },
  { chapter: 18, title: 'Full Trade Cycle',     type: 'Capstone Simulation', Icon: RefreshCw,    description: 'The capstone: source a cargo, price it, hedge it, manage delivery, and close out for a final P&L.' },
]

function SimulatorCard({ sim }) {
  const { chapter, title, type, description, Icon, to } = sim
  const num = String(chapter).padStart(2, '0')

  const inner = (
    <>
      <header className={styles.cardHead}>
        <span className={styles.iconBox}>
          <Icon size={17} strokeWidth={1.75} />
        </span>
        <span className={styles.chapterPill}>Ch. {num}</span>
      </header>

      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>

      <footer className={styles.cardFooter}>
        <span className={styles.typeLabel}>{type}</span>
        {to
          ? <span className={styles.openLabel}>Open lab <ArrowRight size={12} strokeWidth={2.5} /></span>
          : <span className={styles.statusBadge}>In development</span>}
      </footer>
    </>
  )

  return to
    ? <Link to={to} className={`${styles.card} ${styles.cardLink}`}>{inner}</Link>
    : <article className={styles.card}>{inner}</article>
}

export default function Simulators() {
  const total = simulators.length
  const available = simulators.filter(s => s.to).length

  return (
    <div className="page">
      <header className={styles.pageHeader}>
        <p className="label">Practice</p>
        <h1>Simulators</h1>
        <p className={styles.meta}>
          {total} interactive simulations &nbsp;·&nbsp;
          <span className={styles.metaStatus}>{available} available</span>
          &nbsp;·&nbsp; {total - available} in development
        </p>
      </header>

      <div className={styles.grid}>
        {simulators.map(sim => (
          <SimulatorCard key={sim.title} sim={sim} />
        ))}
      </div>
    </div>
  )
}
