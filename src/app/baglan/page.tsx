'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/components/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { REQUIRED_SQL } from '@/lib/required-sql'

export default function ConnectSupabasePage() {
  const router = useRouter()
  const {
    hasConnection,
    hasDefaultConnection,
    connectionSource,
    connection,
    connectSupabase,
    switchToDefaultSupabase,
    disconnectSupabase,
  } = useAuth()

  const [url, setUrl] = useState(() => connection?.url || '')
  const [anonKey, setAnonKey] = useState(() => connection?.anonKey || '')
  
  const [status, setStatus] = useState<'IDLE' | 'TESTING' | 'SAVING' | 'SUCCESS' | 'ERROR' | 'MISSING_SCHEMA'>('IDLE')
  const [feedback, setFeedback] = useState('')

  const testConnection = async () => {
    setStatus('TESTING')
    setFeedback('')

    // 1. Basic Config Check
    const result = await connectSupabase(url, anonKey)
    if (result.error) {
      setFeedback('Configuration Invalid: Check URL and Key.')
      setStatus('ERROR')
      return false
    }

    try {
      // 2. Schema Probe (Dedektif Modu)
      // Burada 'posts' tablosunu kontrol ediyoruz çünkü profiles auth trigger ile oluşabilir ama posts kesin biziz.
      const supabase = getSupabaseBrowserClient()
      const { error: probeError } = await supabase.from('posts').select('id').limit(1)

      if (probeError) {
        // HATA KODU 42P01: Undefined Table (Tablo Yok)
        if (probeError.code === '42P01' || probeError.message.includes('does not exist')) {
          setFeedback('Connection Established, but Database is Empty.')
          setStatus('MISSING_SCHEMA') // Kritik nokta burası
          return false
        }
        
        setFeedback(`Connection Error: ${probeError.message}`)
        setStatus('ERROR')
        return false
      }

      setFeedback('Connection Verified. System Ready.')
      setStatus('SUCCESS')
      return true

    } catch (e) {
      setFeedback(`Critical Failure: ${(e as Error).message}`)
      setStatus('ERROR')
      return false
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    // Eğer zaten SUCCESS ise tekrar teste gerek yok, direkt geç
    if (status === 'SUCCESS') {
      router.push('/giris')
      return
    }

    const ok = await testConnection()
    if (ok) router.push('/giris')
  }

  const handleDisconnect = async () => {
    await disconnectSupabase()
    setStatus('IDLE')
    setFeedback('')
    setUrl('')
    setAnonKey('')
  }

  const copySQL = () => {
    navigator.clipboard.writeText(REQUIRED_SQL)
    alert('SQL copied to clipboard. Paste it in Supabase SQL Editor.')
  }

  return (
    <div className="min-h-screen flex flex-col font-mono">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl border border-ink bg-paper p-6">
          <div className="mb-8 border-b-2 border-black pb-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tighter">SYSTEM CONFIGURATION</h1>
              <Link href="/" className="text-xs underline hover:no-underline">
                HOME
              </Link>
            </div>
            <p className="text-sm text-gray-600 mt-2 uppercase">
              Protocol: Bring Your Own Database (BYOD)
            </p>
            <p className="text-xs text-ink-light mt-2">
              Configure your own Supabase project here. We transparently show every setup step below.
            </p>
          </div>

          {hasDefaultConnection && (
            <div className="mb-5 p-3 border border-ink text-xs bg-paper-dark">
              Active source: <span className="font-semibold uppercase">{connectionSource}</span>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  disabled={connectionSource === 'env'}
                  onClick={() => { switchToDefaultSupabase() }}
                >
                  Use Default Project
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="border border-ink p-4 text-xs space-y-2 bg-paper-dark">
              <p className="font-semibold uppercase">Setup Guide</p>
              <p>1. Create a Supabase project and copy Project URL + anon key.</p>
              <p>2. Paste values below and click <span className="font-semibold">TEST CONNECTION</span>.</p>
              <p>3. Open Supabase SQL Editor and run the schema script.</p>
              <p>4. Click <span className="font-semibold">INITIALIZE SYSTEM</span>, then go to Sign up / Sign in.</p>
              <p className="text-stamp-red font-semibold">
                Note: For quick testing, disable email confirmation in Supabase Auth settings.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="SUPABASE PROJECT URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                required
                className="font-mono"
              />
              <Input
                label="ANON KEY"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                required
                className="font-mono"
              />
            </div>

            <div className="border border-ink p-4 bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold underline text-sm">SQL SCHEMA</h3>
                <button
                  type="button"
                  onClick={copySQL}
                  className="text-xs bg-black text-white px-2 py-1 hover:bg-gray-800"
                >
                  COPY SQL
                </button>
              </div>
              <p className="text-xs">
                Paste this into Supabase SQL Editor and run it once.
              </p>
              <pre className="text-[10px] bg-white p-2 border border-gray-300 overflow-x-auto h-40">
                {REQUIRED_SQL}
              </pre>
            </div>

            {feedback && (
              <div className={`p-4 border text-sm font-bold ${
                status === 'ERROR' ? 'border-red-600 bg-red-50 text-red-600' :
                status === 'SUCCESS' ? 'border-green-600 bg-green-50 text-green-600' :
                status === 'MISSING_SCHEMA' ? 'border-orange-600 bg-orange-50 text-orange-800' :
                'border-gray-300 bg-gray-50'
              }`}>
                [{status}] {feedback}
              </div>
            )}

            {status === 'MISSING_SCHEMA' && (
              <div className="border-2 border-dashed border-black p-4 bg-gray-50 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold underline">INITIALIZATION REQUIRED</h3>
                  <button
                    type="button"
                    onClick={copySQL}
                    className="text-xs bg-black text-white px-2 py-1 hover:bg-gray-800"
                  >
                    COPY SQL
                  </button>
                </div>
                <p className="text-xs">
                  Your database is connected but empty. Go to Supabase SQL Editor and run this script:
                </p>
                <pre className="text-[10px] bg-white p-2 border border-gray-300 overflow-x-auto h-32">
                  {REQUIRED_SQL}
                </pre>
                <p className="text-xs font-bold text-center animate-pulse">
                  AFTER RUNNING SQL, CLICK TEST CONNECTION AGAIN.
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={testConnection}
                disabled={status === 'TESTING'}
                className="flex-1"
              >
                {status === 'TESTING' ? 'VERIFYING...' : 'TEST CONNECTION'}
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={status === 'TESTING' || status === 'ERROR' || status === 'MISSING_SCHEMA'}
                className="flex-1 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                INITIALIZE SYSTEM
              </Button>
            </div>

            {hasConnection && connectionSource === 'custom' && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-red-600 underline hover:no-underline"
                >
                  [TERMINATE CONNECTION]
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      <footer className="border-t border-ink px-6 py-4 text-xs text-ink-light">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span>Ledger BYOD Setup</span>
          <a
            href="https://github.com/MEKOD/franzkafka"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
