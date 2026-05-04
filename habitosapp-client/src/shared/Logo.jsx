export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="36" height="36" rx="10" fill="#aaff00" />
      <path
        d="M18 6C13 6 9 10 9 15C9 18.5 11 21.5 14 23V28C14 28.6 14.4 29 15 29H21C21.6 29 22 28.6 22 28V23C25 21.5 27 18.5 27 15C27 10 23 6 18 6Z"
        fill="#0a0a0a"
      />
      <rect x="15" y="24" width="6" height="1.5" rx="0.75" fill="#0a0a0a" />
      <rect x="15" y="26" width="6" height="1.5" rx="0.75" fill="#0a0a0a" />
    </svg>
  )
}