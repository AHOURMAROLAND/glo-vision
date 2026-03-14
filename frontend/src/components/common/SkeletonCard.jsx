export default function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <div className="skeleton" style={{ height: '240px' }} />
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton" style={{ height: '10px', width: '40%' }} />
        <div className="skeleton" style={{ height: '16px', width: '75%' }} />
        <div className="skeleton" style={{ height: '22px', width: '35%' }} />
      </div>
    </div>
  )
}