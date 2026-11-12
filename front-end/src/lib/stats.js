import { addDays, dayKey, startOfDay, startOfWeek } from './dates'
import { isLearned, stageOf } from './srs'

function isActive(day) {
  return Boolean(day) && day.reviews + day.quizTotal > 0
}

/** Dias seguidos de estudo. Hoje ainda sem estudo não quebra a sequência. */
export function currentStreak(days, now) {
  let cursor = startOfDay(now)
  if (!isActive(days[dayKey(cursor)])) cursor = addDays(cursor, -1)
  let count = 0
  while (isActive(days[dayKey(cursor)])) {
    count += 1
    cursor = addDays(cursor, -1)
  }
  return count
}

export function bestStreak(days) {
  const keys = Object.keys(days)
    .filter((key) => isActive(days[key]))
    .sort()
  let best = 0
  let run = 0
  let previous = null
  for (const key of keys) {
    const [y, m, d] = key.split('-').map(Number)
    const time = new Date(y, m - 1, d).getTime()
    run = previous !== null && dayKey(addDays(previous, 1)) === key ? run + 1 : 1
    best = Math.max(best, run)
    previous = time
  }
  return best
}

const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const WEEK_NAMES = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']

/** Os 7 dias da semana atual (segunda a domingo). */
export function weekActivity(days, now) {
  const monday = startOfWeek(now)
  const todayKey = dayKey(now)
  return WEEK_LABELS.map((label, index) => {
    const key = dayKey(addDays(monday, index))
    return {
      key,
      label,
      name: WEEK_NAMES[index],
      done: isActive(days[key]),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    }
  })
}

/** Taxa de acerto dos últimos 7 dias (0–100) ou null se não houve estudo. */
export function weekAccuracy(days, now) {
  let total = 0
  let correct = 0
  for (let i = 0; i < 7; i++) {
    const day = days[dayKey(addDays(now, -i))]
    if (!day) continue
    total += day.reviews + day.quizTotal
    correct += day.correct + day.quizCorrect
  }
  return total === 0 ? null : Math.round((correct / total) * 100)
}

export function totalReviews(days) {
  return Object.values(days).reduce((sum, day) => sum + day.reviews, 0)
}

export function stageCounts(cards) {
  const counts = { new: 0, learning: 0, mastered: 0 }
  for (const card of cards) counts[stageOf(card)] += 1
  return counts
}

/** Porcentagem de cartões já aprendidos (0–100). */
export function learnedPercent(cards) {
  if (cards.length === 0) return 0
  return Math.round((cards.filter(isLearned).length / cards.length) * 100)
}
