import { Link, useNavigate, useLocation } from 'react-router-dom'
import usePanierStore from '../../store/panierStore'
import IconPanier from '../icons/IconPanier'
import IconLogo from '../icons/IconLogo'

export default function Navbar() {
  const items    = usePanierStore(s => s.items)
  const navigate = useNavigate()
  const location = useLocation()
  const totalItems = items.reduce((a, i) => a + i.nbUnites, 0)

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background: 'rgba(26,26,46,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--gold-border)',
      position: 'sticky', top: 0, zIndex: 100,
      height: '64px', display: 'flex', alignItems: 'center',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', width: '100%',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconLogo size={36} />
          <div>
            <div style={{
              fontSize: '16px', fontWeight: 700, letterSpacing: '3px',
              color: 'var(--cream)', lineHeight: 1,
              fontFamily: 'var(--font-serif)',
            }}>GLO VISION</div>
            <div style={{
              fontSize: '8px', letterSpacing: '5px',
              color: 'var(--gold)', lineHeight: 1.6,
            }}>PHOTOGRAPHIE</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{
            fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
            color: isActive('/') ? 'var(--gold)' : 'var(--muted)',
            borderBottom: isActive('/') ? '1px solid var(--gold)' : '1px solid transparent',
            paddingBottom: '2px', transition: 'var(--transition)',
          }}>Catalogue</Link>

          <button
            onClick={() => navigate('/panier')}
            style={{
              position: 'relative', background: 'transparent',
              border: '1px solid var(--gold-border)',
              borderRadius: 'var(--radius-sm)',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gold-border)'}
          >
            <IconPanier size={16} color="var(--gold)" />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '-7px', right: '-7px',
                background: 'var(--gold)', color: 'var(--dark)',
                width: '18px', height: '18px', borderRadius: '50%',
                fontSize: '9px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}