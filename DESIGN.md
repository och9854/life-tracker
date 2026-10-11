# Life Journal Design System

## 1. Atmosphere & Identity

Life Journal should feel like a personal notebook that quietly helps its owner keep promises to themselves. The visual direction is **warm editorial utility**: paper and ink, clear modern controls, and a small forest-green accent. Notion's warm minimalism informs whitespace, soft neutral surfaces, and serif display moments; Life Journal keeps its own Korean school reward-chart apple as the signature. The app shell is redesigned around shadcn/ui source components, but those components must take Life Journal tokens rather than their defaults.

## 2. Color

| Role | Token | Light | Dark | Usage |
|---|---|---|---|---|
| Canvas | `--background` | `#f8f6f1` | `#191f1d` | App and page background |
| Paper | `--card` | `#fffefa` | `#232c27` | Journal, habit, and review surfaces |
| Soft surface | `--muted` | `#eeeee7` | `#303a34` | Quiet controls and selected rows |
| Primary ink | `--foreground` | `#303632` | Main text |
| Secondary ink | `--muted-foreground` | `#69716a` | Metadata and guidance |
| Border | `--border` | `#e3e4dc` | Dividers and control edges |
| Primary action | `--primary` | `#426653` | Save, create, selected navigation |
| Primary hover | `--primary-hover` | `#345240` | Hover and pressed primary actions |
| On primary | `--primary-foreground` | `#ffffff` | Primary action labels |
| Apple progress | `--apple` | `#c84939` | Habit reward fill and progress label |
| Destructive | `--destructive` | `#9b3535` | Delete and error states |
| Success | `--success` | `#426653` | Saved and completed states |

Dark theme equivalents: canvas `#191f1d`, paper `#232c27`, muted `#303a34`, foreground `#eff2ef`, secondary `#b1bcb3`, border `#3b463f`, primary `#b4d3bb`, primary foreground `#1a241e`, apple `#ffb0a0`, destructive `#ffb4ab`, success `#b4d3bb`.

Use semantic tokens through CSS variables and Tailwind/shadcn mappings. Do not add arbitrary colors in component styles. Apple red belongs to progress only; green remains the sole primary action accent.

## 3. Typography

| Level | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Display | `clamp(2.25rem, 5vw, 3.5rem)` | 500 | 1.12 | Landing and reflection title |
| H1 | `2rem` | 600 | 1.25 | App page title |
| H2 | `1.5rem` | 600 | 1.35 | Page sections |
| H3 | `1.125rem` | 600 | 1.45 | Cards and entry titles |
| Body | `1rem` | 400 | 1.7 | Journal and supporting copy |
| Body small | `.875rem` | 400 | 1.55 | Secondary information |
| Label | `.75rem` | 600 | 1.4 | Field labels and overlines |

Primary stack: system sans with `-apple-system`, `Apple SD Gothic Neo`, and `Malgun Gothic` for platform-native Korean. Display serif: Georgia, `Noto Serif KR`, serif. No more than these two families; body copy never falls below 14px.

## 4. Spacing & Layout

