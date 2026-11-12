import { cx } from '../lib/utils'
import { IconButton } from './Button'
import { TabBar } from './TabBar'

/**
 * Moldura de toda tela: uma coluna com largura de celular, centralizada.
 * tone="dark" é o modo foco (estudo). tabBar mostra a navegação inferior.
 */
export function Screen({ tone = 'light', tabBar = false, children }) {
  const dark = tone === 'dark'
  return (
    <div className={cx('min-h-dvh', dark ? 'tone-dark bg-[#0d0c13]' : 'bg-paper-deep')}>
      <div
        className={cx(
          'mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col sm:border-x-2',
          dark ? 'bg-ink text-paper sm:border-ink-line' : 'bg-paper text-ink sm:border-ink',
        )}
      >
        <main className="flex flex-1 flex-col gap-5 p-5">{children}</main>
        {tabBar ? <TabBar /> : null}
      </div>
    </div>
  )
}

/** Cabeçalho com botão de voltar, título e uma ação opcional à direita. */
export function PageHeader({ title, backTo, backLabel = 'Voltar', action }) {
  return (
    <header className="flex items-center gap-3">
      {backTo ? <IconButton icon="back" label={backLabel} to={backTo} /> : null}
      <h1 className="min-w-0 flex-1 font-display text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em] text-balance break-words">
        {title}
      </h1>
      {action}
    </header>
  )
}

/** Título de seção: "Seus baralhos" */
export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-[22px] leading-tight font-extrabold">{children}</h2>
      {action}
    </div>
  )
}
