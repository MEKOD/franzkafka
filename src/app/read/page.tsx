import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { SiteHeader } from '@/components/nav/SiteHeader'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PublicPostRow = {
  id: number
  title: string
  slug: string
  inserted_at: string
  author: { username: string | null } | null
}

export default async function ReadPage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, inserted_at, author:profiles(username)')
    .eq('is_published', true)
    .eq('visibility', 'public')
    .order('inserted_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Read (Oku)</h1>
          <p className="text-sm text-ink-light mb-8">
            Public notes only. / Sadece herkese acik.
          </p>

          {error ? (
            <div className="p-3 border border-stamp-red bg-stamp-red/5 text-stamp-red text-xs">
              Failed to load. / Yuklenemedi.
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-2">
              {(posts as unknown as PublicPostRow[]).map((post) => {
                const username = post.author?.username
                const href = username ? `/${username}/${post.slug}` : '#'
                return (
                  <Link
                    key={post.id}
                    href={href}
                    className="block border border-ink p-4 hover:bg-paper-dark"
                  >
                    <h2 className="font-semibold mb-1">{post.title}</h2>
                    <p className="text-xs text-ink-light">
                      {username ? `@${username}` : 'unknown'} ·{' '}
                      {new Date(post.inserted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-ink-light text-sm">Nothing public yet. / Henuz yok.</p>
          )}
        </div>
      </main>

      <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light text-center">
        <p>FranzKafka.xyz — Ledger</p>
      </footer>
    </div>
  )
}
