# Ledger (FranzKafka.xyz)

Minimal blog platform with a "bring your own Supabase" model.

## How it works

- App does not require a central database.
- Each user connects their own Supabase project from `/baglan`.
- Auth, profiles, and posts are stored in that user's Supabase project.

## Setup

1. Install deps:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000/baglan`

4. Enter:
- Supabase Project URL
- Supabase anon key

5. In your Supabase dashboard, run `schema.sql` in SQL Editor.

6. Return to app and use Test/Save on `/baglan`, then sign up/sign in.

## Notes

- `anon key` is public by design; RLS policies in `schema.sql` enforce access rules.
- If you still want a fixed single-project setup, you can set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  The app will use env config as fallback when no local connection is saved.

