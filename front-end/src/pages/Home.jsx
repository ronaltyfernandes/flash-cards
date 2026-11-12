import { useState } from 'react'
import { Button, IconButton } from '../components/Button'
import { DeckTile } from '../components/DeckTile'
import { Input } from '../components/Field'
import { FlameIcon, Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { Screen, SectionTitle } from '../components/Screen'
import { greeting } from '../lib/dates'
import { buildSession, estimateMinutes } from '../lib/srs'
import { currentStreak, learnedPercent } from '../lib/stats'
import { plural } from '../lib/utils'
import { useStore } from '../store/context'

export default function Home() {
  const { state } = useStore()
  const [now] = useState(() => Date.now())
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  const session = buildSession(state, now)
  const streak = currentStreak(state.days, now)
  const term = search.trim().toLowerCase()
  const decks = term ? state.decks.filter((deck) => deck.name.toLowerCase().includes(term)) : state.decks

  function toggleSearch() {
    setSearchOpen((open) => !open)
    setSearch('')
  }

  return (
    <Screen tabBar>
      <header className="flex items-center justify-between">
        <Logo />
        <p className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-white py-1.5 pr-3 pl-2 text-sm font-bold">
          <FlameIcon />
          <span className="sr-only">Sequência: </span>
          {plural(streak, 'dia', 'dias')}
        </p>
      </header>

      <div className="flex flex-col gap-1">
        <p className="text-[15px] text-graphite">{greeting(now)}</p>
        <h1 className="font-display text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em]">
          {state.cards.length === 0 ? 'Bora começar?' : session.length > 0 ? 'Bora revisar?' : 'Tudo em dia!'}
        </h1>
      </div>

      <TodayCard state={state} session={session} />

      <SectionTitle
        action={
          state.decks.length > 0 ? (
            <IconButton
              icon={searchOpen ? 'close' : 'search'}
              label={searchOpen ? 'Fechar busca' : 'Buscar baralhos'}
              aria-expanded={searchOpen}
              onClick={toggleSearch}
            />
          ) : null
        }
      >
        Seus baralhos
      </SectionTitle>

      {searchOpen ? (
        <Input
          type="search"
          autoFocus
          aria-label="Buscar baralhos"
          placeholder="Nome do baralho"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      ) : null}

      {state.decks.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-tile border-2 border-dashed border-ink p-5">
          <p className="text-[15px] leading-normal text-graphite">
            Você ainda não tem baralhos. Crie um para um idioma ou para qualquer outro assunto.
          </p>
          <Button to="/baralhos/novo" size="sm">
            Criar baralho
          </Button>
        </div>
      ) : decks.length === 0 ? (
        <p className="text-[15px] text-graphite">Nenhum baralho com “{search.trim()}”.</p>
      ) : (
        <ul className="flex flex-col gap-3 pb-2">
          {decks.map((deck) => {
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
        </ul>
      )}
    </Screen>
  )
}

/** Bloco escuro com a revisão do dia. */
function TodayCard({ state, session }) {
  const deckCount = new Set(
    session.map((id) => state.cards.find((card) => card.id === id)?.deckId).filter(Boolean),
  ).size

  let content
  if (state.cards.length === 0) {
    content = {
      big: 'Sem cartões',
      detail: 'Crie o primeiro e ele já entra na revisão.',
      to: state.decks.length === 0 ? '/baralhos/novo' : '/criar',
      action: state.decks.length === 0 ? 'Criar baralho' : 'Criar cartão',
    }
  } else if (session.length === 0) {
    content = {
      big: 'Nada pendente',
      detail: 'Que tal umas questões para fixar?',
      to: '/questoes',
      action: 'Praticar questões',
    }
  } else {
    content = {
      count: session.length,
      detail: `~${estimateMinutes(session.length)} min · ${plural(deckCount, 'baralho', 'baralhos')}`,
      to: '/estudar',
      action: 'Começar',
    }
  }

  return (
    <section
      aria-label="Revisão de hoje"
      className="relative flex flex-col gap-4 overflow-hidden rounded-[26px] bg-ink p-5.5 text-paper"
    >
      {/* Motivo "pilha" */}
      <div
        aria-hidden="true"
        className="absolute -top-4.5 -right-6.5 h-[150px] w-[120px] rotate-[16deg] rounded-[18px] border-2 border-paper bg-violet"
      />
      <div
        aria-hidden="true"
        className="absolute top-1.5 right-2 h-[118px] w-[92px] rotate-[6deg] rounded-2xl border-2 border-paper bg-lime"
      />

      <div className="relative flex max-w-[210px] flex-col gap-1">
        <p className="text-[13px] font-semibold tracking-[0.1em] text-mist uppercase">Revisão de hoje</p>
        {content.count ? (
          <p className="font-display text-[44px] leading-none font-extrabold tracking-[-0.03em]">
            {content.count}{' '}
            <span className="text-xl tracking-normal">{content.count === 1 ? 'cartão' : 'cartões'}</span>
          </p>
        ) : (
          <p className="font-display text-[32px] leading-none font-extrabold tracking-[-0.03em]">{content.big}</p>
        )}
        <p className="text-sm text-fog">{content.detail}</p>
      </div>

      <Button to={content.to} variant="dark-lime" className="relative">
        {content.action}
        <Icon name="arrow" size={20} strokeWidth={2.5} />
      </Button>
    </section>
  )
}
