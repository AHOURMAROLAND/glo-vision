import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCommande } from '../services/commandeService'
import IconCheck from '../components/icons/IconCheck'
import IconArrow from '../components/icons/IconArrow'

export default function CommandeSuccesPage() {
  const { code }    = useParams()
  const navigate    = useNavigate()
  const [commande, setCommande] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (code) {
      getCommande(code)
        .then(res => setCommande(res.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [code])

  return (
    <div className="page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>

          {/* ICONE SUCCES */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(29,158,117,0.1)',
            border: '2px solid rgba(29,158,117,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
          }}>
            <IconCheck size={32} color="#1D9E75" />
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '10px' }}>
            Commande confirmée !
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            Votre acompte a bien été reçu. Nous allons préparer votre tableau et vous contacter sur WhatsApp dès qu'il sera prêt.
          </p>

          {/* CODE COMMANDE */}
          {!loading && commande && (
            <div className="card" style={{ padding: '24px', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
                Détails de votre commande
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Code commande</span>
                  <span style={{
                    color: 'var(--gold)', fontWeight: 700, fontFamily: 'var(--font-sans)',
                    background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
                    padding: '2px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px',
                    letterSpacing: '2px',
                  }}>{commande.code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Tableau</span>
                  <span style={{ color: 'var(--cream)' }}>{commande.tableau?.titre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Client</span>
                  <span style={{ color: 'var(--cream)' }}>{commande.nom_client}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Acompte payé</span>
                  <span style={{ color: '#1D9E75', fontWeight: 600 }}>
                    {Number(commande.montant_avance).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Solde à la livraison</span>
                  <span style={{ color: 'var(--cream)' }}>
                    {Number(commande.montant_solde).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Statut</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 10px', borderRadius: '10px',
                    background: 'rgba(233,196,106,0.1)', color: '#E9C46A',
                    border: '1px solid rgba(233,196,106,0.3)',
                  }}>{commande.statut_display}</span>
                </div>
              </div>
            </div>
          )}

          {/* INFO WHATSAPP */}
          <div style={{
            background: 'rgba(196,150,58,0.05)',
            border: '1px solid var(--gold-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '2rem',
            fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7,
          }}>
            Vous recevrez un message WhatsApp avec votre reçu d'acompte. Conservez votre code commande — il vous sera demandé lors du retrait.
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Retour à l'accueil
            <IconArrow size={13} color="var(--dark)" />
          </button>
        </div>
      </div>
    </div>
  )
}