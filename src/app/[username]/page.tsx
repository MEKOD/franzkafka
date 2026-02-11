'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useAuth } from '@/components/auth'

interface ProfileView {
  id: string
  username: string | null
  bio: string | null
}

interface PublicPost {
  id: number
  title: string
  slug: string
  inserted_at: string
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const { hasConnection } = useAuth()
  const username = params.username
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!hasConnection) {
        setLoading(false)
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, bio')
        .eq('username', username)
        .maybeSingle()

      if (!profileData) {
        setProfile(null)
        setPosts([])
        setLoading(false)
        return
      }

      const { data: postData } = await supabase
        .from('posts')
        .select('id, title, slug, inserted_at')
        .eq('author_id', profileData.id)
        .eq('is_published', true)
        .eq('visibility', 'public')
        .order('inserted_at', { ascending: false })

      setProfile(profileData)
      setPosts(postData || [])
      setLoading(false)
    }

    fetchData()
  }, [hasConnection, username])

  if (!hasConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-ink-light">
          Bu sayfayi okumak icin once <Link href="/baglan" className="underline hover:no-underline">Supabase bagla</Link>.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-light text-sm">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-light text-sm">Kullanici bulunamadi.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:underline">
          FRANZKAFKA.XYZ
        </Link>
      </header>

      <section className="border-b border-ink px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">@{profile.username}</h1>
          {profile.bio && <p className="text-ink-light">{profile.bio}</p>}
          <p className="text-xs text-ink-light mt-4">{posts.length} yazi</p>
        </div>
      </section>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs uppercase tracking-wider font-semibold mb-4 text-ink-light">Yazilar</h2>

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${username}/${post.slug}`}
                  className="block border border-ink p-4 hover:bg-paper-dark"
                >
                  <h3 className="font-semibold mb-1">{post.title}</h3>
                  <p className="text-xs text-ink-light">
                    {new Date(post.inserted_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-ink-light text-sm">Henuz yazi yok.</p>
          )}
        </div>
      </main>
    </div>
  )
}

