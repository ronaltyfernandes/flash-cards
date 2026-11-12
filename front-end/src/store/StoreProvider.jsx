import { useEffect, useMemo, useReducer } from 'react'
import { createSeedState } from '../data/seed'
import { loadState, saveState } from '../data/storage'
import { newSrs } from '../lib/srs'
import { newId } from '../lib/utils'
import { StoreContext } from './context'
import { reducer } from './reducer'

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState() ?? createSeedState())

  // Salva a cada mudança
  useEffect(() => {
    saveState(state)
  }, [state])

  const actions = useMemo(
    () => ({
      addDeck(data) {
        const deck = { ...data, id: newId(), createdAt: Date.now() }
        dispatch({ type: 'deck/add', deck })
        return deck
      },
      updateDeck(id, data) {
        dispatch({ type: 'deck/update', deck: { ...data, id } })
      },
      deleteDeck(id) {
        dispatch({ type: 'deck/delete', id })
      },

      addCard(data) {
        const card = { image: null, autoQuiz: true, ...data, id: newId(), srs: newSrs(), createdAt: Date.now() }
        dispatch({ type: 'card/add', card })
        return card
      },
      updateCard(id, data) {
        dispatch({ type: 'card/update', card: { ...data, id } })
      },
      deleteCard(id) {
        dispatch({ type: 'card/delete', id })
      },

      addQuestion(data) {
        const question = { ...data, id: newId(), createdAt: Date.now() }
        dispatch({ type: 'question/add', question })
        return question
      },
      updateQuestion(id, data) {
        dispatch({ type: 'question/update', question: { ...data, id } })
      },
      deleteQuestion(id) {
        dispatch({ type: 'question/delete', id })
      },

      gradeCard(id, grade) {
        dispatch({ type: 'card/grade', id, grade, now: Date.now() })
      },
      answerQuiz({ correct, cardId }) {
        dispatch({ type: 'quiz/answer', correct, cardId, now: Date.now() })
      },
    }),
    [],
  )

  const store = useMemo(() => ({ state, actions }), [state, actions])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
