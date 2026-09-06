'use client';

// Full-screen branded moment shown right after a successful sign-in, before
// the dashboard appears. Used two ways:
//  - LoginPage renders this directly after email/password succeeds, then
//    navigates once the timeout fires.
//  - WelcomeGate renders this on the dashboard side for the Google OAuth
//    path, since that flow leaves the login page entirely for a real
//    redirect to Google and back — there's no login page left to animate.
export default function WelcomeIntro() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base animate-welcome-out">
      <style>{`
        @keyframes welcome-logo { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
        @keyframes welcome-line { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes welcome-underline { from { width: 0; } to { width: 100%; } }
        @keyframes welcome-out { 0%, 78% { opacity: 1; } 100% { opacity: 0; } }
        .welcome-logo { animation: welcome-logo .5s cubic-bezier(0.16,1,0.3,1) both; }
        .welcome-line1 { animation: welcome-line .5s ease .3s both; }
        .welcome-line2 { animation: welcome-line .5s ease .5s both; }
        .welcome-underline { animation: welcome-underline .6s cubic-bezier(0.16,1,0.3,1) .75s both; }
        .animate-welcome-out { animation: welcome-out 1.7s ease forwards; }
      `}</style>
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="SCM Cloudbook" className="welcome-logo h-14 w-auto mb-6" />
        <div className="welcome-line1 text-2xl font-semibold text-ink font-display">SCM Cloudbook</div>
        <div className="welcome-line2 text-xs tracking-[0.25em] uppercase text-accent mt-2">
          Learning Intelligence Assistant
        </div>
        <div className="mt-3 h-0.5 bg-accent welcome-underline" style={{ maxWidth: 180 }} />
      </div>
    </div>
  );
}
