export default function IconArrow({ size = 20, color = 'currentColor', direction = 'right' }) {
  const rotate = { right: 0, left: 180, up: -90, down: 90 }[direction]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: `rotate(${rotate}deg)`, display: 'block' }}>
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}