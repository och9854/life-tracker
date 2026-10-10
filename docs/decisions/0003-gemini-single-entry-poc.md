# ADR 0003: Use Gemini through an Edge Function for the first AI POC

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

The product needs an inexpensive way to test whether users value suggestions
that turn diary text into small next steps. Browser-held API keys and whole
diary uploads would create unnecessary risk.

## Decision

Use Gemini from a Supabase Edge Function. The function receives a saved entry
ID, authenticates the caller, retrieves that one entry through RLS, and returns
at most three structured candidates. It caches results per entry revision and
limits each user to five fresh analyses per UTC day.

## Consequences

The Gemini key is a provider secret. Prompt text is not written to operational
logs by the application. The first POC does not use pgvector or a separate
vector database because it does not search across entries. Weekly reflection and
cross-entry analysis will be evaluated before semantic retrieval is introduced.
