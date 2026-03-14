import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import IconLogo from '../components/icons/IconLogo'
import IconCheck from '../components/icons/IconCheck'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const navigate  = useNavigate()
  const login     = useAuthStore(s => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Remplissez tous les champs')
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Connexion réussie')
      navigate('/admin')
    } catch {
      toast.error('Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <IconLogo size={52} />
          </div>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', letterSpacing: '3px', color: 'var(--cream)' }}>
            GLO VISION
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '5px', color: 'var(--gold)', marginTop: '3px' }}>
            ESPACE ADMIN
          </div>
        </div>

        {/* CARD */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '6px' }}>
            Connexion
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
            Accès réservé à l'équipe Glo Vision
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">Nom d'utilisateur</label>
              <input
                className="input"
                type="text"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="input-label">Mot de passe</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '46px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Connexion...' : (
                <>
                  Se connecter
                  <IconCheck size={14} color="var(--dark)" />
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted-2)', marginTop: '1.5rem' }}>
          Accès non autorisé — usage strictement réservé
        </p>
      </div>
    </div>
  )
}