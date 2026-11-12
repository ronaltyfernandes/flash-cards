import { DECK_COLORS, deckCode } from '../lib/languages'
import { cx } from '../lib/utils'
import { Link } from './Link'
import { ProgressBar } from './ProgressBar'

/** Selo quadrado do baralho: "EN", "Bio"... */
export function DeckBadge({ deck, size = 'md' }) {
  const color = DECK_COLORS[deck.color] ?? DECK_COLORS.paper
  return (
    <span
      aria-hidden="true"
      className={cx(
        'flex shrink-0 items-center justify-center rounded-btn border-2 border-ink font-mono font-medium',
        size === 'lg' ? 'size-16 text-xl' : 'size-13 text-base',
        color.className,
      )}
    >
      {deckCode(deck)}
    </span>
  )
}

/** Bloco de um baralho na lista. Leva para a tela do baralho. */
export function DeckTile({ deck, dueCount, percent, cardCount }) {
  const status = cardCount === 0 ? 'vazio' : dueCount > 0 ? `${dueCount} p/ hoje` : 'em dia'
  return (
    <Link
      to={`/baralhos/${deck.id}`}
      className="press flex items-center gap-3.5 rounded-tile border-2 border-ink bg-white p-3.5 text-ink no-underline shadow-hard"
    >
      <DeckBadge deck={deck} />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-bold">{deck.name}</span>
          <span className="shrink-0 text-[13px] text-graphite">{status}</span>
        </span>
        <ProgressBar value={percent} label={`${percent}% aprendido`} />
      </span>
    </Link>
  )
}
