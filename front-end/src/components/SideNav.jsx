import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { isPlainShortcut } from '../lib/keyboard'
import { cx } from '../lib/utils'
import { Icon } from './Icon'
import { Kbd } from './Kbd'
import { LogoMark } from './Logo'

// No menu lateral a ordem é outra: Questões vem antes de Progresso
const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: 'home', isActive: (path) => path === '/' },
  { to: '/baralhos', label: 'Baralhos', icon: 'decks', isActive: (path) => path.startsWith('/baralhos') },
  { to: '/questoes', label: 'Questões', icon: 'quiz', isActive: (path) => path.startsWith('/questoes') },
  { to: '/progresso', label: 'Progresso', icon: 'chart', isActive: (path) => path === '/progresso' },
]

const SHORTCUTS = [
  ['N', 'novo cartão'],
  ['/', 'buscar'],
  ['Espaço', 'virar o cartão'],
  ['1–4', 'avaliar'],
  ['A–D', 'responder questões'],
  ['Esc', 'sair do estudo'],
]

/**
 * Navegação de tela grande.
 * Tablet (640–1023px): trilho de ícones com 88px. Desktop (1024px+): menu de 248px com nomes.
 * Lima marca onde você está; violeta continua sendo só para ações.
 */
export function SideNav() {
  const { pathname: path } = useLocation()
  const navigate = useNavigate()
  const [helpOpen, setHelpOpen] = useState(false)

  // Atalhos globais: N cria um cartão, / vai para a busca, ? mostra a lista
  const onKeyDown = useEffectEvent((event) => {
    if (!isPlainShortcut(event)) return
    if (event.key === 'n' || event.key === 'N') {
      event.preventDefault()
      navigate('/criar')
    } else if (event.key === '/') {
      const search = document.getElementById('busca')
      if (search) {
        event.preventDefault()
        search.focus()
      }
    } else if (event.key === '?') {
      setHelpOpen((open) => !open)
    } else if (event.key === 'Escape') {
      setHelpOpen(false)
    }
  })

  useEffect(() => {
    const listener = (event) => onKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky top-0 hidden h-dvh w-22 shrink-0 flex-col items-center gap-3.5 overflow-y-auto border-r-2 border-ink bg-white px-0 py-6 sm:flex lg:w-62 lg:items-stretch lg:gap-6.5 lg:px-5 lg:py-7"
    >
      <Link
        to="/"
        aria-label="Insane Flash Cards, início"
        className="flex items-center gap-2.5 px-1.5 text-ink no-underline"
      >
        <LogoMark size={46} />
        <span aria-hidden="true" className="hidden flex-col lg:flex">
          <span className="font-display text-[28px] leading-[0.95] font-extrabold tracking-[-0.03em]">insane</span>
          <span className="text-[10px] font-bold tracking-[0.26em] uppercase">flash cards</span>
        </span>
      </Link>

      <Link
        to="/criar"
        aria-label="Novo cartão"
        aria-keyshortcuts="N"
        className="press mt-2.5 mb-1.5 flex size-14 items-center justify-center rounded-[18px] border-2 border-ink bg-violet text-white no-underline shadow-hard-sm lg:m-0 lg:h-13 lg:w-auto lg:justify-start lg:gap-2.5 lg:rounded-btn lg:pr-3 lg:pl-3.5 lg:shadow-hard"
      >
        <Icon name="plus" size={22} strokeWidth={2.6} />
        <span className="hidden flex-1 font-bold lg:inline">Novo cartão</span>
        <Kbd tone="flat">N</Kbd>
      </Link>

      <ul className="flex flex-col items-center gap-3.5 lg:items-stretch lg:gap-1.5">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(path)
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex h-16 w-17 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 text-[11px] no-underline',
                  'lg:h-12 lg:w-full lg:flex-row lg:justify-start lg:gap-3 lg:rounded-btn lg:px-3.5 lg:text-[15px]',
                  active
                    ? 'border-ink bg-lime font-bold text-ink shadow-hard-sm'
                    : 'border-transparent font-semibold text-graphite hover:bg-paper lg:text-ink',
                )}
              >
                <Icon name={item.icon} size={22} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex-1" />

      {/* Lista de atalhos: só faz sentido com teclado, então só no desktop */}
      <div className="relative hidden lg:block">
        {helpOpen ? (
          <div
            id="atalhos"
            role="dialog"
            aria-label="Atalhos do teclado"
            className="absolute bottom-full left-0 mb-3 flex w-60 animate-pop-in flex-col gap-2.5 rounded-tile border-2 border-ink bg-white p-4 shadow-hard motion-reduce:animate-none"
          >
            <p className="font-display text-lg font-extrabold">Atalhos</p>
            <ul className="flex flex-col gap-2 text-sm">
              {SHORTCUTS.map(([key, label]) => (
                <li key={key} className="flex items-center gap-2.5">
                  <Kbd>{key}</Kbd>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <button
          type="button"
          aria-expanded={helpOpen}
          aria-controls="atalhos"
          aria-keyshortcuts="?"
          onClick={() => setHelpOpen((open) => !open)}
          className="flex min-h-10 items-center gap-2.5 rounded-chip px-2 text-[13px] text-graphite hover:text-ink"
        >
          <Kbd>?</Kbd>
          Atalhos do teclado
        </button>
      </div>
    </nav>
  )
}
