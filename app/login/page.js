'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GoogleGlyph from '@/components/GoogleGlyph';
import WelcomeIntro from '@/components/WelcomeIntro';

// Without this, Next.js tries to prerender /login into static HTML at build
// time (since the page has no dynamic API call like cookies() to signal
// otherwise). That build-time render still executes createClient() below,
// which throws if Supabase env vars aren't wired into that specific step —
// this is what produced the "URL and API key are required" build error.
// force-dynamic skips the prerender attempt entirely; the page always
// renders per-request instead, which is what an auth page should do anyway.
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Enter both fields to continue');
      return;
    }
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    // Play the branded intro here, then navigate once it's done. Google's
    // flow can't do this on this page (it leaves the page entirely) — that
    // path gets the same animation via WelcomeGate on the dashboard side.
    setShowIntro(true);
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 1700);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const next = encodeURIComponent('/dashboard?welcome=1');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
    // on success the browser leaves this page for Google, then returns via
    // /auth/callback straight into /dashboard?welcome=1
  }

  if (showIntro) return <WelcomeIntro />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-base">
      <div className="w-full max-w-sm p-8 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2.5 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SCM Cloudbook" className="h-9 w-auto" />
          <div>
            <div className="text-base font-semibold font-display text-ink">LIA</div>
            <div className="text-xs text-muted">SCM-Cloudbook learning platform</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs block mb-1.5 text-muted">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md text-sm bg-base border border-border text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@scm-cloudbook.co.in"
            />
          </div>
          <div>
            <label className="text-xs block mb-1.5 text-muted">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md text-sm bg-base border border-border text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-xs text-review">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-medium bg-accent text-white disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-faint">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-md text-sm font-medium bg-white text-[#1F1F1F] border border-border disabled:opacity-60"
        >
          <GoogleGlyph />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="text-xs mt-6 text-center text-faint">
          Needs a Supabase project with email auth and the Google provider enabled — see README.
        </div>
      </div>
    </div>
  );
}
