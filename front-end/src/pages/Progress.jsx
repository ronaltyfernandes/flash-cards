import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../components/Button'
import { DeckBadge } from '../components/DeckTile'
import { ProgressBar } from '../components/ProgressBar'
import { Screen, SectionTitle } from '../components/Screen'
import { StreakCard } from '../components/StreakCard'
import { deckCode } from '../lib/languages'
import { buildSession } from '../lib/srs'
import { activityGrid, learnedPercent, stageCounts, totalReviews, weekAccuracy } from '../lib/stats'
import { cx, plural } from '../lib/utils'
import { useStore } from '../store/context'

const STAGES = [
  { id: 'new', label: 'Novos', className: 'bg-paper-deep' },
  { id: 'learning', label: 'Aprendendo', className: 'bg-violet-light' },
  { id: 'mastered', label: 'Dominados', className: 'bg-lime' },
]

// A claridade cai de "nada" a "muito": dá para ler sem depender só do tom
// O nível máximo troca o lima pelo violeta, para os dias mais fortes saltarem aos olhos
const HEAT = ['bg-paper', 'bg-lime/40', 'bg-lime', 'bg-violet']

// Atividade: primeiro uma onda revela os quadrados vazios, depois eles se preenchem (efeito sorteado)
const WAVE_STEP = 45
const FILL_START = 1700
const FILL_STEP = 70
const HEAT_WEEKS = 16

