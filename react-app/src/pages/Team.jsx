import styles from './Team.module.css'

export default function Team() {
  return (
    <div className="page">
      <header className={styles.header}>
        <p className="label">People</p>
        <h1>Team</h1>
      </header>

      <figure className={styles.figure}>
        <img
          src="/assets/team.jpg"
          alt="The TradeCruiser team"
          className={styles.photo}
        />
        <figcaption className={styles.caption}>
          <span className={styles.rule} />
          We trade commodities, but our greatest asset is our people
        </figcaption>
      </figure>
    </div>
  )
}
