import { createClient } from '@/lib/supabase/server'
import { BookOpen, CheckSquare, FileText, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: notebooks, count: notebookCount },
    { data: recentNotes },
    { data: tasks },
  ] = await Promise.all([
    supabase.from('notebooks').select('*', { count: 'exact' }).limit(4),
    supabase.from('notes').select('*, notebooks(title, icon, color)').order('updated_at', { ascending: false }).limit(5),
    supabase.from('tasks').select('*').eq('is_completed', false).order('created_at', { ascending: false }).limit(5),
  ])

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Kamu'
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="text-ink-400 font-body mb-1">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
        </p>
        <h1 className="font-display text-4xl text-ink-900">
          {greeting()}, <span className="italic">{userName}.</span>
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Notebook', value: notebookCount || 0, icon: BookOpen, color: 'text-ink-700' },
          { label: 'Catatan', value: recentNotes?.length || 0, icon: FileText, color: 'text-ink-600' },
          { label: 'Tugas Aktif', value: tasks?.length || 0, icon: CheckSquare, color: 'text-sage-500' },
          { label: 'Hari ini', value: new Date().getDate(), icon: Clock, color: 'text-ink-500' },
        ].map((stat, i) => (
          <div key={i} className="paper-card-plain p-4 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`${stat.color} mb-2`}>
              <stat.icon size={20} />
            </div>
            <div className="font-display text-3xl text-ink-900 mb-0.5">{stat.value}</div>
            <div className="text-ink-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-ink-800">Catatan Terbaru</h2>
            <Link href="/dashboard/notes" className="text-sm text-ink-400 hover:text-ink-700 transition-colors">
              Lihat semua →
            </Link>
          </div>
          <div className="space-y-2">
            {recentNotes && recentNotes.length > 0 ? recentNotes.map((note: any) => (
              <Link
                key={note.id}
                href={`/dashboard/notebook/${note.notebook_id}/note/${note.id}`}
                className="paper-card-plain p-4 flex items-start gap-3 hover:border-ink-200 transition-colors block group"
              >
                <span className="text-lg flex-shrink-0">{note.notebooks?.icon || '📝'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-800 text-sm truncate group-hover:text-ink-900">
                    {note.title}
                  </div>
                  <div className="text-xs text-ink-400 mt-0.5">
                    {note.notebooks?.title} · {format(new Date(note.updated_at), 'd MMM', { locale: id })}
                  </div>
                </div>
              </Link>
            )) : (
              <div className="paper-card-plain p-6 text-center text-ink-400 text-sm">
                Belum ada catatan. Buat notebook dulu!
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-ink-800">Tugas Aktif</h2>
            <Link href="/dashboard/tasks" className="text-sm text-ink-400 hover:text-ink-700 transition-colors">
              Lihat semua →
            </Link>
          </div>
          <div className="space-y-2">
            {tasks && tasks.length > 0 ? tasks.map((task: any) => (
              <div key={task.id} className="paper-card-plain p-4 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === 'high' ? 'bg-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-400' : 'bg-sage-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-800 truncate">{task.title}</div>
                  {task.due_date && (
                    <div className="text-xs text-ink-400 mt-0.5">
                      Tenggat: {format(new Date(task.due_date), 'd MMM yyyy', { locale: id })}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="paper-card-plain p-6 text-center text-ink-400 text-sm">
                Tidak ada tugas aktif 🎉
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notebooks grid */}
      {notebooks && notebooks.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-ink-800">Notebook</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {notebooks.map((nb: any, i: number) => (
              <Link
                key={nb.id}
                href={`/dashboard/notebook/${nb.id}`}
                className="paper-card-plain p-4 hover:border-ink-200 transition-all hover:shadow-md group animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="text-2xl mb-2">{nb.icon}</div>
                <div className="font-medium text-ink-800 text-sm group-hover:text-ink-900 line-clamp-2">
                  {nb.title}
                </div>
                {nb.description && (
                  <div className="text-xs text-ink-400 mt-1 line-clamp-2">{nb.description}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
