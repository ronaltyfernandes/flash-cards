import { cx } from '../lib/utils'

/**
 * Estado vazio com o motivo "pilha" da marca. `tone="dark"` para o modo foco.
 * Use `main` quando ele for o título principal da tela (vira <h1>).
 */
export function EmptyState({ title, children, action, tone = 'light', main = false }) {
  const dark = tone === 'dark'
  const Heading = main ? 'h1' : 'h2'
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
      <div aria-hidden="true" className="relative h-28 w-24">
        <div
          className={cx(
            'absolute inset-0 -rotate-[9deg] rounded-2xl border-2 bg-violet',
            dark ? 'border-paper' : 'border-ink',
          )}
        />
        <div
          className={cx(
            'absolute inset-0 translate-x-2 rotate-[5deg] rounded-2xl border-2 bg-lime',
            dark ? 'border-paper' : 'border-ink',
          )}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Heading className="font-display text-[26px] leading-tight font-extrabold tracking-[-0.02em]">{title}</Heading>
        <p className={cx('mx-auto max-w-xs text-[15px] leading-normal', dark ? 'text-fog' : 'text-graphite')}>
          {children}
        </p>
      </div>
      {action ? <div className="flex flex-col items-stretch gap-3">{action}</div> : null}
    </div>
  )
}
