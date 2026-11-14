import { useEffect, useEffectEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, IconButton } from '../components/Button'
import { DeckChip, TagChip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { Kbd } from '../components/Kbd'
import { Screen } from '../components/Screen'
import { buildQuiz } from '../lib/quiz'
import { DESKTOP, useMediaQuery } from '../lib/useMediaQuery'
import { cx } from '../lib/utils'
import { useStore } from '../store/context'

const LETTERS = ['A', 'B', 'C', 'D']

const RESULT_STYLE = {
  correct: { className: 'bg-lime', text: 'acertou' },
  wrong: { className: 'bg-coral', text: 'errou' },
  skipped: { className: 'bg-mist', text: 'pulou' },
  current: { className: 'bg-paper', text: 'atual' },
  pending: { className: 'border-2 border-ink-line bg-ink-muted', text: 'pendente' },
}

// Mesmas fases no desktop: tracinhos com contorno, como no modelo
const RESULT_STYLE_LIGHT = {
  correct: { className: 'bg-lime', text: 'acertou' },
  wrong: { className: 'bg-coral', text: 'errou' },
  skipped: { className: 'bg-mist', text: 'pulou' },
  current: { className: 'bg-white', text: 'atual' },
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
  const navigate = useNavigate()
  // Desktop: modelo claro, sem o cartão; celular e tablet: modo foco escuro
  const desktop = useMediaQuery(DESKTOP)
  const dark = !desktop
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

  // Teclado: 1–4 ou A–D escolhem a alternativa, Esc sai
  const onKeyDown = useEffectEvent((event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === 'Escape') {
      navigate(exitTo)
      return
    }
    if (!item || answered) return
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
      <Screen tone={dark ? 'dark' : 'focus'}>
        <EmptyState
          main
          tone={dark ? 'dark' : 'light'}
          title="Ainda não dá para gerar questões"
          action={
            <>
              <Button to={deckId ? `/criar?deck=${deckId}` : '/criar'} variant={dark ? 'dark-lime' : 'primary'}>
                Criar cartão
              </Button>
              <Button to={exitTo} variant={dark ? 'dark-outline' : 'secondary'}>
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
      <Screen tone={dark ? 'dark' : 'focus'}>
        <ProgressSegments
          items={items}
          results={results}
          index={index}
          light={!dark}
          className={dark ? undefined : 'w-full max-w-[75rem]'}
        />
        <EmptyState
          main
          tone={dark ? 'dark' : 'light'}
          title={ratio >= 0.8 ? 'Mandou bem!' : ratio >= 0.5 ? 'Boa!' : 'Bora de novo?'}
          action={
            <>
              <Button variant={dark ? 'dark-lime' : 'primary'} onClick={onRestart}>
                Nova rodada
              </Button>
              <Button to={exitTo} variant={dark ? 'dark-outline' : 'secondary'}>
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

  if (desktop) {
    return (
      <Screen tone="focus">
        <DesktopQuestion
          item={item}
          items={items}
          results={results}
          index={index}
          picked={picked}
          right={right}
          exitTo={exitTo}
          onPick={pick}
          onSkip={skip}
          onNext={next}
        />
      </Screen>
    )
  }

  return (
    <Screen tone="dark">
      <h1 className="sr-only">
        Questão {index + 1} de {items.length}
      </h1>

      {/* Topo: sair, andamento, contador */}
      <div className="flex w-full items-center gap-3.5 sm:gap-4 lg:mx-auto lg:max-w-[1200px]">
        <IconButton icon="close" label="Sair das questões" tone="dark" to={exitTo} aria-keyshortcuts="Escape" />
        <Kbd tone="dark">Esc</Kbd>
        <ProgressSegments items={items} results={results} index={index} className="flex-1" />
        <span aria-hidden="true" className="shrink-0 font-mono text-sm text-mist sm:text-[15px]">
          {index + 1}/{items.length}
        </span>
      </div>

      {/* Tablet: uma coluna de 560px. Desktop: pergunta à esquerda, alternativas à direita */}
      <div className="flex flex-1 flex-col gap-5 sm:mx-auto sm:w-full sm:max-w-[35rem] sm:gap-6 lg:grid lg:max-w-[70rem] lg:grid-cols-2 lg:items-start lg:gap-14 lg:pt-4">
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-ink uppercase">
              {item.typeLabel}
            </span>
            <DeckChip deck={item.deck} tone="dark" />
          </div>

          <QuestionCard key={item.id} item={item} revealed={answered} />
        </div>

        <div className="flex flex-1 flex-col gap-5 lg:gap-3.5">
          {/* Alternativas em grade 2 × 2; no desktop, uma embaixo da outra */}
          <ol className="mt-1 grid grid-cols-2 gap-3 lg:mt-0 lg:grid-cols-1 lg:gap-3.5">
            {item.options.map((option, position) => {
              const isCorrect = option.id === item.correctId
              const isPicked = option.id === picked
              const status = !answered ? 'idle' : isCorrect ? 'correct' : isPicked ? 'wrong' : 'rest'
              return (
                <li key={option.id} className="flex">
                  <button
                    type="button"
                    onClick={() => pick(option.id)}
                    aria-disabled={answered}
                    aria-keyshortcuts={LETTERS[position]}
                    className={cx(
                      'flex min-h-25 w-full flex-col items-start justify-between gap-2 rounded-tile border-2 px-3.5 py-3 text-left text-base leading-tight transition-colors',
                      'sm:min-h-28 sm:text-[17px] lg:min-h-16.5 lg:flex-row lg:items-center lg:justify-start lg:gap-3.5 lg:rounded-[18px] lg:px-4.5 lg:py-2.5 lg:text-lg',
                      status === 'idle' && 'press border-paper bg-ink-soft font-semibold text-paper shadow-hard-paper',
                      status === 'correct' && 'border-paper bg-lime font-bold text-ink shadow-hard-paper',
                      status === 'wrong' && 'border-paper bg-coral-tint font-semibold text-ink',
                      status === 'rest' && 'border-ink-line bg-transparent font-semibold text-mist',
                      answered && 'cursor-default',
                    )}
                  >
                    <span
                      className={cx(
                        'flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-medium lg:size-8.5 lg:rounded-[10px] lg:text-sm',
                        status === 'idle' && 'bg-lime text-ink',
                        status === 'correct' && 'bg-ink text-lime',
                        status === 'wrong' && 'border-2 border-ink bg-coral text-ink',
                        status === 'rest' && 'bg-ink-muted text-mist',
                      )}
                    >
                      {status === 'correct' ? (
                        <Icon name="check" size={18} strokeWidth={3} />
                      ) : status === 'wrong' ? (
                        <Icon name="close" size={16} strokeWidth={3} />
                      ) : (
                        LETTERS[position]
                      )}
                    </span>
                    <span className={cx('min-w-0 break-words', status === 'wrong' && 'line-through')}>
                      {option.text}
                    </span>
                    {status === 'correct' ? <span className="sr-only"> (resposta certa)</span> : null}
                    {status === 'wrong' ? <span className="sr-only"> (sua resposta, errada)</span> : null}
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="flex-1 lg:hidden" />

          {answered ? (
            <div
              role="status"
              className={cx(
                'flex animate-pop-in flex-wrap items-center gap-3 rounded-[22px] border-2 border-paper py-3.5 pr-3.5 pl-4.5 text-ink motion-reduce:animate-none sm:p-5 lg:mt-3.5 lg:gap-4.5 lg:rounded-3xl lg:p-5.5 lg:shadow-[6px_6px_0_var(--color-paper)]',
                right ? 'bg-lime' : 'bg-coral-tint',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-[22px] leading-tight font-extrabold lg:text-[28px] lg:tracking-[-0.02em]">
                  {right ? 'Mandou bem!' : 'Quase!'}
                </p>
                <p className="text-sm leading-snug lg:text-base">
                  {right
                    ? 'Resposta certa.'
                    : item.cardId
                      ? 'Esse cartão volta na próxima revisão.'
                      : `A resposta era “${item.answerText}”.`}
                </p>
              </div>
              <Button
                variant="ink"
                className="px-4.5! lg:h-14 lg:pr-3.5! lg:pl-5.5!"
                autoFocus
                aria-keyshortcuts="Enter"
                onClick={next}
              >
                {index === items.length - 1 ? 'Ver resultado' : 'Continuar'}
                <Kbd tone="inverse">Enter</Kbd>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" className="self-center font-semibold! text-mist!" onClick={skip}>
              Pular esta questão
            </Button>
          )}
        </div>
      </div>

      <p className="hidden text-center text-[13px] text-mist lg:block">
        As letras das alternativas são teclas: A, B, C e D respondem sem tirar a mão do teclado.
      </p>
    </Screen>
  )
}

/**
 * A pergunta é um cartão com a pilha atrás, igual ao estudo.
 * Depois da resposta ele vira e mostra o verso.
 */
function QuestionCard({ item, revealed }) {
  const { reveal } = item
  return (
    <div className="relative mx-1.5 mt-1 h-[clamp(15rem,36dvh,18.75rem)] shrink-0 sm:mx-0 sm:h-[22.5rem] lg:h-[25rem] animate-deal-in perspective-[1400px] motion-reduce:animate-none">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-2.5 bottom-0 -rotate-[4deg] rounded-card border-2 border-paper bg-violet"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1 bottom-0 rotate-[2.5deg] rounded-card border-2 border-paper bg-ink-muted"
      />

      <div
        className={cx(
          'absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] transform-3d motion-reduce:transition-none',
          revealed && 'rotate-y-180',
        )}
      >
        {/* Frente: a pergunta */}
        <div
          aria-hidden={revealed}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-y-auto rounded-card border-2 border-ink bg-white p-6 text-center text-ink shadow-[6px_6px_0_var(--color-lime)] backface-hidden"
        >
          <QuestionFront item={item} />
        </div>

        {/* Verso: a resposta */}
        <div
          aria-hidden={!revealed}
          className="absolute inset-0 flex rotate-y-180 flex-col gap-3 overflow-y-auto rounded-card border-2 border-paper bg-ink-soft p-5.5 text-left text-paper shadow-[6px_6px_0_var(--color-violet)] backface-hidden"
        >
          <span className="max-w-full self-start truncate rounded-full bg-lime px-3 py-1 font-mono text-[13px] font-medium text-ink">
            {reveal.front && reveal.front.length <= 32 ? reveal.front : 'resposta'}
          </span>
          <p
            className={cx(
              'font-display leading-[1.05] font-extrabold tracking-[-0.02em] text-lime break-words',
              reveal.back.length > 40 ? 'text-2xl' : 'text-[32px]',
            )}
          >
            {reveal.back}
          </p>
          {reveal.example ? (
            <div className="mt-auto flex flex-col gap-1.5 border-t-2 border-dashed border-ink-line pt-3.5">
              <p className="text-base leading-snug">
                {item.kind === 'custom' ? reveal.example : `“${reveal.example}”`}
              </p>
              {reveal.exampleTranslation ? (
                <p className="text-sm leading-snug text-mist">{reveal.exampleTranslation}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Frente do cartão: muda conforme o tipo da questão. */
function QuestionFront({ item }) {
  if (item.kind === 'cloze') {
    return (
      <>
        <p className="text-[15px] font-medium text-graphite">{item.lead}</p>
        <p
          className={cx(
            'font-display leading-[1.15] font-extrabold tracking-[-0.02em] text-balance break-words',
            item.sentence.length > 60 ? 'text-[22px]' : 'text-[28px]',
          )}
        >
          “{item.sentence}”
        </p>
        {item.hint ? <p className="text-[15px] leading-normal text-graphite">{item.hint}</p> : null}
      </>
    )
  }

  if (item.term) {
    return (
      <>
        <p className="text-[15px] font-medium text-graphite">{item.lead}</p>
        <p
          className={cx(
            'font-display leading-none font-extrabold tracking-[-0.03em] text-balance break-words',
            item.term.length > 18 ? 'text-[32px] sm:text-[40px]' : 'text-[44px] sm:text-[54px]',
          )}
        >
          {item.term}
        </p>
        {item.reveal.ipa ? <p className="font-mono text-[15px] text-graphite">{item.reveal.ipa}</p> : null}
        {item.context ? (
          <p className="mt-2.5 border-t-2 border-dashed border-paper-line pt-3.5 text-[15px] leading-normal text-graphite">
            “<Highlight text={item.context} term={item.term} />”
          </p>
        ) : null}
      </>
    )
  }

  return (
    <p
      className={cx(
        'font-display leading-[1.15] font-extrabold tracking-[-0.02em] text-balance break-words',
        item.question.length > 70 ? 'text-[22px]' : 'text-[28px]',
      )}
    >
      {item.question}
    </p>
  )
}

/** Deixa o termo em negrito dentro da frase de exemplo. */
function Highlight({ text, term }) {
  const start = text.toLowerCase().indexOf(term.toLowerCase())
  if (start < 0) return text
  const end = start + term.length
  return (
    <>
      {text.slice(0, start)}
      <strong className="text-ink">{text.slice(start, end)}</strong>
      {text.slice(end)}
    </>
  )
}

/**
 * Desktop: tela clara. Pergunta grande à esquerda (sem cartão), alternativas e retorno à direita.
 */
function DesktopQuestion({ item, items, results, index, picked, right, exitTo, onPick, onSkip, onNext }) {
  const answered = picked !== null
  return (
    <>
      <h1 className="sr-only">
        Questão {index + 1} de {items.length}
      </h1>

      {/* Topo: sair, andamento, contador */}
      <div className="flex w-full max-w-[75rem] items-center gap-4">
        <IconButton icon="close" label="Sair das questões" to={exitTo} aria-keyshortcuts="Escape" />
        <Kbd>Esc</Kbd>
        <ProgressSegments items={items} results={results} index={index} light className="flex-1" />
        <span aria-hidden="true" className="shrink-0 font-mono text-[15px] text-graphite">
          {index + 1}/{items.length}
        </span>
      </div>

      <div className="flex w-full max-w-[70rem] flex-wrap items-start gap-14">
        <div className="flex min-w-0 flex-[1_1_26.25rem] flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <TagChip>{item.typeLabel}</TagChip>
            <DeckChip deck={item.deck} className="px-2.5 py-1" />
          </div>
          <p className="text-base text-graphite">
            Questão {index + 1} de {items.length}
          </p>
          <DesktopPrompt item={item} />
        </div>

        <div className="flex min-w-0 flex-[1_1_26.25rem] flex-col gap-3.5">
          <ol className="flex flex-col gap-3.5">
            {item.options.map((option, position) => {
              const isCorrect = option.id === item.correctId
              const isPicked = option.id === picked
              const status = !answered ? 'idle' : isCorrect ? 'correct' : isPicked ? 'wrong' : 'rest'
              return (
                <li key={option.id} className="flex">
                  <button
                    type="button"
                    onClick={() => onPick(option.id)}
                    aria-disabled={answered}
                    aria-keyshortcuts={LETTERS[position]}
                    className={cx(
                      'flex min-h-16.5 w-full items-center gap-3.5 rounded-[18px] border-2 border-ink px-4.5 py-2.5 text-left text-lg leading-tight font-semibold transition-colors',
                      status === 'idle' && 'press bg-white text-ink shadow-hard',
                      status === 'correct' && 'bg-lime text-ink shadow-hard',
                      status === 'wrong' && 'bg-coral-tint text-ink',
                      status === 'rest' && 'bg-white text-graphite',
                      answered && 'cursor-default',
                    )}
                  >
                    <span
                      className={cx(
                        'flex size-8.5 shrink-0 items-center justify-center rounded-[10px] border-2 border-ink font-mono text-sm',
                        (status === 'idle' || status === 'rest') && 'bg-white text-ink shadow-[0_2px_0_var(--color-ink)]',
                        status === 'correct' && 'bg-ink text-lime',
                        status === 'wrong' && 'bg-coral text-ink',
                      )}
                    >
                      {status === 'correct' ? (
                        <Icon name="check" size={20} strokeWidth={3} />
                      ) : status === 'wrong' ? (
                        <Icon name="close" size={20} strokeWidth={3} />
                      ) : (
                        LETTERS[position]
                      )}
                    </span>
                    <span className={cx('min-w-0 break-words', status === 'wrong' && 'line-through')}>
                      {option.text}
                    </span>
                    {status === 'correct' ? <span className="sr-only"> (resposta certa)</span> : null}
                    {status === 'wrong' ? <span className="sr-only"> (sua resposta, errada)</span> : null}
                  </button>
                </li>
              )
            })}
          </ol>

          {answered ? (
            <div
              role="status"
              className={cx(
                'mt-3.5 flex animate-pop-in flex-wrap items-center justify-between gap-4.5 rounded-3xl border-2 border-ink p-5.5 shadow-hard-lg motion-reduce:animate-none',
                right ? 'bg-lime' : 'bg-coral-tint',
              )}
            >
              <div className="flex min-w-0 flex-[1_1_15rem] flex-col gap-1">
                <p className="font-display text-[28px] leading-tight font-extrabold tracking-[-0.02em]">
                  {right ? 'Mandou bem!' : 'Quase!'}
                </p>
                <p className="text-base leading-snug">
                  {right
                    ? 'Resposta certa.'
                    : `A resposta era “${item.answerText}”.${item.cardId ? ' Esse cartão volta na sua próxima revisão.' : ''}`}
                </p>
              </div>
              <Button variant="ink" className="h-14 pr-3.5! pl-5.5!" autoFocus aria-keyshortcuts="Enter" onClick={onNext}>
                {index === items.length - 1 ? 'Ver resultado' : 'Continuar'}
                <Kbd tone="inverse">Enter</Kbd>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" className="self-center font-semibold! text-graphite!" onClick={onSkip}>
              Pular esta questão
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1" />

      <p className="text-center text-[13px] text-graphite">
        As letras das alternativas são teclas: A, B, C e D respondem sem tirar a mão do teclado.
      </p>
    </>
  )
}

/** A pergunta em letras grandes, direto na página, com o termo destacado em lima. */
function DesktopPrompt({ item }) {
  const heading = 'font-display leading-[1.12] font-extrabold tracking-[-0.03em] text-balance break-words'

  if (item.kind === 'cloze') {
    return (
      <>
        <h2 className={cx(heading, item.sentence.length > 60 ? 'text-4xl' : 'text-[54px]')}>“{item.sentence}”</h2>
        {item.hint ? <p className="max-w-[28.75rem] text-[19px] leading-normal text-graphite">{item.hint}</p> : null}
      </>
    )
  }

  if (item.term) {
    return (
      <>
        <h2 className={cx(heading, 'text-[54px]')}>
          {item.lead}{' '}
          <span className="inline-block -rotate-[1.5deg] rounded-[14px] border-2 border-ink bg-lime px-3">
            {item.term}
          </span>
          ?
        </h2>
        {item.context ? (
          <p className="max-w-[28.75rem] text-[19px] leading-normal text-graphite">
            “<Highlight text={item.context} term={item.term} />”
          </p>
        ) : null}
      </>
    )
  }

  return <h2 className={cx(heading, item.question.length > 70 ? 'text-4xl' : 'text-[54px]')}>{item.question}</h2>
}

/** Um tracinho por questão: lima = acerto, coral = erro, claro = atual. */
function ProgressSegments({ items, results, index, className, light = false }) {
  return (
    <ol
      aria-label="Andamento da rodada"
      className={cx('grid', light ? 'gap-1.5' : 'gap-1', className)}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, position) => {
        const status = results[position] ?? (position === index ? 'current' : 'pending')
        const style = light ? RESULT_STYLE_LIGHT[status] : RESULT_STYLE[status]
        return (
          <li
            key={item.id}
            className={cx(light ? 'h-3.5 rounded-[5px] border-2 border-ink' : 'h-3 rounded', style.className)}
          >
            <span className="sr-only">
              Questão {position + 1}: {style.text}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
