/**
 * Reduz a imagem escolhida e devolve um data URL (JPEG).
 * Mantém as imagens pequenas porque, por enquanto, tudo fica no localStorage.
 */
export function imageFileToDataUrl(file, maxSize = 640) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const context = canvas.getContext('2d')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não consegui ler essa imagem.'))
    }
    image.src = url
  })
}
