'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        })
        if (error) throw error
        setMessage('Cek emailmu untuk konfirmasi akun!')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-100 flex noise-overlay">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-paper-100"
              style={{ top: `${i * 5 + 5}%` }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-paper-200 rounded flex items-center justify-center">
              <BookOpen size={20} className="text-ink-900" />
            </div>
            <span className="font-display text-2xl text-paper-100 tracking-wide">SevNotes</span>
          </div>

          <div className="mb-auto">
            <h2 className="font-display text-5xl text-paper-100 leading-tight mb-6">
              Setiap catatan<br />
              <span className="text-ink-300 italic">bercerita.</span>
            </h2>
            <p className="text-ink-300 font-body text-lg leading-relaxed max-w-sm">
              Simpan pikiranmu, kelola tugasmu, dan simpan file penting — semua dalam satu tempat yang rapi.
            </p>
          </div>
        </div>

      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-ink-900 rounded flex items-center justify-center">
              <BookOpen size={16} className="text-paper-100" />
            </div>
            <span className="font-display text-xl text-ink-900">SevNotes</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl text-ink-900 mb-2">
              {mode === 'login' ? 'Selamat datang!' : 'Buat akun baru'}
            </h1>
            <p className="text-ink-400 font-body">
              {mode === 'login'
                ? 'Masuk untuk melanjutkan catatanmu'
                : 'Mulai perjalanan catatanmu hari ini'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-slide-up">
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Nama lengkap</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    required
                    className="input-field pl-9"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  required
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-md text-sm animate-slide-up">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-sage-400/20 border border-sage-400/40 text-sage-600 px-3 py-2.5 rounded-md text-sm animate-slide-up">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-ink-400 text-sm">
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }}
              className="text-ink-700 font-medium text-sm hover:underline"
            >
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
