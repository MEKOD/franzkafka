export function stripHtml(html: string): string {
  // Good enough for excerpts/metrics; content is authored HTML from TipTap.
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function countWords(text: string): number {
  if (!text) return 0
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return words.length
}

export function readingTimeMinutesFromWords(words: number): number {
  // 200 wpm baseline.
  return Math.max(1, Math.round(words / 200))
}

