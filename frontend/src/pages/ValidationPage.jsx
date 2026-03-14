import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifierNumero } from '../services/commandeService'
import usePanierStore from '../store/panierStore'
import IconArrow from '../components/icons/IconArrow'
import IconCheck from '../components/icons/IconCheck'
import toast from 'react-hot-toast'

export default function ValidationPage() {
  const navigate    = useNavigate()
  const items       = usePanierStore(s => s.items)
  const totalPanier = usePanierStore(s => s.totalPanier)

  const [nom, setNom]             = useState('')
  const [numero, setNumero]       = useState('')
  const [pseudo, setPseudo]       = useState('')
  const [verifie, setVerifie]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [verLoading, setVerLoading] = useState(false)

  const total  = totalPanier()
  const avance = total / 2

  const handleVerifier = async () => {
    if (!numero || numero.length < 8) {
      toast.error('Numéro WhatsApp invalide')
      return
    }
    setVerLoading(true)
    try {
      const res = await verifierNumero(numero)
      if (res.data.valide) {
        setPseudo(res.data.pseudo || numero)
        setVerifie(true)
        toast.success('Numéro WhatsApp vérifié !')
      } else {
        toast.error('Ce numéro n\'est pas sur WhatsApp')
        setVerifie(false)
      }
    } catch {
      toast.error('Erreur de vérification')
    } finally {
      setVerLoading(false)
    }
  }

  const handleValider = () => {
    if (!nom.trim()) { toast.error('Veuillez saisir votre nom'); return }
    if (!verifie)    { toast.error('Veuillez vérifier votre numéro WhatsApp'); return }
    navigate('/paiement', { state: { nom, numero, pseudo } })
  }

  return (
    <div className="page-enter">
      <div style={{ borderBottom: '1px solid var(--gold-border)', padding: '3rem 0 2rem' }}>
        <div className="container">
          <button onClick={() => navigate('/panier')} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: '1.5rem', padding: 0, cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <IconArrow size={13} direction="left" color="currentColor" />
            Retour au panier
          </button>
          <div className="section-label">Étape 2 / 3</div>
          <h1 style={{ fontSize: '2.2rem' }}>Vos informations</h1>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

            {/* FORMULAIRE */}
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '24px', color: 'var(--cream)' }}>
                Coordonnées
              </h3>

              {/* NOM */}
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Nom complet</label>
                <input
                  className="input"
                  placeholder="Votre nom et prénom"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                />
              </div>

              {/* WHATSAPP */}
              <div style={{ marginBottom: '8px' }}>
                <label className="input-label">Numéro WhatsApp</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="input"
                    placeholder="ex: 22890000000"
                    value={numero}
                    onChange={e => { setNumero(e.target.value); setVerifie(false); setPseudo('') }}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={handleVerifier}
                    disabled={verLoading}
                    className="btn btn-outline"
                    style={{ flexShrink: 0, opacity: verLoading ? 0.6 : 1 }}
                  >
                    {verLoading ? 'Vérif...' : 'Vérifier'}
                  </button>
                </div>
              </div>

              {/* RESULTAT VERIFICATION */}
              {verifie && pseudo && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(29,158,117,0.08)',
                  border: '1px solid rgba(29,158,117,0.25)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                  marginBottom: '8px',
                }}>
                  <IconCheck size={14} color="#1D9E75" />
                  <span style={{ fontSize: '13px', color: '#1D9E75' }}>
                    Vérifié — <strong>{pseudo}</strong>
                  </span>
                </div>
              )}

              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
                Vous recevrez vos reçus et notifications sur ce numéro WhatsApp.
              </p>

              <div style={{ marginTop: '28px' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleValider}
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Continuer vers le paiement'}
                  <IconArrow size={13} color="var(--dark)" />
                </button>
              </div>
            </div>

            {/* RECAP */}
            <div style={{ position: 'sticky', top: '80px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '14px', fontFamily: 'var(--font-serif)', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--gold-border)' }}>
                  Résumé
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--muted)' }}>{item.tableau.titre} ×{item.nbUnites}</span>
                    <span style={{ color: 'var(--cream)' }}>
                      {(Number(item.tableau.prix_unitaire) * item.nbUnites).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--gold-border)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>Acompte maintenant</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{avance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted)' }}>Solde à la livraison</span>
                    <span style={{ color: 'var(--cream)' }}>{avance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}