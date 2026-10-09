# Life Journal product roadmap

## Product promise

Life Journal turns private writing into a dependable personal record. The first
release helps people write, revisit, and export their own words. It does not
attempt to infer commitments or manage every part of their lives before they
have a dependable writing habit.

## Release 1: personal journal

- Google sign-in and one owner-only journal for each account.
- Flexible entries: any number on a date, Korean and English interface, and
  original text retained as written.
- Timeline, focused editor, device-local draft recovery, cross-device conflict
  protection, and Markdown export.
- Public account creation is allowed through Google, while every entry remains
  private through database row-level security.

## Release 2: follow-through

Extract a suggested action from an entry only when the writer asks. Each action
has a title, optional due date, cadence, state, source entry, and a deliberate
reminder preference. A weekly review surfaces open actions and habits such as
"run in the morning" or "use a face mask once a week". Calendar creation stays
an explicit confirmation step.

## Release 3: reflection

Offer optional private search and weekly themes. Add embeddings only when there
is a real retrieval experience, such as "show moments related to career change"
across a large history. Until then, Postgres full-text search and simple filters
are cheaper, clearer, and easier to audit.

## Technical decisions

- Host the static React PWA over HTTPS; build-time public variables supply the
  Supabase URL and publishable key.
- Use a personal Supabase project for Postgres, Auth, row-level security and
  the journal migration already in this repository.
- Do not add a vector database in release 1 or release 2. If semantic retrieval
  later proves useful, enable `pgvector` in the same Supabase project and store
  embeddings in a separate owner-scoped table. It is sufficient at this stage;
  a separate vector service adds no user value yet.
- Notifications and calendar integrations require separate consent and are not
  enabled by the journal launch.

## Production checklist

1. Create a personally owned Supabase project.
2. Apply the journal migration and configure Google as the Auth provider.
3. Set the production origin in Supabase and Google OAuth.
4. Add the Supabase URL and publishable key to the host build environment.
5. Deploy, then verify sign-in, owner isolation with two accounts, save/reload,
   sign-out, and PWA installation on a phone.
