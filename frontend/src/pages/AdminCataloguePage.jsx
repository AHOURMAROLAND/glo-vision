import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  getTableauxAdmin, creerTableau, updateTableau,
  supprimerTableau, ajouterRealisation, supprimerRealisation
} from '../services/catalogueService'
import IconClose from '../components/icons/IconClose'
import IconCheck from '../components/icons/IconCheck'
import IconImage from '../components/icons/IconImage'
import IconArrow from '../components/icons/IconArrow'
import IconUpload from '../components/icons/IconUpload'
import toast from 'react-hot-toast'

function ModalTableau({ tableau, onClose, onSave }) {
  const [titre, setTitre]         = useState(tableau?.titre || '')
  const [description, setDesc]    = useState(tableau?.description || '')
  const [prix, setPrix]           = useState(tableau?.prix_unitaire || '')
  const [image, setImage]         = useState(null)
  const [preview, setPreview]     = useState(tableau?.image_principale || '')
  const [loading, setLoading]     = useState(false)

  const onDrop = useCallback(files => {
    setImage(files[0])
    setPreview(URL.createObjectURL(files[0]))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false,
  })

  const handleSave = async () => {
    if (!titre || !prix) { toast.error('Titre et prix requis'); return }
    if (!tableau && !image) { toast.error('Image principale requise'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('titre', titre)
      fd.append('description', description)
      fd.append('prix_unitaire', prix)
      fd.append('disponible', true)
      if (image) fd.append('image_principale', image)

      if (tableau) {
        await updateTableau(tableau.id, fd)
        toast.success('Catégorie mise à jour !')
      } else {
        await creerTableau(fd)
        toast.success('Catégorie créée !')
      }
      onSave()
      onClose()
    } catch { toast.error('Erreur lors de la sauvegarde') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '2px' }}>
              {tableau ? 'Modifier' : 'Nouvelle catégorie'}
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', color: 'var(--cream)' }}>
              {tableau ? tableau.titre : 'Créer un modèle de tableau'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer' }}>
            <IconClose size={13} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Titre du modèle</label>
            <input className="input" placeholder="ex: Cadre Doré Classique" value={titre} onChange={e => setTitre(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input" placeholder="Description du modèle..." value={description} onChange={e => setDesc(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="input-label">Prix unitaire (FCFA)</label>
            <input className="input" type="number" placeholder="15000" value={prix} onChange={e => setPrix(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Image principale</label>
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`} style={{ padding: '1rem' }}>
              <input {...getInputProps()} />
              {preview ? (
                <div style={{ position: 'relative' }}>
                  <img src={preview} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'var(--transition)', borderRadius: 'var(--radius-sm)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  >
                    <span style={{ color: 'var(--cream)', fontSize: '12px' }}>Changer l'image</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <IconUpload size={24} color="var(--muted)" />
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
                    {isDragActive ? 'Déposez ici...' : 'Cliquez ou glissez une image'}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Sauvegarde...' : (tableau ? 'Mettre à jour' : 'Créer')}
              <IconCheck size={13} color="var(--dark)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PageRealisations({ tableau, onBack, onUpdate }) {
  const [photos, setPhotos]   = useState(tableau.realisations || [])
  const [loading, setLoading] = useState(false)
  const [newFile, setNewFile] = useState(null)
  const [newPreview, setNewPreview] = useState('')
  const [legende, setLegende] = useState('')

  const onDrop = useCallback(files => {
    setNewFile(files[0])
    setNewPreview(URL.createObjectURL(files[0]))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false,
  })

  const handleAjouter = async () => {
    if (!newFile) { toast.error('Sélectionnez une image'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', newFile)
      fd.append('legende', legende)
      const res = await ajouterRealisation(tableau.id, fd)
      setPhotos(prev => [...prev, res.data])
      setNewFile(null)
      setNewPreview('')
      setLegende('')
      toast.success('Photo ajoutée !')
      onUpdate()
    } catch { toast.error('Erreur ajout photo') }
    finally { setLoading(false) }
  }

  const handleSupprimer = async (photoId) => {
    if (!confirm('Supprimer cette photo ?')) return
    try {
      await supprimerRealisation(photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      toast.success('Photo supprimée')
      onUpdate()
    } catch { toast.error('Erreur suppression') }
  }

  return (
    <div className="page-enter">
      {/* HEADER */}
      <div style={{ borderBottom: '1px solid var(--gold-border)', padding: '2rem 2rem 1.5rem' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--muted)',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
          marginBottom: '1rem', padding: 0, cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <IconArrow size={13} direction="left" color="currentColor" />
          Retour aux catégories
        </button>
        <div className="section-label">Réalisations</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>{tableau.titre}</h2>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
          {photos.length} réalisation{photos.length > 1 ? 's' : ''} — {Number(tableau.prix_unitaire).toLocaleString('fr-FR')} FCFA / unité
        </div>
      </div>

      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

        {/* GALERIE */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>Photos existantes</div>
          {photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--gold-border)', borderRadius: 'var(--radius-lg)', color: 'var(--muted)' }}>
              <IconImage size={36} color="var(--muted-2)" />
              <p style={{ marginTop: '10px', fontSize: '13px' }}>Aucune réalisation pour ce modèle</p>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: '12px' }}>
              {photos.map(photo => (
                <div key={photo.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gold-border)' }}>
                  <div style={{ height: '180px', background: 'var(--dark-3)' }}>
                    {photo.image ? (
                      <img src={photo.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconImage size={32} color="var(--muted-2)" />
                      </div>
                    )}
                  </div>
                  {photo.legende && (
                    <div style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--muted)', background: 'var(--dark-2)' }}>{photo.legende}</div>
                  )}
                  <button onClick={() => handleSupprimer(photo.id)} style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(15,15,31,0.8)', border: '1px solid rgba(231,111,81,0.4)',
                    borderRadius: 'var(--radius-sm)', width: '26px', height: '26px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#E76F51', cursor: 'pointer',
                  }}>
                    <IconClose size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AJOUTER PHOTO */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Ajouter une réalisation
            </div>

            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`} style={{ padding: '1rem', marginBottom: '12px' }}>
              <input {...getInputProps()} />
              {newPreview ? (
                <img src={newPreview} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <IconUpload size={22} color="var(--muted)" />
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                    {isDragActive ? 'Déposez ici...' : 'Cliquez ou glissez'}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label className="input-label">Légende (optionnel)</label>
              <input className="input" placeholder="Description de la photo..." value={legende} onChange={e => setLegende(e.target.value)} />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAjouter} disabled={loading || !newFile}>
              {loading ? 'Ajout...' : 'Ajouter la photo'}
              <IconCheck size={13} color="var(--dark)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminCataloguePage() {
  const [tableaux, setTableaux]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)

  useEffect(() => { charger() }, [])

  const charger = () => {
    setLoading(true)
    getTableauxAdmin()
      .then(res => setTableaux(res.data.results || res.data))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  const handleSupprimer = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Supprimer cette catégorie ? Toutes ses réalisations seront supprimées.')) return
    try {
      await supprimerTableau(id)
      toast.success('Catégorie supprimée')
      charger()
    } catch { toast.error('Erreur suppression') }
  }

  if (selected) return (
    <PageRealisations
      tableau={selected}
      onBack={() => setSelected(null)}
      onUpdate={charger}
    />
  )

  return (
    <div className="page-enter" style={{ padding: '2rem' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div className="section-label">Gestion</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Catalogue</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            {tableaux.length} catégorie{tableaux.length > 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('creer')}>
          Nouvelle catégorie
          <IconCheck size={13} color="var(--dark)" />
        </button>
      </div>

      {/* GRILLE */}
      {loading ? (
        <div className="grid-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : tableaux.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed var(--gold-border)', borderRadius: 'var(--radius-lg)' }}>
          <IconImage size={48} color="var(--muted-2)" />
          <p style={{ color: 'var(--muted)', margin: '1rem 0 1.5rem', fontSize: '14px' }}>Aucune catégorie créée</p>
          <button className="btn btn-primary" onClick={() => setModal('creer')}>
            Créer ma première catégorie
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {tableaux.map(t => (
            <div key={t.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(t)}>
              <div style={{ position: 'relative', height: '200px', background: 'var(--dark-3)', overflow: 'hidden' }}>
                {t.image_principale ? (
                  <img src={t.image_principale} alt={t.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconImage size={40} color="var(--muted-2)" />
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,15,31,0.8) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', color: 'var(--gold)', border: '1px solid var(--gold-border)', padding: '2px 8px', borderRadius: '10px', background: 'rgba(15,15,31,0.7)' }}>
                    {t.realisations?.length || 0} photos
                  </span>
                  <span style={{ fontSize: '10px', color: t.disponible ? '#1D9E75' : '#E76F51', border: `1px solid ${t.disponible ? 'rgba(29,158,117,0.4)' : 'rgba(231,111,81,0.4)'}`, padding: '2px 8px', borderRadius: '10px', background: 'rgba(15,15,31,0.7)' }}>
                    {t.disponible ? 'Visible' : 'Masqué'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '4px' }}>{t.titre}</div>
                <div style={{ fontSize: '16px', color: 'var(--gold)', fontWeight: 700, marginBottom: '12px' }}>
                  {Number(t.prix_unitaire).toLocaleString('fr-FR')} <span style={{ fontSize: '10px', color: 'var(--muted)' }}>FCFA</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={e => { e.stopPropagation(); setModal(t) }}
                    style={{ flex: 1, background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-sm)', padding: '7px', fontSize: '11px', color: 'var(--gold)', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={e => handleSupprimer(t.id, e)}
                    style={{ width: '36px', background: 'rgba(231,111,81,0.08)', border: '1px solid rgba(231,111,81,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E76F51', cursor: 'pointer' }}
                  >
                    <IconClose size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ModalTableau
          tableau={modal === 'creer' ? null : modal}
          onClose={() => setModal(null)}
          onSave={charger}
        />
      )}
    </div>
  )
}
