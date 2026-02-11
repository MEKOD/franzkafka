# Ledger

"I am a cage, in search of a bird." - Franz Kafka

Ledger is an open-source writing platform.

## Core idea

Ledger supports two modes:

- `Default mode` (recommended for hosted app): uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` from deployment env.
- `Custom mode` (BYOD): user connects their own Supabase project from `/baglan`.

So users can start immediately, or switch to their own database when they want full data ownership.

## How it works

1. Open `/baglan`
2. (Optional) Keep default project, or enter custom Supabase URL + anon key
3. Run SQL schema (`schema.sql`) in Supabase SQL Editor
4. Test connection and continue to auth

## Important note for testing

For faster testing, disable email confirmation in Supabase Auth settings.

Path in Supabase dashboard:
- `Authentication -> Providers -> Email -> Confirm email`

## Local development

```bash
git clone https://github.com/MEKOD/franzkafka.git
cd franzkafka
npm install
```

Create `.env.local` (default project for local app):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Run:

```bash
npm run dev
```

## Database

Run `schema.sql` in Supabase SQL Editor for any project you want Ledger to use.

## Deploy

- Deploy on Vercel.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env for default mode.
- Redeploy after env changes.

## Security

- Access control relies on Supabase RLS policies in `schema.sql`.
- In custom mode, connection values are stored in browser local storage.

## Links

- App: `https://franzkafka.xyz`
- Repo: `https://github.com/MEKOD/franzkafka`

## Community files

- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/*`
- `.github/PULL_REQUEST_TEMPLATE.md`

## License

MIT
