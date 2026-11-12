import { useEffect } from 'react'
import { matchRoute, useRoute } from './lib/router'
import Create from './pages/Create'
import DeckDetail from './pages/DeckDetail'
import DeckForm from './pages/DeckForm'
import Decks from './pages/Decks'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Progress from './pages/Progress'
import Quiz from './pages/Quiz'
import QuizLobby from './pages/QuizLobby'
import Study from './pages/Study'

// A ordem importa: rotas fixas antes das que têm parâmetro (:deckId).
const ROUTES = [
  ['/', Home],
  ['/baralhos', Decks],
  ['/baralhos/novo', DeckForm],
  ['/baralhos/:deckId', DeckDetail],
  ['/baralhos/:deckId/editar', DeckForm],
  ['/estudar', Study],
  ['/estudar/:deckId', Study],
  ['/questoes', QuizLobby],
  ['/questoes/todas', Quiz],
  ['/questoes/:deckId', Quiz],
  ['/criar', Create],
  ['/editar/cartao/:cardId', Create],
  ['/editar/questao/:questionId', Create],
  ['/progresso', Progress],
]

export default function App() {
  const { path, query } = useRoute()
  const routeKey = `${path}?${new URLSearchParams(query)}`

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [routeKey])

  for (const [pattern, Page] of ROUTES) {
    const params = matchRoute(pattern, path)
    // `key` recria a tela a cada navegação, zerando o estado dela
    if (params) return <Page key={routeKey} params={params} query={query} />
  }
  return <NotFound />
}
