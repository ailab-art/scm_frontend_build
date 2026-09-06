'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import WelcomeIntro from '@/components/WelcomeIntro';

// Catches ?welcome=1 on any dashboard route — this is how the Google OAuth
// path gets its welcome animation, since /auth/callback does a real server
// redirect straight into the dashboard with no login page left to animate.
// Strips the query param afterward so a refresh doesn't replay it.
export default function WelcomeGate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('welcome') !== '1') return;
    setShow(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('welcome');
    const clean = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    const t = setTimeout(() => router.replace(clean), 1700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;
  return <WelcomeIntro />;
}
