import { useState } from 'react'
import { Button, IconButton } from '../components/Button'
import { DeckChip } from '../components/Chip'
import { DeckBadge } from '../components/DeckTile'
import { Icon } from '../components/Icon'
import { Link } from '../components/Link'
import { ProgressBar } from '../components/ProgressBar'
import { PageHeader, Screen, SectionTitle } from '../components/Screen'
import { countQuizItems } from '../lib/quiz'
import { navigate } from '../lib/router'
import { buildSession } from '../lib/srs'
import { learnedPercent } from '../lib/stats'
import { plural } from '../lib/utils'
import { useStore } from '../store/context'
import NotFound from './NotFound'

export default function DeckDetail({ params }) {
  const { state, actions } = useStore()
  const [now] = useState(() => Date.now())
  // O que está aguardando confirmação para apagar: 'deck', 'card:<id>' ou 'question:<id>'
  const [confirming, setConfirming] = useState(null)

  const deck = state.decks.find((d) => d.id === params.deckId)
  if (!deck) return <NotFound title="Baralho não encontrado" backTo="/baralhos" backLabel="Ver baralhos" />

  const cards = state.cards.filter((card) => card.deckId === deck.id)
  const questions = state.questions.filter((question) => question.deckId === deck.id)
  const dueCount = buildSession(state, now, deck.id).length
  const percent = learnedPercent(cards)
  const quizCount = countQuizItems(state, deck.id)

  function deleteDeck() {
    actions.deleteDeck(deck.id)
    navigate('/baralhos', { replace: true })
  }

  return (
    <Screen>
      <PageHeader
        title={deck.name}
        backTo="/baralhos"
        action={<IconButton icon="edit" label="Editar baralho" to={`/baralhos/${deck.id}/editar`} />}
      />

      <section className="flex items-center gap-4 rounded-tile border-2 border-ink bg-white p-4 shadow-hard">
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

      <div className="grid grid-cols-2 gap-3">
        {dueCount > 0 ? (
          <Button to={`/estudar/${deck.id}`}>Estudar</Button>
        ) : (
          <Button
            to={cards.length > 0 ? `/estudar/${deck.id}?modo=livre` : undefined}
            disabled={cards.length === 0}
            variant="secondary"
          >
            Revisar tudo
          </Button>
        )}
        <Button
          to={quizCount > 0 ? `/questoes/${deck.id}` : undefined}
          disabled={quizCount === 0}
          variant="lime"
        >
          Questões
        </Button>
      </div>

      <SectionTitle action={<AddLink to={`/criar?deck=${deck.id}`}>Adicionar</AddLink>}>Cartões</SectionTitle>
      {cards.length === 0 ? (
        <p className="rounded-tile border-2 border-dashed border-ink p-4 text-[15px] leading-normal text-graphite">
          Nenhum cartão ainda. Toque em “Adicionar” para criar o primeiro.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
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

      <SectionTitle action={<AddLink to={`/criar?deck=${deck.id}&tipo=questao`}>Adicionar</AddLink>}>
        Questões
      </SectionTitle>
      {questions.length === 0 ? (
        <p className="text-[15px] leading-normal text-graphite">
          Nenhuma questão escrita por você. As questões automáticas saem dos cartões.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {questions.map((question) => (
            <ItemRow
              key={question.id}
              title={question.prompt}
              subtitle={question.answer}
              editTo={`/editar/questao/${question.id}`}
              confirming={confirming === `question:${question.id}`}
              onAskDelete={() => setConfirming(`question:${question.id}`)}
              onCancel={() => setConfirming(null)}
              onDelete={() => actions.deleteQuestion(question.id)}
            />
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-paper-line pt-5">
        {confirming === 'deck' ? (
          <div role="alertdialog" aria-label="Apagar baralho" className="flex flex-col gap-3">
            <p className="text-[15px] leading-normal">
              Apagar “{deck.name}” com {plural(cards.length, 'cartão', 'cartões')}? Não dá para desfazer.
            </p>
            <div className="flex gap-2.5">
              <Button variant="secondary" size="sm" autoFocus onClick={() => setConfirming(null)}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" onClick={deleteDeck}>
                Apagar baralho
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="dashed" size="sm" className="self-start font-semibold!" onClick={() => setConfirming('deck')}>
            <Icon name="trash" size={18} />
            Apagar baralho
          </Button>
        )}
      </div>
    </Screen>
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
