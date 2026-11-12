import { dayKey } from '../lib/dates'
import { schedule } from '../lib/srs'

const EMPTY_DAY = { reviews: 0, correct: 0, newCards: 0, quizTotal: 0, quizCorrect: 0 }

/** Soma os valores de `patch` no registro do dia. */
function addToDay(days, now, patch) {
  const key = dayKey(now)
  const day = { ...EMPTY_DAY, ...days[key] }
  for (const [field, amount] of Object.entries(patch)) day[field] += amount
  return { ...days, [key]: day }
}

function replaceById(list, item) {
  return list.map((current) => (current.id === item.id ? { ...current, ...item } : current))
}

export function reducer(state, action) {
  switch (action.type) {
    case 'deck/add':
      return { ...state, decks: [...state.decks, action.deck] }
    case 'deck/update':
      return { ...state, decks: replaceById(state.decks, action.deck) }
    case 'deck/delete':
      return {
        ...state,
        decks: state.decks.filter((d) => d.id !== action.id),
        cards: state.cards.filter((c) => c.deckId !== action.id),
        questions: state.questions.filter((q) => q.deckId !== action.id),
      }

    case 'card/add':
      return { ...state, cards: [...state.cards, action.card] }
    case 'card/update':
      return { ...state, cards: replaceById(state.cards, action.card) }
    case 'card/delete':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.id) }

    case 'question/add':
      return { ...state, questions: [...state.questions, action.question] }
    case 'question/update':
      return { ...state, questions: replaceById(state.questions, action.question) }
    case 'question/delete':
      return { ...state, questions: state.questions.filter((q) => q.id !== action.id) }

    // Avaliação de um cartão na tela de estudo
    case 'card/grade': {
      const card = state.cards.find((c) => c.id === action.id)
      if (!card) return state
      const srs = schedule(card.srs, action.grade, action.now)
      return {
        ...state,
        cards: replaceById(state.cards, { id: card.id, srs }),
        days: addToDay(state.days, action.now, {
          reviews: 1,
          correct: action.grade === 'again' ? 0 : 1,
          newCards: card.srs.reps === 0 ? 1 : 0,
        }),
      }
    }

    // Resposta de uma questão. Errar uma questão gerada de um cartão
    // traz esse cartão de volta para a próxima revisão.
    case 'quiz/answer': {
      const days = addToDay(state.days, action.now, { quizTotal: 1, quizCorrect: action.correct ? 1 : 0 })
      if (action.correct || !action.cardId) return { ...state, days }
      const cards = state.cards.map((card) =>
        card.id === action.cardId && card.srs.reps > 0 && card.srs.due > action.now
          ? { ...card, srs: { ...card.srs, due: action.now } }
          : card,
      )
      return { ...state, cards, days }
    }

    default:
      return state
  }
}
