import { useEffect, useEffectEvent, useState } from 'react'
import { Button, IconButton } from '../components/Button'
import { DeckChip, TagChip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { Screen } from '../components/Screen'
import { buildQuiz } from '../lib/quiz'
import { cx } from '../lib/utils'
import { useStore } from '../store/context'

const LETTERS = ['A', 'B', 'C', 'D']

const RESULT_STYLE = {
  correct: { className: 'bg-lime', text: 'acertou' },
  wrong: { className: 'bg-coral', text: 'errou' },
  skipped: { className: 'bg-paper-line', text: 'pulou' },
  current: { className: 'bg-violet', text: 'atual' },
  pending: { className: 'bg-paper-deep', text: 'pendente' },
}

/** Rodada de questões de múltipla escolha. Sem `deckId`, mistura todos os baralhos. */
export default function Quiz({ params }) {
  const [round, setRound] = useState(0)
  // Trocar a `key` monta uma rodada nova, com outras questões
  return <QuizRound key={round} deckId={params.deckId} onRestart={() => setRound((current) => current + 1)} />
}

function QuizRound({ deckId, onRestart }) {
  const { state, actions } = useStore()
  const [items] = useState(() => buildQuiz(state, deckId))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [results, setResults] = useState([])

  const exitTo = deckId ? `/baralhos/${deckId}` : '/questoes'
  const item = items[index]
  const answered = picked !== null
  const finished = index >= items.length

  function pick(optionId) {
    if (!item || answered) return
    const correct = optionId === item.correctId
    setPicked(optionId)
    setResults((current) => [...current, correct ? 'correct' : 'wrong'])
    actions.answerQuiz({ correct, cardId: item.cardId })
  }

  function next() {
    setPicked(null)
    setIndex((current) => current + 1)
  }

  function skip() {
    setResults((current) => [...current, 'skipped'])
    next()
  }

  // Teclado: 1–4 ou A–D escolhem a alternativa
  const onKeyDown = useEffectEvent((event) => {
    if (!item || answered || event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key.toUpperCase()
    const position = LETTERS.includes(key) ? LETTERS.indexOf(key) : Number(key) - 1
    const option = item.options[position]
    if (option) pick(option.id)
  })

  useEffect(() => {
    const listener = (event) => onKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          main
          title="Ainda não dá para gerar questões"
          action={
            <>
              <Button to={deckId ? `/criar?deck=${deckId}` : '/criar'}>Criar cartão</Button>
              <Button to={exitTo} variant="secondary">
                Voltar
              </Button>
            </>
          }
        >
          Com pelo menos 2 cartões no mesmo baralho eu monto questões sozinho. Você também pode escrever as suas.
        </EmptyState>
      </Screen>
    )
  }

  if (finished) {
    const right = results.filter((result) => result === 'correct').length
    const ratio = right / items.length
    return (
      <Screen>
        <ProgressSegments items={items} results={results} index={index} />
        <EmptyState
          main
          title={ratio >= 0.8 ? 'Mandou bem!' : ratio >= 0.5 ? 'Boa!' : 'Bora de novo?'}
          action={
            <>
              <Button onClick={onRestart}>Nova rodada</Button>
              <Button to={exitTo} variant="secondary">
                Voltar
              </Button>
            </>
          }
        >
          Você acertou {right} de {items.length}.
          {results.includes('wrong') ? ' Os cartões que você errou voltam na próxima revisão.' : ''}
        </EmptyState>
      </Screen>
    )
  }

  const right = picked === item.correctId
  const isLast = index === items.length - 1

  return (
    <Screen>
      <div className="flex items-center gap-3.5">
        <IconButton icon="close" label="Sair das questões" to={exitTo} />
        <ProgressSegments items={items} results={results} index={index} className="flex-1" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TagChip>{item.typeLabel}</TagChip>
        <DeckChip deck={item.deck} />
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-[15px] text-graphite">
          Questão {index + 1} de {items.length}
        </p>
        <QuestionTitle item={item} />
      </div>

      <ol className="flex flex-col gap-3">
        {item.options.map((option, position) => {
          const isCorrect = option.id === item.correctId
          const isPicked = option.id === picked
          const status = !answered ? 'idle' : isCorrect ? 'correct' : isPicked ? 'wrong' : 'rest'
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => pick(option.id)}
                aria-disabled={answered}
                className={cx(
                  'flex min-h-15 w-full items-center gap-3 rounded-2xl border-2 border-ink px-4 py-2.5 text-left text-base font-semibold transition-colors',
                  status === 'idle' && 'bg-white active:translate-y-0.5',
                  status === 'correct' && 'bg-lime shadow-hard',
                  status === 'wrong' && 'bg-coral-tint',
                  status === 'rest' && 'bg-white text-graphite',
                  answered && 'cursor-default',
                )}
              >
                <span
                  className={cx(
                    'flex size-7.5 shrink-0 items-center justify-center rounded-[9px] border-2 border-ink font-mono text-[13px]',
                    status === 'correct' ? 'bg-ink text-lime' : status === 'wrong' ? 'bg-coral' : 'bg-white text-ink',
                  )}
                >
                  {status === 'correct' ? (
                    <Icon name="check" size={18} strokeWidth={3} />
                  ) : status === 'wrong' ? (
                    <Icon name="close" size={18} strokeWidth={3} />
                  ) : (
                    LETTERS[position]
                  )}
                </span>
                <span className={cx('min-w-0 break-words', status === 'wrong' && 'line-through')}>{option.text}</span>
                {status === 'correct' ? <span className="sr-only"> (resposta certa)</span> : null}
                {status === 'wrong' ? <span className="sr-only"> (sua resposta, errada)</span> : null}
              </button>
            </li>
          )
        })}
      </ol>

      <div className="flex-1" />

      {answered ? (
        <div
          role="status"
          className={cx(
            'flex animate-pop-in flex-col gap-3.5 rounded-[22px] border-2 border-ink p-4.5 shadow-hard motion-reduce:animate-none',
            right ? 'bg-lime' : 'bg-coral-tint',
          )}
        >
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl font-extrabold">{right ? 'Mandou bem!' : 'Quase!'}</p>
            <p className="text-[15px] leading-snug">
              {right
                ? item.explanation
                : `A resposta era “${item.answerText}”.${item.cardId ? ' Esse cartão volta na sua próxima revisão.' : ''}`}
            </p>
            {!right && item.kind === 'custom' && item.explanation ? (
              <p className="text-[15px] leading-snug">{item.explanation}</p>
            ) : null}
          </div>
          <Button variant="ink" autoFocus onClick={next}>
            {isLast ? 'Ver resultado' : 'Continuar'}
          </Button>
        </div>
      ) : (
        <Button variant="dashed" className="font-semibold! text-graphite!" onClick={skip}>
          Pular esta questão
        </Button>
      )}
    </Screen>
  )
}

