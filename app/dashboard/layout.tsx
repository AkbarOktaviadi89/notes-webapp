import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const [{ data: { user } }, { data: notebooks }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('notebooks').select('*').order('created_at', { ascending: true }),
  ])

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-paper-100">
      <Sidebar user={user} notebooks={notebooks || []} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
