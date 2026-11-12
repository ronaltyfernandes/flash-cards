import { cx } from '../lib/utils'

const TONES = {
  light: 'border-ink bg-white text-ink',
  paper: 'border-ink bg-paper text-ink',
  dark: 'border-ink-line bg-transparent text-fog',
}

/**
 * Etiqueta do assunto de um baralho.
 * Idiomas: código em mono ("EN → PT"), sem bandeiras (idioma não é país).
 * Outros assuntos: texto normal.
 */
export function DeckChip({ deck, tone = 'light', suffix, className }) {
  const isLanguage = deck.kind === 'language'
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border-2 px-2.5 py-1 text-[13px] leading-tight',
        isLanguage ? 'font-mono font-medium' : 'font-semibold',
        TONES[tone],
        className,
      )}
    >
      {isLanguage ? `${deck.from} → ${deck.to}` : deck.name}
      {suffix ? ` · ${suffix}` : null}
    </span>
  )
}

/** Código pequeno de idioma ao lado de um campo: "EN" */
export function CodeChip({ children }) {
  return (
    <span className="rounded-full border-2 border-ink bg-white px-2 py-0.5 font-mono text-xs">{children}</span>
  )
}

/** Rótulo em caixa alta, tinta com texto lima. */
export function TagChip({ children }) {
  return (
    <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-lime uppercase">
      {children}
    </span>
  )
}
