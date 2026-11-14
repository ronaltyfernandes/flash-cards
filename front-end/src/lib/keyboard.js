/** A tecla foi digitada dentro de um campo? Então não é atalho. */
export function isTyping(event) {
  const target = event.target
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** Atalho sem Ctrl/Cmd/Alt, fora de campos de texto. */
export function isPlainShortcut(event) {
  return !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event)
}
