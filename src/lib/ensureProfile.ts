import type { PostgrestError, SupabaseClient, User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { usernameFromEmail } from '@/lib/username'

export async function ensureProfile(user: User, supabase: SupabaseClient): Promise<Profile | null> {
  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('ensureProfile: select failed:', selectError)
    return null
  }

  if (existing) return existing

  const base = usernameFromEmail(user.email)
  const candidates = [base, `${base}-${Math.random().toString(36).slice(2, 6)}`]

  for (const username of candidates) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      username,
    })

    if (!insertError) {
      const { data: created } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      return created || null
    }

    // If username conflicts, try next candidate.
    const e = insertError as PostgrestError
    if (e.code !== '23505') {
      console.error('ensureProfile: insert failed:', insertError)
      return null
    }
  }

  return null
}
