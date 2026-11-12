/*
 * Persistência. Por enquanto tudo fica no localStorage do navegador.
 * Quando o back-end (Spring Boot) tiver a API pronta, este é o único
 * arquivo que precisa mudar: troque loadState/saveState por chamadas fetch.
 */
const STORAGE_KEY = 'insane-flash-cards:v1'
export const STATE_VERSION = 1

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.version !== STATE_VERSION) return null
    return data
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    // Navegação privada ou armazenamento cheio: o app segue funcionando em memória.
    return false
  }
}
