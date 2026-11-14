/* Baralhos de exemplo para o app não começar vazio. Pode apagar todos pela tela de Baralhos. */
import { dayKey } from '../lib/dates'
import { newSrs } from '../lib/srs'
import { newId } from '../lib/utils'
import { STATE_VERSION } from './storage'

const SAMPLE_DECKS = [
  {
    deck: { name: 'Inglês · Phrasal verbs', kind: 'language', from: 'EN', to: 'PT', color: 'violet' },
    cards: [
      ['figure out', 'descobrir, entender', '/ˈfɪɡ.jɚ aʊt/', 'I can’t figure out how this works.', 'Não consigo entender como isso funciona.'],
      ['look forward to', 'estar ansioso por', '/lʊk ˈfɔːr.wɚd tuː/', 'I look forward to meeting you.', 'Estou ansioso para te conhecer.'],
      ['give up', 'desistir', '/ɡɪv ʌp/', 'Don’t give up now.', 'Não desista agora.'],
      ['find out', 'ficar sabendo', '/faɪnd aʊt/', 'I want to find out the truth.', 'Quero ficar sabendo a verdade.'],
      ['run out of', 'ficar sem', '/rʌn aʊt əv/', 'We always run out of milk.', 'A gente sempre fica sem leite.'],
      ['pick up', 'pegar, buscar', '/pɪk ʌp/', 'Can you pick up the kids at eight?', 'Você pode buscar as crianças às oito?'],
      ['put off', 'adiar', '/pʊt ɔːf/', 'They put off the meeting until Monday.', 'Eles adiaram a reunião para segunda.'],
      ['get along with', 'dar-se bem com', '/ɡet əˈlɔːŋ wɪð/', 'I get along with everyone at work.', 'Eu me dou bem com todo mundo no trabalho.'],
    ],
  },
  {
    deck: { name: 'Espanhol · Viagem', kind: 'language', from: 'ES', to: 'PT', color: 'amber' },
    cards: [
      ['el equipaje', 'a bagagem', '/e.kiˈpa.xe/', '¿Dónde puedo recoger el equipaje?', 'Onde posso pegar a bagagem?'],
      ['el billete', 'a passagem', '/biˈʎe.te/', 'Compré el billete de ida y vuelta.', 'Comprei a passagem de ida e volta.'],
      ['la habitación', 'o quarto', '/a.βi.taˈθjon/', 'La habitación tiene vistas al mar.', 'O quarto tem vista para o mar.'],
      ['la cuenta', 'a conta', '/ˈkwen.ta/', 'La cuenta, por favor.', 'A conta, por favor.'],
      ['cerca', 'perto', '/ˈθeɾ.ka/', '¿Hay una farmacia cerca?', 'Tem uma farmácia perto?'],
      ['la tarjeta de embarque', 'o cartão de embarque', '', 'Necesito imprimir la tarjeta de embarque.', 'Preciso imprimir o cartão de embarque.'],
    ],
  },
  {
    deck: { name: 'Japonês · Básico', kind: 'language', from: 'JA', to: 'PT', color: 'ink' },
    cards: [
      ['水', 'água', 'mizu', '水をください。', 'Água, por favor.'],
      ['犬', 'cachorro', 'inu', '犬が好きです。', 'Eu gosto de cachorros.'],
      ['駅', 'estação', 'eki', '駅はどこですか。', 'Onde fica a estação?'],
      ['食べる', 'comer', 'taberu', 'パンを食べる。', 'Comer pão.'],
      ['ありがとう', 'obrigado', 'arigatō', '', ''],
      ['こんにちは', 'olá, boa tarde', 'konnichiwa', '', ''],
    ],
  },
  {
    deck: { name: 'Biologia · A célula', kind: 'subject', code: 'Bio', color: 'paper' },
    cards: [
      ['Qual organela produz a maior parte do ATP da célula?', 'Mitocôndria'],
      ['Onde fica o material genético em uma célula eucarionte?', 'No núcleo'],
      ['Qual estrutura controla o que entra e sai da célula?', 'Membrana plasmática'],
      ['Qual organela faz a síntese de proteínas?', 'Ribossomo'],
      ['Qual organela realiza a fotossíntese nas células vegetais?', 'Cloroplasto'],
      ['Qual organela faz a digestão intracelular?', 'Lisossomo'],
    ],
    questions: [
      {
        prompt: 'Qual destas estruturas existe nas células vegetais, mas não nas animais?',
        answer: 'Parede celular',
        wrong: ['Mitocôndria', 'Ribossomo', 'Membrana plasmática'],
        explanation: 'As células vegetais têm parede celular de celulose; as animais não.',
      },
      {
        prompt: 'O que as células procariontes não possuem?',
        answer: 'Núcleo delimitado por membrana',
        wrong: ['Ribossomos', 'Membrana plasmática', 'Material genético'],
        explanation: 'Nas procariontes, o material genético fica solto no citoplasma.',
      },
    ],
  },
]

/*
 * Histórico de estudo de demonstração: 130 dias seguidos até hoje, com
 * mais revisões em dias úteis, uma ou outra pausa de quiz e acerto variado.
 * Gerador determinístico (sempre o mesmo histórico), para o visual não mudar a cada recarga.
 */
const HISTORY_DAYS = 130

function buildHistory(now) {
  let seed = 20260101
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const days = {}
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    const reviews = Math.round((weekend ? 8 : 16) + random() * (weekend ? 14 : 24))
    const correct = Math.round(reviews * (0.74 + random() * 0.2))
    const quizTotal = random() < 0.45 ? Math.round(2 + random() * 6) : 0
    const quizCorrect = Math.round(quizTotal * (0.55 + random() * 0.4))
    const newCards = Math.round(random() * 4)
    days[dayKey(date.getTime())] = { reviews, correct, newCards, quizTotal, quizCorrect }
  }
  return days
}

export function createSeedState(now = Date.now()) {
  const decks = []
  const cards = []
  const questions = []
  let order = 0

  for (const sample of SAMPLE_DECKS) {
    const deck = { id: newId(), createdAt: now + order++, ...sample.deck }
    decks.push(deck)

    for (const [front, back, ipa = '', example = '', exampleTranslation = ''] of sample.cards) {
      cards.push({
        id: newId(),
        deckId: deck.id,
        front,
        back,
        ipa,
        example,
        exampleTranslation,
        image: null,
        autoQuiz: true,
        srs: newSrs(),
        createdAt: now + order++,
      })
    }

    for (const question of sample.questions ?? []) {
      questions.push({ id: newId(), deckId: deck.id, createdAt: now + order++, ...question })
    }
  }

  return { version: STATE_VERSION, decks, cards, questions, days: buildHistory(now) }
}