Spacing uses a 4px base: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-10: 40px`, `--space-12: 48px`, `--space-16: 64px`.

- Reading surface max width: 760px; app content max width: 1040px; landing max width: 1120px.
- Desktop shell: centered reading surface with a compact topbar and bottom navigation; do not add an always-visible sidebar.
- Mobile: one column, 16px page gutters, five equal bottom-navigation destinations plus safe-area inset. The document owns vertical scrolling; editor text owns its own input scroll.
- Breakpoints: 640px, 768px, 1024px, 1280px.
- Today prioritizes the writing prompt; Plans prioritizes next actions and visible habit progress; Calendar is date-led; Review is reflective and quiet.

## 5. Components

### Button
- **Structure**: shadcn source component using Radix Slot and CVA; text and optional Lucide icon.
- **Variants**: primary, secondary, outline, ghost, destructive, link; sizes default, small, icon.
- **Spacing**: 44px minimum interactive height; 8px icon gap; control radius token.
- **States**: default, hover, active, focus-visible, disabled, loading.
- **Accessibility**: native button semantics; icon-only buttons include an accessible name; visible focus ring.
- **Motion**: 140ms transform/opacity response; disabled by reduced-motion preference.
- **Layout**: cluster; no scroll ownership.

### Card
- **Structure**: shadcn Card, Header, Title, Description, Content, Footer source primitives.
- **Variants**: paper, inset, progress, editorial.
- **Spacing**: 24px desktop padding, 16px mobile padding; 16px internal gaps.
- **States**: default, hover when interactive, selected wash, loading, empty, error.
- **Accessibility**: use semantic heading order; interactive card has one clear focus target.
- **Motion**: no idle animation; interactive state changes use 140ms transform/opacity.
- **Layout**: stack/grid; page remains the scroll owner.

### Field
- **Structure**: visible label, shadcn Input or Textarea, optional hint and inline error.
- **Variants**: text, date, number, long-form journal body.
- **Spacing**: 12px label gap; 12px control padding; 44px minimum control height.
- **States**: default, hover, focus-visible, disabled, invalid, saved draft.
- **Accessibility**: programmatic label, described hint/error, no placeholder-only names.
- **Motion**: focus ring appears immediately; no layout animation.
- **Layout**: stack; long-form textarea is the editor scroll owner.

### Navigation
- **Structure**: five text-labeled destinations with consistent 20px Lucide outline icons.
- **Variants**: desktop centered dock, mobile fixed bottom bar with safe-area padding.
- **Spacing**: 44px target minimum; 8px icon/label gap; equal mobile columns.
- **States**: default, active wash with glyph/state, hover, focus-visible.
- **Accessibility**: `aria-current="page"`, named navigation landmark, keyboard reachable.
- **Motion**: active wash cross-fades in 140ms; reduced motion is respected.
- **Layout**: fixed only on mobile; page reserves matching bottom space.

### HabitProgress
- **Structure**: custom SVG apple split into target-count slices, with completion text and count.
- **Variants**: compact list, full card, interactive daily stepper.
- **Spacing**: 12px apple/count gap; card uses standard spacing tokens.
- **States**: empty, partial, goal reached, disabled, error.
- **Accessibility**: visible count and accessible progress label; completion is never conveyed by color alone.
- **Motion**: filled slice uses a 180ms opacity fade, with reduced-motion support.
- **Layout**: inline or card; no scroll ownership.

### Sheet
- **Structure**: shadcn Dialog source primitives with overlay, title, close button, and content.
- **Variants**: settings, habit history, confirm delete.
- **Spacing**: 24px desktop, 16px mobile; maximum width 520px.
- **States**: open, closed, busy, error.
- **Accessibility**: focus trapping, Escape close, title association, visible cancel for destructive confirmation.
- **Motion**: opacity/transform transition; reduced-motion path is a cross-fade.
- **Layout**: modal layer above page; sheet content scrolls when it exceeds the viewport.

## 6. Motion & Interaction

Use 140ms ease-out for control feedback and 220ms cubic-bezier(0.2, 0.8, 0.2, 1) for sheets or view changes. Animate transform and opacity only. No decorative looping or scroll reveal is used in the private journal. Respect `prefers-reduced-motion`; all interactions remain immediate and usable.

## 7. Depth & Surface

Use **mixed but restrained paper surfaces**: thin warm borders establish boundaries; a soft layered shadow separates only the active editor, modal, and featured progress surface. Avoid glass blur on scrolling content and avoid framing every row as a card.

| Token | Value | Usage |
|---|---|---|
| `--radius-control` | `10px` | Buttons and fields |
| `--radius-card` | `16px` | Cards and paper |
| `--radius-sheet` | `22px` | Modal and settings sheet |
| `--radius-pill` | `9999px` | Progress labels and small status tags |
| `--shadow-paper` | `0 8px 28px rgb(41 45 40 / .055)` | Raised paper |
| `--shadow-sheet` | `0 24px 72px rgb(24 31 27 / .18)` | Modal and overlay |

Nested corners reduce by the inner padding; repeated rows use dividers or tonal washes instead of card-on-card borders.

## 8. Accessibility Constraints & Accepted Debt

### Constraints
- Target WCAG 2.2 AA: 4.5:1 body text, 3:1 large text and control edges.
- Support 360px mobile width, 200% zoom, keyboard navigation, visible focus, screen-reader labels, reduced motion, and both color schemes.
- Korean copy may wrap naturally and must not clip; long labels and empty/error/loading states are designed.
- Theme selector exposes System, Light, and Dark; system preference updates until a manual override is chosen.

### Accepted Debt
| Item | Location | Why accepted | Owner / Exit |
|---|---|---|---|
| Existing journal/tracker styles are replaced incrementally behind a single token layer | `src/styles.css`, `src/weekly-review.css` | Preserves business flows while component markup migrates to shared primitives | Remove legacy selectors touched by this redesign before release |
| Full browser coverage of OAuth and remote account data cannot run from preview mode | Auth flow | Avoids changing user account state during visual checks | Recheck with signed-in personal Chrome session before production release |
