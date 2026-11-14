import { Link } from 'react-router'
import { DECK_COLORS, deckCode } from '../lib/languages'
import { cx, plural } from '../lib/utils'
import { Icon } from './Icon'
import { ProgressBar } from './ProgressBar'

/** Selo quadrado do baralho: "EN", "Bio"... */
export function DeckBadge({ deck, size = 'md', className }) {
  const color = DECK_COLORS[deck.color] ?? DECK_COLORS.paper
  return (
    <span
      aria-hidden="true"
      className={cx(
        'flex shrink-0 items-center justify-center rounded-btn border-2 border-ink font-mono font-medium',
        size === 'xl'
          ? 'size-18 rounded-[18px] text-[22px] shadow-hard'
          : size === 'lg'
            ? 'size-16 text-xl'
            : 'size-13 text-base',
        color.className,
        className,
      )}
    >
      {deckCode(deck)}
    </span>
  )
}

/**
 * Bloco de um baralho. Leva para a tela do baralho.
 * No celular é uma linha; do tablet para cima vira um cartão em grade.
 */
export function DeckTile({ deck, dueCount, percent, cardCount }) {
  const status = cardCount === 0 ? 'vazio' : dueCount > 0 ? `${dueCount} p/ hoje` : 'em dia'
  return (
    <Link
      to={`/baralhos/${deck.id}`}
      className="press flex h-full items-center gap-3.5 rounded-tile border-2 border-ink bg-white p-3.5 text-ink no-underline shadow-hard sm:flex-col sm:items-stretch sm:gap-4 sm:rounded-[22px] sm:p-4.5 lg:gap-4.5 lg:p-5"
    >
      <span className="contents sm:flex sm:items-center sm:gap-3.5">
        <DeckBadge deck={deck} className="sm:size-14 sm:text-[17px]" />
        <span className="hidden min-w-0 flex-col gap-0.75 sm:flex">
          <span className="text-[17px] leading-tight font-bold break-words">{deck.name}</span>
          <span className="text-[13px] text-graphite">{plural(cardCount, 'cartão', 'cartões')}</span>
        </span>
      </span>

      {/* Celular */}
      <span className="flex min-w-0 flex-1 flex-col gap-2 sm:hidden">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-bold">{deck.name}</span>
          <span className="shrink-0 text-[13px] text-graphite">{status}</span>
        </span>
        <ProgressBar value={percent} label={`${percent}% aprendido`} />
      </span>

      {/* Tablet e desktop */}
      <span className="mt-auto hidden flex-col gap-2 sm:flex">
        <ProgressBar value={percent} label={`${percent}% aprendido`} />
        <span className="flex justify-between gap-2 text-[13px]">
          <span className="text-graphite">{percent}% aprendido</span>
          <span className="font-bold">{status}</span>
        </span>
      </span>
    </Link>
  )
}

/** Bloco tracejado para criar um baralho, no fim da grade. */
export function NewDeckTile({ className }) {
  return (
    <Link
      to="/baralhos/novo"
      className={cx(
        'flex min-h-[9.375rem] flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-ink p-5 text-base font-bold text-ink no-underline hover:bg-white',
        className,
      )}
    >
      <Icon name="plus" size={26} strokeWidth={2.4} />
      Novo baralho
    </Link>
  )
}

/** Grade de baralhos: 1 coluna no celular, 2 no tablet, até 4 no desktop. */
export const DECK_GRID =
  'grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-[repeat(auto-fill,minmax(15.625rem,1fr))] lg:gap-6'
