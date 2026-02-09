'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, NotebookPen } from 'lucide-react'
import { useAuth } from '@/components/auth'
import { Button } from '@/components/ui'

export function SiteHeader() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const right = () => {
    if (loading) return null
    if (!user) {
      return (
        <Link href="/giris" className="text-sm hover:underline">
          Sign in
        </Link>
      )
    }

    const label = profile?.username ? `@${profile.username}` : (user.email || 'signed-in')

    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-light hidden sm:block">{label}</span>
        <Link href="/dashboard" className="text-sm hover:underline flex items-center gap-2">
          <NotebookPen size={14} />
          My posts
        </Link>
        <Link href="/settings/profile" className="text-sm hover:underline flex items-center gap-2">
          <UserIcon size={14} />
          Profile
        </Link>
        <Button onClick={handleSignOut} variant="danger">
          <LogOut size={14} />
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <header className="border-b border-ink px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-lg font-semibold tracking-tight hover:underline">
        FRANZKAFKA.XYZ
      </Link>
      {right()}
    </header>
  )
}

