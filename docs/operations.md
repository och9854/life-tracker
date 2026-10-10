# Operations

## Production resources

- **Supabase project:** `norzflwojwutofzkwzxu` in the personal organization.
- **Static site:** `https://life-journal-jh.jakehyun1119.chatgpt.site`
- **GitHub repository:** `och9854/life-tracker`

Do not place access tokens, database passwords, OAuth client secrets, service
role keys, or Gemini keys in this repository or client-side environment files.

## Database changes

1. Create a timestamped file in `supabase/migrations/`.
2. Review the SQL against the personal project only.
3. Apply it to the personal project and confirm the result in the dashboard.
4. Record the release and any operational impact in the applicable decision
   record or a new one.

The first production dashboard-applied migration is
`20261010063734_ai_action_suggestions.sql`. It adds the `source_entry_id`
relationship for habits and the private AI candidate cache. It was applied in
the personal Supabase SQL Editor because the available scoped CLI token could
deploy functions but could not link the project for `db push`. Record later
schema changes in both the timestamped file and the provider migration history.

## Edge Function deployment

The deployed function is `ai-action-candidates`.

Required project secret:

- `GEMINI_API_KEY`

Optional secrets:

- `GEMINI_MODEL` — defaults to `gemini-2.5-flash-lite`.
- `APP_ORIGIN` — the exact public web origin allowed by CORS.

Before publishing a new function version, run:

```sh
deno check supabase/functions/ai-action-candidates/index.ts
supabase --workdir . functions deploy ai-action-candidates --project-ref <personal-project-ref> --use-api
```

Use a scoped, personal Supabase CLI token held outside the repository. After
deployment, verify the function appears in the personal project dashboard and
make an authenticated request through the PWA.

## Static site release

```sh
pnpm build
```

Publish the resulting `dist/` directory through the configured Sites project.
After publishing, open the public URL and verify the current version can load,
sign in, save an entry, and reach the AI suggestion UI. Do not use a company
hosting, Supabase, or Google account for this release.

## Key rotation

If a Gemini key may have been exposed:

1. Create a replacement key in the personal Google AI Studio project.
2. Replace `GEMINI_API_KEY` in the personal Supabase project.
3. Redeploy the Edge Function if required by the platform.
4. Delete the old key and check recent function logs for unexpected use.

A free-tier project with no billing account does not eliminate quota abuse, so
the daily limit and secret rotation process remain necessary.
