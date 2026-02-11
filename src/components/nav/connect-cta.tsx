'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth'

export function ConnectCta() {
  const { hasConnection } = useAuth()

  if (hasConnection) return null

  return (
    <div className="mb-6 border border-ink p-4 text-sm bg-paper-dark">
      <p className="text-ink-light mb-2">
        Baslamadan once kendi Supabase projeni bagla.
      </p>
      <Link href="/baglan" className="underline hover:no-underline font-semibold">
        /baglan
      </Link>
    </div>
  )
}

