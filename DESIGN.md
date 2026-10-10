# Life Journal

## Direction
A calm mobile-first journal: browse entries as a day timeline, then enter a
separate focused writing surface. The reference direction borrows Day One's
timeline, Bear's uncluttered editor, and Journey's time-oriented context while
using original copy and identity. No illustrations or dashboard metrics are
needed for the initial diary.

## Tokens
- Canvas #f7f7f3; paper #ffffff; soft surface #eef2f6.
- Ink #262b30; secondary #747a80; border #e2e5e7.
- Accent #496f9d; accent hover #385b86; on-accent #ffffff.
- Error #9b3535; success #496f9d.
- Dark: canvas #1d2228; paper #242b32; soft #303942; ink #eff2f4;
  secondary #aeb7bf; border #3c4650; accent #8ab0df; on-accent #18212b;
  error #ffb4ab.
- Type: system sans-serif (including Apple SD Gothic Neo and Malgun Gothic);
  display serif Georgia/Noto Serif KR with system fallback.
- Type scale: 12, 14, 16, 18, 24, 32, 40px. Body line height 1.8.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64px.
- Radius: 8px controls, 16px writing paper; borders 1px.
- Shadow: 0 8px 32px rgb(41 45 40 / 0.04).

## Layout and primitives
The app separates three destinations: Today for writing, Entries for browsing,
and Calendar for date-led recall. Today alone owns the week strip; Entries is a
clean chronological feed; Calendar is its own month grid and opens that day's
entries. The editor owns its screen: a back control, a labelled Save action,
date, optional title, and generous writing space. Input is saved immediately as
a device draft. The Save button writes to the cloud; no typing-driven cloud
writes occur. Settings live in a bottom sheet with language, export, and
account controls. The desktop layout keeps the same hierarchy in a 760px
reading column instead of adding a persistent sidebar. Buttons have text labels,
44px minimum touch targets and visible focus rings. States: default, hover,
pressed, disabled, saving, saved, local draft, failure. Empty history keeps the
compose action available. Errors retain editor text. Language never changes
diary text.

## Accessibility and scope
Support keyboard navigation, 200% zoom, 360px phone width, light/dark system
preference and reduced motion. Motion is limited to 160ms opacity/transform
feedback for press and view transitions, disabled under reduced motion. Use
semantic landmarks, form labels and a polite saving status. Persist drafts per signed-in user.
Initial preview explicitly labels device-only sample mode; it is never reported
as cloud storage. Authentication and database checks need a personal project.

## October polish: a personal progress notebook
Retain the five destinations and the Korean school reward-chart apple motif.
Use a warm ivory canvas (#f8f6f1), white paper, charcoal ink (#303632),
forest accent (#426653), muted ink (#69716a), and neutral borders (#e3e4dc).
Dark mode uses #191f1d canvas, #232c27 paper, #b4d3bb accent and #b1bcb3 muted ink.
Apple red is #c84939 in light mode and #ffb0a0 in dark mode for readable labels.
Headings: 32–40px serif; body 16px; labels 12–14px. Controls at least 44px.
Use 24px card padding, 16px gaps, 20px corners, a quiet paper shadow.
The document owns scroll. Navigation spans five equal columns on phones, with
safe-area padding and reserved page space. Desktop navigation stays centered.
Plans: a factual summary, a compact action form, collapsible labelled habit
creation, apple progress cards and explicitly labelled today steppers.
History affordances are visible. No new libraries or decorative animation.
Accepted debt: older CSS declarations remain until a dedicated cleanup; scoped
polish rules provide the final shared tokens and responsive behavior.

## Landing / welcome
An editorial cream-paper landing page with forest typography and apple-red
highlights, distinct from the app's system-aware dark mode. Desktop hero uses
two columns: a 56px headline and a notebook demonstration. Mobile stacks both.
Maximum width 1120px, section spacing 80px, body 16px/1.8, cards 24px padding.
Use the real apple progress primitive for a clearly labelled interactive sample.
Sections: hero and Google CTA, three-step product explanation, interactive
habit preview, clearly unavailable roadmap, FAQ, closing CTA. English/Korean.
No fabricated testimonials, usage numbers, pricing or available AI claims.
Anchor #welcome is accessible with or without an authenticated session.

## Appearance preference
Offer System / Light / Dark in journal settings and landing header. Persist the
choice on this device. System reacts to OS appearance changes; explicit choices
override OS mode. The root data-theme attribute controls both app and landing.