export default function Progress() {
  const { state } = useStore()
  const [now] = useState(() => Date.now())

  const accuracy = weekAccuracy(state.days, now)
  const counts = stageCounts(state.cards)
  const cardTotal = state.cards.length

  const numberCard =
    'flex flex-col justify-end gap-1 rounded-tile border-2 border-ink bg-white px-4 py-3.5 sm:rounded-3xl sm:p-5.5'
  const numberValue =
    'font-display text-3xl leading-none font-extrabold tracking-[-0.02em] sm:text-[44px] lg:text-[52px] lg:tracking-[-0.03em]'

  return (
    <Screen tabBar>
      <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[40px] sm:leading-[1.02] lg:text-[44px]">
        Progresso
      </h1>

      {/* Linha 1: sequência e números */}
      <div className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:gap-6">
        <StreakCard days={state.days} now={now} layout="row" className="lg:flex-[2_1_25rem]" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:flex lg:flex-[2_1_22rem] lg:gap-6">
          <div className={cx(numberCard, 'lg:flex-1')}>
            <p className={numberValue}>{accuracy === null ? '—' : <Count value={accuracy} suffix="%" />}</p>
            <p className="text-[13px] text-graphite sm:text-sm">de acerto em 7 dias</p>
          </div>
          <div className={cx(numberCard, 'lg:flex-1')}>
            <p className={numberValue}>
              <Count value={totalReviews(state.days)} />
            </p>
            <p className="text-[13px] text-graphite sm:text-sm">revisões feitas</p>
          </div>
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
          {/* Linha 2: atividade (tablet e desktop) e domínio */}
          <div className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:gap-6">
            <Activity days={state.days} now={now} />
            <Mastery counts={counts} total={cardTotal} />
          </div>

          {/* Linha 3: por assunto */}
          <section className="flex flex-col gap-2.5 sm:gap-3.5 sm:rounded-3xl sm:border-2 sm:border-ink sm:bg-white sm:p-6">
            <SectionTitle>Por assunto</SectionTitle>
            <ul className="flex flex-col gap-2.5 pb-2 sm:gap-0 sm:pb-0">
              {state.decks.map((deck, position) => {
                const cards = state.cards.filter((card) => card.deckId === deck.id)
                const percent = learnedPercent(cards)
                const due = buildSession(state, now, deck.id).length
                return (
                  <li key={deck.id}>
                    {/* Celular: uma barra por assunto */}
                    <div className="flex items-center gap-3 sm:hidden">
                      <span className="w-10 shrink-0 font-mono text-[13px] font-medium" title={deck.name}>
                        {deckCode(deck)}
                      </span>
                      <GrowBar
                        delay={400 + position * 300}
                        tone="violet"
                        value={percent}
                        label={`${deck.name}: ${percent}% aprendido`}
                        className="flex-1"
                      />
                      <span aria-hidden="true" className="w-10 shrink-0 text-right text-[13px] font-semibold">
                        {percent}%
                      </span>
                    </div>

                    {/* Tablet e desktop: linha com o selo, que leva ao baralho */}
                    <Link
                      to={`/baralhos/${deck.id}`}
                      className="hidden flex-wrap items-center gap-x-4 gap-y-3 border-t border-paper-line py-3 text-ink no-underline hover:bg-paper sm:flex"
                    >
                      <DeckBadge deck={deck} className="size-11 rounded-chip text-sm" />
                      <span className="min-w-0 flex-[0_1_13.75rem] text-base font-bold">{deck.name}</span>
                      <GrowBar
                        delay={400 + position * 300}
                        tone="violet"
                        value={percent}
                        label={`${deck.name}: ${percent}% aprendido`}
                        className="h-3.5 min-w-32 flex-[1_1_12.5rem]"
                      />
                      <span aria-hidden="true" className="w-11 text-right font-mono text-sm">
                        {percent}%
                      </span>
                      <span className="w-22 text-right text-sm text-graphite">
                        {cards.length === 0 ? 'vazio' : due > 0 ? `${due} p/ hoje` : 'em dia'}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </Screen>
  )
}

/** Número entre 0 e 1 que parece sorteado, mas é sempre o mesmo para o mesmo `n` e `seed`. */
function noise(n, seed) {
  const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const LAST_COLUMN = HEAT_WEEKS - 1

/**
 * Efeitos da segunda onda (o preenchimento). Cada um devolve o atraso em ms de um quadrado.
 * A coluna 0 é a semana mais antiga; a linha 0 é segunda-feira.
 */
const FILL_WAVES = [
  // Do fim para o começo: os dias mais recentes acendem primeiro
  (column, row) => (LAST_COLUMN - column) * FILL_STEP + (6 - row) * 25,
  // Do centro para fora, como uma gota na água
  (column, row) => Math.hypot(column - LAST_COLUMN / 2, (row - 3) * 1.6) * 110,
  // Linha por linha, de cima para baixo
  (column, row) => row * 170 + column * 18,
  // Cintilar: cada dia acende em um momento sorteado
  (column, row, seed) => noise(column * 7 + row, seed) * 1300,
]

/** Quadradinhos das últimas semanas: mais escuro = mais respostas no dia. */
function Activity({ days, now }) {
  // Sorteado a cada vez que a tela abre
  const [wave] = useState(() => ({
    index: Math.floor(Math.random() * FILL_WAVES.length),
    seed: Math.random() * 1000,
  }))
  const fillDelay = FILL_WAVES[wave.index]
  const cells = activityGrid(days, now, HEAT_WEEKS)
  const activeDays = cells.filter((cell) => cell.count > 0).length
  return (
    <section className="hidden min-w-0 flex-col gap-4.5 rounded-3xl border-2 border-ink bg-white p-6 sm:flex lg:flex-[2_1_30rem]">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em]">Atividade</h2>
        <span className="text-[13px] text-graphite">últimas {HEAT_WEEKS} semanas</span>
      </div>
      <div className="overflow-x-auto">
        <div
          role="img"
          aria-label={`Mapa de atividade das últimas ${HEAT_WEEKS} semanas: ${plural(activeDays, 'dia', 'dias')} com estudo. Os quadrados mais escuros são os dias com mais revisões.`}
          className="grid w-max grid-flow-col grid-rows-[repeat(7,1.375rem)] auto-cols-[1.375rem] gap-1.5"
        >
          {cells.map((cell, position) => {
            // A grade corre por colunas (7 dias cada): a onda anda na diagonal
            const column = Math.floor(position / 7)
            const row = position % 7
            return (
              <span
                key={cell.key}
                style={{ animationDelay: `${(column + row) * WAVE_STEP}ms` }}
                title={cell.isFuture ? undefined : `${cell.key}: ${plural(cell.count, 'resposta', 'respostas')}`}
                className={cx(
                  'relative animate-cell-in overflow-hidden rounded-md border-2 bg-paper motion-reduce:animate-none',
                  cell.isFuture ? 'border-paper-line' : 'border-ink',
                )}
              >
                {cell.level > 0 ? (
                  <span
                    aria-hidden="true"
                    style={{ animationDelay: `${FILL_START + Math.round(fillDelay(column, row, wave.seed))}ms` }}
                    className={cx('absolute inset-0 animate-cell-fill motion-reduce:animate-none', HEAT[cell.level])}
                  />
                ) : null}
              </span>
            )
          })}
        </div>
      </div>
      <div aria-hidden="true" className="flex items-center gap-2 text-[13px] text-graphite">
        menos
        {HEAT.map((className) => (
          <span key={className} className={cx('size-4 rounded-[5px] border-2 border-ink', className)} />
        ))}
        mais
      </div>
    </section>
  )
}

/** Número que sobe de 0 até o valor atual. Sem movimento se o sistema pedir menos animação. */
function Count({ value, suffix = '' }) {
  const [shown, setShown] = useState(0)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (reduced) return
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1800)
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, reduced])
  return `${reduced ? value : shown}${suffix}`
}

/** Barra de progresso que cresce de 0 até o valor, com atraso (para uma após a outra). */
function GrowBar({ value, delay = 0, ...props }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(id)
  }, [delay])
  return <ProgressBar value={ready ? value : 0} fillClassName="duration-1200! ease-out" {...props} />
}

