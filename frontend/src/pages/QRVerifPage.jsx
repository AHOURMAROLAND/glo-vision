import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import IconCheck from '../components/icons/IconCheck'
import IconClose from '../components/icons/IconClose'
import IconLogo from '../components/icons/IconLogo'
import api from '../services/api'
import QRCode from 'qrcode'

export default function QRVerifPage() {
  const { token }   = useParams()
  const [data, setData]     = useState(null)
  const [qrImage, setQrImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [valide, setValide]   = useState(false)

  useEffect(() => {
    api.get(`/qrcodes/verifier/${token}/`)
      .then(res => {
        setData(res.data)
        setValide(res.data.valide)
        if (res.data.valide) {
          QRCode.toDataURL(window.location.href, { width: 220, margin: 2, color: { dark: '#C4963A', light: '#0F0F1F' } })
            .then(url => setQrImage(url))
        }
      })
      .catch(() => setValide(false))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '220px', height: '220px', borderRadius: 'var(--radius-md)', margin: '0 auto' }} />
        <div className="skeleton" style={{ width: '140px', height: '14px', margin: '16px auto 0', borderRadius: '4px' }} />
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--dark)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <IconLogo size={48} />
      </div>

      {valide ? (
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          {/* QR IMAGE */}
          {qrImage && (
            <div style={{
              background: '#0F0F1F', border: '2px solid var(--gold)',
              borderRadius: 'var(--radius-lg)', padding: '16px',
              display: 'inline-block', marginBottom: '1.5rem',
            }}>
              <img src={qrImage} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            justifyContent: 'center', marginBottom: '8px',
          }}>
            <IconCheck size={16} color="#1D9E75" />
            <span style={{ fontSize: '16px', color: '#1D9E75', fontWeight: 600 }}>Code valide</span>
          </div>

          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '6px' }}>
            {data?.nom_client}
          </div>
          <div style={{
            fontSize: '13px', color: 'var(--gold)',
            background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
            padding: '4px 14px', borderRadius: '20px', display: 'inline-block',
            letterSpacing: '2px', marginBottom: '1.5rem',
          }}>
            {data?.commande_code}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Présentez ce code à l'admin pour finaliser votre retrait.
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(231,111,81,0.1)', border: '1px solid rgba(231,111,81,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <IconClose size={28} color="#E76F51" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Code invalide</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Ce QR code est expiré, déjà utilisé ou invalide.
          </p>
        </div>
      )}
    </div>
  )
}