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
The timeline uses a compact header, a seven-day strip, cards for each entry,
a fixed compose action, and two bottom navigation choices. The editor owns its
screen: a back control, save state, date, optional title, and generous writing
space. Settings live in a bottom sheet with language, export, and account
controls. The desktop layout keeps the same hierarchy in a 760px reading
column instead of adding a persistent sidebar. Buttons have text labels, 44px
minimum touch targets and visible focus rings. States: default, hover, focus,
disabled, saving, saved, local draft, failure. Empty history keeps the compose
action available. Errors retain editor text. Language never changes diary text.

## Accessibility and scope
Support keyboard navigation, 200% zoom, 360px phone width, light/dark system
preference and reduced motion. No decorative motion. Use semantic landmarks,
form labels and a polite saving status. Persist drafts per signed-in user.
Initial preview explicitly labels device-only sample mode; it is never reported
as cloud storage. Authentication and database checks need a personal project.
