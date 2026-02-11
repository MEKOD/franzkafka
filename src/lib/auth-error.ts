type LooseError = {
  message?: string
  status?: number
  code?: string
  name?: string
}

export function formatAuthError(input: unknown, fallback: string): string {
  const err = (input || {}) as LooseError
  const message = err.message || fallback
  const parts: string[] = [message]

  if (typeof err.status === 'number') parts.push(`status=${err.status}`)
  if (err.code) parts.push(`code=${err.code}`)

  return parts.join(' | ')
}

