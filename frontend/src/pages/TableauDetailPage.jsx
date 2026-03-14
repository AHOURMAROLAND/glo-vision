import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTableau } from '../services/catalogueService'
import ModalCommande from '../components/panier/ModalCommande'
import SkeletonCard from '../components/common/SkeletonCard'
import IconArrow from '../components/icons/IconArrow'
import IconImage from '../components/icons/IconImage'

export default function TableauDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [tableau, setTableau] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getTableau(id)
      .then(res => setTableau(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="container section page-enter">
      <div className="skeleton" style={{ height: '28px', width: '180px', marginBottom: '2rem' }} />
      <div className="skeleton" style={{ height: '48px', width: '50%', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '3rem' }} />
      <div className="grid-3">
        {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  if (!tableau) return null

  return (
    <div className="page-enter">

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid var(--gold-border)', padding: '3rem 0 2.5rem' }}>
        <div className="container">
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: '1.5rem', padding: 0, cursor: 'pointer',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <IconArrow size={13} color="currentColor" direction="left" />
            Retour au catalogue
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div className="section-label">Modèle de tableau</div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '10px' }}>{tableau.titre}</h1>
              {tableau.description && (
                <p style={{ color: 'var(--muted)', maxWidth: '500px', lineHeight: 1.8, fontSize: '14px' }}>
                  {tableau.description}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '6px' }}>Prix unitaire</div>
              <div style={{ fontSize: '2.2rem', color: 'var(--gold)', fontWeight: 700, fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
                {Number(tableau.prix_unitaire).toLocaleString('fr-FR')}
                <span style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: '6px' }}>FCFA</span>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={() => setModalOpen(true)}>
                Commander ce modèle
                <IconArrow size={13} color="var(--dark)" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GALERIE */}
      <section className="section">
        <div className="container">
          <div className="section-label">Réalisations</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            {tableau.realisations?.length > 0
              ? `${tableau.realisations.length} réalisation${tableau.realisations.length > 1 ? 's' : ''}`
              : 'Galerie'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '2.5rem' }}>
            Double-cliquez sur une photo pour commander avec ce modèle
          </p>

          {tableau.realisations?.length > 0 ? (
            <div className="grid-3">
              {tableau.realisations.map((r, i) => (
                <div
                  key={r.id}
                  className="card"
                  onDoubleClick={() => setModalOpen(true)}
                  style={{ cursor: 'crosshair', position: 'relative' }}
                >
                  <div style={{ height: '270px', overflow: 'hidden', background: 'var(--dark-3)' }}>
                    {r.image ? (
                      <img src={r.image} alt={r.legende || `Réalisation ${i+1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconImage size={40} color="var(--muted-2)" />
                      </div>
                    )}
                  </div>
                  {r.legende && (
                    <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted)' }}>{r.legende}</div>
                  )}
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    fontSize: '9px', color: 'var(--gold)', letterSpacing: '1px',
                    border: '1px solid var(--gold-border)',
                    padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(15,15,31,0.85)',
                  }}>2× CLIC</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '5rem',
              border: '1px dashed var(--gold-border)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <IconImage size={48} color="var(--muted-2)" />
              <p style={{ color: 'var(--muted)', margin: '1rem 0 1.5rem' }}>
                Aucune réalisation disponible pour ce modèle.
              </p>
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                Commander quand même
                <IconArrow size={13} color="var(--dark)" />
              </button>
            </div>
          )}
        </div>
      </section>

      {modalOpen && <ModalCommande tableau={tableau} onClose={() => setModalOpen(false)} />}
    </div>
  )
}