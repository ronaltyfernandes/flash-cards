/*
 * Roteador mínimo baseado no hash da URL (#/baralhos, #/estudar/abc...).
 * Funciona sem configurar o servidor. Se o app crescer, dá para trocar
 * por react-router sem mexer nas telas: elas só usam `params` e `query`.
 */
import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getHash() {
  return window.location.hash
}

export function parseHash(hash) {
  const raw = hash.replace(/^#/, '') || '/'
  const [path, search = ''] = raw.split('?')
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(search)) }
}

/** Rota atual: { path: '/baralhos/abc', query: { deck: '...' } } */
export function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash)
  return parseHash(hash)
}

export function navigate(to, { replace = false } = {}) {
  if (replace) window.location.replace(`#${to}`)
  else window.location.hash = to
}

/** Compara '/baralhos/:deckId' com '/baralhos/abc' e devolve { deckId: 'abc' } ou null. */
export function matchRoute(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
    else if (patternParts[i] !== pathParts[i]) return null
  }
  return params
}