/** Enunciado: muda conforme o tipo da questão. */
function QuestionTitle({ item }) {
  if (item.kind === 'cloze') {
    return (
      <>
        <h1 className="font-display text-[22px] leading-tight font-extrabold tracking-[-0.02em]">{item.lead}</h1>
        <p className="font-display text-[28px] leading-[1.15] font-extrabold tracking-[-0.02em]">“{item.sentence}”</p>
        {item.hint ? <p className="text-[15px] leading-normal text-graphite">{item.hint}</p> : null}
      </>
    )
  }

  if (item.term) {
    return (
      <>
        <h1 className="font-display text-3xl leading-[1.2] font-extrabold tracking-[-0.02em]">
          {item.lead}{' '}
          <span className="inline-block -rotate-[1.5deg] rounded-[10px] border-2 border-ink bg-lime px-2">
            {item.term}
          </span>
          ?
        </h1>
        {item.context ? <p className="text-[15px] leading-normal text-graphite">“{item.context}”</p> : null}
      </>
    )
  }

  return (
    <h1
      className={cx(
        'font-display leading-[1.15] font-extrabold tracking-[-0.02em]',
        item.question.length > 70 ? 'text-2xl' : 'text-[28px]',
      )}
    >
      {item.question}
    </h1>
  )
}

/** Um tracinho por questão: lima = acerto, coral = erro, violeta = atual. */
function ProgressSegments({ items, results, index, className }) {
  return (
    <ol
      aria-label="Andamento da rodada"
      className={cx('grid gap-1', className)}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, position) => {
        const status = results[position] ?? (position === index ? 'current' : 'pending')
        const style = RESULT_STYLE[status]
        return (
          <li key={item.id} className={cx('h-3 rounded border-2 border-ink', style.className)}>
            <span className="sr-only">
              Questão {position + 1}: {style.text}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
