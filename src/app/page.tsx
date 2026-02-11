import Link from 'next/link'
import Image from 'next/image'
import { Database, PenLine, NotebookPen } from 'lucide-react'
import { SiteHeader } from '@/components/nav/SiteHeader'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto border border-ink bg-paper p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5 pb-7 border-b border-ink">
            <Image
              src="/fkafka.jpg"
              alt="Kafka"
              width={128}
              height={128}
              className="w-32 h-32 object-cover mix-blend-multiply grayscale contrast-125 border border-ink"
            />
            <p className="text-xl sm:text-2xl leading-tight max-w-xl">
              &quot;I am free. That is why I am lost.&quot;
            </p>
          </div>

          <div className="pt-7">
            <h1 className="text-5xl font-bold tracking-tight">LEDGER</h1>
            <p className="mt-4 text-lg text-ink-light">
              Open-source writing platform
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
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
                My Post
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
