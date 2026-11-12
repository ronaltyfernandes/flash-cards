import { useEffect, useRef, useState } from 'react'
import { Button, IconButton } from '../components/Button'
import { CodeChip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import { Field, Input, Segmented, Select, Textarea } from '../components/Field'
import { BoltIcon, Icon } from '../components/Icon'
import { PageHeader, Screen } from '../components/Screen'
import { Toast } from '../components/Toast'
import { imageFileToDataUrl } from '../lib/image'
import { canSpeak, speak } from '../lib/languages'
import { navigate } from '../lib/router'
import { useStore } from '../store/context'
import NotFound from './NotFound'

const TYPE_OPTIONS = [
  { value: 'card', label: 'Cartão' },
  { value: 'question', label: 'Questão' },
]

const READING_LANGUAGES = ['JA', 'ZH', 'KO']

/** Criar ou editar um cartão ou uma questão. */
export default function Create({ params, query }) {
  const { state, actions } = useStore()
  const card = params.cardId ? state.cards.find((c) => c.id === params.cardId) : null
  const question = params.questionId ? state.questions.find((q) => q.id === params.questionId) : null

  if ((params.cardId && !card) || (params.questionId && !question)) {
    return <NotFound title="Não encontrei esse item" backTo="/baralhos" backLabel="Ver baralhos" />
  }

  if (state.decks.length === 0) {
    return (
      <Screen>
        <PageHeader title="Novo cartão" backTo="/" />
        <EmptyState title="Primeiro, um baralho" action={<Button to="/baralhos/novo">Criar baralho</Button>}>
          Cartões e questões ficam dentro de baralhos. Crie um e volte aqui.
        </EmptyState>
      </Screen>
    )
  }

  const fromDeck = state.decks.some((deck) => deck.id === query.deck) ? query.deck : null
  const initialDeckId = card?.deckId ?? question?.deckId ?? fromDeck ?? state.decks[0].id
  const editing = Boolean(card || question)

  return (
    <CreateForm
      decks={state.decks}
      actions={actions}
      card={card}
      question={question}
      initialDeckId={initialDeckId}
      initialType={question || (!card && query.tipo === 'questao') ? 'question' : 'card'}
      backTo={editing || fromDeck ? `/baralhos/${initialDeckId}` : '/'}
    />
  )
}

function emptyFields() {
  return {
    front: '',
    back: '',
    ipa: '',
    example: '',
    exampleTranslation: '',
    image: null,
    prompt: '',
    answer: '',
    wrong: ['', '', ''],
    explanation: '',
  }
}

function CreateForm({ decks, actions, card, question, initialDeckId, initialType, backTo }) {
  const editing = Boolean(card || question)
  const [type, setType] = useState(initialType)
  const [deckId, setDeckId] = useState(initialDeckId)
  const [autoQuiz, setAutoQuiz] = useState(card?.autoQuiz ?? true)
  const [fields, setFields] = useState(() => ({
    ...emptyFields(),
    ...(card
      ? {
          front: card.front,
          back: card.back,
          ipa: card.ipa,
          example: card.example,
          exampleTranslation: card.exampleTranslation,
          image: card.image,
        }
      : null),
    ...(question
      ? {
          prompt: question.prompt,
          answer: question.answer,
          wrong: [...question.wrong, '', '', ''].slice(0, 3),
          explanation: question.explanation ?? '',
        }
      : null),
  }))
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const firstFieldRef = useRef(null)
  const fileInputRef = useRef(null)

  // O aviso some sozinho depois de um tempo
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const deck = decks.find((d) => d.id === deckId) ?? decks[0]
  const isLanguage = deck.kind === 'language'
  const isCard = type === 'card'

  function setField(name, value) {
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function setWrong(position, value) {
    setFields((current) => ({ ...current, wrong: current.wrong.map((w, i) => (i === position ? value : w)) }))
    setErrors((current) => ({ ...current, wrong: undefined }))
  }

  function validate() {
    const found = {}
    if (isCard) {
      if (!fields.front.trim()) found.front = 'Escreva a frente do cartão.'
      if (!fields.back.trim()) found.back = 'Escreva o verso.'
    } else {
      if (!fields.prompt.trim()) found.prompt = 'Escreva o enunciado.'
      if (!fields.answer.trim()) found.answer = 'Escreva a resposta certa.'
      if (!fields.wrong.some((w) => w.trim())) found.wrong = 'Escreva pelo menos uma alternativa errada.'
    }
    setErrors(found)
    return Object.keys(found).length === 0
  }

  function save({ keepGoing }) {
    if (!validate()) return

    if (isCard) {
      const data = {
        deckId: deck.id,
        front: fields.front.trim(),
        back: fields.back.trim(),
        ipa: isLanguage ? fields.ipa.trim() : '',
        example: fields.example.trim(),
        exampleTranslation: isLanguage ? fields.exampleTranslation.trim() : '',
        image: fields.image,
        autoQuiz,
      }
      if (card) actions.updateCard(card.id, data)
      else actions.addCard(data)
    } else {
      const data = {
        deckId: deck.id,
        prompt: fields.prompt.trim(),
        answer: fields.answer.trim(),
        wrong: fields.wrong.map((w) => w.trim()).filter(Boolean),
        explanation: fields.explanation.trim(),
      }
      if (question) actions.updateQuestion(question.id, data)
      else actions.addQuestion(data)
    }

    if (keepGoing) {
      setFields(emptyFields())
      setToast(isCard ? 'Cartão salvo! Bora pro próximo.' : 'Questão salva! Bora pra próxima.')
      firstFieldRef.current?.focus()
    } else {
      navigate(`/baralhos/${deck.id}`)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    save({ keepGoing: !editing })
  }

  async function handleImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setField('image', await imageFileToDataUrl(file))
    } catch (error) {
      setErrors((current) => ({ ...current, image: error.message }))
    }
  }

  const title = editing ? (isCard ? 'Editar cartão' : 'Editar questão') : isCard ? 'Novo cartão' : 'Nova questão'

  return (
    <Screen>
      <PageHeader title={title} backTo={backTo} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4.5">
        {editing ? null : <Segmented label="Tipo" options={TYPE_OPTIONS} value={type} onChange={setType} />}

        <Field label="Baralho" htmlFor="create-deck">
          <Select id="create-deck" value={deck.id} onChange={(event) => setDeckId(event.target.value)}>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>

        {isCard ? (
          <>
            <Field
              label="Frente"
              htmlFor="card-front"
              aside={isLanguage ? <CodeChip>{deck.from}</CodeChip> : null}
              error={errors.front}
            >
              <Input
                id="card-front"
                ref={firstFieldRef}
                value={fields.front}
                placeholder={isLanguage ? 'Palavra ou expressão' : 'Pergunta ou termo'}
                className="text-lg font-semibold"
                aria-invalid={Boolean(errors.front)}
                onChange={(event) => setField('front', event.target.value)}
              />
            </Field>

            <div className={isLanguage ? 'grid grid-cols-2 gap-3' : undefined}>
              <Field
                label="Verso"
                htmlFor="card-back"
                aside={isLanguage ? <CodeChip>{deck.to}</CodeChip> : null}
                error={errors.back}
              >
                <Input
                  id="card-back"
                  value={fields.back}
                  placeholder={isLanguage ? 'Tradução' : 'Resposta'}
                  aria-invalid={Boolean(errors.back)}
                  onChange={(event) => setField('back', event.target.value)}
                />
              </Field>
              {isLanguage ? (
                <Field label={READING_LANGUAGES.includes(deck.from) ? 'Leitura' : 'Fonética'} htmlFor="card-ipa">
                  <Input
                    id="card-ipa"
                    value={fields.ipa}
                    placeholder={READING_LANGUAGES.includes(deck.from) ? 'mizu' : '/ˈwɝːd/'}
                    className="font-mono text-sm"
                    onChange={(event) => setField('ipa', event.target.value)}
                  />
                </Field>
              ) : null}
            </div>

            <Field label="Frase de exemplo" htmlFor="card-example" optional>
              <Textarea
                id="card-example"
                rows={2}
                value={fields.example}
                onChange={(event) => setField('example', event.target.value)}
              />
            </Field>

            {isLanguage ? (
              <Field label="Tradução da frase" htmlFor="card-example-translation" optional>
                <Input
                  id="card-example-translation"
                  value={fields.exampleTranslation}
                  onChange={(event) => setField('exampleTranslation', event.target.value)}
                />
              </Field>
            ) : null}

            <div className="flex gap-2.5">
              {isLanguage && canSpeak() ? (
                <Button
                  variant="dashed"
                  size="sm"
                  className="h-12! flex-1 font-semibold!"
                  disabled={!fields.front.trim()}
                  onClick={() => speak(fields.front, deck.from)}
                >
                  <Icon name="volume" size={18} />
                  Ouvir
                </Button>
              ) : null}
              <Button
                variant="dashed"
                size="sm"
                className="h-12! flex-1 font-semibold!"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="image" size={18} />
                {fields.image ? 'Trocar imagem' : 'Imagem'}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImage} />
            </div>

            {errors.image ? (
              <p role="alert" className="text-[13px] font-semibold">
                {errors.image}
              </p>
            ) : null}

            {fields.image ? (
              <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-white p-2.5">
                <img
                  src={fields.image}
                  alt="Imagem do cartão"
                  className="size-16 rounded-[10px] border-2 border-ink object-cover"
                />
                <span className="flex-1 text-sm text-graphite">Aparece na frente do cartão.</span>
                <IconButton icon="trash" label="Remover imagem" onClick={() => setField('image', null)} />
              </div>
            ) : null}

            <label
              htmlFor="card-auto-quiz"
              className="flex items-center gap-3 rounded-[18px] border-2 border-ink bg-lime p-3.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ink text-lime">
                <BoltIcon />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-bold">Gerar questões automaticamente</span>
                <span className="text-[13px]">Múltipla escolha e completar a frase</span>
              </span>
              <input
                id="card-auto-quiz"
                type="checkbox"
                checked={autoQuiz}
                onChange={(event) => setAutoQuiz(event.target.checked)}
                className="size-5.5 shrink-0 accent-ink"
              />
            </label>
          </>
        ) : (
          <>
            <Field label="Enunciado" htmlFor="question-prompt" error={errors.prompt}>
              <Textarea
                id="question-prompt"
                ref={firstFieldRef}
                rows={3}
                value={fields.prompt}
                placeholder="Escreva a pergunta"
                aria-invalid={Boolean(errors.prompt)}
                onChange={(event) => setField('prompt', event.target.value)}
              />
            </Field>

            <Field label="Resposta certa" htmlFor="question-answer" error={errors.answer}>
              <Input
                id="question-answer"
                value={fields.answer}
                className="shadow-hard-lime"
                aria-invalid={Boolean(errors.answer)}
                onChange={(event) => setField('answer', event.target.value)}
              />
            </Field>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-sm font-semibold">Alternativas erradas</legend>
              {fields.wrong.map((value, position) => (
                <Input
                  key={position}
                  aria-label={`Alternativa errada ${position + 1}`}
                  placeholder={position === 0 ? 'Pelo menos uma' : 'Opcional'}
                  value={value}
                  onChange={(event) => setWrong(position, event.target.value)}
                />
              ))}
              {errors.wrong ? (
                <p role="alert" className="text-[13px] font-semibold">
                  <span className="mr-1.5 rounded-md bg-coral px-1.5 py-0.5">!</span>
                  {errors.wrong}
                </p>
              ) : null}
            </fieldset>

            <Field
              label="Explicação"
              htmlFor="question-explanation"
              optional
              hint="Aparece depois que a pessoa responde."
            >
              <Textarea
                id="question-explanation"
                rows={2}
                value={fields.explanation}
                onChange={(event) => setField('explanation', event.target.value)}
              />
            </Field>
          </>
        )}

        <div className="min-h-2 flex-1" />

        <div className="flex gap-2.5">
          {editing ? (
            <>
              <Button to={backTo} variant="secondary" size="lg" className="px-5!">
                Cancelar
              </Button>
              <Button type="submit" size="lg" className="flex-1">
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="lg" className="px-5!" onClick={() => save({ keepGoing: false })}>
                Salvar
              </Button>
              <Button type="submit" size="lg" className="flex-1 px-3!">
                {isCard ? 'Salvar e criar outro' : 'Salvar e criar outra'}
              </Button>
            </>
          )}
        </div>
      </form>

      {toast ? <Toast>{toast}</Toast> : null}
    </Screen>
  )
}
