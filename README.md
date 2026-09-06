# SCM-LIA — deployable skeleton

Next.js (App Router) + Supabase (Postgres + Auth) + Tailwind. Deploys to Vercel.
The AI generation backend (Railway) is intentionally not part of this repo yet —
see "What's stubbed" below.

## 1. Create the Supabase project

1. Create a project at https://supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_seed_tree.sql`. This creates the schema and seeds
   the real 35 main objects / 102 sub-objects from Annexure A, each starting
   as `draft`.
3. Under **Authentication → Providers**, enable **Email** (should be on by
   default) and **Google**. For Google you'll need an OAuth client ID/secret
   from the Google Cloud Console — Supabase's Google provider page links
   directly to the setup docs and shows you the exact redirect URI to
   register.
4. Under **Authentication → URL Configuration**, set the Site URL and add
   `http://localhost:3000/auth/callback` (and your Vercel URL's
   `/auth/callback` once deployed) as allowed redirect URLs.
5. Copy your Project URL and anon public key from **Settings → API**.

## 2. Run locally

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`. Sign up a test user via
the Supabase dashboard (**Authentication → Users → Add user**) to test
email/password, or click **Continue with Google** once the provider is
configured.

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same two env vars (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's project settings.
4. Add your Vercel deployment URL + `/auth/callback` to Supabase's allowed
   redirect URLs (step 4 above).
5. Deploy.

## What's real vs. what's stubbed

**Real, working today:**
- Email/password + Google OAuth via Supabase Auth (no mocking)
- Full 35/102 content tree, seeded from the actual contract Annexure A
- `documents` table drives every status badge — flip a row to `accepted` in
  the Supabase table editor and it shows up immediately in Knowledge Dukan
- Selection state lives in the URL (`?level=&main=&sub=&domain=`), so it's
  consistent across all three tabs and survives a refresh
- `AI Chetak`'s generate buttons make a real network call to `/api/generate`,
  which does a real auth check and a real `upsert` into `generated_assets` —
  refresh the page and generated content is still there

**Stubbed, needs the Railway backend:**
- `/api/generate`'s actual content is a placeholder generator function, not a
  real model call. Swap the block marked in `app/api/generate/route.js` for a
  call to the Railway service once it exists — nothing else in the route
  needs to change.
- Process Flow Mela shows one hand-drawn sample swim lane for every process.
  Real per-process flows are a `swim_lane`-type row in `generated_assets`,
  same as everything else AI Chetak produces.
- No file upload yet — `documents.file_url` is a plain text column you'd fill
  in manually (or via the future backend) once real PDFs exist somewhere like
  Supabase Storage or S3.

## Known gaps worth flagging back to the client

- RLS currently lets any authenticated user write to `generated_assets` and
  read everything. Once roles (admin / reviewer / student) exist, tighten
  this — in particular, only admins/reviewers should be able to flip
  `documents.status`, since that's what drives Section 5.5 milestone billing
  eligibility.
- This was written without the ability to run `npm install` in this
  environment (no network access here) — it hasn't been build-tested. Run it
  locally and fix anything that comes up before deploying; the patterns used
  (Next.js 14 App Router, `@supabase/ssr`) are standard, but exact package
  versions may need a bump.
