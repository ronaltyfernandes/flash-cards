import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, IconButton } from '../components/Button'
import { DECK_GRID, DeckTile, NewDeckTile } from '../components/DeckTile'
import { Input } from '../components/Field'
import { FlameIcon, Icon } from '../components/Icon'
import { Kbd } from '../components/Kbd'
import { Logo } from '../components/Logo'
import { Screen, SectionTitle } from '../components/Screen'
import { StreakCard } from '../components/StreakCard'
import { greeting } from '../lib/dates'
import { isTyping } from '../lib/keyboard'
import { countQuizItems } from '../lib/quiz'
import { buildSession, estimateMinutes } from '../lib/srs'
import { currentStreak, learnedPercent } from '../lib/stats'
import { cx, plural } from '../lib/utils'
import { useStore } from '../store/context'

const ROUND_SIZE = 10

export default function Home() {
  const { state } = useStore()
  const [now] = useState(() => Date.now())
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  const session = buildSession(state, now)
  const streak = currentStreak(state.days, now)
  const quizCount = countQuizItems(state)
  const term = search.trim().toLowerCase()
  const decks = term ? state.decks.filter((deck) => deck.name.toLowerCase().includes(term)) : state.decks

  function toggleSearch() {
    setSearchOpen((open) => !open)
    setSearch('')
  }

  const streakPill = (
    <p className="flex h-11 items-center gap-1.5 rounded-full border-2 border-ink bg-white pr-3 pl-2 text-sm font-bold sm:pr-3.5 sm:pl-2.5 sm:text-[15px]">
      <FlameIcon />
      <span className="sr-only">Sequência: </span>
      {plural(streak, 'dia', 'dias')}
    </p>
  )

  const searchButton =
    state.decks.length > 0 ? (
      <IconButton
        icon={searchOpen ? 'close' : 'search'}
        label={searchOpen ? 'Fechar busca' : 'Buscar baralhos'}
        aria-expanded={searchOpen}
        onClick={toggleSearch}
      />
    ) : null

  return (
    <Screen tabBar>
      {/* Celular: logo e sequência no topo (no tablet e no desktop o logo está no menu) */}
      <header className="flex items-center justify-between sm:hidden">
        <Logo />
        {streakPill}
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4 lg:gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-[15px] text-graphite sm:text-base">{greeting(now)}</p>
          <h1 className="font-display text-[34px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.02] lg:text-[44px]">
            {state.cards.length === 0 ? 'Bora começar?' : session.length > 0 ? 'Bora revisar?' : 'Tudo em dia!'}
          </h1>
        </div>

        {/* Tablet: sequência e busca no cabeçalho */}
        <div className="hidden items-center gap-2.5 sm:flex lg:hidden">
          {streakPill}
          {searchButton}
        </div>

        {/* Desktop: a busca fica sempre aberta, com "/" de atalho */}
        {state.decks.length > 0 ? (
          <div className="relative hidden flex-[0_1_21.25rem] lg:block">
            <Icon name="search" size={20} className="pointer-events-none absolute top-3.5 left-3.5" />
            <Input
              id="busca"
              type="search"
              aria-label="Buscar baralhos"
              aria-keyshortcuts="/"
              placeholder="Buscar baralhos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12! pr-12! pl-11! text-[15px]!"
            />
            {search ? null : <Kbd className="absolute top-3 right-3">/</Kbd>}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:gap-6">
        <TodayCard state={state} session={session} quizCount={quizCount} />
        <StreakCard days={state.days} now={now} className="hidden lg:flex lg:flex-[1_1_17.5rem] lg:justify-between" />
      </div>

      <SectionTitle
        action={
          <>
            <span className="sm:hidden">{searchButton}</span>
            {state.decks.length > 0 ? (
              <Link
                to="/baralhos"
                className="hidden min-h-11 items-center text-[15px] font-bold text-violet no-underline sm:flex"
              >
                Ver todos
              </Link>
            ) : null}
          </>
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
          className="lg:hidden"
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
        <ul className={cx(DECK_GRID, 'pb-2')}>
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
          {term ? null : (
            <li className="hidden lg:block">
              <NewDeckTile className="h-full" />
            </li>
          )}
        </ul>
      )}

      {/* Tablet: atalhos para o resto */}
      {state.decks.length > 0 ? (
        <div className="hidden grid-cols-2 items-start gap-5 sm:grid lg:hidden">
          {quizCount > 0 ? (
            <Link
              to="/questoes/todas"
              className="press flex flex-col gap-1.5 rounded-[22px] border-2 border-ink bg-lime p-5 text-ink no-underline shadow-hard"
            >
              <span className="text-xs font-bold tracking-[0.1em] uppercase">Rodada rápida</span>
              <span className="font-display text-[30px] leading-none font-extrabold tracking-[-0.03em]">
                {plural(Math.min(ROUND_SIZE, quizCount), 'questão', 'questões')}
              </span>
              <span className="text-sm">Misturando todos os baralhos.</span>
            </Link>
          ) : null}
          <NewDeckTile className="min-h-[7.375rem] flex-row gap-2.5" />
        </div>
      ) : null}
    </Screen>
  )
}

/** Bloco escuro com a revisão do dia. */
function TodayCard({ state, session, quizCount }) {
  const navigate = useNavigate()
  const deckCount = new Set(session.map((id) => state.cards.find((card) => card.id === id)?.deckId).filter(Boolean))
    .size
  const nextCard = state.cards.find((card) => card.id === session[0])

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

  // Desktop: Enter começa (quando o foco não está em outro controle)
  const onKeyDown = useEffectEvent((event) => {
    if (event.key !== 'Enter' || event.metaKey || event.ctrlKey || event.altKey || isTyping(event)) return
    if (event.target !== document.body) return
    navigate(content.to)
  })

  useEffect(() => {
    const listener = (event) => onKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  return (
    <section
      aria-label="Revisão de hoje"
      className="relative flex flex-col gap-4 overflow-hidden rounded-[26px] bg-ink p-5.5 text-paper sm:gap-5.5 sm:rounded-card sm:p-7.5 lg:min-h-[17.5rem] lg:flex-[2_1_30rem] lg:justify-center lg:p-8"
    >
      {/* Motivo "pilha": dois cartões no celular, três (com a próxima palavra) do tablet para cima */}
      <div
        aria-hidden="true"
        className="absolute -top-4.5 -right-6.5 h-[150px] w-[120px] rotate-[16deg] rounded-[18px] border-2 border-paper bg-violet sm:-top-5.5 sm:-right-6 sm:h-49 sm:w-37.5 sm:rotate-[15deg] sm:rounded-[22px] lg:top-6 lg:right-8 lg:h-46.5 lg:w-35 lg:rotate-[14deg]"
      />
      <div
        aria-hidden="true"
        className="absolute top-1.5 right-2 h-[118px] w-[92px] rotate-[6deg] rounded-2xl border-2 border-paper bg-lime sm:top-4 sm:right-11 sm:h-46 sm:w-35 sm:rotate-[5deg] sm:rounded-[22px] lg:top-10 lg:right-24 lg:h-46.5 lg:rotate-[4deg]"
      />
      <div
        aria-hidden="true"
        className="absolute top-10 right-29 hidden h-46 w-35 -rotate-6 items-center justify-center rounded-[22px] border-2 border-ink bg-white p-3 text-center font-display text-[25px] leading-none font-extrabold tracking-[-0.03em] break-words text-ink sm:flex lg:top-14 lg:right-40 lg:h-46.5 lg:text-[26px]"
      >
        {nextCard && nextCard.front.length <= 24 ? nextCard.front : null}
      </div>

      <div className="relative flex max-w-[210px] flex-col gap-1 sm:max-w-[300px] sm:gap-1.5">
        <p className="text-[13px] font-semibold tracking-[0.1em] text-mist uppercase">Revisão de hoje</p>
        {content.count ? (
          <p className="font-display text-[44px] leading-none font-extrabold tracking-[-0.03em] sm:text-[64px] sm:leading-[0.95] sm:tracking-[-0.04em] lg:text-[72px]">
            {content.count}{' '}
            <span className="text-xl tracking-normal sm:text-2xl lg:text-[26px]">
              {content.count === 1 ? 'cartão' : 'cartões'}
            </span>
          </p>
        ) : (
          <p className="font-display text-[32px] leading-none font-extrabold tracking-[-0.03em] sm:text-[44px]">
            {content.big}
          </p>
        )}
        <p className="text-sm text-fog sm:text-[15px]">{content.detail}</p>
      </div>

      <div className="relative flex flex-wrap items-center gap-3.5">
        <Button
          to={content.to}
          variant="dark-lime"
          aria-keyshortcuts="Enter"
          className="max-sm:w-full sm:h-14 sm:px-7 sm:text-[17px] lg:pr-3.5 lg:pl-5.5"
        >
          {content.action}
          <Icon name="arrow" size={20} strokeWidth={2.5} className="lg:hidden" />
          <Kbd tone="flat">Enter</Kbd>
        </Button>
        {content.count && quizCount > 0 ? (
          <span className="hidden lg:contents">
            <Button to="/questoes/todas" variant="dark-outline" className="h-14!">
              Só questões
            </Button>
          </span>
        ) : null}
      </div>
    </section>
  )
}
