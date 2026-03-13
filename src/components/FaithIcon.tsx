// FaithIcon — person silhouette with halo, gold gradient
// Replaces the word "Compass" in the Faith Compass brand mark

interface FaithIconProps {
  size?: number
  className?: string
}

export default function FaithIcon({ size = 28, className = '' }: FaithIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Faith Compass"
    >
      <defs>
        <linearGradient id="faithGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#F7E08A" />
          <stop offset="45%"  stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>

      {/* Halo — elliptical ring floating above head */}
      <ellipse
        cx="16"
        cy="5.5"
        rx="7.5"
        ry="2.5"
        stroke="url(#faithGold)"
        strokeWidth="2"
        fill="none"
      />

      {/* Head */}
      <circle cx="16" cy="14" r="5.5" fill="url(#faithGold)" />

      {/* Shoulders / body */}
      <path
        d="M2 36c0-7.732 6.268-14 14-14s14 6.268 14 14"
        fill="url(#faithGold)"
      />
    </svg>
  )
}
