import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import usePanierStore from '../../store/panierStore'
import IconClose from '../icons/IconClose'
import IconUpload from '../icons/IconUpload'
import IconCheck from '../icons/IconCheck'
import toast from 'react-hot-toast'

export default function ModalCommande({ tableau, onClose }) {
  const [nbUnites, setNbUnites] = useState(1)
  const [photos, setPhotos]     = useState([])
  const ajouterItem = usePanierStore(s => s.ajouterItem)
  const navigate    = useNavigate()

  const prix   = Number(tableau.prix_unitaire) * nbUnites
  const avance = prix / 2

  const onDrop = useCallback(files => setPhotos(p => [...p, ...files]), [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  })

  const handleAjouter = () => {
    if (photos.length === 0) {
      toast.error('Veuillez uploader au moins une photo')
      return
    }
    ajouterItem(tableau, nbUnites, photos)
    toast.success('Ajouté au panier !')
    onClose()
    navigate('/panier')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">

        {/* HEADER */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--gold-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div className="section-label" style={{ marginBottom: '2px' }}>Commander</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--cream)' }}>
              {tableau.titre}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid var(--gold-border)',
            borderRadius: 'var(--radius-sm)', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            <IconClose size={14} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* QUANTITE */}
          <div>
            <label className="input-label">Nombre d'unités</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => setNbUnites(n => Math.max(1, n - 1))} style={{
                  width: '40px', height: '40px', background: 'var(--dark-3)',
                  border: '1px solid var(--gold-border)', borderRight: 'none',
                  borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                  color: 'var(--gold)', fontSize: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)',
                }}>−</button>
                <div style={{
                  width: '56px', height: '40px', background: 'var(--dark-3)',
                  border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 600, color: 'var(--cream)',
                }}>{nbUnites}</div>
                <button onClick={() => setNbUnites(n => n + 1)} style={{
                  width: '40px', height: '40px', background: 'var(--dark-3)',
                  border: '1px solid var(--gold-border)', borderLeft: 'none',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  color: 'var(--gold)', fontSize: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)',
                }}>+</button>
              </div>

              <div>
                <div style={{ fontSize: '26px', color: 'var(--gold)', fontWeight: 700, lineHeight: 1 }}>
                  {prix.toLocaleString('fr-FR')}
                  <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '5px' }}>FCFA</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
                  Acompte 50% : <span style={{ color: 'var(--cream)' }}>{avance.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* UPLOAD */}
          <div>
            <label className="input-label">
              Vos photos
              {photos.length > 0 && (
                <span style={{ color: 'var(--gold)', marginLeft: '8px' }}>
                  {photos.length} sélectionnée{photos.length > 1 ? 's' : ''}
                </span>
              )}
            </label>
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <IconUpload size={28} color={isDragActive ? 'var(--gold)' : 'var(--muted)'} />
              <div style={{ marginTop: '10px', fontSize: '13px', color: isDragActive ? 'var(--gold)' : 'var(--muted)' }}>
                {isDragActive ? 'Déposez ici...' : 'Glissez vos photos ou cliquez pour parcourir'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted-2)', marginTop: '4px' }}>
                JPG, PNG, WEBP — qualité originale conservée
              </div>
            </div>

            {photos.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {photos.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: 'var(--dark-3)', border: '1px solid var(--gold-border)',
                    borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                  }}>
                    <IconCheck size={11} color="var(--gold)" />
                    <span style={{
                      fontSize: '11px', color: 'var(--cream)',
                      maxWidth: '120px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{f.name}</span>
                    <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} style={{
                      background: 'none', border: 'none',
                      color: 'var(--muted)', padding: 0, marginLeft: '2px',
                      display: 'flex', cursor: 'pointer',
                    }}>
                      <IconClose size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAjouter}>
              Ajouter au panier
              <IconCheck size={14} color="var(--dark)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}