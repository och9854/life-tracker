# ADR 0006: Use OAuth-authenticated MCP for chatbot capture

- **Status:** Accepted
- **Date:** 2026-11-08

## Context

The journal becomes more useful when a person can ask a chatbot to save an
idea or follow-up while they are already discussing it. A copied user JWT will
expire, and a shared API key or Supabase service-role key would allow a chatbot
to bypass the data-ownership boundary.

## Decision

Expose a narrow Life Journal MCP server through a Supabase Edge Function.
Use Supabase Auth OAuth 2.1 with PKCE for user authorization. Each tool call
uses the user-scoped Supabase client and existing RLS policies.

The first tools create a journal entry, create an action, and list open
actions. Every write includes an idempotency key. The MCP surface does not
include deletion, arbitrary SQL, raw table access, or automatic AI-created
plans.

A future REST API will share the same command layer for developer
integrations. It will use the same OAuth user tokens instead of permanent
personal access tokens.

## Consequences

The implementation includes the consent screen and MCP function. The personal
Supabase project still needs asymmetric JWT signing, OAuth enablement, client
revocation, and end-to-end authorization tests before a chatbot can connect.
This is more work than copying a token into an MCP configuration, but the user
can see and revoke access and every request remains constrained by their
existing RLS ownership.
