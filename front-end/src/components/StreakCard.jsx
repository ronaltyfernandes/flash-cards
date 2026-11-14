import { currentStreak, bestStreak, weekActivity } from '../lib/stats'
import { cx, plural } from '../lib/utils'
import { FlameIcon, Icon } from './Icon'

/**
 * Bloco violeta da sequência de dias, com a semana atual.
 * layout="row" (desktop do progresso) põe a semana ao lado do número.
 */
export function StreakCard({ days, now, layout = 'stack', className }) {
  const streak = currentStreak(days, now)
  const record = Math.max(streak, bestStreak(days))
  const week = weekActivity(days, now)
  const row = layout === 'row'

  return (
    <section
      aria-label="Sequência de estudo"
      className={cx(
        'flex flex-col gap-4 rounded-[26px] border-2 border-ink bg-violet p-5 text-white shadow-hard sm:rounded-card sm:p-6.5 sm:shadow-hard-lg',
        row && 'lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-5.5',
        className,
      )}
    >
      <div className="flex items-center gap-3.5">
        <FlameIcon size={52} className="shrink-0 fill-coral stroke-ink sm:size-14" />
        <div>
          <p
            className={cx(
              'font-display text-[44px] leading-none font-extrabold tracking-[-0.03em] sm:text-[46px]',
              row && 'lg:text-[56px]',
            )}
          >
            {plural(streak, 'dia', 'dias')}
          </p>
          <p className="text-sm text-violet-tint sm:text-[15px]">de sequência · recorde: {record}</p>
        </div>
      </div>
      <ol className={cx('grid grid-cols-7 gap-1.5 sm:gap-2', row && 'lg:grid-cols-[repeat(7,2.5rem)]')}>
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
  )
}
