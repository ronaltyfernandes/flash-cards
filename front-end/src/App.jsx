import { useEffect } from 'react'
import { Route, Routes, useLocation, useParams, useSearchParams } from 'react-router'
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

/** Entrega `params` e `query` às telas e recria a tela a cada navegação, zerando o estado dela. */
function Page({ component: Component }) {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { pathname, search } = useLocation()
  const key = `${pathname}${search}`

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [key])

  return <Component key={key} params={params} query={Object.fromEntries(searchParams)} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Page component={Home} />} />
      <Route path="/baralhos" element={<Page component={Decks} />} />
      <Route path="/baralhos/novo" element={<Page component={DeckForm} />} />
      <Route path="/baralhos/:deckId" element={<Page component={DeckDetail} />} />
      <Route path="/baralhos/:deckId/editar" element={<Page component={DeckForm} />} />
      <Route path="/estudar" element={<Page component={Study} />} />
      <Route path="/estudar/:deckId" element={<Page component={Study} />} />
      <Route path="/questoes" element={<Page component={QuizLobby} />} />
      <Route path="/questoes/todas" element={<Page component={Quiz} />} />
      <Route path="/questoes/:deckId" element={<Page component={Quiz} />} />
      <Route path="/criar" element={<Page component={Create} />} />
      <Route path="/editar/cartao/:cardId" element={<Page component={Create} />} />
      <Route path="/editar/questao/:questionId" element={<Page component={Create} />} />
      <Route path="/progresso" element={<Page component={Progress} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
