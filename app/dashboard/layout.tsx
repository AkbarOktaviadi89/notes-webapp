import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get notebooks
  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="flex h-screen overflow-hidden bg-paper-100">
      <Sidebar user={user} notebooks={notebooks || []} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
