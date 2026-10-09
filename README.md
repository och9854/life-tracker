# Life Journal

Independent Korean/English diary PWA. This is separate from the existing
`life_tracker` / money app. No company resources are used.

## Local preview

```sh
pnpm install
pnpm dev --port 4183 --strictPort
```

Open http://127.0.0.1:4183. Without configuration, Google sign-in is disabled and
the explicitly labelled preview stores sample writing only in this browser.
Preview records are not uploaded when cloud authentication is later enabled.

## Personal Supabase setup (pending)

Use a personal organization owned by `jakehyun1119@gmail.com`. Verify the
organization and billing ownership, not merely the currently signed-in email.
The connected organization seen during development was not verified as personal
and was not modified. No remote project was created or linked.

1. Create a personal Supabase project and enable Google authentication.
2. In a personally owned Google Cloud project, configure the external OAuth
   consent screen and a web client. Use the callback URL displayed by Supabase.
   Add only identity scopes; calendar access is a separate future capability.
3. In Supabase Auth URL configuration, allow `http://127.0.0.1:4183` for local
   development and the exact HTTPS production origin when deployed. Configure
   public signups and the production Google consent status before public launch.
4. Apply `supabase/migrations/20261008124739_create_journal.sql` to that verified
   personal project. It uses owner-only RLS and optimistic version checks.
5. Copy `.env.example` to `.env.local`, fill the project URL and **publishable**
   key. Never put a service-role key, database password or OAuth secret here.
6. Restart Vite. Sign in with two distinct test accounts and confirm record
   isolation, reload persistence, and cross-device conflict recovery.

## Deploy

`pnpm build` produces `dist/`, suitable for an HTTPS static host. Configure the
same public environment values at build time. All navigation stays on `/`.
The manifest supports home-screen installation; this version does not cache the
app shell offline. Draft recovery is device-local and scoped to the auth user.
Web push, notifications, AI processing and full offline synchronization are not
implemented. Do not describe the preview as a live cloud diary.

## Behavior

- English/Korean UI follows the browser on first visit; manual choice persists.
- Diary text is never translated. Multiple entries per local date are allowed.
- Saves debounce for 650ms. Pending drafts are retained on failure and retried
  on reconnect, focus, or explicit retry. Version conflicts require keeping a
  separate copy instead of silently overwriting another device.
- Export includes the currently loaded entries and pending edits as Markdown.
- First release scope: writing, reading, editing, exporting, Google sign-in.

## Checks

```sh
pnpm test
pnpm build
```

Remote Google sign-in, RLS and deployed PWA installation require the personal
project and HTTPS deployment. Their status is tracked in `HANDOFF.md`.
