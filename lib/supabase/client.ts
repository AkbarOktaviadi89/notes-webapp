import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
          if (init?.headers) {
            const h = init.headers as Record<string, string>
            const sanitized: Record<string, string> = {}
            for (const [name, value] of Object.entries(h)) {
              // Strip any non-Latin1 characters that would break the Fetch API
              sanitized[name] = (value ?? '').replace(/[^\x00-\xFF]/g, '')
            }
            init = { ...init, headers: sanitized }
          }
          return fetch(input, init)
        },
      },
    }
  )
}
