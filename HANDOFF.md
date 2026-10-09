# Handoff — 2026-10-08

## Location and ownership

New standalone directory: `/Users/ohchanghyun/study_2026/product_buildilng/life-journal`.
The existing money app in `life_tracker` was inspected and not edited. No remote
repository, commit, paid resource or deployment was created. Use only personally
owned projects under `jakehyun1119@gmail.com`; no company resources are authorized.

## Implemented locally

- React/TypeScript app with Korean and English UI, browser-language default and
  persistent manual selection. Original diary text is not translated.
- Today/all-entries navigation, multiple entries per date, editing, autosave,
  user-scoped draft recovery, Markdown export and mobile/dark-mode styles.
- Supabase Google PKCE auth integration and server repository ready for config.
- SQL migration for owner-only RLS and optimistic versioned saving, not applied.
- PWA manifest and SVG icon. No offline app-shell cache or push implementation.
- Clearly labelled preview using this device's storage only. Preview is hidden
  when a Supabase project is configured; sample entries never migrate to cloud.

## Evidence

- `pnpm test`: 5 passed, covering multiple entries/mixed-language export,
  failure/reload recovery and user separation, typing during a save,
  stale-version conflicts, and local-storage quota failure.
- `pnpm build`: passed. Upstream Zod PURE-comment annotations produce two
  non-blocking Rollup warnings. Vendor code was not modified.
- Real in-app browser: Korean/English switch, sample title/body editing,
  reload recovery, Korean-language preference persistence, Markdown download.
- Downloaded Markdown was read and contained the original Korean/English text.
- Responsive narrow in-app-browser layout observed without horizontal overflow.
  Real iPhone installation and standalone behavior are not yet verified.
- Local URL: http://127.0.0.1:4183 (loopback, accessible on this Mac only).

## Required before cloud use

Connected Supabase organizations did not establish personal ownership. No
organization was selected for writes. User must sign into/connect a personal
Supabase account and identify its organization. Follow README setup steps.

After ownership is verified: create/select the personal project, configure
Google OAuth in a personal Google Cloud project, apply migration, configure
environment, validate two-account RLS and cross-device saves on the real service.
Then select a personal hosting account and deploy over HTTPS. This local app is
not yet a public service, and real login/cloud persistence are unverified.

## Next product scope

Keep the first release journal-only. AI summaries, extracted actions, reminders,
calendar integration and MCP are later stages. User approved public signup and
Google-only login, with flexible entry frequency and Korean/English UI.
