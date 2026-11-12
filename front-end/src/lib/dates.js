export const MINUTE = 60 * 1000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

/** Chave do dia no fuso local: "2026-11-12" */
export function dayKey(timestamp) {
  const d = new Date(timestamp)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export function startOfDay(timestamp) {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function endOfDay(timestamp) {
  const d = new Date(timestamp)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/** Soma dias respeitando horário de verão. */
export function addDays(timestamp, amount) {
  const d = new Date(timestamp)
  d.setDate(d.getDate() + amount)
  return d.getTime()
}

/** Segunda-feira da semana do timestamp. */
export function startOfWeek(timestamp) {
  const d = new Date(startOfDay(timestamp))
  const weekday = (d.getDay() + 6) % 7 // segunda = 0
  return addDays(d.getTime(), -weekday)
}

export function greeting(timestamp) {
  const hour = new Date(timestamp).getHours()
  if (hour < 12) return 'Bom dia!'
  if (hour < 18) return 'Boa tarde!'
  return 'Boa noite!'
}
