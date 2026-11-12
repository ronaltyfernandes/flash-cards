/*
 * Gera questões de múltipla escolha.
 *  - 'meaning': mostra a frente do cartão, as alternativas são versos.
 *  - 'cloze':   mostra a frase de exemplo com uma lacuna, as alternativas são frentes.
 *  - 'custom':  questão escrita pelo usuário.
 */
import { shuffle } from './utils'

const BLANK = '_____'

function sameText(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** Até `amount` textos diferentes de `correct`, sem repetir. */
function pickDistractors(candidates, correct, amount) {
  const picked = []
  for (const text of shuffle(candidates)) {
    if (!text || sameText(text, correct)) continue
    if (picked.some((p) => sameText(p, text))) continue
    picked.push(text)
    if (picked.length === amount) break
  }
  return picked
}

function toOptions(correct, distractors) {
  const options = shuffle([correct, ...distractors]).map((text, index) => ({ id: `o${index}`, text }))
  return { options, correctId: options.find((o) => o.text === correct).id }
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function fromCard(card, deck, deckCards, otherCards) {
  const isLanguage = deck.kind === 'language'

  // Completar a frase: só quando o exemplo contém a frente do cartão
  const pattern = new RegExp(escapeRegExp(card.front), 'i')
  const canCloze = isLanguage && card.example && pattern.test(card.example)
  if (canCloze && Math.random() < 0.4) {
    const distractors = pickDistractors(
      deckCards.map((c) => c.front),
      card.front,
      3,
    )
    if (distractors.length >= 1) {
      return {
        id: `cloze-${card.id}`,
        kind: 'cloze',
        typeLabel: 'Completar a frase',
        deck,
        cardId: card.id,
        lead: 'Complete a frase',
        sentence: card.example.replace(pattern, BLANK),
        hint: card.exampleTranslation || null,
        answerText: card.front,
        explanation: `“${card.front}” = ${card.back}.`,
        ...toOptions(card.front, distractors),
      }
    }
  }

  let distractors = pickDistractors(
    deckCards.map((c) => c.back),
    card.back,
    3,
  )
  if (distractors.length < 3) {
    const extra = pickDistractors(
      otherCards.map((c) => c.back),
      card.back,
      3,
    ).filter((text) => !distractors.some((d) => sameText(d, text)))
    distractors = [...distractors, ...extra].slice(0, 3)
  }
  if (distractors.length === 0) return null

  return {
    id: `meaning-${card.id}`,
    kind: 'meaning',
    typeLabel: 'Múltipla escolha',
    deck,
    cardId: card.id,
    lead: isLanguage ? 'O que significa' : null,
    term: isLanguage ? card.front : null,
    question: isLanguage ? null : card.front,
    context: isLanguage && card.example ? card.example : null,
    answerText: card.back,
    explanation: isLanguage ? `“${card.front}” = ${card.back}.` : `Resposta: ${card.back}.`,
    ...toOptions(card.back, distractors),
  }
}

function fromQuestion(question, deck) {
  return {
    id: `custom-${question.id}`,
    kind: 'custom',
    typeLabel: 'Múltipla escolha',
    deck,
    cardId: null,
    question: question.prompt,
    answerText: question.answer,
    explanation: question.explanation || `Resposta: ${question.answer}.`,
    ...toOptions(question.answer, question.wrong.filter(Boolean)),
  }
}

/** Baralhos "parecidos" podem emprestar alternativas: mesmo tipo e mesmo idioma de resposta. */
function isSimilarDeck(deck, other) {
  return other.id !== deck.id && other.kind === deck.kind && other.to === deck.to
}

/** Quantas questões dá para gerar (sem montar a rodada). */
export function countQuizItems({ decks, cards, questions }, deckId) {
  const deckById = new Map(decks.map((d) => [d.id, d]))
  const inScope = (item) => deckById.has(item.deckId) && (!deckId || item.deckId === deckId)

  const fromCards = cards.filter((card) => {
    if (!inScope(card) || card.autoQuiz === false) return false
    const deck = deckById.get(card.deckId)
    // Precisa existir pelo menos uma alternativa errada diferente
    return cards.some((other) => {
      if (other.id === card.id || sameText(other.back, card.back)) return false
      const otherDeck = deckById.get(other.deckId)
      return Boolean(otherDeck) && (otherDeck.id === deck.id || isSimilarDeck(deck, otherDeck))
    })
  }).length

  return fromCards + questions.filter(inScope).length
}

/** Monta uma rodada com até `size` questões. */
export function buildQuiz({ decks, cards, questions }, deckId, size = 10) {
  const deckById = new Map(decks.map((d) => [d.id, d]))
  const inScope = (item) => deckById.has(item.deckId) && (!deckId || item.deckId === deckId)

  const fromCards = cards
    .filter((card) => inScope(card) && card.autoQuiz !== false)
    .map((card) => {
      const deck = deckById.get(card.deckId)
      const deckCards = cards.filter((c) => c.deckId === card.deckId && c.id !== card.id)
      // Se faltar alternativa, completa com cartões de baralhos parecidos
      const otherCards = cards.filter((c) => {
        const other = deckById.get(c.deckId)
        return Boolean(other) && isSimilarDeck(deck, other)
      })
      return fromCard(card, deck, deckCards, otherCards)
    })
    .filter(Boolean)

  const custom = questions.filter(inScope).map((q) => fromQuestion(q, deckById.get(q.deckId)))

  return shuffle([...custom, ...fromCards]).slice(0, size)
}
