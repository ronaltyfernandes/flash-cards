import { cx } from '../lib/utils'

const TONES = {
  light: { track: 'border-ink bg-paper-deep', fill: 'bg-lime', edge: 'border-r-2 border-ink' },
  violet: { track: 'border-ink bg-paper-deep', fill: 'bg-violet', edge: '' },
  dark: { track: 'border-ink-line bg-ink-muted', fill: 'bg-lime', edge: '' },
}

/** Barra de progresso. `value` vai de 0 a 100. */
export function ProgressBar({ value, label, tone = 'light', className }) {
  const percent = Math.max(0, Math.min(100, value))
  const { track, fill, edge } = TONES[tone]
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('h-3 overflow-hidden rounded-full border-2', track, className)}
    >
      <div
        className={cx(
          'h-full transition-[width] duration-300 motion-reduce:transition-none',
          fill,
          percent > 0 && percent < 100 && edge,
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
