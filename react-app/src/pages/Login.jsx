import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import styles from './Login.module.css'

export default function Login() {
  const { authenticated, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (authenticated) return <Navigate to="/dashboard" replace />

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const ok = login(username, password)

    if (ok) {
      navigate('/dashboard', { replace: true })
    } else {
      setError('Incorrect username or password.')
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/logo-mark.svg" alt="TradeCruiser" className={styles.logo} />
          <p className={styles.sub}>ACADEMY</p>
        </div>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.desc}>Access your trading education platform.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              autoFocus
              autoComplete="username"
              spellCheck={false}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoComplete="current-password"
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <button
            type="submit"
            className={styles.btn}
            disabled={loading || !username || !password}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
