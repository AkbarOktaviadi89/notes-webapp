'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen, CheckSquare, LayoutDashboard, Plus, LogOut,
  ChevronRight, X, Menu, Search
} from 'lucide-react'
import { Notebook } from '@/types'
import CreateNotebookModal from './notes/CreateNotebookModal'
import GlobalSearch from './GlobalSearch'
import { User } from '@supabase/supabase-js'
import clsx from 'clsx'

interface SidebarProps {
  user: User
  notebooks: Notebook[]
}

export default function Sidebar({ user, notebooks: initialNotebooks }: SidebarProps) {
  const [notebooks, setNotebooks] = useState(initialNotebooks)
  const [showCreate, setShowCreate] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const handleNotebookCreated = (notebook: Notebook) => {
    setNotebooks(prev => [...prev, notebook])
    setShowCreate(false)
    router.push(`/dashboard/notebook/${notebook.id}`)
  }

  const navItems = [
    { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
    { href: '/dashboard/tasks', label: 'Tugas', icon: CheckSquare },
  ]

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-paper-300">
        <div className="w-8 h-8 bg-ink-900 rounded flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-paper-100" />
        </div>
        <span className="font-display text-xl text-ink-900">SevNotes</span>
        <button
          className="ml-auto lg:hidden text-ink-400 hover:text-ink-700"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Search button */}
      <div className="px-3 pt-3">
        <button
          onClick={() => { setSearchOpen(true); setMobileOpen(false) }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-paper-100 border border-paper-300 text-ink-400 text-sm hover:border-ink-300 hover:text-ink-600 transition-colors"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Cari catatan...</span>
          <kbd className="hidden sm:inline text-xs font-mono bg-paper-200 px-1.5 py-0.5 rounded border border-paper-300 text-ink-300">⌃K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'sidebar-item',
              pathname === item.href && 'active'
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 mb-2">
        <div className="border-t border-paper-300" />
      </div>

      {/* Notebooks */}
      <div className="px-3 flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-ink-400 uppercase tracking-widest px-2">Notebook</span>
        <button
          onClick={() => setShowCreate(true)}
          className="p-1 rounded text-ink-400 hover:text-ink-700 hover:bg-paper-200 transition-colors"
          title="Buat notebook baru"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {notebooks.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-ink-400 mb-2">Belum ada notebook</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs text-ink-600 hover:underline"
            >
              + Buat pertama kali
            </button>
          </div>
        ) : (
          notebooks.map((nb) => {
            const isActive = pathname.startsWith(`/dashboard/notebook/${nb.id}`)
            return (
              <Link
                key={nb.id}
                href={`/dashboard/notebook/${nb.id}`}
                onClick={() => setMobileOpen(false)}
                className={clsx('sidebar-item group', isActive && 'active')}
              >
                <span className="text-base">{nb.icon}</span>
                <span className="flex-1 truncate">{nb.title}</span>
                <ChevronRight
                  size={14}
                  className={clsx(
                    'flex-shrink-0 transition-transform',
                    isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'
                  )}
                />
              </Link>
            )
          })
        )}
      </div>

      {/* User */}
      <div className="border-t border-paper-300 px-3 py-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 bg-ink-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-ink-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-800 truncate">{userName}</div>
            <div className="text-xs text-ink-400 truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Keluar"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-paper-50 border border-paper-300 rounded-md shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} className="text-ink-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink-900/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-paper-300 bg-paper-50 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside
        className={clsx(
          'lg:hidden fixed left-0 top-0 bottom-0 w-64 flex flex-col border-r border-paper-300 bg-paper-50 z-50 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Create Notebook Modal */}
      {showCreate && (
        <CreateNotebookModal
          onClose={() => setShowCreate(false)}
          onCreated={handleNotebookCreated}
        />
      )}

      {/* Global Search */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
