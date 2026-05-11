export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#logoGradient)" />
      <path
        d="M18 6C13 6 9 10 9 15C9 18.5 11 21.5 14 23V28C14 28.6 14.4 29 15 29H21C21.6 29 22 28.6 22 28V23C25 21.5 27 18.5 27 15C27 10 23 6 18 6Z"
        fill="white"
      />
      <rect x="15" y="24" width="6" height="1.5" rx="0.75" fill="white" />
      <rect x="15" y="26" width="6" height="1.5" rx="0.75" fill="white" />
      {/* Estrella dorada pequeña */}
      <path
        d="M26 8L26.5 9.5L28 10L26.5 10.5L26 12L25.5 10.5L24 10L25.5 9.5L26 8Z"
        fill="url(#goldGradient)"
      />
    </svg>
  )
}