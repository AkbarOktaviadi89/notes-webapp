'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/types'
import {
  CheckSquare, Square, Plus, Trash2, Calendar, Flag,
  Loader2, Filter, ChevronDown, Check, Circle
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import clsx from 'clsx'

type Filter = 'all' | 'active' | 'completed'
type Priority = 'low' | 'medium' | 'high'

interface Props {
  initialTasks: Task[]
  notebooks: { id: string; title: string; icon: string }[]
}

const PRIORITY_CONFIG = {
  low: { label: 'Rendah', color: 'text-sage-500', bg: 'bg-sage-400/20', dot: 'bg-sage-400' },
  medium: { label: 'Sedang', color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'bg-yellow-400' },
  high: { label: 'Tinggi', color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400' },
}

export default function TasksView({ initialTasks, notebooks }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<Filter>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [newNotebook, setNewNotebook] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.is_completed
    if (filter === 'completed') return t.is_completed
    return true
  })

  const activeTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('tasks')
      .insert({
        user_id: user!.id,
        title: newTitle.trim(),
        priority: newPriority,
        due_date: newDueDate || null,
        notebook_id: newNotebook || null,
      })
      .select()
      .single()

    if (data) {
      setTasks(prev => [data, ...prev])
      setNewTitle('')
      setNewDueDate('')
      setNewNotebook('')
      setNewPriority('medium')
      setShowForm(false)
    }
    setAdding(false)
  }

  const toggleComplete = async (task: Task) => {
    const newVal = !task.is_completed
    const { data } = await supabase
      .from('tasks')
      .update({
        is_completed: newVal,
        completed_at: newVal ? new Date().toISOString() : null,
      })
      .eq('id', task.id)
      .select()
      .single()

    if (data) {
      setTasks(prev => prev.map(t => t.id === task.id ? data : t))
    }
  }

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const TaskItem = ({ task }: { task: Task }) => {
    const pc = PRIORITY_CONFIG[task.priority]
    const isOverdue = task.due_date && !task.is_completed && new Date(task.due_date) < new Date()

    return (
      <div
        className={clsx(
          'flex items-start gap-3 p-4 rounded-lg border transition-all group',
          task.is_completed
            ? 'border-paper-200 bg-paper-50/50 opacity-60'
            : 'border-paper-300 bg-paper-50 hover:border-ink-200'
        )}
      >
        <button
          onClick={() => toggleComplete(task)}
          className="mt-0.5 flex-shrink-0 transition-colors"
        >
          {task.is_completed ? (
            <div className="w-5 h-5 rounded bg-sage-500 flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded border-2 border-ink-300 group-hover:border-ink-500 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={clsx(
            'text-sm font-medium',
            task.is_completed ? 'line-through text-ink-400' : 'text-ink-800'
          )}>
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', pc.bg, pc.color)}>
              {pc.label}
            </span>

            {task.due_date && (
              <span className={clsx(
                'text-xs flex items-center gap-1',
                isOverdue ? 'text-red-500' : 'text-ink-400'
              )}>
                <Calendar size={10} />
                {format(new Date(task.due_date), 'd MMM', { locale: idLocale })}
                {isOverdue && ' (Terlambat)'}
              </span>
            )}

            {task.is_completed && task.completed_at && (
              <span className="text-xs text-ink-400">
                Selesai {format(new Date(task.completed_at), 'd MMM', { locale: idLocale })}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => deleteTask(task.id)}
          className="p-1 opacity-0 group-hover:opacity-100 text-ink-400 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="border-b border-paper-300 bg-paper-50 px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl text-ink-900">Tugas</h1>
            <p className="text-ink-400 text-sm mt-0.5">
              {activeTasks.length} aktif · {completedTasks.length} selesai
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={14} />
            Tugas Baru
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-paper-100 rounded-lg p-4 border border-paper-300 space-y-3 animate-slide-up">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nama tugas..."
              required
              className="input-field"
              autoFocus
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-ink-500 mb-1">Prioritas</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="input-field text-sm"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1">Tenggat</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              {notebooks.length > 0 && (
                <div>
                  <label className="block text-xs text-ink-500 mb-1">Notebook</label>
                  <select
                    value={newNotebook}
                    onChange={(e) => setNewNotebook(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Tanpa notebook</option>
                    {notebooks.map(nb => (
                      <option key={nb.id} value={nb.id}>{nb.icon} {nb.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1 text-sm">
                Batal
              </button>
              <button type="submit" disabled={adding || !newTitle.trim()} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                {adding && <Loader2 size={12} className="animate-spin" />}
                Tambah
              </button>
            </div>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 mt-4">
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                filter === f
                  ? 'bg-ink-900 text-paper-100'
                  : 'text-ink-500 hover:bg-paper-200'
              )}
            >
              {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare size={40} className="text-ink-200 mx-auto mb-3" />
            <p className="text-ink-400">
              {filter === 'completed' ? 'Belum ada tugas selesai' :
               filter === 'active' ? 'Semua tugas sudah selesai! 🎉' :
               'Belum ada tugas. Tambah tugas baru!'}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-2">
            {/* Active tasks */}
            {filter !== 'completed' && filtered.filter(t => !t.is_completed).length > 0 && (
              <div className="space-y-2">
                {filtered.filter(t => !t.is_completed).map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}

            {/* Completed tasks */}
            {filter !== 'active' && filtered.filter(t => t.is_completed).length > 0 && (
              <div className="mt-6">
                {filter === 'all' && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 border-t border-paper-300" />
                    <span className="text-xs text-ink-400 font-medium">
                      {filtered.filter(t => t.is_completed).length} selesai
                    </span>
                    <div className="flex-1 border-t border-paper-300" />
                  </div>
                )}
                <div className="space-y-2">
                  {filtered.filter(t => t.is_completed).map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
