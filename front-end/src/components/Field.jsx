import { cx } from '../lib/utils'

const CONTROL =
  'w-full min-w-0 rounded-btn border-2 border-ink bg-white text-base text-ink placeholder:text-graphite ' +
  'transition-shadow duration-75 focus:shadow-hard-violet focus-visible:outline-none'

/** Rótulo + campo + dica/erro. `aside` aparece à direita do rótulo (ex.: código do idioma). */
export function Field({ label, htmlFor, optional = false, aside, hint, error, children, className }) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
          {optional ? <span className="font-normal text-graphite"> (opcional)</span> : null}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] font-semibold text-ink">
          <span className="mr-1.5 rounded-md bg-coral px-1.5 py-0.5">!</span>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-graphite">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ className, ...props }) {
  return <input className={cx(CONTROL, 'h-13 px-4', className)} {...props} />
}

export function Textarea({ className, ...props }) {
  return <textarea className={cx(CONTROL, 'resize-none px-4 py-3 leading-snug', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cx(CONTROL, 'h-13 px-3', className)} {...props}>
      {children}
    </select>
  )
}

/** Alternador de duas ou mais opções: [Cartão | Questão] */
export function Segmented({ label, options, value, onChange, size = 'md' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-1 rounded-2xl border-2 border-ink bg-white p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              size === 'sm' ? 'h-9 rounded-[9px] border-2 px-2 text-sm' : 'h-11 rounded-[11px] border-2 text-[15px]',
              selected ? 'border-ink bg-ink font-bold text-lime' : 'border-transparent font-semibold text-graphite',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
