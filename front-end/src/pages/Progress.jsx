import { useState } from 'react'
import { Button } from '../components/Button'
import { FlameIcon, Icon } from '../components/Icon'
import { ProgressBar } from '../components/ProgressBar'
import { Screen, SectionTitle } from '../components/Screen'
import { deckCode } from '../lib/languages'
import {
  bestStreak,
  currentStreak,
  learnedPercent,
  stageCounts,
  totalReviews,
  weekAccuracy,
  weekActivity,
} from '../lib/stats'
import { cx, plural } from '../lib/utils'
import { useStore } from '../store/context'

const STAGES = [
  { id: 'new', label: 'Novos', className: 'bg-paper-deep' },
  { id: 'learning', label: 'Aprendendo', className: 'bg-violet-light' },
  { id: 'mastered', label: 'Dominados', className: 'bg-lime' },
]

export default function Progress() {
  const { state } = useStore()
  const [now] = useState(() => Date.now())

  const streak = currentStreak(state.days, now)
  const record = Math.max(streak, bestStreak(state.days))
  const week = weekActivity(state.days, now)
  const accuracy = weekAccuracy(state.days, now)
  const counts = stageCounts(state.cards)
  const cardTotal = state.cards.length

  return (
    <Screen tabBar>
      <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-[-0.03em]">Progresso</h1>

      {/* Sequência de dias */}
      <section
        aria-label="Sequência de estudo"
        className="flex flex-col gap-4 rounded-[26px] border-2 border-ink bg-violet p-5 text-white shadow-hard"
      >
        <div className="flex items-center gap-3.5">
          <FlameIcon size={52} className="shrink-0 fill-coral stroke-ink" />
          <div>
            <p className="font-display text-[44px] leading-none font-extrabold tracking-[-0.03em]">
              {plural(streak, 'dia', 'dias')}
            </p>
            <p className="text-sm text-violet-tint">
              de sequência · recorde: {record}
            </p>
          </div>
        </div>
        <ol className="grid grid-cols-7 gap-1.5">
          {week.map((day) => (
            <li key={day.key} className="flex flex-col items-center gap-1.5">
              <span
                className={cx(
                  'flex aspect-square w-full items-center justify-center rounded-[10px] border-2 border-ink text-ink',
                  day.done ? 'bg-lime' : day.isToday ? 'bg-white' : 'bg-violet-soft',
                )}
              >
                {day.done ? <Icon name="check" size={16} strokeWidth={3.2} /> : null}
              </span>
              <span aria-hidden="true" className={cx('text-xs', day.isToday ? 'font-bold underline' : 'font-semibold')}>
                {day.label}
              </span>
              <span className="sr-only">
                {day.name}
                {day.isToday ? ' (hoje)' : ''}: {day.done ? 'estudou' : day.isFuture ? 'ainda não chegou' : 'sem estudo'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Números */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-tile border-2 border-ink bg-white px-4 py-3.5">
          <p className="font-display text-3xl font-extrabold tracking-[-0.02em]">
            {accuracy === null ? '—' : `${accuracy}%`}
          </p>
          <p className="text-[13px] text-graphite">de acerto em 7 dias</p>
        </div>
        <div className="rounded-tile border-2 border-ink bg-white px-4 py-3.5">
          <p className="font-display text-3xl font-extrabold tracking-[-0.02em]">{totalReviews(state.days)}</p>
          <p className="text-[13px] text-graphite">revisões feitas</p>
        </div>
      </div>

      {cardTotal === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-tile border-2 border-dashed border-ink p-5">
          <p className="text-[15px] leading-normal text-graphite">
            Seu progresso aparece aqui assim que você criar e revisar cartões.
          </p>
          <Button to="/criar" size="sm">
            Criar cartão
          </Button>
        </div>
      ) : (
        <>
          {/* Domínio */}
          <section className="flex flex-col gap-3 rounded-[22px] border-2 border-ink bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl font-extrabold">Domínio</h2>
              <span className="text-[13px] text-graphite">{plural(cardTotal, 'cartão', 'cartões')}</span>
            </div>
            <div aria-hidden="true" className="flex h-5.5 overflow-hidden rounded-lg border-2 border-ink">
              {STAGES.filter((stage) => counts[stage.id] > 0).map((stage, position) => (
                <div
                  key={stage.id}
                  className={cx(stage.className, position > 0 && 'border-l-2 border-ink')}
                  style={{ width: `${(counts[stage.id] / cardTotal) * 100}%` }}
                />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px]">
              {STAGES.map((stage) => (
                <li key={stage.id} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={cx('size-3 rounded-[3px] border-2 border-ink', stage.className)} />
                  {stage.label} {Math.round((counts[stage.id] / cardTotal) * 100)}%
                </li>
              ))}
            </ul>
            <p className="text-[13px] leading-normal text-graphite">
              Um cartão conta como dominado quando o intervalo de revisão passa de 3 semanas.
            </p>
          </section>

          {/* Por baralho */}
          <SectionTitle>Por assunto</SectionTitle>
          <ul className="flex flex-col gap-2.5 pb-2">
            {state.decks.map((deck) => {
              const percent = learnedPercent(state.cards.filter((card) => card.deckId === deck.id))
              return (
                <li key={deck.id} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 font-mono text-[13px] font-medium" title={deck.name}>
                    {deckCode(deck)}
                  </span>
                  <ProgressBar
                    tone="violet"
                    value={percent}
                    label={`${deck.name}: ${percent}% aprendido`}
                    className="flex-1"
                  />
                  <span aria-hidden="true" className="w-10 shrink-0 text-right text-[13px] font-semibold">
                    {percent}%
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Screen>
  )
}
