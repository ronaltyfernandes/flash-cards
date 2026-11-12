/*
 * Repetição espaçada (versão simplificada do SM-2, o algoritmo do Anki).
 *
 * Cada cartão guarda em `srs`:
 *   state    'new' | 'learning' | 'review'
 *   due      quando volta (timestamp)
 *   interval intervalo atual em dias (0 enquanto está aprendendo)
 *   ease     multiplicador do intervalo (começa em 2.5)
 *   reps     quantas vezes foi avaliado
 *   lapses   quantas vezes foi esquecido depois de aprendido
 */
import { DAY, HOUR, MINUTE, dayKey, endOfDay } from './dates'
import { shuffle } from './utils'

export const GRADES = [
  { id: 'again', label: 'Errei' },
  { id: 'hard', label: 'Difícil' },
  { id: 'good', label: 'Bom' },
  { id: 'easy', label: 'Fácil' },
]

/** Quantos cartões novos entram por dia. */
export const NEW_PER_DAY = 20

/** A partir de quantos dias de intervalo um cartão conta como dominado. */
export const MASTERED_AFTER_DAYS = 21

const MIN_EASE = 1.3

export function newSrs() {
  return { state: 'new', due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0 }
}

/** Devolve o novo `srs` depois de uma avaliação. Não altera o original. */
export function schedule(srs, grade, now) {
  const next = { ...srs, reps: srs.reps + 1 }

  if (srs.state !== 'review') {
    // Cartão novo ou reaprendendo
    if (grade === 'again') return { ...next, state: 'learning', interval: 0, due: now + MINUTE }
    if (grade === 'hard') return { ...next, state: 'learning', interval: 0, due: now + 6 * MINUTE }
    if (grade === 'good') return { ...next, state: 'review', interval: 1, due: now + DAY }
    return { ...next, state: 'review', interval: 4, due: now + 4 * DAY }
  }

  // Cartão já aprendido
  if (grade === 'again') {
    return {
      ...next,
      state: 'learning',
      interval: 0,
      ease: Math.max(MIN_EASE, srs.ease - 0.2),
      lapses: srs.lapses + 1,
      due: now + MINUTE,
    }
  }

  // Cada resposta melhor garante um intervalo maior que a anterior
  const hard = Math.max(srs.interval + 1, Math.round(srs.interval * 1.2))
  const good = Math.max(hard + 1, Math.round(srs.interval * srs.ease))
  const easy = Math.max(good + 1, Math.round(srs.interval * srs.ease * 1.3))

  if (grade === 'hard') {
    return { ...next, interval: hard, ease: Math.max(MIN_EASE, srs.ease - 0.15), due: now + hard * DAY }
  }
  if (grade === 'good') return { ...next, interval: good, due: now + good * DAY }
  return { ...next, interval: easy, ease: srs.ease + 0.15, due: now + easy * DAY }
}

export function formatInterval(ms) {
  if (ms <= MINUTE) return '<1 min'
  if (ms < HOUR) return `${Math.round(ms / MINUTE)} min`
  if (ms < DAY) return `${Math.round(ms / HOUR)} h`
  const days = Math.round(ms / DAY)
  if (days === 1) return '1 dia'
  if (days < 30) return `${days} dias`
  if (days < 365) {
    const months = Math.round(days / 30)
    return months === 1 ? '1 mês' : `${months} meses`
  }
  const years = Math.round((days / 365) * 10) / 10
  return years === 1 ? '1 ano' : `${String(years).replace('.', ',')} anos`
}

/** Texto de cada botão de avaliação: quando o cartão volta. */
export function previewIntervals(srs) {
  return Object.fromEntries(GRADES.map((g) => [g.id, formatInterval(schedule(srs, g.id, 0).due)]))
}

/** 'new' | 'learning' | 'mastered' — usado na tela de progresso. */
export function stageOf(card) {
  if (card.srs.reps === 0) return 'new'
  if (card.srs.state === 'review' && card.srs.interval >= MASTERED_AFTER_DAYS) return 'mastered'
  return 'learning'
}

/** Já passou da fase de aprendizado (intervalo de pelo menos 1 dia). */
export function isLearned(card) {
  return card.srs.state === 'review'
}

/**
 * Monta a fila de estudo: primeiro os cartões vencidos, depois os novos
 * (respeitando o limite diário). Devolve uma lista de ids.
 * `free: true` ignora a agenda e traz todos os cartões embaralhados.
 */
export function buildSession({ cards, days }, now, deckId, { free = false } = {}) {
  const pool = deckId ? cards.filter((c) => c.deckId === deckId) : cards
  if (free) return shuffle(pool).map((c) => c.id)

  const limit = endOfDay(now)
  const due = pool
    .filter((c) => c.srs.reps > 0 && c.srs.due <= limit)
    .sort((a, b) => a.srs.due - b.srs.due)

  const newToday = days[dayKey(now)]?.newCards ?? 0
  const quota = Math.max(0, NEW_PER_DAY - newToday)
  const fresh = pool
    .filter((c) => c.srs.reps === 0)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, quota)

  return [...due, ...fresh].map((c) => c.id)
}

/** Estimativa de tempo: uns 15 segundos por cartão. */
export function estimateMinutes(cardCount) {
  return Math.max(1, Math.round((cardCount * 15) / 60))
}
