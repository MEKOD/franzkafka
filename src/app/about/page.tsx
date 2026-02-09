import Link from 'next/link'
import { SiteHeader } from '@/components/nav/SiteHeader'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-baseline justify-between gap-6">
            <h1 className="text-2xl font-bold tracking-tight">About</h1>
            <Link href="/" className="text-xs text-ink-light hover:underline">
              Home
            </Link>
          </div>

          <div className="mt-6 border border-ink bg-paper p-6">
            <h2 className="text-xs uppercase tracking-wider text-ink-light font-semibold">
              Disclaimer
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              This project is a tribute to the literary legacy of Franz Kafka.
              It is an independent software project and is not affiliated with
              any Franz Kafka estate or official organization.
            </p>
          </div>
        </div>
      </main>

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
