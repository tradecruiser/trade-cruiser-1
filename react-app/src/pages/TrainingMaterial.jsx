import { useState, useEffect } from 'react'
import { FileText, Download, Eye, X, ExternalLink } from 'lucide-react'
import styles from './TrainingMaterial.module.css'

const libraryChapters = [
  { id: 1,  title: 'Chapter 1: Introduction to Oil Trading',                             description: 'Why hedging funds are essential in modern markets; why physical trading is inefficient without hedging and financial markets.' },
  { id: 2,  title: 'Chapter 2: Physical Characteristics of Crude Oil',                   description: 'Understanding the fundamental physical properties of crude oil.' },
  { id: 3,  title: 'Chapter 3: Trading Terminology',                                     description: 'Bearish vs bullish, long vs short, exposure, bid-offer spread, traded volume, open interest, slippage, indicative vs firm prices, types of orders, VaR, etc.' },
  { id: 4,  title: 'Chapter 4: Introduction to Refining',                                description: 'The three main refining processes: distillation, conversion, and treatment.' },
  { id: 5,  available: true, title: 'Chapter 5: Crude Oil Markets',                      description: 'Overview and dynamics of global crude oil markets.' },
  { id: 6,  available: true, title: 'Chapter 6: What Affects the Market',                description: 'Key drivers and factors influencing oil market fluctuations.' },
  { id: 7,  available: true, title: 'Chapter 7: Oil Product Markets',                    description: 'Analysis of the refined oil products market.' },
  { id: 8,  available: true, title: 'Chapter 8: Introduction to Financial Markets',      description: 'Market participants and their specific roles in the energy sector.' },
  { id: 9,  available: true, title: 'Chapter 9: The Financial Marketplace',              description: 'ICE, clearing houses, exchanges, and OTC (Over-The-Counter) markets.' },
  { id: 10, available: true, title: 'Chapter 10: Flat Price Trading and Financial Contracts', description: 'Understanding futures, forwards, and swaps.' },
  { id: 11, available: true, title: 'Chapter 11: Crack Spread Trading',                  description: 'Mechanics and strategies of crack spread trading.' },
  { id: 12, title: 'Chapter 12: Geographical Spread Trading',                            description: 'Arbitrage and geographical price differentials.' },
  { id: 13, title: 'Chapter 13: Product Quality Spread Trading',                         description: 'Trading strategies based on product specifications and quality differences.' },
  { id: 14, title: 'Chapter 14: Calendar Spread Trading',                                description: 'Time-based spread trading strategies.' },
  { id: 15, title: 'Chapter 15: Introduction to Risk Management',                        description: 'General principles and frameworks of risk management in trading.' },
  { id: 16, title: 'Chapter 16: Understanding Exposure in Physical Trading',             description: 'Identifying and managing price and physical exposure.' },
  { id: 17, title: 'Chapter 17: Types of Pricing in Physical Trading',                   description: 'Pricing mechanisms, formulas, and Incoterms.' },
  { id: 18, title: 'Chapter 18: Process Analysis Cycle in Physical Trading with Hedging', description: 'End-to-end analysis of physical trading operations combined with hedging strategies.' },
]

const fileFor = (id) => `/assets/library/chapter-${String(id).padStart(2, '0')}.pdf`

function ChapterCard({ chapter, onOpen }) {
  const { id, title, available = false } = chapter
  const num = String(id).padStart(2, '0')

  return (
    <article
      className={`${styles.card} ${available ? styles.cardAvailable : styles.cardPending}`}
      onClick={available ? () => onOpen(chapter) : undefined}
      role={available ? 'button' : undefined}
      tabIndex={available ? 0 : undefined}
      onKeyDown={available ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(chapter) }
      } : undefined}
    >
      <header className={styles.cardHead}>
        <span className={styles.chapterPill}>Ch. {num}</span>
        {available && <span className={styles.availableDot} aria-label="Available" />}
      </header>

      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{chapter.description}</p>

      <footer className={styles.cardFooter}>
        {available ? (
          <span className={styles.previewHint}>
            <Eye size={13} strokeWidth={1.75} />
            Click to preview
          </span>
        ) : (
          <span className={styles.fileLabel}>
            <FileText size={13} strokeWidth={1.75} />
            PDF Presentation
          </span>
        )}

        {available ? (
          <a
            href={fileFor(id)}
            download
            className={styles.downloadBtn}
            onClick={e => e.stopPropagation()}
          >
            <Download size={12} strokeWidth={2} />
            Download
          </a>
        ) : (
          <span className={styles.pendingBadge}>Coming soon</span>
        )}
      </footer>
    </article>
  )
}

function PreviewModal({ chapter, onClose }) {
  const num = String(chapter.id).padStart(2, '0')
  const url = fileFor(chapter.id)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.modalHead}>
          <div className={styles.modalTitle}>
            <span className={styles.modalPill}>Ch. {num}</span>
            <h2>{chapter.title}</h2>
          </div>
          <div className={styles.modalActions}>
            <a href={url} target="_blank" rel="noreferrer" className={styles.modalAction}>
              <ExternalLink size={14} strokeWidth={1.9} /> New tab
            </a>
            <a href={url} download className={styles.modalAction}>
              <Download size={14} strokeWidth={1.9} /> Download
            </a>
            <button className={styles.modalClose} onClick={onClose} aria-label="Close preview">
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </header>
        <iframe src={url} title={chapter.title} className={styles.viewer} />
      </div>
    </div>
  )
}

export default function TrainingMaterial() {
  const [preview, setPreview] = useState(null)
  const available = libraryChapters.filter(c => c.available).length
  const total     = libraryChapters.length

  return (
    <div className="page">
      <header className={styles.pageHeader}>
        <p className="label">Learning</p>
        <h1>Training Material</h1>
        <p className={styles.meta}>
          {total} chapters &nbsp;·&nbsp;
          <span className={styles.metaCount}>{available} available</span>
          &nbsp;·&nbsp; {total - available} pending
        </p>
      </header>

      <div className={styles.grid}>
        {libraryChapters.map(ch => (
          <ChapterCard key={ch.id} chapter={ch} onOpen={setPreview} />
        ))}
      </div>

      {preview && <PreviewModal chapter={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}
