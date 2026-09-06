import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import TopNav from '@/components/TopNav';
import WelcomeGate from '@/components/WelcomeGate';

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-base">
      <Suspense fallback={null}>
        <WelcomeGate />
      </Suspense>
      <TopNav userEmail={user.email} />
      <div className="p-8">{children}</div>
    </div>
  );
}
