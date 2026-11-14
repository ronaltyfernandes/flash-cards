import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, IconButton } from '../components/Button'
import { BoltIcon, Icon } from '../components/Icon'
import { CodeChip, DeckChip } from '../components/Chip'
import { DeckBadge } from '../components/DeckTile'
import { Field, Input, Segmented, Textarea } from '../components/Field'
import { Kbd } from '../components/Kbd'
import { ProgressBar } from '../components/ProgressBar'
import { PageHeader, Screen, SectionTitle } from '../components/Screen'
import { DAY, endOfDay, startOfDay } from '../lib/dates'
import { countQuizItems } from '../lib/quiz'
import { buildSession, stageOf } from '../lib/srs'
import { learnedPercent } from '../lib/stats'
import { DESKTOP, useMediaQuery } from '../lib/useMediaQuery'
import { cx, plural } from '../lib/utils'
import { useStore } from '../store/context'
import NotFound from './NotFound'

const READING_LANGUAGES = ['JA', 'ZH', 'KO']

const STAGE_CHIP = {
  new: { label: 'Novo', className: 'bg-paper-deep' },
  learning: { label: 'Aprendendo', className: 'bg-violet-light' },
  mastered: { label: 'Dominado', className: 'bg-lime' },
}

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Novos' },
  { value: 'learning', label: 'Aprendendo' },
  { value: 'mastered', label: 'Dominados' },
]

