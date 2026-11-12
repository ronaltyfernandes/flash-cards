import { GRADES } from '../lib/srs'
import { cx } from '../lib/utils'

// A claridade cresce do "errei" ao "fácil": não depende só da cor.
const COLORS = {
  again: 'bg-coral text-ink',
  hard: 'bg-amber text-ink',
  good: 'bg-violet text-white',
  easy: 'bg-lime text-ink',
}

/**
 * "Quanto você lembrou?" — quatro botões, cada um mostra quando o cartão volta.
 * intervals: { again: '<1 min', hard: '6 min', good: '1 dia', easy: '4 dias' }
 */
export function GradeButtons({ intervals, onGrade }) {
  return (
    <div className="flex animate-pop-in flex-col gap-2.5 motion-reduce:animate-none">
      <p id="grade-label" className="text-center text-[13px] text-mist">
        Quanto você lembrou?
      </p>
      <div role="group" aria-labelledby="grade-label" className="grid grid-cols-4 gap-2">
        {GRADES.map((grade, index) => (
          <button
            key={grade.id}
            type="button"
            onClick={() => onGrade(grade.id)}
            aria-keyshortcuts={String(index + 1)}
            className={cx(
              'press flex h-18 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-paper shadow-hard-paper',
              COLORS[grade.id],
            )}
          >
            <span className="text-[15px] font-bold">{grade.label}</span>
            <span className="font-mono text-[11px]">{intervals[grade.id]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
