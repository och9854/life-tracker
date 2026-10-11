# ADR 0005: Use verified email and password as the default account flow

- **Status:** Accepted
- **Date:** 2026-10-11

## Context

Some prospective users do not want to use a Google account. They expect a
familiar email-and-password account, including support for Naver and other
email providers.

## Decision

Life Journal uses email address and password as the default sign-up and login
method. A new account must verify a six-digit email OTP before it can be used.
Google OAuth remains an optional alternative. Password recovery also uses an
email OTP followed by a new-password form.

The email address is the Supabase Auth identity and the source of the JWT
`sub` used by RLS through `auth.uid()`. Display names, if added later, remain
separate from authorization.

## Consequences

Public sign-up requires custom SMTP owned by the personal project. Supabase's
built-in sender is retained only for team-address testing. Authentication email
templates must contain `{{ .Token }}` so the product consistently presents a
code-entry flow rather than a magic-link-only flow.
