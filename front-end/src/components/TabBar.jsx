import { Link, useLocation } from 'react-router'
import { cx } from '../lib/utils'
import { Icon } from './Icon'

const TABS = [
  { to: '/', label: 'Início', icon: 'home', isActive: (path) => path === '/' },
  { to: '/baralhos', label: 'Baralhos', icon: 'decks', isActive: (path) => path.startsWith('/baralhos') },
  { create: true },
  { to: '/progresso', label: 'Progresso', icon: 'chart', isActive: (path) => path === '/progresso' },
  { to: '/questoes', label: 'Questões', icon: 'quiz', isActive: (path) => path.startsWith('/questoes') },
]

/** Barra de navegação inferior. O botão do meio cria um cartão. */
export function TabBar() {
  const { pathname: path } = useLocation()
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-10 flex h-21 sm:hidden shrink-0 items-center justify-around border-t-2 border-ink bg-white px-1 pb-[env(safe-area-inset-bottom)] min-[360px]:px-2"
    >
      {TABS.map((tab) => {
        if (tab.create) {
          return (
            <Link
              key="criar"
              to="/criar"
              aria-label="Criar cartão"
              className="press flex size-14 -translate-y-2.5 items-center justify-center rounded-[18px] border-2 border-ink bg-violet text-white shadow-hard-sm"
            >
              <Icon name="plus" size={26} strokeWidth={2.6} />
            </Link>
          )
        }
        const active = tab.isActive(path)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={active ? 'page' : undefined}
            className={cx(
              'flex min-h-11 min-w-12 flex-col items-center justify-center gap-0.5 text-[11px] no-underline min-[360px]:min-w-14 min-[360px]:text-xs',
              active ? 'font-bold text-violet' : 'font-semibold text-graphite',
            )}
          >
            <Icon name={tab.icon} size={24} />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
