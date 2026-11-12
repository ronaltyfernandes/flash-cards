/** Símbolo: dois cartões empilhados com um raio. */
export function LogoMark({ size = 34, title }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      <rect
        x="10"
        y="12"
        width="34"
        height="44"
        rx="7"
        transform="rotate(-14 27 34)"
        className="fill-violet stroke-ink"
        strokeWidth="3.5"
      />
      <g transform="rotate(8 37 30)">
        <rect x="20" y="8" width="34" height="44" rx="7" className="fill-lime stroke-ink" strokeWidth="3.5" />
        <path d="M40 15 28 33h8l-3 12 13-18h-8z" className="fill-ink" />
      </g>
    </svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-2xl font-extrabold tracking-[-0.03em]">insane</span>
    </span>
  )
}
