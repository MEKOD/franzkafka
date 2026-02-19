'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Share2 } from 'lucide-react'
import { ShareCardModal } from '@/components/ShareCardModal'
import { useAuth } from '@/components/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

interface PublicProfile {
  id: string
  username: string | null
}

interface PublicPost {
  id: number
  title: string
  content: string
  inserted_at: string
  slug: string
}

export default function PostPage() {
  const params = useParams<{ username: string; slug: string }>()
  const { hasConnection } = useAuth()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [post, setPost] = useState<PublicPost | null>(null)
  const [sharePost, setSharePost] = useState<PublicPost | null>(null)
  const [loading, setLoading] = useState(true)

  const username = params.username
  const slug = params.slug

  useEffect(() => {
    async function fetchData() {
      if (!hasConnection) {
        setLoading(false)
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .maybeSingle()

      if (!profileData) {
        setProfile(null)
        setPost(null)
        setLoading(false)
        return
      }

      const { data: postData } = await supabase
        .from('posts')
        .select('id, title, content, inserted_at, slug')
        .eq('author_id', profileData.id)
        .eq('slug', slug)
        .eq('is_published', true)
        .eq('visibility', 'public')
        .maybeSingle()

      setProfile(profileData)
      setPost(postData)
      setLoading(false)
    }

    fetchData()
  }, [hasConnection, username, slug])

  if (!hasConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-ink-light">
          Bu yaziyi okumak icin once <Link href="/baglan" className="underline hover:no-underline">Supabase bagla</Link>.
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

  if (!profile || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-light text-sm">Yazi bulunamadi.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink px-6 py-4 flex items-center justify-between">
        <Link href={`/${username}`} className="flex items-center gap-2 text-sm hover:underline">
          <ArrowLeft size={14} />
          @{username}
        </Link>
        <Link href="/" className="text-lg font-semibold tracking-tight hover:underline">
          FRANZKAFKA.XYZ
        </Link>
      </header>

      <article className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-ink-light mb-8 pb-8 border-b border-ink">
            <Link href={`/${username}`} className="hover:underline">
              @{profile.username}
            </Link>
            <span>•</span>
            <time dateTime={post.inserted_at}>
              {new Date(post.inserted_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <button
              onClick={() => setSharePost(post)}
              className="hover:underline flex items-center gap-1"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>

          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>

      {sharePost && profile && (
        <ShareCardModal
          post={sharePost}
          username={profile.username || ''}
          onClose={() => setSharePost(null)}
        />
      )}
    </div>
  )
}

