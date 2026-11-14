import { cx } from '../lib/utils'

const TONES = {
  light: 'border-ink bg-white text-ink shadow-[0_2px_0_var(--color-ink)]',
  flat: 'border-ink bg-white text-ink',
  dark: 'border-mist bg-transparent text-fog',
  inverse: 'border-paper bg-transparent text-paper',
}

/**
 * Tecla de atalho ao lado da ação: <Kbd>N</Kbd>.
 * Só aparece no desktop (lg), onde existe teclado. Leitores de tela usam `aria-keyshortcuts`.
 */
export function Kbd({ children, tone = 'light', className }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'hidden h-6 min-w-6 shrink-0 items-center justify-center rounded-[7px] border-2 px-1.5 font-mono text-xs font-medium lg:inline-flex',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
