import { useNavigate } from 'react-router-dom'
import usePanierStore from '../store/panierStore'
import IconClose from '../components/icons/IconClose'
import IconArrow from '../components/icons/IconArrow'
import IconImage from '../components/icons/IconImage'

export default function PanierPage() {
  const navigate       = useNavigate()
  const items          = usePanierStore(s => s.items)
  const supprimerItem  = usePanierStore(s => s.supprimerItem)
  const totalPanier    = usePanierStore(s => s.totalPanier)

  const total  = totalPanier()
  const avance = total / 2

  if (items.length === 0) return (
    <div className="page-enter" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', border: '1px solid var(--gold-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <IconImage size={32} color="var(--muted-2)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Votre panier est vide</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '14px' }}>Parcourez notre catalogue pour trouver votre modèle</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Voir le catalogue
          <IconArrow size={13} color="var(--dark)" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="page-enter">
      <div style={{ borderBottom: '1px solid var(--gold-border)', padding: '3rem 0 2rem' }}>
        <div className="container">
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: '1.5rem', padding: 0, cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <IconArrow size={13} color="currentColor" direction="left" />
            Continuer mes achats
          </button>
          <div className="section-label">Récapitulatif</div>
          <h1 style={{ fontSize: '2.2rem' }}>Mon panier</h1>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

            {/* LISTE ITEMS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, i) => (
                <div key={i} className="card" style={{ display: 'flex', gap: '0', overflow: 'hidden' }}>

                  {/* IMAGE */}
                  <div style={{ width: '120px', minHeight: '120px', background: 'var(--dark-3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.tableau.image_principale ? (
                      <img src={item.tableau.image_principale} alt={item.tableau.titre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <IconImage size={32} color="var(--muted-2)" />
                    )}
                  </div>

                  {/* INFOS */}
                  <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>Tableau</div>
                        <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', color: 'var(--cream)', marginBottom: '6px' }}>{item.tableau.titre}</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          {item.nbUnites} unité{item.nbUnites > 1 ? 's' : ''} ×{' '}
                          <span style={{ color: 'var(--cream)' }}>{Number(item.tableau.prix_unitaire).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      </div>
                      <button onClick={() => supprimerItem(item.tableau.id)} style={{
                        background: 'none', border: '1px solid var(--gold-border)',
                        borderRadius: 'var(--radius-sm)', width: '30px', height: '30px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--muted)', cursor: 'pointer', transition: 'var(--transition)',
                        flexShrink: 0,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#E76F51'; e.currentTarget.style.color = '#E76F51' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        <IconClose size={12} />
                      </button>
                    </div>

                    {/* PHOTOS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {item.photos.length} photo{item.photos.length > 1 ? 's' : ''} uploadée{item.photos.length > 1 ? 's' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {item.photos.slice(0, 3).map((f, j) => (
                          <div key={j} style={{
                            width: '28px', height: '28px', borderRadius: '3px',
                            background: 'var(--dark-3)', border: '1px solid var(--gold-border)',
                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                        {item.photos.length > 3 && (
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '3px',
                            background: 'var(--dark-3)', border: '1px solid var(--gold-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', color: 'var(--muted)',
                          }}>+{item.photos.length - 3}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PRIX */}
                  <div style={{
                    padding: '16px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'flex-end', borderLeft: '1px solid var(--gold-border)',
                    minWidth: '130px',
                  }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', color: 'var(--gold)', fontWeight: 700 }}>
                        {(Number(item.tableau.prix_unitaire) * item.nbUnites).toLocaleString('fr-FR')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>FCFA</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RECAP TOTAL */}
            <div style={{ position: 'sticky', top: '80px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-serif)', color: 'var(--cream)', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--gold-border)' }}>
                  Récapitulatif
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted)' }}>{items.length} article{items.length > 1 ? 's' : ''}</span>
                    <span style={{ color: 'var(--cream)' }}>{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted)' }}>Acompte à payer (50%)</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{avance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted)' }}>Solde à la livraison</span>
                    <span style={{ color: 'var(--cream)' }}>{avance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--gold-border)', paddingTop: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Total</span>
                    <div>
                      <span style={{ fontSize: '26px', color: 'var(--gold)', fontWeight: 700 }}>{total.toLocaleString('fr-FR')}</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' }}>FCFA</span>
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/validation')}
                >
                  Valider ma commande
                  <IconArrow size={13} color="var(--dark)" />
                </button>

                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                  Vous ne payez que 50% maintenant.<br />Le solde est réglé lors du retrait.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}