import { cx } from '../lib/utils'
import { Segmented } from './Field'
import { Icon } from './Icon'

const SIDE_OPTIONS = [
  { value: 'front', label: 'Frente' },
  { value: 'back', label: 'Verso' },
]

const LETTERS = ['A', 'B', 'C', 'D']

// Versões menores das regras do FlashCard: a prévia ocupa bem menos espaço
function frontSizeClass(text) {
  if (text.length <= 14) return 'text-[44px]'
  if (text.length <= 28) return 'text-[34px]'
  if (text.length <= 64) return 'text-[26px]'
  return 'text-xl'
}

function backSizeClass(text) {
  if (text.length <= 28) return 'text-[34px]'
  if (text.length <= 64) return 'text-[26px]'
  return 'text-xl'
}

/** Moldura escura da prévia: imita o modo foco, onde o cartão aparece de verdade. */
function PreviewFrame({ title, action, children }) {
  return (
    <section
      aria-label="Prévia"
      className="tone-dark flex flex-col gap-4 rounded-card border-2 border-ink bg-ink p-4 text-paper shadow-hard-lg sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.08em] text-mist uppercase">
          <Icon name="eye" size={16} strokeWidth={2} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/**
 * Prévia ao vivo do cartão enquanto ele é criado.
 * `side` e `onSideChange` deixam o formulário virar o cartão quando o foco muda de campo.
 */
export function CardPreview({ card, side, onSideChange }) {
  const flipped = side === 'back'
  const front = card.front.trim()
  const back = card.back.trim()
  const example = card.example.trim()

  return (
    <PreviewFrame
      title="Prévia"
      action={
        <div className="w-44">
          <Segmented label="Lado do cartão" size="sm" options={SIDE_OPTIONS} value={side} onChange={onSideChange} />
        </div>
      }
    >
      <div className="relative mx-1 mt-1 mb-2 h-80 perspective-[1400px]">
        {/* Pilha */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-2.5 bottom-0 -rotate-[3deg] rounded-card border-2 border-paper bg-violet"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1 bottom-0 rotate-[2deg] rounded-card border-2 border-paper bg-ink-muted"
        />

        <button
          type="button"
          onClick={() => onSideChange(flipped ? 'front' : 'back')}
          aria-label={flipped ? 'Ver a frente do cartão' : 'Ver o verso do cartão'}
          className={cx(
            'absolute inset-0 block w-full rounded-card text-inherit transition-transform duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] transform-3d motion-reduce:transition-none',
            flipped && 'rotate-y-180',
          )}
        >
          {/* Frente */}
          <span
            aria-hidden={flipped}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-card border-2 border-ink bg-white p-5 pb-11 text-center text-ink shadow-[6px_6px_0_var(--color-lime)] backface-hidden"
          >
            {card.image ? (
              <img
                src={card.image}
                alt=""
                className="max-h-24 max-w-full rounded-chip border-2 border-ink object-contain"
              />
            ) : null}
            <span
              className={cx(
                'font-display leading-[1.05] font-extrabold tracking-[-0.03em] text-balance break-words',
                front ? frontSizeClass(front) : 'text-[34px] text-paper-line',
              )}
            >
              {front || 'Frente'}
            </span>
            {card.ipa.trim() ? <span className="font-mono text-base text-graphite">{card.ipa.trim()}</span> : null}
            <span className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-[13px] text-graphite">
              <Icon name="flip" size={16} strokeWidth={2} />
              toque para virar
            </span>
          </span>

          {/* Verso */}
          <span
            aria-hidden={!flipped}
            className="absolute inset-0 flex rotate-y-180 flex-col gap-3.5 overflow-y-auto rounded-card border-2 border-paper bg-ink-soft p-5 text-left text-paper shadow-[6px_6px_0_var(--color-violet)] backface-hidden"
          >
            <span className="max-w-full self-start truncate rounded-full bg-lime px-3 py-1 font-mono text-[13px] font-medium text-ink">
              {front && front.length <= 32 ? front : 'resposta'}
            </span>
            <span
              className={cx(
                'font-display leading-[1.05] font-extrabold tracking-[-0.02em] break-words',
                back ? cx('text-lime', backSizeClass(back)) : 'text-[34px] text-ink-line',
              )}
            >
              {back || 'Verso'}
            </span>
            {example ? (
              <span className="mt-auto flex flex-col gap-1.5 border-t-2 border-dashed border-ink-line pt-3.5">
                <span className="text-base leading-snug">“{example}”</span>
                {card.exampleTranslation.trim() ? (
                  <span className="text-sm leading-snug text-mist">{card.exampleTranslation.trim()}</span>
                ) : null}
              </span>
            ) : null}
          </span>
        </button>
      </div>
    </PreviewFrame>
  )
}

/** Prévia ao vivo de uma questão de múltipla escolha, com a resposta certa marcada. */
export function QuestionPreview({ question }) {
  const prompt = question.prompt.trim()
  const options = [
    { text: question.answer.trim(), correct: true },
    ...question.wrong.map((text) => ({ text: text.trim(), correct: false })).filter((option) => option.text),
  ]
  const explanation = question.explanation.trim()

  return (
    <PreviewFrame title="Prévia">
      <div className="flex flex-col gap-4 rounded-card border-2 border-paper bg-ink-soft p-5 shadow-[6px_6px_0_var(--color-violet)]">
        <span
          className={cx(
            'font-display text-2xl leading-tight font-extrabold tracking-[-0.02em] break-words',
            !prompt && 'text-ink-line',
          )}
        >
          {prompt || 'Enunciado'}
        </span>

        <ol className="flex flex-col gap-2.5">
          {options.map((option, position) => (
            <li
              key={position}
              className={cx(
                'flex min-h-12 items-center gap-3 rounded-[14px] border-2 px-3 py-2 text-[15px] leading-tight font-semibold',
                option.correct ? 'border-paper bg-lime text-ink' : 'border-ink-line text-paper',
              )}
            >
              <span
                className={cx(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-medium',
                  option.correct ? 'bg-ink text-lime' : 'bg-ink-muted text-mist',
                )}
              >
                {option.correct ? <Icon name="check" size={16} strokeWidth={3} /> : LETTERS[position]}
              </span>
              <span className={cx('min-w-0 break-words', !option.text && 'opacity-50')}>
                {option.text || 'Resposta certa'}
              </span>
              {option.correct ? <span className="sr-only"> (resposta certa)</span> : null}
            </li>
          ))}
        </ol>

        {explanation ? (
          <p className="border-t-2 border-dashed border-ink-line pt-3.5 text-[15px] leading-snug text-mist">
            {explanation}
          </p>
        ) : null}
      </div>
      <p className="text-[13px] text-mist">Na rodada, as alternativas aparecem embaralhadas.</p>
    </PreviewFrame>
  )
}
