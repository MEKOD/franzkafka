import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function supabaseHeaders() {
  if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return {
    apikey: supabaseAnonKey,
    authorization: `Bearer ${supabaseAnonKey}`,
    accept: 'application/json',
  }
}

async function supabaseRest<T>(path: string, searchParams?: Record<string, string>) {
  if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  const url = new URL(path, supabaseUrl)
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v)
  }
  const res = await fetch(url, { headers: supabaseHeaders(), cache: 'no-store' })
  if (!res.ok) return null
  return (await res.json()) as T
}

export default async function OpenGraphImage({
  params,
}: {
  params: { username: string; slug: string } | Promise<{ username: string; slug: string }>
}) {
  try {
    const { username, slug } = await Promise.resolve(params)

    const profiles = await supabaseRest<Array<{ id: string; username: string | null }>>(
      '/rest/v1/profiles',
      {
        select: 'id,username',
        username: `eq.${username}`,
        limit: '1',
      }
    )

    const profile = profiles?.[0]
    if (!profile?.id) {
      return new ImageResponse(
        <OgShell title="Not found" caseId="-" author="@unknown" date="-" stamp="CONFIDENTIAL" />,
        size
      )
    }

    const posts = await supabaseRest<
      Array<{ id: number; title: string | null; content: string | null; inserted_at: string | null }>
    >('/rest/v1/posts', {
      select: 'id,title,content,inserted_at',
      author_id: `eq.${profile.id}`,
      slug: `eq.${slug}`,
      is_published: 'eq.true',
      visibility: 'eq.public',
      limit: '1',
    })

    const post = posts?.[0]
    if (!post) {
      return new ImageResponse(
        <OgShell title="Not found" caseId="-" author={`@${profile.username || username}`} date="-" stamp="CONFIDENTIAL" />,
        size
      )
    }

    const date = formatDate(post.inserted_at)

    return new ImageResponse(
      <OgShell
        title={post.title || 'Untitled'}
        caseId={`#${post.id}`}
        author={`@${profile.username || username}`}
        date={date}
        stamp="ARCHIVED"
      />,
      size
    )
  } catch {
    return new ImageResponse(
      <OgShell title="Error" caseId="-" author="@unknown" date="-" stamp="CONFIDENTIAL" />,
      size
    )
  }
}

function OgShell({
  title,
  caseId,
  author,
  date,
  stamp,
}: {
  title: string
  caseId: string
  author: string
  date: string
  stamp?: 'ARCHIVED' | 'CONFIDENTIAL'
}) {
  const paper = '#FDFBF7'
  const ink = '#000000'
  const stampRed = '#b91c1c'
  const stampGreen = '#15803d'

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px',
        background: paper,
        color: ink,
        fontFamily: '"Courier New", Courier, monospace',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          border: `2px solid ${ink}`,
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            fontWeight: 800,
            color: stampRed,
            letterSpacing: 2,
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          RESTRICTED // ACCESS LEVEL 5
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: `2px solid ${ink}`,
            borderBottom: `2px solid ${ink}`,
            padding: '28px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 900,
              textAlign: 'center',
              lineHeight: 1.12,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 20,
            paddingTop: 18,
            borderTop: `1px solid ${ink}`,
            fontSize: 22,
            color: '#444',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
            CASE: {caseId}
          </div>
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
            AUTHOR: {author}
          </div>
          <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
            DATE: {date}
          </div>
        </div>
      </div>

      {stamp === 'ARCHIVED' ? (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: 60,
            bottom: 80,
            border: `4px solid ${stampGreen}`,
            color: stampGreen,
            padding: '10px 30px',
            fontSize: 40,
            fontWeight: 900,
            transform: 'rotate(-15deg)',
            opacity: 0.82,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          ARCHIVED
        </div>
      ) : null}
    </div>
  )
}

function formatDate(insertedAt: string | null) {
  if (!insertedAt) return '-'
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(insertedAt))
  } catch {
    return String(insertedAt).split('T')[0] || '-'
  }
}
