# ADR 0001: Keep Life Journal on personal infrastructure

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

The product contains private diary text and personal habits. Development
environments may also have company cloud accounts available.

## Decision

Production uses the personal Supabase organization and personal Google AI Studio
project. The public static site and GitHub repository are likewise personal
resources. Company projects, credentials, and data are excluded.

## Consequences

The setup must verify the project reference and signed-in account before any
remote change. Personal credentials are kept in local secure storage or
provider-managed secrets, never in the repository.
