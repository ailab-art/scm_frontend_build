'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Layers, GitBranch, Zap, LogOut, ClipboardCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TABS = [
  { href: '/dashboard/dukan', label: 'Knowledge Granths', icon: Layers },
  { href: '/dashboard/mela', label: 'Process Flow Mela', icon: GitBranch },
  { href: '/dashboard/chetak', label: 'AI Chetak', icon: Zap },
  { href: '/dashboard/review', label: 'Review Queue', icon: ClipboardCheck },
];

export default function TopNav({ userEmail }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = (userEmail || '??').slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-border flex-wrap gap-3">
      <div className="flex items-center gap-8 flex-wrap">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SCM Cloudbook" className="h-6 w-auto" />
          <span className="text-sm font-semibold font-display text-ink">LIA</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${active ? 'bg-surface text-ink' : 'text-muted hover:text-ink'}`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-accent' : 'text-faint'}`} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs px-2.5 py-1 rounded-full border border-border text-faint">{userEmail}</span>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-accent/10 text-accent"
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md overflow-hidden bg-surface border border-border z-10">
              <button onClick={signOut} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-muted hover:text-ink">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}