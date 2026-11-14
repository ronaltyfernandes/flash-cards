import { Button } from '../components/Button'
import { DeckBadge } from '../components/DeckTile'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { Link } from 'react-router'
import { PageHeader, Screen, SectionTitle } from '../components/Screen'
import { countQuizItems } from '../lib/quiz'
import { plural } from '../lib/utils'
import { useStore } from '../store/context'

const ROUND_SIZE = 10

/** Aba "Questões": escolher entre uma rodada geral ou por baralho. */
export default function QuizLobby() {
  const { state } = useStore()
  const total = countQuizItems(state)
  const decks = state.decks
    .map((deck) => ({ deck, count: countQuizItems(state, deck.id) }))
    .filter((entry) => entry.count > 0)

  return (
    <Screen tabBar>
      <PageHeader
        title="Questões"
        action={
          state.decks.length > 0 ? (
            <Button to="/criar?tipo=questao" size="sm" variant="secondary">
              <Icon name="plus" size={18} strokeWidth={2.6} />
              Nova
            </Button>
          ) : null
        }
      />

      {total === 0 ? (
        <EmptyState
          title="Ainda não dá para gerar questões"
          action={
            state.decks.length === 0 ? (
              <Button to="/baralhos/novo">Criar baralho</Button>
            ) : (
              <Button to="/criar">Criar cartão</Button>
            )
          }
        >
          Com pelo menos 2 cartões no mesmo baralho eu monto questões de múltipla escolha sozinho. Você também pode
          escrever as suas.
        </EmptyState>
      ) : (
        <>
          <section className="flex flex-col gap-4 rounded-[26px] border-2 border-ink bg-lime p-5.5 shadow-hard sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-card sm:p-7.5 sm:shadow-hard-lg">
            <div className="flex flex-col gap-1">
              <p className="text-[13px] font-semibold tracking-[0.1em] uppercase">Rodada rápida</p>
              <p className="font-display text-[32px] leading-none font-extrabold tracking-[-0.03em] sm:text-[44px]">
                {plural(Math.min(ROUND_SIZE, total), 'questão', 'questões')}
              </p>
              <p className="text-sm">Misturando todos os seus baralhos.</p>
            </div>
            <Button to="/questoes/todas" variant="ink" className="sm:h-14 sm:px-7">
              Começar
              <Icon name="arrow" size={20} strokeWidth={2.5} />
            </Button>
          </section>

          <SectionTitle>Por baralho</SectionTitle>
          <ul className="grid gap-3 pb-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {decks.map(({ deck, count }) => (
              <li key={deck.id}>
                <Link
                  to={`/questoes/${deck.id}`}
                  className="press flex items-center gap-3.5 rounded-tile border-2 border-ink bg-white p-3.5 text-ink no-underline shadow-hard"
                >
                  <DeckBadge deck={deck} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-base font-bold">{deck.name}</span>
                    <span className="text-[13px] text-graphite">
                      {plural(count, 'questão disponível', 'questões disponíveis')}
                    </span>
                  </span>
                  <Icon name="arrow" size={20} className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Screen>
  )
}
