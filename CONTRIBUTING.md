# Contributing

Thanks for contributing to Ledger.

## Quick start

1. Fork the repo and create a branch from `main`.
2. Install dependencies:
   - `npm install`
3. Copy env file:
   - `cp .env.example .env.local`
4. Run dev server:
   - `npm run dev`

## Before opening a PR

Run:

- `npm run lint`
- `npm run build`

If your change affects auth/data behavior, include manual test steps in the PR.

## Commit style

Use short, clear commits. Example:

- `feat(auth): show supabase auth error details`
- `fix(config): fallback to env supabase connection`

## Pull request checklist

- [ ] Scope is focused
- [ ] Lint/build pass locally
- [ ] Docs/README updated if behavior changed
- [ ] Screenshots attached for UI changes