export default function DeckDetail({ params }) {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const desktop = useMediaQuery(DESKTOP)
  const [now] = useState(() => Date.now())
  // O que está aguardando confirmação para apagar: 'deck', 'card:<id>' ou 'question:<id>'
  const [confirming, setConfirming] = useState(null)

  const deck = state.decks.find((d) => d.id === params.deckId)
  if (!deck) return <NotFound title="Baralho não encontrado" backTo="/baralhos" backLabel="Ver baralhos" />

  const cards = state.cards.filter((card) => card.deckId === deck.id)
  const questions = state.questions.filter((question) => question.deckId === deck.id)
  const info = {
    cards,
    questions,
    dueCount: buildSession(state, now, deck.id).length,
    percent: learnedPercent(cards),
    quizCount: countQuizItems(state, deck.id),
  }

  function deleteDeck() {
    actions.deleteDeck(deck.id)
    navigate('/baralhos', { replace: true })
  }

  const questionList = (
    <QuestionList
      deck={deck}
      questions={questions}
      confirming={confirming}
      setConfirming={setConfirming}
      onDelete={actions.deleteQuestion}
    />
  )
  const dangerZone = (
    <DeleteDeck
      deck={deck}
      cardCount={cards.length}
      confirming={confirming === 'deck'}
      onAsk={() => setConfirming('deck')}
      onCancel={() => setConfirming(null)}
      onDelete={deleteDeck}
    />
  )

  if (desktop) {
    return (
      <Screen>
        <DeckDesktop
          deck={deck}
          info={info}
          now={now}
          actions={actions}
          questionList={questionList}
          dangerZone={dangerZone}
        />
      </Screen>
    )
  }

  const { dueCount, percent, quizCount } = info

  return (
    <Screen>
      <PageHeader
        title={deck.name}
        backTo="/baralhos"
        action={<IconButton icon="edit" label="Editar baralho" to={`/baralhos/${deck.id}/editar`} />}
      />

      <section className="flex items-center gap-4 rounded-tile border-2 border-ink bg-white p-4 shadow-hard sm:p-5">
        <DeckBadge deck={deck} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {deck.kind === 'language' ? <DeckChip deck={deck} tone="paper" /> : null}
            <span className="text-[13px] text-graphite">
              {plural(cards.length, 'cartão', 'cartões')}
              {questions.length > 0 ? ` · ${plural(questions.length, 'questão', 'questões')}` : ''}
            </span>
          </div>
          <ProgressBar value={percent} label={`${percent}% aprendido`} />
          <p className="text-[13px] text-graphite">
            {percent}% aprendido · {cards.length === 0 ? 'vazio' : dueCount > 0 ? `${dueCount} p/ hoje` : 'em dia'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <StudyButton deck={deck} cards={cards} dueCount={dueCount} />
        <Button to={quizCount > 0 ? `/questoes/${deck.id}` : undefined} disabled={quizCount === 0} variant="lime">
          Questões
        </Button>
      </div>

      <SectionTitle action={<AddLink to={`/criar?deck=${deck.id}`}>Adicionar</AddLink>}>Cartões</SectionTitle>
      {cards.length === 0 ? (
        <p className="rounded-tile border-2 border-dashed border-ink p-4 text-[15px] leading-normal text-graphite">
          Nenhum cartão ainda. Toque em “Adicionar” para criar o primeiro.
        </p>
      ) : (
        // Tablet: duas colunas
        <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          {cards.map((card) => (
            <ItemRow
              key={card.id}
              title={card.front}
              subtitle={card.back}
              editTo={`/editar/cartao/${card.id}`}
              confirming={confirming === `card:${card.id}`}
              onAskDelete={() => setConfirming(`card:${card.id}`)}
              onCancel={() => setConfirming(null)}
              onDelete={() => actions.deleteCard(card.id)}
            />
          ))}
        </ul>
      )}

      {questionList}
      {dangerZone}
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Desktop: lista vira tabela, e a edição abre ao lado                  */
/* ------------------------------------------------------------------ */

function DeckDesktop({ deck, info, now, actions, questionList, dangerZone }) {
  const { cards, questions, dueCount, percent, quizCount } = info
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const term = search.trim().toLowerCase()
  const visible = cards.filter((card) => {
    if (filter !== 'all' && stageOf(card) !== filter) return false
    if (!term) return true
    return `${card.front} ${card.back}`.toLowerCase().includes(term)
  })
  const selected = cards.find((card) => card.id === selectedId) ?? null

  return (
    <div className="flex flex-wrap items-start gap-7">
      <div className="flex min-w-0 flex-[999_1_32.5rem] flex-col gap-5.5">
        <nav aria-label="Caminho" className="text-sm text-graphite">
          <Link to="/baralhos" className="font-semibold text-violet no-underline">
            Baralhos
          </Link>{' '}
          / {deck.name}
        </nav>

        <header className="flex flex-wrap items-center gap-4.5">
          <DeckBadge deck={deck} size="xl" />
          <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 font-display text-[40px] leading-[1.02] font-extrabold tracking-[-0.03em] break-words">
                {deck.name}
              </h1>
              <IconButton icon="edit" label="Editar baralho" to={`/baralhos/${deck.id}/editar`} className="size-10!" />
            </div>
            <p className="flex flex-wrap items-center gap-2.5 text-sm text-graphite">
              {deck.kind === 'language' ? <DeckChip deck={deck} className="text-ink" /> : null}
              <span>
                {plural(cards.length, 'cartão', 'cartões')} · {percent}% aprendido
                {questions.length > 0 ? ` · ${plural(questions.length, 'questão', 'questões')}` : ''}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <StudyButton deck={deck} cards={cards} dueCount={dueCount} desktop />
            <Button
              to={quizCount > 0 ? `/questoes/${deck.id}` : undefined}
              disabled={quizCount === 0}
              variant="lime"
              className="px-4.5!"
            >
              Questões
            </Button>
          </div>
        </header>

        {cards.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-tile border-2 border-dashed border-ink p-5">
            <p className="text-[15px] leading-normal text-graphite">Nenhum cartão ainda neste baralho.</p>
            <Button to={`/criar?deck=${deck.id}`} size="sm">
              <Icon name="plus" size={18} strokeWidth={2.6} />
              Criar cartão
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <div className="w-full max-w-[26rem]">
                <Segmented label="Filtrar cartões" options={FILTERS} value={filter} onChange={setFilter} size="sm" />
              </div>
              <div className="relative flex-[0_1_16.25rem]">
                <Icon name="search" size={18} className="pointer-events-none absolute top-3.25 left-3.5" />
                <Input
                  id="busca"
                  type="search"
                  aria-label="Buscar neste baralho"
                  aria-keyshortcuts="/"
                  placeholder="Buscar neste baralho"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11! rounded-chip! pr-3.5! pl-10! text-sm!"
                />
              </div>
            </div>

            <CardTable cards={visible} now={now} selectedId={selectedId} onSelect={setSelectedId} />
            {visible.length === 0 ? <p className="text-[15px] text-graphite">Nenhum cartão com esse filtro.</p> : null}
          </>
        )}

        {questionList}
        {dangerZone}
      </div>

      {/* Painel de edição: no celular é outra tela */}
      <div className="sticky top-10 flex min-w-0 flex-[1_1_21.25rem] flex-col">
        {selected ? (
          <CardEditPanel
            key={selected.id}
            card={selected}
            deck={deck}
            actions={actions}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-3xl border-2 border-dashed border-ink p-6">
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em]">Editar cartão</h2>
            <p className="text-[15px] leading-normal text-graphite">
              Escolha um cartão na tabela para editar aqui do lado, sem sair da lista.
            </p>
            <Button to={`/criar?deck=${deck.id}`} size="sm" aria-keyshortcuts="N">
              <Icon name="plus" size={18} strokeWidth={2.6} />
              Novo cartão
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Quando o cartão volta: "hoje", "amanhã", "12 dias"... */
function dueLabel(card, now) {
  if (card.srs.reps === 0) return 'ainda não visto'
  if (card.srs.due <= endOfDay(now)) return 'hoje'
  const days = Math.round((startOfDay(card.srs.due) - startOfDay(now)) / DAY)
  return days === 1 ? 'amanhã' : `${days} dias`
}

function CardTable({ cards, now, selectedId, onSelect }) {
  if (cards.length === 0) return null
  const cell = 'border-t border-paper-line px-4.5 py-2.75'
  return (
    <div className="overflow-x-auto rounded-tile border-2 border-ink bg-white">
      <table className="w-full min-w-[35rem] border-collapse text-[15px]">
        <caption className="sr-only">Cartões do baralho. Escolha um para editar.</caption>
        <thead>
          <tr className="text-left text-[13px] text-graphite">
            {['Frente', 'Verso', 'Situação', 'Volta em'].map((label) => (
              <th key={label} scope="col" className="border-b-2 border-ink px-4.5 py-3 font-semibold">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => {
            const stage = STAGE_CHIP[stageOf(card)]
            const isSelected = card.id === selectedId
            return (
              <tr
                key={card.id}
                onClick={() => onSelect(card.id)}
                className={cx('cursor-pointer', isSelected ? 'bg-violet-tint' : 'hover:bg-paper')}
              >
                <th scope="row" className={cx(cell, 'text-left font-normal')}>
                  {/* O botão deixa a linha acessível pelo teclado */}
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelect(card.id)
                    }}
                    className="flex flex-col items-start text-left"
                  >
                    <span className="font-bold">{card.front}</span>
                    {card.ipa ? <span className="font-mono text-xs text-graphite">{card.ipa}</span> : null}
                  </button>
                </th>
                <td className={cell}>{card.back}</td>
                <td className={cell}>
                  <span
                    className={cx(
                      'inline-block rounded-full border-2 border-ink px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap',
                      stage.className,
                    )}
                  >
                    {stage.label}
                  </span>
                </td>
                <td className={cx(cell, 'font-mono text-[13px] whitespace-nowrap')}>{dueLabel(card, now)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Edição de um cartão ao lado da tabela. Ctrl+S salva. */
function CardEditPanel({ card, deck, actions, onClose }) {
  const isLanguage = deck.kind === 'language'
  const [fields, setFields] = useState({
    front: card.front,
    back: card.back,
    ipa: card.ipa ?? '',
    example: card.example ?? '',
    exampleTranslation: card.exampleTranslation ?? '',
  })
  const [autoQuiz, setAutoQuiz] = useState(card.autoQuiz ?? true)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function setField(name, value) {
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSaved(false)
  }

  function save() {
    const found = {}
    if (!fields.front.trim()) found.front = 'Escreva a frente do cartão.'
    if (!fields.back.trim()) found.back = 'Escreva o verso.'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    actions.updateCard(card.id, {
      deckId: deck.id,
      front: fields.front.trim(),
      back: fields.back.trim(),
      ipa: isLanguage ? fields.ipa.trim() : '',
      example: fields.example.trim(),
      exampleTranslation: isLanguage ? fields.exampleTranslation.trim() : '',
      image: card.image ?? null,
      autoQuiz,
    })
    setSaved(true)
  }

  const onKeyDown = useEffectEvent((event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      save()
    }
  })

  useEffect(() => {
    const listener = (event) => onKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  return (
    <form
      aria-label="Editar cartão"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
      className="flex flex-col gap-4 rounded-3xl border-2 border-ink bg-white p-6 shadow-hard-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em]">Editar cartão</h2>
        <IconButton icon="close" label="Fechar edição" onClick={onClose} className="size-10!" />
      </div>

      <Field
        label="Frente"
        htmlFor="panel-front"
        aside={isLanguage ? <CodeChip>{deck.from}</CodeChip> : null}
        error={errors.front}
      >
        <Input
          id="panel-front"
          value={fields.front}
          aria-invalid={Boolean(errors.front)}
          onChange={(event) => setField('front', event.target.value)}
          className="h-12.5! text-lg! font-semibold shadow-hard-violet"
        />
      </Field>
      <Field
        label="Verso"
        htmlFor="panel-back"
        aside={isLanguage ? <CodeChip>{deck.to}</CodeChip> : null}
        error={errors.back}
      >
        <Input
          id="panel-back"
          value={fields.back}
          aria-invalid={Boolean(errors.back)}
          onChange={(event) => setField('back', event.target.value)}
          className="h-12!"
        />
      </Field>
      {isLanguage ? (
        <Field label={READING_LANGUAGES.includes(deck.from) ? 'Leitura' : 'Fonética'} htmlFor="panel-ipa">
          <Input
            id="panel-ipa"
            value={fields.ipa}
            onChange={(event) => setField('ipa', event.target.value)}
            className="h-12! font-mono text-sm!"
          />
        </Field>
      ) : null}
      <Field label="Frase de exemplo" htmlFor="panel-example" optional>
        <Textarea
          id="panel-example"
          rows={2}
          value={fields.example}
          onChange={(event) => setField('example', event.target.value)}
          className="text-[15px]!"
        />
      </Field>
      {isLanguage ? (
        <Field label="Tradução da frase" htmlFor="panel-example-translation" optional>
          <Input
            id="panel-example-translation"
            value={fields.exampleTranslation}
            onChange={(event) => setField('exampleTranslation', event.target.value)}
            className="h-12!"
          />
        </Field>
      ) : null}

      <label htmlFor="panel-auto" className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-lime p-3">
        <span className="flex size-8.5 shrink-0 items-center justify-center rounded-[10px] bg-ink text-lime">
          <BoltIcon />
        </span>
        <span className="flex-1 text-sm font-bold">Gerar questões automaticamente</span>
        <input
          id="panel-auto"
          type="checkbox"
          checked={autoQuiz}
          onChange={(event) => {
            setAutoQuiz(event.target.checked)
            setSaved(false)
          }}
          className="size-5 shrink-0 accent-ink"
        />
      </label>

      {confirming ? (
        <div role="alertdialog" aria-label="Apagar cartão" className="flex flex-col gap-2.5">
          <p className="text-[15px]">Apagar “{card.front}” de vez?</p>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="sm" autoFocus onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                actions.deleteCard(card.id)
                onClose()
              }}
            >
              Apagar cartão
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex gap-2.5">
          <IconButton
            icon="trash"
            label="Apagar cartão"
            onClick={() => setConfirming(true)}
            className="size-13! rounded-btn! border-dashed bg-transparent!"
          />
          <Button type="submit" aria-keyshortcuts="Control+S" className="flex-1">
            Salvar
            <Kbd tone="flat">Ctrl S</Kbd>
          </Button>
        </div>
      )}

      <p role="status" className="min-h-5 text-[13px] font-semibold text-graphite">
        {saved ? 'Salvo!' : ''}
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Partes em comum                                                     */
/* ------------------------------------------------------------------ */

function StudyButton({ deck, cards, dueCount, desktop = false }) {
  if (dueCount > 0) {
    return (
      <Button to={`/estudar/${deck.id}`} className={desktop ? 'px-4.5!' : undefined}>
        Estudar
        {desktop ? (
          <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[13px] text-ink">{dueCount}</span>
        ) : null}
      </Button>
    )
  }
  return (
    <Button
      to={cards.length > 0 ? `/estudar/${deck.id}?modo=livre` : undefined}
      disabled={cards.length === 0}
      variant="secondary"
      className={desktop ? 'px-4.5!' : undefined}
    >
      Revisar tudo
    </Button>
  )
}

function QuestionList({ deck, questions, confirming, setConfirming, onDelete }) {
  return (
    <>
      <SectionTitle action={<AddLink to={`/criar?deck=${deck.id}&tipo=questao`}>Adicionar</AddLink>}>
        Questões
      </SectionTitle>
      {questions.length === 0 ? (
        <p className="text-[15px] leading-normal text-graphite">
          Nenhuma questão escrita por você. As questões automáticas saem dos cartões.
        </p>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          {questions.map((question) => (
            <ItemRow
              key={question.id}
              title={question.prompt}
              subtitle={question.answer}
              editTo={`/editar/questao/${question.id}`}
              confirming={confirming === `question:${question.id}`}
              onAskDelete={() => setConfirming(`question:${question.id}`)}
              onCancel={() => setConfirming(null)}
              onDelete={() => onDelete(question.id)}
            />
          ))}
        </ul>
      )}
    </>
  )
}

function DeleteDeck({ deck, cardCount, confirming, onAsk, onCancel, onDelete }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-paper-line pt-5">
      {confirming ? (
        <div role="alertdialog" aria-label="Apagar baralho" className="flex flex-col gap-3">
          <p className="text-[15px] leading-normal">
            Apagar “{deck.name}” com {plural(cardCount, 'cartão', 'cartões')}? Não dá para desfazer.
          </p>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="sm" autoFocus onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete}>
              Apagar baralho
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="dashed" size="sm" className="self-start font-semibold!" onClick={onAsk}>
          <Icon name="trash" size={18} />
          Apagar baralho
        </Button>
      )}
    </div>
  )
}

function AddLink({ to, children }) {
  return (
    <Link to={to} className="flex min-h-11 items-center gap-1 text-[15px] font-bold text-violet no-underline">
      <Icon name="plus" size={18} strokeWidth={2.6} />
      {children}
    </Link>
  )
}

/** Linha de cartão ou questão, com editar e apagar (com confirmação). */
function ItemRow({ title, subtitle, editTo, confirming, onAskDelete, onCancel, onDelete }) {
  return (
    <li className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-white py-2.5 pr-2.5 pl-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base font-bold">{title}</span>
        <span className="truncate text-sm text-graphite">{confirming ? 'Apagar de vez?' : subtitle}</span>
      </div>
      {confirming ? (
        <>
          <Button variant="secondary" size="sm" className="px-3!" autoFocus onClick={onCancel}>
            Não
          </Button>
          <Button variant="danger" size="sm" className="px-3!" onClick={onDelete}>
            Apagar
          </Button>
        </>
      ) : (
        <>
          <IconButton icon="edit" label={`Editar: ${title}`} to={editTo} />
          <IconButton icon="trash" label={`Apagar: ${title}`} onClick={onAskDelete} />
        </>
      )}
    </li>
  )
}
