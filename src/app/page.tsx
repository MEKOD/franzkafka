import Link from 'next/link'
import { PenLine, NotebookPen } from 'lucide-react'
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
              href="/dashboard"
              className="btn text-base py-3 px-6"
            >
              <NotebookPen size={16} />
              My posts (Yazilarim)
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light">
        <div className="flex items-center justify-between w-full">
          <span>FranzKafka.xyz — Ledger</span>
          <nav className="flex items-center gap-3 shrink-0">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
