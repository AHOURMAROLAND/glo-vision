import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer style={{
      borderTop: '1px solid var(--gold-border)',
      padding: '2rem 0',
      marginTop: '4rem',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--muted-2)' }}>
          © 2025 Glo Vision — Photographie professionnelle
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted-2)' }}>Lomé, Togo</span>

          {/* ICONE ADMIN DISCRET */}
          <button
            onClick={() => navigate('/admin/login')}
            title="Espace admin"
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px',
              opacity: 0.25, transition: 'opacity 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.25'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}