/** Idiomas disponíveis. `voice` é o código usado para ler a palavra em voz alta. */
export const LANGUAGES = [
  { code: 'EN', name: 'Inglês', voice: 'en-US' },
  { code: 'ES', name: 'Espanhol', voice: 'es-ES' },
  { code: 'FR', name: 'Francês', voice: 'fr-FR' },
  { code: 'DE', name: 'Alemão', voice: 'de-DE' },
  { code: 'IT', name: 'Italiano', voice: 'it-IT' },
  { code: 'JA', name: 'Japonês', voice: 'ja-JP' },
  { code: 'KO', name: 'Coreano', voice: 'ko-KR' },
  { code: 'ZH', name: 'Chinês', voice: 'zh-CN' },
  { code: 'RU', name: 'Russo', voice: 'ru-RU' },
  { code: 'AR', name: 'Árabe', voice: 'ar-SA' },
  { code: 'PT', name: 'Português', voice: 'pt-BR' },
]

export function languageName(code) {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Lê o texto em voz alta com a voz do navegador. */
export function speak(text, languageCode) {
  if (!canSpeak() || !text) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANGUAGES.find((l) => l.code === languageCode)?.voice ?? 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

/** Cores possíveis para o selo do baralho. */
export const DECK_COLORS = {
  violet: { name: 'Violeta', className: 'bg-violet text-white' },
  amber: { name: 'Âmbar', className: 'bg-amber text-ink' },
  ink: { name: 'Tinta', className: 'bg-ink text-lime' },
  lime: { name: 'Lima', className: 'bg-lime text-ink' },
  coral: { name: 'Coral', className: 'bg-coral text-ink' },
  paper: { name: 'Papel', className: 'bg-paper-deep text-ink' },
}

/** Texto curto do selo: "EN" para idiomas, sigla para outros assuntos. */
export function deckCode(deck) {
  return deck.kind === 'language' ? deck.from : deck.code
}
