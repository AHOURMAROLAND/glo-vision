import { useNavigate } from 'react-router-dom'
import IconImage from '../icons/IconImage'
import IconArrow from '../icons/IconArrow'

export default function TableauCard({ tableau }) {
  const navigate = useNavigate()

  return (
    <div
      className="card"
      onClick={() => navigate(`/tableau/${tableau.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{
        position: 'relative', height: '240px',
        overflow: 'hidden', background: 'var(--dark-3)',
      }}>
        {tableau.image_principale ? (
          <img
            src={tableau.image_principale}
            alt={tableau.titre}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconImage size={48} color="var(--muted-2)" />
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,15,31,0.85) 0%, transparent 55%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '14px', left: '16px', right: '16px',
          fontSize: '1.2rem', fontFamily: 'var(--font-serif)',
          fontWeight: 600, color: 'var(--cream)',
        }}>{tableau.titre}</div>
      </div>

      <div style={{
        padding: '16px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '3px' }}>
            À partir de
          </div>
          <div style={{ fontSize: '20px', color: 'var(--gold)', fontWeight: 700 }}>
            {Number(tableau.prix_unitaire).toLocaleString('fr-FR')}
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' }}>FCFA</span>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '10px', color: 'var(--gold)',
          border: '1px solid var(--gold-border)',
          padding: '5px 10px', borderRadius: 'var(--radius-sm)',
          letterSpacing: '1px',
        }}>
          VOIR
          <IconArrow size={12} color="var(--gold)" />
        </div>
      </div>
    </div>
  )
}