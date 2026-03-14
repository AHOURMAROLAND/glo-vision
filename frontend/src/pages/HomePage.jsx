import { useEffect, useState } from 'react'
import { getTableaux } from '../services/catalogueService'
import TableauCard from '../components/catalogue/TableauCard'
import SkeletonCard from '../components/common/SkeletonCard'
import IconArrow from '../components/icons/IconArrow'

export default function HomePage() {
  const [tableaux, setTableaux] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getTableaux()
      .then(res => setTableaux(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter">

      {/* HERO */}
      <section style={{
        padding: '7rem 0 5rem',
        borderBottom: '1px solid var(--gold-border)',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
            borderRadius: '20px', padding: '5px 16px', marginBottom: '2rem',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase' }}>
              Tableaux encadrés sur mesure
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>
            Vos souvenirs,<br />
            <span style={{ color: 'var(--gold)' }}>encadrés avec art</span>
          </h1>

          <p style={{
            fontSize: '15px', color: 'var(--muted)',
            maxWidth: '460px', margin: '0 auto 2.5rem', lineHeight: 1.8,
          }}>
            Choisissez un modèle, uploadez votre photo et recevez votre tableau encadré de qualité professionnelle.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#catalogue" className="btn btn-primary">
              Voir le catalogue
              <IconArrow size={13} color="var(--dark)" />
            </a>
            <button className="btn btn-outline">Comment ça marche</button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderBottom: '1px solid var(--gold-border)', padding: '2rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
            {[
              { val: '100%', label: 'Qualité originale' },
              { val: '50%', label: 'Acompte seulement' },
              { val: 'WA', label: 'Suivi WhatsApp' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', color: 'var(--gold)', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section id="catalogue" className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <div className="section-label">Nos modèles</div>
              <h2 style={{ fontSize: '2rem' }}>Catalogue</h2>
            </div>
            {!loading && (
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                {tableaux.length} modèle{tableaux.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="grid-3">
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : tableaux.map(t => <TableauCard key={t.id} tableau={t} />)
            }
          </div>

          {!loading && tableaux.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '5rem',
              border: '1px dashed var(--gold-border)',
              borderRadius: 'var(--radius-lg)', color: 'var(--muted)',
            }}>
              Aucun tableau disponible pour le moment.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}