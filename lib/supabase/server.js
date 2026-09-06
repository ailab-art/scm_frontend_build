import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server Components can't set cookies directly (Next.js restriction) — the
// try/catch is intentional so this client also works when imported from a
// Server Component that only reads the session; middleware.js is what
// actually refreshes the session cookie on every request.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // called from a Server Component — safe to ignore
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}
