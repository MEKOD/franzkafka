'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { ProtectedRoute, useAuth } from '@/components/auth'
import { Button, Input } from '@/components/ui'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { normalizeUsername, usernameFromEmail } from '@/lib/username'
import type { PostgrestError } from '@supabase/supabase-js'

function ProfileSettingsContent() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const suggested = useMemo(() => usernameFromEmail(user?.email), [user?.email])

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsername(profile?.username || suggested)
    setBio(profile?.bio || '')
  }, [user, profile?.username, profile?.bio, suggested])

  const validateUsername = (raw: string) => {
    const u = normalizeUsername(raw)
    if (u.length < 3) return 'Username too short (min 3). / Cok kisa.'
    if (u.length > 24) return 'Username too long (max 24). / Cok uzun.'
    if (!/^[a-z0-9_-]+$/.test(u)) return 'Only a-z 0-9 _ - allowed.'
    return ''
  }

  const handleSave = async () => {
    if (!user) return
    setError('')

    const u = normalizeUsername(username)
    const validation = validateUsername(u)
    if (validation) {
      setError(validation)
      return
    }

    setSaving(true)
    const supabase = getSupabaseBrowserClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: u,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      const e = updateError as PostgrestError
      if (e.code === '23505') {
        setError('Username already taken. / Kullaniliyor.')
      } else {
        setError('Save failed. / Kayit olmadi.')
      }
      setSaving(false)
      return
    }

    await refreshProfile()
    setSaving(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm hover:underline">
          <ArrowLeft size={14} />
          Back / Geri
        </Link>
        <Button onClick={handleSave} variant="primary" disabled={saving}>
          <Save size={14} />
          {saving ? 'Saving... / Kaydediliyor' : 'Save / Kaydet'}
        </Button>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-sm text-ink-light mb-8">
            Pick a username to publish and share links. / Paylasim icin kullanici adi.
          </p>

          <div className="border border-ink p-6 bg-paper space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={suggested}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wider text-ink-light font-medium">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 bg-transparent border border-ink text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Optional. / Istege bagli."
              />
            </div>

            {error && (
              <div className="p-3 border border-stamp-red bg-stamp-red/5 text-stamp-red text-xs">
                {error}
              </div>
            )}

            <p className="text-xs text-ink-light">
              Allowed: a-z, 0-9, `_`, `-` (3-24 chars).
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light text-center">
        <p>FranzKafka.xyz — Ledger</p>
      </footer>
    </div>
  )
}

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <ProfileSettingsContent />
    </ProtectedRoute>
  )
}
