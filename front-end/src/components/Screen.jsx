import { cx } from '../lib/utils'
import { IconButton } from './Button'
import { SideNav } from './SideNav'
import { TabBar } from './TabBar'

const WIDTHS = {
  // Listas e painéis: até 1200px no desktop
  wide: 'max-w-[1200px]',
  // Formulários: uma coluna confortável
  narrow: 'max-w-[40rem]',
  // Formulário com prévia: uma coluna; no desktop ganha espaço para a prévia ao lado
  split: 'max-w-[40rem] lg:max-w-[72rem]',
}

/**
 * Moldura de toda tela.
 *  - Celular (até 639px): uma coluna; `tabBar` mostra a barra inferior.
 *  - Tablet e desktop: menu lateral (trilho no tablet, menu com nomes no desktop).
 * tone="dark" é o modo foco (estudo e questões): o menu some em qualquer tamanho.
 */
export function Screen({ tone = 'light', tabBar = false, width = 'wide', children }) {
  // Modo foco claro (questões no desktop): sem menu, fundo de papel, conteúdo centralizado
  if (tone === 'focus') {
    return (
      <div className="min-h-dvh bg-paper text-ink">
        <main className="mx-auto flex min-h-dvh w-full flex-col items-center gap-12 px-10 py-8">{children}</main>
      </div>
    )
  }

  if (tone === 'dark') {
    return (
      <div className="tone-dark min-h-dvh bg-[#0d0c13] sm:bg-ink">
        <div className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col bg-ink text-paper sm:max-w-none">
          <main className="flex flex-1 flex-col gap-5 p-5 sm:gap-6 sm:p-8 lg:px-10">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-paper-deep sm:flex sm:bg-paper">
      <SideNav />
      <div className="mx-auto flex min-h-dvh w-full max-w-[30rem] min-w-0 flex-col bg-paper text-ink border-ink min-[30rem]:border-x-2 sm:border-x-0 sm:max-w-none sm:flex-1">
        <main className={cx('mx-auto flex w-full flex-1 flex-col gap-5 p-5 sm:gap-6 sm:p-8 lg:p-10', WIDTHS[width])}>
          {children}
        </main>
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
      <h1 className="min-w-0 flex-1 font-display text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em] text-balance break-words sm:text-[34px] lg:text-[40px]">
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
      <h2 className="font-display text-[22px] leading-tight font-extrabold sm:text-[26px] lg:text-[28px] lg:tracking-[-0.02em]">
        {children}
      </h2>
      {action}
    </div>
  )
}
