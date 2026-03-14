import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getCommandesAdmin, updateStatut, genererQR, validerQR } from '../services/commandeService'
import { telechargerPhotos } from '../services/commandeService'
import IconLogo from '../components/icons/IconLogo'
import IconCheck from '../components/icons/IconCheck'
import IconClose from '../components/icons/IconClose'
import IconArrow from '../components/icons/IconArrow'
import IconImage from '../components/icons/IconImage'
import toast from 'react-hot-toast'
import AdminCataloguePage from './AdminCataloguePage'

const STATUTS = [
  { val: '',               label: 'Toutes' },
  { val: 'EN_ATTENTE',     label: 'En attente' },
  { val: 'PAYEE_AVANCE',   label: 'Payée' },
  { val: 'EN_PRODUCTION',  label: 'En production' },
  { val: 'PRETE',          label: 'Prête' },
  { val: 'RETRAIT_EN_COURS', label: 'Retrait' },
  { val: 'SOLDEE',         label: 'Soldée' },
  { val: 'ANNULEE',        label: 'Annulée' },
]

const BADGE_COLORS = {
  EN_ATTENTE:      { bg: 'rgba(139,115,85,0.15)',  color: '#8B7355',  border: 'rgba(139,115,85,0.3)'  },
  PAYEE_AVANCE:    { bg: 'rgba(233,196,106,0.15)', color: '#E9C46A',  border: 'rgba(233,196,106,0.3)' },
  EN_PRODUCTION:   { bg: 'rgba(55,138,221,0.15)',  color: '#378ADD',  border: 'rgba(55,138,221,0.3)'  },
  PRETE:           { bg: 'rgba(29,158,117,0.15)',  color: '#1D9E75',  border: 'rgba(29,158,117,0.3)'  },
  RETRAIT_EN_COURS:{ bg: 'rgba(196,150,58,0.15)',  color: '#C4963A',  border: 'rgba(196,150,58,0.3)'  },
  SOLDEE:          { bg: 'rgba(29,158,117,0.2)',   color: '#1D9E75',  border: 'rgba(29,158,117,0.4)'  },
  ANNULEE:         { bg: 'rgba(231,111,81,0.15)',  color: '#E76F51',  border: 'rgba(231,111,81,0.3)'  },
}

