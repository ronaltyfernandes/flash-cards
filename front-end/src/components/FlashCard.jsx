import { cx } from '../lib/utils'
import { Icon } from './Icon'

/** O tamanho da letra diminui conforme o texto cresce (perguntas longas, frases). */
function frontSizeClass(text) {
  if (text.length <= 14) return 'text-5xl'
  if (text.length <= 28) return 'text-4xl'
  if (text.length <= 64) return 'text-[28px]'
  return 'text-[22px]'
}

function backSizeClass(text) {
  if (text.length <= 28) return 'text-4xl'
  if (text.length <= 64) return 'text-[28px]'
  return 'text-[22px]'
}

/**
 * O cartão que vira, com a "pilha" de cartões tortos atrás.
 * Feito para o modo foco (fundo escuro).
 */
export function FlashCard({ card, flipped, onFlip }) {
  return (
    <div className="relative mx-1.5 mt-1.5 min-h-[22rem] flex-1 animate-deal-in perspective-[1400px] motion-reduce:animate-none">
      {/* Pilha */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-2.5 bottom-0 -rotate-[4deg] rounded-card border-2 border-paper bg-violet"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1 bottom-0 rotate-[2.5deg] rounded-card border-2 border-paper bg-ink-muted"
      />

      <button
        type="button"
        onClick={onFlip}
        className={cx(
          'absolute inset-0 block w-full rounded-card text-inherit transition-transform duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] transform-3d motion-reduce:transition-none',
          flipped && 'rotate-y-180',
        )}
      >
        {/* Frente */}
        <span
          aria-hidden={flipped}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-card border-2 border-ink bg-white p-6 pb-14 text-center text-ink shadow-[6px_6px_0_var(--color-lime)] backface-hidden"
        >
          {card.image ? (
            <img
              src={card.image}
              alt=""
              className="max-h-36 max-w-full rounded-chip border-2 border-ink object-contain"
            />
          ) : null}
          <span
            className={cx(
              'font-display leading-[1.05] font-extrabold tracking-[-0.03em] text-balance break-words',
              frontSizeClass(card.front),
            )}
          >
            {card.front}
          </span>
          {card.ipa ? <span className="font-mono text-base text-graphite">{card.ipa}</span> : null}
          <span className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 text-[13px] text-graphite">
            <Icon name="flip" size={16} strokeWidth={2} />
            toque para virar
          </span>
        </span>

        {/* Verso */}
        <span
          aria-hidden={!flipped}
          className="absolute inset-0 flex rotate-y-180 flex-col gap-4 overflow-y-auto rounded-card border-2 border-paper bg-ink-soft p-6 text-left text-paper shadow-[6px_6px_0_var(--color-violet)] backface-hidden"
        >
          <span className="max-w-full self-start truncate rounded-full bg-lime px-3 py-1 font-mono text-[13px] font-medium text-ink">
            {card.front.length <= 32 ? card.front : 'resposta'}
          </span>
          <span
            className={cx(
              'font-display leading-[1.05] font-extrabold tracking-[-0.02em] text-lime break-words',
              backSizeClass(card.back),
            )}
          >
            {card.back}
          </span>
          {card.example ? (
            <span className="flex flex-col gap-2 border-t-2 border-dashed border-ink-line pt-4">
              <span className="text-[17px] leading-snug">“{card.example}”</span>
              {card.exampleTranslation ? (
                <span className="text-[15px] leading-snug text-mist">{card.exampleTranslation}</span>
              ) : null}
            </span>
          ) : null}
          <span className="sr-only">Toque para ver a frente.</span>
        </span>
      </button>
    </div>
  )
}
