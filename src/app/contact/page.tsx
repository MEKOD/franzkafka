import Link from 'next/link'
import { SiteHeader } from '@/components/nav/SiteHeader'

const links = [
  { label: 'Email', href: 'mailto:mert38338@gmail.com', value: 'mert38338@gmail.com' },
  { label: 'Product Hunt', href: 'https://www.producthunt.com/@mert_turkoglu', value: '@mert_turkoglu' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mertturkoglu-dev/', value: 'mertturkoglu-dev' },
  { label: 'Instagram', href: 'https://www.instagram.com/merttuurkoglu_/', value: 'merttuurkoglu_' },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-baseline justify-between gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Contact</h1>
            <Link href="/" className="text-xs text-ink-light hover:underline">
              Home
            </Link>
          </div>

          <div className="mt-6 border border-ink bg-paper p-6">
            <p className="text-sm text-ink-light">
              Reach out via:
            </p>

            <ul className="mt-4 space-y-3">
              {links.map((l) => (
                <li key={l.label} className="flex items-center justify-between gap-6">
                  <span className="text-xs uppercase tracking-wider text-ink-light font-semibold">
                    {l.label}
                  </span>
                  <a
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                    className="text-sm underline underline-offset-2 hover:no-underline break-all text-right"
                  >
                    {l.value}
                  </a>
                </li>
              ))}
            </ul>
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
