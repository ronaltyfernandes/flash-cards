import { BoltIcon } from './Icon'

/** Aviso curto no topo da tela. Renderize só quando houver mensagem. */
export function Toast({ children }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-5">
      <div
        role="status"
        className="flex animate-pop-in items-center gap-3 rounded-[18px] border-2 border-paper bg-ink px-4 py-3 text-paper motion-reduce:animate-none"
      >
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-lime text-ink">
          <BoltIcon />
        </span>
        <span className="text-[15px] font-semibold">{children}</span>
      </div>
    </div>
  )
}
