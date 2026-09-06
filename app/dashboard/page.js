import { redirect } from 'next/navigation';

// Preserves ?welcome=1 through the redirect so the Google OAuth callback
// (which lands here) still reaches WelcomeGate on /dashboard/dukan.
export default function DashboardIndex({ searchParams }) {
  const suffix = searchParams?.welcome === '1' ? '?welcome=1' : '';
  redirect(`/dashboard/dukan${suffix}`);
}
