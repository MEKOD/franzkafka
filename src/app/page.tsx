import Link from 'next/link'
import { PenLine, BookOpen } from 'lucide-react'
import { SiteHeader } from '@/components/nav/SiteHeader'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <SiteHeader />

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            LEDGER
          </h2>
          <p className="text-lg text-ink-light mb-8 leading-relaxed">
            A bureaucratic notebook.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/yaz"
              className="btn btn-primary text-base py-3 px-6"
            >
              <PenLine size={16} />
              Write (Yaz)
            </Link>
            <Link
              href="/read"
              className="btn text-base py-3 px-6"
            >
              <BookOpen size={16} />
              Read (Oku)
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light text-center">
        <p>FranzKafka.xyz — Ledger</p>
      </footer>
    </div>
  )
}
