'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, X, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface SearchResult {
  id: string
  title: string
  content: string
  updated_at: string
  notebook_id: string
  notebooks: { title: string; icon: string }[] | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '')

function getExcerpt(text: string, query: string): string {
  const plain = stripHtml(text)
  if (!query.trim()) return plain.slice(0, 120)
  const idx = plain.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return plain.slice(0, 120)
  const start = Math.max(0, idx - 40)
  const end = Math.min(plain.length, idx + query.length + 80)
  return (start > 0 ? '…' : '') + plain.slice(start, end) + (end < plain.length ? '…' : '')
}

export default function GlobalSearch({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) { setResults([]); return }
      setLoading(true)
      const { data } = await supabase
        .from('notes')
        .select('id, title, content, updated_at, notebook_id, notebooks(title, icon)')
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .order('updated_at', { ascending: false })
        .limit(20)
      setResults((data as unknown as SearchResult[]) || [])
      setLoading(false)
    },
    [supabase]
  )

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, doSearch])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-ink-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl mx-4 bg-paper-50 rounded-xl shadow-2xl border border-paper-300 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-paper-200">
          <Search size={18} className="text-ink-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari di semua catatan..."
            className="flex-1 bg-transparent outline-none text-ink-900 placeholder-ink-300 text-sm"
          />
          {loading ? (
            <Loader2 size={16} className="animate-spin text-ink-400 flex-shrink-0" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="text-ink-400 hover:text-ink-700 flex-shrink-0">
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-auto">
          {results.length === 0 && query && !loading ? (
            <div className="py-10 text-center text-ink-400 text-sm">
              <FileText size={28} className="mx-auto mb-2 opacity-30" />
              Tidak ditemukan untuk &ldquo;{query}&rdquo;
            </div>
          ) : results.length === 0 && !query ? (
            <div className="py-8 text-center text-ink-400 text-xs opacity-60">
              Ketik untuk mencari catatan
            </div>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/notebook/${r.notebook_id}/note/${r.id}`}
                    onClick={onClose}
                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-paper-100 transition-colors border-b border-paper-100 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm leading-none">{r.notebooks?.[0]?.icon}</span>
                      <span className="text-xs text-ink-400 truncate">{r.notebooks?.[0]?.title}</span>
                      <span className="ml-auto text-xs text-ink-300 flex-shrink-0">
                        {format(new Date(r.updated_at), 'd MMM', { locale: id })}
                      </span>
                    </div>
                    <div className="font-medium text-sm text-ink-800 truncate">
                      {r.title || 'Tanpa Judul'}
                    </div>
                    {r.content && (
                      <p className="text-xs text-ink-400 line-clamp-2 mt-0.5">
                        {getExcerpt(r.content, query)}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 border-t border-paper-200 flex items-center gap-4 text-xs text-ink-300">
          <span>
            <kbd className="font-mono bg-paper-200 px-1 rounded text-ink-500">Esc</kbd>{' '}
            tutup
          </span>
          <span>
            <kbd className="font-mono bg-paper-200 px-1 rounded text-ink-500">↵</kbd>{' '}
            buka catatan
          </span>
        </div>
      </div>
    </div>
  )
}
