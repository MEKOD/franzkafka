'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useAuth } from '@/components/auth'
import { Button } from '@/components/ui'
import type { Post, Visibility } from '@/lib/types'
import { stripHtml, countWords, readingTimeMinutesFromWords } from '@/lib/text'

export default function DossierPage() {
  const params = useParams()
  const router = useRouter()
  const search = useSearchParams()
  const { user, profile } = useAuth()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error || !data) {
        router.push('/')
        return
      }

      // Allow if public OR if user is author
      const isPublic = data.visibility === 'public'
      const isAuthor = user?.id === data.author_id

      if (!isPublic && !isAuthor) {
        router.push('/')
        return
      }

      setPost(data)
      setLoading(false)
    }

    fetchPost()
  }, [postId, router, user])

  const plain = useMemo(() => stripHtml(post?.content || ''), [post?.content])
  const words = useMemo(() => countWords(plain), [plain])
  const minutes = useMemo(() => readingTimeMinutesFromWords(words), [words])

  const stamp = (post?.visibility as Visibility) === 'public' ? 'ARCHIVED' : 'CONFIDENTIAL'

  useEffect(() => {
    if (!loading && post && search.get('print') === '1') {
      // Let the layout paint first.
      const t = window.setTimeout(() => window.print(), 350)
      return () => window.clearTimeout(t)
    }
  }, [loading, post, search])

  if (loading || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-light text-sm">Loading... / Yukleniyor...</p>
      </div>
    )
  }

  const isAuthor = user?.id === post.author_id

  return (
    <div className="min-h-screen flex flex-col dossier-root">
      <header className="border-b border-ink px-6 py-4 flex items-center justify-between no-print">
        <Link
          href={isAuthor ? `/duzenle/${post.id}` : `/${profile?.username || post.author_id}/${post.slug}`}
          className="text-sm hover:underline"
        >
          ← {isAuthor ? 'Back to editor' : 'Back to post'}
        </Link>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.print()} variant="primary">
            Print / Save PDF
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto dossier-sheet border border-ink bg-paper">
          <div className="dossier-holes" aria-hidden="true" />

          <div className="p-10 relative">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-light">
                  The Dossier
                </div>
                <div className="text-lg font-semibold tracking-tight">
                  FRANZKAFKA.XYZ
                </div>
              </div>
              <div className={`stamp ${stamp === 'ARCHIVED' ? 'stamp-approved' : 'stamp-rejected'}`}>
                {stamp}
              </div>
            </div>

            <div className="mt-10 border-t border-ink pt-8">
              <h1 className="text-3xl font-bold mb-3">{post.title || 'Untitled'}</h1>
              <div className="text-xs text-ink-light flex flex-wrap gap-4">
                <span>Case: #{post.id}</span>
                <span>Author: {profile?.username ? `@${profile.username}` : post.author_id}</span>
                <span>Date: {new Date(post.inserted_at).toLocaleDateString('tr-TR')}</span>
                <span>Visibility: {(post.visibility as string) === 'public' ? 'Open' : 'Private'}</span>
                <span>
                  {words} words · {minutes} min
                </span>
              </div>
            </div>

            <div className="mt-10 dossier-body prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
            </div>

            <div className="mt-12 pt-6 border-t border-ink text-xs text-ink-light">
              <div className="flex justify-between">
                <span>Printed from franzkafka.xyz</span>
                <span>{stamp}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
