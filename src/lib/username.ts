export function usernameFromEmail(email: string | null | undefined): string {
  const raw = (email || '').split('@')[0] || 'user'
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 24)

  if (cleaned.length >= 3) return cleaned
  return `user-${Date.now().toString().slice(-6)}`
}

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
}

