import { useEffect, useState } from 'react'
import { getStats } from '../services/commandeService'

const STATUT_LABELS = {
  EN_ATTENTE: 'En attente',
  PAYEE_AVANCE: 'Payée',
  EN_PRODUCTION: 'En production',
  PRETE: 'Prête',
  RETRAIT_EN_COURS: 'Retrait',
  SOLDEE: 'Soldée',
  ANNULEE: 'Annulée',
}

const STATUT_COLORS = {
  EN_ATTENTE:      '#8B7355',
  PAYEE_AVANCE:    '#E9C46A',
  EN_PRODUCTION:   '#378ADD',
  PRETE:           '#1D9E75',
  RETRAIT_EN_COURS:'#C4963A',
  SOLDEE:          '#2A9D8F',
  ANNULEE:         '#E76F51',
}

function MiniBarChart({ data, valueKey, labelKey, color = '#C4963A', height = 120 }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${height}px` }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100
        const date = new Date(d[labelKey])
        const label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '10px', color: '#C4963A', fontWeight: 600 }}>
              {d[valueKey] > 0 ? d[valueKey] : ''}
            </div>
            <div style={{
              width: '100%', background: color,
              height: `${Math.max(pct, d[valueKey] > 0 ? 8 : 2)}%`,
              borderRadius: '3px 3px 0 0', opacity: d[valueKey] > 0 ? 1 : 0.2,
              transition: 'height 0.5s ease',
            }} />
            <div style={{ fontSize: '9px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ data }) {
  const total = data.reduce((a, d) => a + d.count, 0)
  if (total === 0) return <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', padding: '2rem' }}>Aucune donnée</div>

  let cumul = 0
  const segments = data.map(d => {
    const pct    = (d.count / total) * 100
    const start  = cumul
    cumul       += pct
    return { ...d, pct, start }
  })

  const size  = 120
  const r     = 45
  const cx    = size / 2
  const cy    = size / 2
  const circ  = 2 * Math.PI * r

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {segments.map((s, i) => {
          const dashArr    = (s.pct / 100) * circ
          const dashOffset = circ - (s.start / 100) * circ
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none"
              stroke={STATUT_COLORS[s.statut] || '#888'}
              strokeWidth="20"
              strokeDasharray={`${dashArr} ${circ - dashArr}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'all 0.5s ease' }}
            />
          )
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--cream)" fontSize="18" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#8B7355" fontSize="9">total</text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUT_COLORS[s.statut] || '#888', flexShrink: 0 }} />
            <span style={{ color: 'var(--muted)', flex: 1 }}>{STATUT_LABELS[s.statut] || s.statut}</span>
            <span style={{ color: 'var(--cream)', fontWeight: 600 }}>{s.count}</span>
            <span style={{ color: 'var(--muted-2)', minWidth: '30px', textAlign: 'right' }}>{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminStatsPage() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  )

  if (!stats) return null

  const { kpis, visiteurs_7j, commandes_7j, commandes_statut } = stats

  return (
    <div className="page-enter" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* HEADER */}
      <div>
        <div className="section-label">Vue d'ensemble</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Statistiques</h2>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Visiteurs aujourd\'hui', val: kpis.visiteurs_aujourdhui, color: '#378ADD', sub: 'visiteurs uniques' },
          { label: 'Commandes aujourd\'hui', val: kpis.commandes_aujourdhui, color: '#C4963A', sub: 'nouvelles commandes' },
          { label: 'Total commandes', val: kpis.total_commandes, color: '#1D9E75', sub: 'depuis le début' },
          { label: 'Total encaissé', val: `${Number(kpis.total_encaisse).toLocaleString('fr-FR')}`, color: '#C4963A', sub: 'FCFA reçus' },
          { label: 'Avances reçues', val: `${Number(kpis.avances).toLocaleString('fr-FR')}`, color: '#E9C46A', sub: 'FCFA acomptes' },
          { label: 'Soldes reçus', val: `${Number(kpis.soldes).toLocaleString('fr-FR')}`, color: '#2A9D8F', sub: 'FCFA soldes' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{k.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: k.color, lineHeight: 1, fontFamily: 'var(--font-sans)' }}>{k.val}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted-2)', marginTop: '4px' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* GRAPHIQUES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* VISITEURS 7J */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div className="section-label" style={{ marginBottom: '2px' }}>Visiteurs</div>
            <div style={{ fontSize: '15px', fontFamily: 'var(--font-serif)', color: 'var(--cream)' }}>7 derniers jours</div>
          </div>
          <MiniBarChart
            data={visiteurs_7j}
            valueKey="uniques"
            labelKey="date"
            color="#378ADD"
            height={130}
          />
        </div>

        {/* COMMANDES 7J */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div className="section-label" style={{ marginBottom: '2px' }}>Commandes</div>
            <div style={{ fontSize: '15px', fontFamily: 'var(--font-serif)', color: 'var(--cream)' }}>7 derniers jours</div>
          </div>
          <MiniBarChart
            data={commandes_7j}
            valueKey="count"
            labelKey="date"
            color="#C4963A"
            height={130}
          />
        </div>
      </div>

      {/* REPARTITION STATUTS */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div className="section-label" style={{ marginBottom: '2px' }}>Répartition</div>
          <div style={{ fontSize: '15px', fontFamily: 'var(--font-serif)', color: 'var(--cream)' }}>Commandes par statut</div>
        </div>
        <DonutChart data={commandes_statut} />
      </div>

    </div>
  )
}
