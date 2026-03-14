export default function IconLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect x="1" y="1" width="34" height="34" rx="4" stroke="#C4963A" strokeWidth="1.5"/>
      <rect x="7" y="7" width="22" height="22" rx="2" fill="#C4963A" fillOpacity="0.15"/>
      <circle cx="13" cy="14" r="3" stroke="#C4963A" strokeWidth="1.5"/>
      <path d="M7 26l6-7 5 5 4-4 7 6" stroke="#C4963A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}