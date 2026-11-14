import { useState } from 'react'
import { Button } from '../components/Button'
import { DECK_GRID, DeckTile, NewDeckTile } from '../components/DeckTile'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { PageHeader, Screen } from '../components/Screen'
import { buildSession } from '../lib/srs'
import { learnedPercent } from '../lib/stats'
import { cx, plural } from '../lib/utils'
import { useStore } from '../store/context'

export default function Decks() {
  const { state } = useStore()
  const [now] = useState(() => Date.now())

  return (
    <Screen tabBar>
      <PageHeader
        title="Baralhos"
        action={
          <Button to="/baralhos/novo" size="sm">
            <Icon name="plus" size={18} strokeWidth={2.6} />
            Novo
          </Button>
        }
      />

      {state.decks.length === 0 ? (
        <EmptyState title="Nenhum baralho ainda" action={<Button to="/baralhos/novo">Criar baralho</Button>}>
          Um baralho junta cartões e questões do mesmo assunto: um idioma, uma matéria, o que você quiser.
        </EmptyState>
      ) : (
        <>
          <p className="text-[15px] text-graphite">
            {plural(state.decks.length, 'baralho', 'baralhos')} · {plural(state.cards.length, 'cartão', 'cartões')}
          </p>
          <ul className={cx(DECK_GRID, 'pb-2')}>
            {state.decks.map((deck) => {
              const cards = state.cards.filter((card) => card.deckId === deck.id)
              return (
                <li key={deck.id}>
                  <DeckTile
                    deck={deck}
                    cardCount={cards.length}
                    dueCount={buildSession(state, now, deck.id).length}
                    percent={learnedPercent(cards)}
                  />
                </li>
              )
            })}
            <li className="hidden sm:block">
              <NewDeckTile className="h-full" />
            </li>
          </ul>
        </>
      )}
    </Screen>
  )
}