function BadgeStatut({ statut, label }) {
  const c = BADGE_COLORS[statut] || BADGE_COLORS.EN_ATTENTE
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, letterSpacing: '1px',
      textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>{label || statut}</span>
  )
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const logout    = useAuthStore(s => s.logout)
  const isAdmin   = useAuthStore(s => s.isAdmin)

  const [onglet, setOnglet]         = useState('commandes')
  const [commandes, setCommandes]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [filtre, setFiltre]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [notifications, setNotifs]  = useState([])
  const [qrModal, setQrModal]       = useState(null)
  const [scanMode, setScanMode]     = useState(false)
  const [scanInput, setScanInput]   = useState('')
  const wsRef = useRef(null)

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return }
    chargerCommandes()
    connecterWS()
    return () => wsRef.current?.close()
  }, [])

  useEffect(() => { chargerCommandes() }, [filtre])

  const chargerCommandes = () => {
    setLoading(true)
    getCommandesAdmin(filtre)
      .then(res => setCommandes(res.data.results || res.data))
      .catch(() => toast.error('Erreur chargement commandes'))
      .finally(() => setLoading(false))
  }

  const connecterWS = () => {
    const ws = new WebSocket(
      (import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws') + '/notifications/'
    )
    ws.onmessage = e => {
      const data = JSON.parse(e.data)
      setNotifs(prev => [data, ...prev.slice(0, 9)])
      if (data.type === 'nouvelle_commande') {
        toast(`Nouvelle commande — ${data.client}`, { icon: '🔔' })
        chargerCommandes()
      } else if (data.type === 'statut_change') {
        chargerCommandes()
      }
    }
    wsRef.current = ws
  }

  const handleStatut = async (code, statut) => {
    try {
      await updateStatut(code, statut)
      toast.success('Statut mis à jour')
      chargerCommandes()
      if (selected?.code === code) {
        setSelected(prev => ({ ...prev, statut }))
      }
    } catch { toast.error('Erreur mise à jour') }
  }

  const handleGenererQR = async (code) => {
    try {
      await handleStatut(code, 'PRETE')
      const res = await genererQR(code)
      setQrModal({ code, qr_image: res.data.qr_image, token: res.data.token })
      toast.success('QR code généré et envoyé au client !')
    } catch { toast.error('Erreur génération QR') }
  }

  const handleScanQR = async () => {
    if (!scanInput.trim()) { toast.error('Entrez le token QR'); return }
    try {
      const res = await validerQR(scanInput.trim())
      if (res.data.valide) {
        toast.success(`Commande ${res.data.commande_code} clôturée !`)
        setScanMode(false)
        setScanInput('')
        chargerCommandes()
      } else {
        toast.error('QR code invalide ou expiré')
      }
    } catch { toast.error('Erreur validation QR') }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const stats = {
    total:       commandes.length,
    enAttente:   commandes.filter(c => c.statut === 'EN_ATTENTE').length,
    enProd:      commandes.filter(c => c.statut === 'EN_PRODUCTION').length,
    pretes:      commandes.filter(c => c.statut === 'PRETE').length,
    soldees:     commandes.filter(c => c.statut === 'SOLDEE').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <div style={{
        background: 'rgba(15,15,31,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gold-border)',
        height: '60px', display: 'flex', alignItems: 'center',
        padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <IconLogo size={32} />
          <div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-serif)', letterSpacing: '2px', color: 'var(--cream)', lineHeight: 1 }}>GLO VISION</div>
            <div style={{ fontSize: '8px', letterSpacing: '4px', color: 'var(--gold)', lineHeight: 1.4 }}>DASHBOARD ADMIN</div>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginLeft: '2rem' }}>
            {[
              { val: 'commandes', label: 'Commandes' },
              { val: 'catalogue', label: 'Catalogue' },
            ].map(o => (
              <button key={o.val} onClick={() => setOnglet(o.val)} style={{
                background: onglet === o.val ? 'var(--gold-dim)' : 'none',
                border: onglet === o.val ? '1px solid var(--gold-border)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)', padding: '5px 14px',
                fontSize: '12px', color: onglet === o.val ? 'var(--gold)' : 'var(--muted)',
                cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
                transition: 'var(--transition)',
              }}>{o.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {notifications.length > 0 && (
            <div style={{
              background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
              borderRadius: '20px', padding: '3px 10px',
              fontSize: '11px', color: 'var(--gold)',
            }}>
              {notifications.length} notif{notifications.length > 1 ? 's' : ''}
            </div>
          )}
          <button
            onClick={() => setScanMode(true)}
            className="btn btn-outline"
            style={{ fontSize: '11px', padding: '7px 14px' }}
          >
            Scanner QR
          </button>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: '11px', padding: '7px 14px' }}>
            Déconnexion
          </button>
        </div>
      </div>

      {onglet === 'catalogue' ? (
        <AdminCataloguePage />
      ) : (
        <div style={{ display: 'flex', flex: 1 }}>

          {/* SIDEBAR */}
          <div style={{
            width: '220px', flexShrink: 0,
            borderRight: '1px solid var(--gold-border)',
            padding: '1.5rem 0',
          }}>
            <div style={{ padding: '0 16px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Filtrer
              </div>
              {STATUTS.map(s => (
                <button key={s.val} onClick={() => setFiltre(s.val)} style={{
                  width: '100%', textAlign: 'left', background: filtre === s.val ? 'var(--gold-dim)' : 'none',
                  border: 'none', borderLeft: filtre === s.val ? '2px solid var(--gold)' : '2px solid transparent',
                  padding: '8px 12px', fontSize: '13px',
                  color: filtre === s.val ? 'var(--gold)' : 'var(--muted)',
                  cursor: 'pointer', borderRadius: '0 4px 4px 0',
                  transition: 'var(--transition)',
                }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* STATS SIDEBAR */}
            <div style={{ borderTop: '1px solid var(--gold-border)', padding: '1rem 16px', marginTop: '1rem' }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Stats</div>
              {[
                { label: 'Total', val: stats.total, color: 'var(--cream)' },
                { label: 'En attente', val: stats.enAttente, color: '#8B7355' },
                { label: 'En production', val: stats.enProd, color: '#378ADD' },
                { label: 'Prêtes', val: stats.pretes, color: '#1D9E75' },
                { label: 'Soldées', val: stats.soldees, color: 'var(--gold)' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LISTE COMMANDES */}
          <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>
                Commandes
                {filtre && <span style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: '10px', fontFamily: 'var(--font-sans)' }}>— {STATUTS.find(s => s.val === filtre)?.label}</span>}
              </h2>
              <button onClick={chargerCommandes} className="btn btn-ghost" style={{ fontSize: '11px', padding: '6px 12px' }}>
                Actualiser
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
            ) : commandes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
                Aucune commande
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {commandes.map(cmd => (
                  <div key={cmd.code}
                    onClick={() => setSelected(cmd)}
                    style={{
                      background: selected?.code === cmd.code ? 'rgba(196,150,58,0.06)' : 'var(--dark-2)',
                      border: `1px solid ${selected?.code === cmd.code ? 'rgba(196,150,58,0.4)' : 'var(--gold-border)'}`,
                      borderRadius: 'var(--radius-md)', padding: '14px 18px',
                      cursor: 'pointer', transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', gap: '16px',
                    }}
                    onMouseEnter={e => { if (selected?.code !== cmd.code) e.currentTarget.style.borderColor = 'rgba(196,150,58,0.3)' }}
                    onMouseLeave={e => { if (selected?.code !== cmd.code) e.currentTarget.style.borderColor = 'var(--gold-border)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '1px' }}>{cmd.code}</span>
                        <BadgeStatut statut={cmd.statut} label={cmd.statut_display} />
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--cream)', fontFamily: 'var(--font-serif)' }}>{cmd.nom_client}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        {cmd.tableau?.titre} · {cmd.nb_unites} unité{cmd.nb_unites > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '16px', color: 'var(--gold)', fontWeight: 700 }}>
                        {Number(cmd.montant_total).toLocaleString('fr-FR')}
                        <span style={{ fontSize: '10px', color: 'var(--muted)', marginLeft: '3px' }}>FCFA</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                        {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <IconArrow size={14} color="var(--muted)" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETAIL COMMANDE */}
          {selected && (
            <div style={{
              width: '340px', flexShrink: 0,
              borderLeft: '1px solid var(--gold-border)',
              padding: '1.5rem', overflow: 'auto',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div className="section-label">Détail</div>
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: '1px solid var(--gold-border)',
                  borderRadius: 'var(--radius-sm)', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--muted)', cursor: 'pointer',
                }}>
                  <IconClose size={12} />
                </button>
              </div>

              {/* CODE + STATUT */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '2px', marginBottom: '6px' }}>
                  {selected.code}
                </div>
                <BadgeStatut statut={selected.statut} label={selected.statut_display} />
              </div>

              {/* INFOS CLIENT */}
              <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Client</div>
                {[
                  { label: 'Nom', val: selected.nom_client },
                  { label: 'WhatsApp', val: selected.numero_whatsapp },
                  { label: 'Tableau', val: selected.tableau?.titre },
                  { label: 'Unités', val: selected.nb_unites },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                    <span style={{ color: 'var(--cream)', fontWeight: 500 }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* MONTANTS */}
              <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Paiement</div>
                {[
                  { label: 'Total', val: `${Number(selected.montant_total).toLocaleString('fr-FR')} FCFA`, color: 'var(--cream)' },
                  { label: 'Acompte', val: `${Number(selected.montant_avance).toLocaleString('fr-FR')} FCFA`, color: '#1D9E75' },
                  { label: 'Solde', val: `${Number(selected.montant_solde).toLocaleString('fr-FR')} FCFA`, color: 'var(--gold)' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                    <span style={{ color: r.color, fontWeight: 600 }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* PHOTOS CLIENT */}
              {selected.photos?.length > 0 && (
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                      Photos ({selected.photos.length})
                    </div>
                    <button
                      onClick={() => telechargerPhotos(selected.code)}
                      style={{
                        background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
                        borderRadius: 'var(--radius-sm)', padding: '3px 10px',
                        fontSize: '10px', color: 'var(--gold)', cursor: 'pointer',
                        letterSpacing: '1px', textTransform: 'uppercase',
                      }}
                    >
                      Télécharger ZIP
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {selected.photos.map((p, i) => (
                      <div key={i} style={{
                        height: '72px', background: 'var(--dark-3)',
                        borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                        border: '1px solid var(--gold-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {p.image ? (
                          <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <IconImage size={20} color="var(--muted-2)" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIONS STATUT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selected.statut === 'PAYEE_AVANCE' && (
                  <button className="btn btn-outline" style={{ justifyContent: 'center' }}
                    onClick={() => handleStatut(selected.code, 'EN_PRODUCTION')}>
                    Démarrer production
                    <IconArrow size={13} color="currentColor" />
                  </button>
                )}
                {selected.statut === 'EN_PRODUCTION' && (
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }}
                    onClick={() => handleGenererQR(selected.code)}>
                    Tableau prêt — Générer QR
                    <IconCheck size={13} color="var(--dark)" />
                  </button>
                )}
                {selected.statut !== 'SOLDEE' && selected.statut !== 'ANNULEE' && (
                  <button style={{
                    background: 'rgba(231,111,81,0.08)', border: '1px solid rgba(231,111,81,0.25)',
                    borderRadius: 'var(--radius-sm)', padding: '9px', fontSize: '12px',
                    color: '#E76F51', cursor: 'pointer', letterSpacing: '1px',
                    textTransform: 'uppercase', transition: 'var(--transition)',
                  }}
                    onClick={() => handleStatut(selected.code, 'ANNULEE')}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,111,81,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(231,111,81,0.08)'}
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL QR CODE GENERE */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="section-label">QR Code généré</div>
              <button onClick={() => setQrModal(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <IconClose size={14} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                Ce QR code a été envoyé au client par WhatsApp. Scannez-le lors du retrait.
              </p>
              {qrModal.qr_image && (
                <img src={qrModal.qr_image} alt="QR" style={{ width: '180px', height: '180px', margin: '0 auto', display: 'block', borderRadius: 'var(--radius-md)' }} />
              )}
              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--gold)', letterSpacing: '2px' }}>
                {qrModal.code}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SCAN QR */}
      {scanMode && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setScanMode(false)}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="section-label" style={{ marginBottom: '2px' }}>Scanner QR</div>
                <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)' }}>Valider un retrait</div>
              </div>
              <button onClick={() => setScanMode(false)} style={{ background: 'none', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer' }}>
                <IconClose size={13} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                Entrez le token du QR code présenté par le client (ou scannez avec un lecteur QR externe).
              </p>
              <label className="input-label">Token QR</label>
              <input
                className="input"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                style={{ marginBottom: '16px', fontFamily: 'monospace', fontSize: '12px' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-ghost" onClick={() => setScanMode(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleScanQR} style={{ flex: 1, justifyContent: 'center' }}>
                  Valider
                  <IconCheck size={13} color="var(--dark)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}