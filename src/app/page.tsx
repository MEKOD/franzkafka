import Link from 'next/link'
import { Database, PenLine, NotebookPen } from 'lucide-react'
import { SiteHeader } from '@/components/nav/SiteHeader'
import { ConnectCta } from '@/components/nav/connect-cta'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <SiteHeader />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="border border-ink bg-paper p-8">
            <h2 className="text-4xl font-bold tracking-tight mb-4">LEDGER</h2>
            <p className="text-base text-ink-light leading-relaxed max-w-2xl">
              Open-source writing platform with bring-your-own-Supabase architecture.
              Your auth, profiles, and posts stay in your own database.
            </p>

            <div className="mt-6 grid gap-3 text-sm">
              <div className="border border-ink px-3 py-2">
                <span className="font-semibold">1.</span> Connect your Supabase on <code>/baglan</code>
              </div>
              <div className="border border-ink px-3 py-2">
                <span className="font-semibold">2.</span> Run initialization SQL (<code>schema.sql</code>)
              </div>
              <div className="border border-ink px-3 py-2">
                <span className="font-semibold">3.</span> Sign up and start publishing
              </div>
            </div>

            <ConnectCta />

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link href="/baglan" className="btn btn-primary text-base py-3 px-6">
                <Database size={16} />
                Connect Supabase
              </Link>
              <Link href="/yaz" className="btn text-base py-3 px-6">
                <PenLine size={16} />
                Write
              </Link>
              <Link href="/dashboard" className="btn text-base py-3 px-6">
                <NotebookPen size={16} />
                My posts
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light">
        <div className="flex items-center justify-between w-full">
          <span>FranzKafka.xyz — Ledger (BYOD)</span>
          <nav className="flex items-center gap-3 shrink-0">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/MEKOD/franzkafka"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
