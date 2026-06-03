import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, TrendingUp, Users } from 'lucide-react'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',         Icon: LayoutDashboard },
  { to: '/training',   label: 'Training Material',  Icon: BookOpen        },
  { to: '/simulators', label: 'Simulators',         Icon: TrendingUp      },
  { to: '/team',       label: 'Team',               Icon: Users           },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/logo-mark.svg" alt="TradeCruiser" className={styles.logoMark} />
        <div className={styles.brandText}>
          <span className={styles.brandName}>TradeCruiser</span>
          <span className={styles.brandSub}>Academy</span>
        </div>
      </div>

      <div className={styles.divider} />

      <nav className={styles.nav}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={16} strokeWidth={1.75} className={styles.icon} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
