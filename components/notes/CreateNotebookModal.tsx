'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2 } from 'lucide-react'
import { Notebook } from '@/types'

const ICONS = ['📓', '📔', '📒', '📕', '📗', '📘', '📙', '🗒️', '💡', '⭐', '🎯', '💼', '🏠', '❤️', '🌱', '✨', '🔥', '🎨', '📚', '🧠']
const COLORS = ['#87a878', '#b89878', '#7898b8', '#b878a0', '#b87878', '#78b8a8', '#a878b8', '#b8a878']

interface Props {
  onClose: () => void
  onCreated: (notebook: Notebook) => void
}

export default function CreateNotebookModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📓')
  const [color, setColor] = useState('#87a878')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('notebooks')
      .insert({ title: title.trim(), description, icon, color, user_id: user!.id })
      .select()
      .single()

    setLoading(false)
    if (data) onCreated(data)
  }

  return (
    <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-paper-50 border border-paper-300 rounded-xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
          <h2 className="font-display text-xl text-ink-900">Notebook Baru</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    icon === i ? 'bg-ink-900 shadow-md' : 'bg-paper-200 hover:bg-paper-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Judul *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nama notebook..."
              required
              className="input-field"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Deskripsi (opsional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tentang notebook ini..."
              className="input-field"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Warna</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-ink-900 ring-offset-2' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-paper-200 rounded-lg p-3 flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <div className="font-medium text-ink-800">{title || 'Judul Notebook'}</div>
              {description && <div className="text-xs text-ink-500">{description}</div>}
            </div>
            <div className="w-3 h-3 rounded-full ml-auto" style={{ backgroundColor: color }} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Batal
            </button>
            <button type="submit" disabled={loading || !title.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Buat Notebook
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