/** Quantos cartões estão em cada fase. */
function Mastery({ counts, total }) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-[22px] border-2 border-ink bg-white p-4 sm:gap-4.5 sm:rounded-3xl sm:p-6 lg:flex-[1_1_18.75rem]">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-extrabold sm:text-2xl sm:tracking-[-0.02em]">Domínio</h2>
        <span className="text-[13px] text-graphite">{plural(total, 'cartão', 'cartões')}</span>
      </div>
      <div
        aria-hidden="true"
        className="flex h-5.5 overflow-hidden rounded-lg border-2 border-ink sm:h-7 sm:rounded-[10px]"
      >
        {STAGES.filter((stage) => counts[stage.id] > 0).map((stage, position) => (
          <div
            key={stage.id}
            className={cx(
              stage.className,
              'origin-left animate-grow-x motion-reduce:animate-none',
              position > 0 && 'border-l-2 border-ink',
            )}
            style={{ width: `${(counts[stage.id] / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] sm:flex-col sm:gap-2.5 sm:text-[15px]">
        {STAGES.map((stage) => {
          const percent = Math.round((counts[stage.id] / total) * 100)
          return (
            <li key={stage.id} className="flex items-center gap-1.5 sm:gap-2.5">
              <span
                aria-hidden="true"
                className={cx('size-3 rounded-[3px] border-2 border-ink sm:size-3.5', stage.className)}
              />
              <span className="sm:flex-1">{stage.label}</span>
              <span className="sm:hidden">
                <Count value={percent} suffix="%" />
              </span>
              <span className="hidden font-mono text-sm sm:inline">
                <Count value={counts[stage.id]} /> · <Count value={percent} suffix="%" />
              </span>
            </li>
          )
        })}
      </ul>
      <p className="text-[13px] leading-normal text-graphite">
        Um cartão conta como dominado quando o intervalo de revisão passa de 3 semanas.
      </p>
    </section>
  )
}
