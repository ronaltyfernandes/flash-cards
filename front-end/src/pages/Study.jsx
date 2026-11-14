import { useEffect, useEffectEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, IconButton } from '../components/Button'
import { DeckChip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import { FlashCard } from '../components/FlashCard'
import { GradeButtons } from '../components/GradeButtons'
import { Icon } from '../components/Icon'
import { Kbd } from '../components/Kbd'
import { ProgressBar } from '../components/ProgressBar'
import { Screen } from '../components/Screen'
import { canSpeak, speak } from '../lib/languages'
import { GRADES, buildSession, previewIntervals } from '../lib/srs'
import { plural } from '../lib/utils'
import { useStore } from '../store/context'

/** Modo foco: um cartão por vez, fundo escuro. */
export default function Study({ params, query }) {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const deckId = params.deckId
  const free = query.modo === 'livre'
  const exitTo = deckId ? `/baralhos/${deckId}` : '/'

  // A fila é montada uma vez, ao abrir a tela
  const [queue, setQueue] = useState(() => buildSession(state, Date.now(), deckId, { free }))
  const [total] = useState(queue.length)
  const [flipped, setFlipped] = useState(false)
  const [turn, setTurn] = useState(0)
  const [tally, setTally] = useState({ again: 0, hard: 0, good: 0, easy: 0 })

  const card = state.cards.find((c) => c.id === queue[0])
  const deck = card ? state.decks.find((d) => d.id === card.deckId) : null
  const done = total - queue.length

  function grade(gradeId) {
    if (!card) return
    actions.gradeCard(card.id, gradeId)
    setTally((current) => ({ ...current, [gradeId]: current[gradeId] + 1 }))
    // "Errei" manda o cartão para o fim da fila: ele volta nesta mesma sessão
    setQueue((current) => (gradeId === 'again' ? [...current.slice(1), current[0]] : current.slice(1)))
    setFlipped(false)
    setTurn((current) => current + 1)
  }

  // Teclado: espaço vira o cartão, 1 a 4 avaliam, S fala a palavra, Esc sai
  const onKeyDown = useEffectEvent((event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === 'Escape') {
      navigate(exitTo)
      return
    }
    if (!card) return
    const onControl = ['BUTTON', 'A', 'INPUT'].includes(event.target.tagName)
    if ((event.key === 's' || event.key === 'S') && deck?.kind === 'language' && canSpeak()) {
      speak(card.front, deck.from)
    } else if (event.key === ' ' && !onControl) {
      event.preventDefault()
      setFlipped((current) => !current)
    } else if (flipped && ['1', '2', '3', '4'].includes(event.key)) {
      grade(GRADES[Number(event.key) - 1].id)
    }
  })

  useEffect(() => {
    const listener = (event) => onKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  if (total === 0) {
    const scopeCards = deckId ? state.cards.filter((c) => c.deckId === deckId) : state.cards
    return (
      <Screen tone="dark">
        <EmptyState
          main
          tone="dark"
          title={scopeCards.length === 0 ? 'Sem cartões por aqui' : 'Tudo em dia!'}
          action={
            <>
              {scopeCards.length === 0 ? (
                <Button to={deckId ? `/criar?deck=${deckId}` : '/criar'} variant="dark-lime">
                  Criar cartão
                </Button>
              ) : (
                <Button to={`${deckId ? `/estudar/${deckId}` : '/estudar'}?modo=livre`} variant="dark-lime">
                  Revisar tudo mesmo assim
                </Button>
              )}
              <Button to={exitTo} variant="dark-outline">
                Voltar
              </Button>
            </>
          }
        >
          {scopeCards.length === 0
            ? 'Crie um cartão e ele entra na revisão na hora.'
            : 'Nenhum cartão para revisar agora. Os próximos aparecem na data certa.'}
        </EmptyState>
      </Screen>
    )
  }

  if (!card) {
    const reviewed = tally.again + tally.hard + tally.good + tally.easy
    return (
      <Screen tone="dark">
        <EmptyState
          main
          tone="dark"
          title="Mandou bem!"
          action={
            <>
              <Button to={deckId ? `/questoes/${deckId}` : '/questoes'} variant="dark-lime">
                Praticar questões
              </Button>
              <Button to={exitTo} variant="dark-outline">
                {deckId ? 'Voltar ao baralho' : 'Voltar ao início'}
              </Button>
            </>
          }
        >
          {plural(total, 'cartão revisado', 'cartões revisados')}
          {reviewed > total ? ` em ${reviewed} respostas` : ''}. Eles voltam na hora certa.
        </EmptyState>
        <ul aria-label="Suas respostas" className="grid grid-cols-4 gap-2 pb-4 text-center">
          {GRADES.map((item) => (
            <li key={item.id} className="flex flex-col rounded-2xl border-2 border-ink-line px-1 py-3">
              <span className="font-display text-2xl font-extrabold">{tally[item.id]}</span>
              <span className="text-xs text-mist">{item.label}</span>
            </li>
          ))}
        </ul>
      </Screen>
    )
  }

  return (
    <Screen tone="dark">
      <h1 className="sr-only">Estudo: {deck.name}</h1>
      <div className="flex w-full items-center gap-3.5 sm:gap-4 lg:mx-auto lg:max-w-[1200px]">
        <IconButton icon="close" label="Sair do estudo" tone="dark" to={exitTo} aria-keyshortcuts="Escape" />
        <Kbd tone="dark">Esc</Kbd>
        <ProgressBar tone="dark" value={(done / total) * 100} label="Andamento da sessão" className="h-3.5 flex-1" />
        <span className="shrink-0 font-mono text-sm text-mist sm:text-[15px]">
          <span className="sr-only">Cartão </span>
          {Math.min(done + 1, total)}/{total}
        </span>
      </div>

      {/* Coluna do cartão: em pé com 560px no tablet, deitado com 640px no desktop */}
      <div className="flex flex-1 flex-col gap-5 sm:mx-auto sm:w-full sm:max-w-[35rem] sm:justify-center sm:gap-6.5 lg:max-w-[40rem] lg:justify-start">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {deck.kind === 'language' ? <DeckChip deck={deck} tone="dark" /> : null}
            <span className="truncate text-[13px] text-mist">{deck.name}</span>
          </div>
          {deck.kind === 'language' && canSpeak() ? (
            <>
              <IconButton
                icon="volume"
                label="Ouvir pronúncia"
                tone="dark-strong"
                aria-keyshortcuts="S"
                onClick={() => speak(card.front, deck.from)}
                className="sm:size-12 sm:rounded-btn lg:hidden"
              />
              <span className="hidden lg:contents">
                <Button
                  variant="dark-outline"
                  size="sm"
                  aria-keyshortcuts="S"
                  onClick={() => speak(card.front, deck.from)}
                  className="rounded-chip! pr-2.5! pl-3.5!"
                >
                  <Icon name="volume" size={20} strokeWidth={2} />
                  Ouvir
                  <Kbd tone="dark">S</Kbd>
                </Button>
              </span>
            </>
          ) : null}
        </div>

        <FlashCard
          key={`${card.id}-${turn}`}
          card={card}
          flipped={flipped}
          onFlip={() => setFlipped((current) => !current)}
        />

        <div className="flex min-h-[7.25rem] shrink-0 flex-col justify-end sm:min-h-0 lg:min-h-28">
          {flipped ? (
            <GradeButtons intervals={previewIntervals(card.srs)} onGrade={grade} />
          ) : (
            <Button
              variant="dark-primary"
              size="lg"
              aria-keyshortcuts="Space"
              onClick={() => setFlipped(true)}
              className="sm:h-15.5 sm:text-lg"
            >
              Mostrar resposta
              <Kbd tone="flat">Espaço</Kbd>
            </Button>
          )}
        </div>
      </div>
    </Screen>
  )
}
