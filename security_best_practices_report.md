# Security review — 2026-10-10

## Executive summary

The Life Journal React PWA and its Supabase Edge Function were reviewed for
client-side injection, secret exposure, authorization boundaries, unsafe
navigation, dependency vulnerabilities, and production response protections.

No critical or high-severity vulnerability was found in the reviewed source.
One medium finding was fixed in source. The remaining operational limitation is
that the currently public static site has not yet received this source version
because its Sites source push is being rejected by the hosting service.

## Fixed findings

### SEC-001 — Browser CSP was absent from the static entry document

- **Severity:** Medium
- **Location:** `index.html:6`
- **Evidence:** The production response did not contain a CSP header, and the
  entry document previously had no CSP meta policy.
- **Impact:** A future client-side injection bug would have had no browser-level
  source restriction to reduce its impact.
- **Fix:** Added a restrictive CSP meta policy. Scripts, styles, fonts, images,
  manifests, and workers are limited to the same origin. Browser connections are
  limited to the Life Journal Supabase project and its WebSocket origin.
- **Mitigation:** The hosting layer should eventually send an HTTP CSP with
  `frame-ancestors` and other response headers. Meta-delivered CSP cannot enforce
  clickjacking protection.
- **Status:** Fixed in source; awaiting public-site publication.

## Verified controls

### SEC-002 — Private secrets are not bundled into the client

- **Severity:** Informational
- **Evidence:** The browser config uses only `VITE_SUPABASE_URL` and the
  Supabase publishable key in `src/repository.ts`. `GEMINI_API_KEY` and the
  Supabase service-role key are read only in
  `supabase/functions/ai-action-candidates/index.ts`.
- **Result:** The Gemini key and service-role key are not committed or exposed to
  the React bundle.

### SEC-003 — Diary and tracker data use owner-scoped RLS

- **Severity:** Informational
- **Evidence:** The migrations enable RLS and use `user_id = auth.uid()` checks
  for journal, action, habit, and completion policies. The journal save RPC is
  `SECURITY INVOKER` and uses an empty `search_path`.
- **Result:** The normal authenticated browser session is limited to its own rows.

### SEC-004 — AI endpoint requires authentication and constrains input

- **Severity:** Informational
- **Evidence:** The Edge Function requires a Bearer token, calls
  `auth.getUser`, fetches the requested entry through RLS, limits input to one
  saved entry and 12,000 characters, caches by entry revision, and caps fresh
  analyses at five per user per UTC day.
- **Result:** It does not accept arbitrary text or expose a general Gemini proxy.

### SEC-005 — No known production dependency vulnerability

- **Severity:** Informational
- **Evidence:** `pnpm audit --prod` completed with no known vulnerabilities.

## Runtime follow-up

After the hosting source push is accepted, verify the deployed response carries
the CSP meta policy. Response headers such as `X-Frame-Options` and a header
CSP are not configurable in the checked-in static app, so they require hosting
platform support.
