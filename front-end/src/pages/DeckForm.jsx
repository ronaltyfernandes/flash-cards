import { useState } from 'react'
import { Button } from '../components/Button'
import { DeckBadge } from '../components/DeckTile'
import { Field, Input, Segmented, Select } from '../components/Field'
import { Icon } from '../components/Icon'
import { PageHeader, Screen } from '../components/Screen'
import { DECK_COLORS, LANGUAGES, languageName } from '../lib/languages'
import { useNavigate } from 'react-router'
import { cx } from '../lib/utils'
import { useStore } from '../store/context'
import NotFound from './NotFound'

const KIND_OPTIONS = [
  { value: 'language', label: 'Idioma' },
  { value: 'subject', label: 'Outro assunto' },
]

/** Criar ou editar um baralho. */
export default function DeckForm({ params }) {
  const { state, actions } = useStore()
  const editing = params.deckId ? state.decks.find((deck) => deck.id === params.deckId) : null

  if (params.deckId && !editing) {
    return <NotFound title="Baralho não encontrado" backTo="/baralhos" backLabel="Ver baralhos" />
  }
  return <DeckFormFields editing={editing} actions={actions} deckCount={state.decks.length} />
}

function DeckFormFields({ editing, actions, deckCount }) {
  const navigate = useNavigate()
  const colorKeys = Object.keys(DECK_COLORS)
  const [kind, setKind] = useState(editing?.kind ?? 'language')
  const [name, setName] = useState(editing?.name ?? '')
  const [from, setFrom] = useState(editing?.from ?? 'EN')
  const [to, setTo] = useState(editing?.to ?? 'PT')
  const [code, setCode] = useState(editing?.code ?? '')
  const [color, setColor] = useState(editing?.color ?? colorKeys[deckCount % colorKeys.length])
  const [error, setError] = useState(null)

  const backTo = editing ? `/baralhos/${editing.id}` : '/baralhos'
  const autoCode = name.trim().slice(0, 3)
  const preview = { kind, from, code: code.trim() || autoCode || '?', color }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Dê um nome ao baralho.')
      return
    }
    const data =
      kind === 'language'
        ? { name: trimmed, kind, from, to, color }
        : { name: trimmed, kind, code: code.trim() || autoCode, color }

    if (editing) {
      actions.updateDeck(editing.id, data)
      navigate(backTo)
    } else {
      const deck = actions.addDeck(data)
      navigate(`/baralhos/${deck.id}`, { replace: true })
    }
  }

  return (
    <Screen width="narrow">
      <PageHeader title={editing ? 'Editar baralho' : 'Novo baralho'} backTo={backTo} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5">
        <Segmented label="Tipo de baralho" options={KIND_OPTIONS} value={kind} onChange={setKind} />

        <Field label="Nome" htmlFor="deck-name" error={error}>
          <Input
            id="deck-name"
            autoFocus={!editing}
            value={name}
            maxLength={60}
            placeholder={kind === 'language' ? 'Ex.: Inglês · Phrasal verbs' : 'Ex.: Biologia · A célula'}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setName(event.target.value)
              setError(null)
            }}
          />
        </Field>

        {kind === 'language' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estou aprendendo" htmlFor="deck-from">
              <Select id="deck-from" value={from} onChange={(event) => setFrom(event.target.value)}>
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Traduzo para" htmlFor="deck-to">
              <Select id="deck-to" value={to} onChange={(event) => setTo(event.target.value)}>
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : (
          <Field
            label="Sigla"
            htmlFor="deck-code"
            optional
            hint="Até 3 letras, aparece no selo do baralho. Se ficar vazia, uso o começo do nome."
          >
            <Input
              id="deck-code"
              value={code}
              maxLength={3}
              placeholder={autoCode || 'Bio'}
              className="font-mono"
              onChange={(event) => setCode(event.target.value)}
            />
          </Field>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">Cor do selo</legend>
          <div className="flex items-center gap-4">
            <DeckBadge deck={preview} size="lg" />
            <div className="grid grid-cols-3 gap-2">
              {colorKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-label={DECK_COLORS[key].name}
                  aria-pressed={color === key}
                  onClick={() => setColor(key)}
                  className={cx(
                    'size-11 rounded-chip border-2 border-ink',
                    DECK_COLORS[key].className,
                    color === key && 'shadow-hard-sm',
                  )}
                >
                  {color === key ? <Icon name="check" size={18} strokeWidth={3} className="mx-auto" /> : null}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        {kind === 'language' ? (
          <p className="text-[13px] leading-normal text-graphite">
            Os cartões deste baralho vão de {languageName(from)} para {languageName(to)}. A pronúncia é lida em{' '}
            {languageName(from)}.
          </p>
        ) : null}

        <div className="flex-1" />

        <div className="flex gap-2.5">
          <Button to={backTo} variant="secondary" size="lg" className="px-5!">
            Cancelar
          </Button>
          <Button type="submit" size="lg" className="flex-1">
            {editing ? 'Salvar' : 'Criar baralho'}
          </Button>
        </div>
      </form>
    </Screen>
  )
}
