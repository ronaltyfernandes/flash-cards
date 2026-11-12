import { createContext, useContext } from 'react'

export const StoreContext = createContext(null)

/** Acesso aos dados do app: const { state, actions } = useStore() */
export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore precisa estar dentro de <StoreProvider>')
  return store
}
