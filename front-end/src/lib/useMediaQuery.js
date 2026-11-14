import { useSyncExternalStore } from 'react'

/** Tamanhos do layout (iguais aos do Tailwind): tablet a partir de 640px, desktop a partir de 1024px. */
export const TABLET = '(min-width: 640px)'
export const DESKTOP = '(min-width: 1024px)'

/** true enquanto a media query bater. Atualiza quando a janela muda de tamanho. */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', callback)
      return () => list.removeEventListener('change', callback)
    },
    () => window.matchMedia(query).matches,
  )
}
