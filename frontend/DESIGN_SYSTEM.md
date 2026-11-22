# Design System — Brand Collaboration Scam Detector

This document is the source of truth for the frontend's visual language.
Tokens live in code at [`src/styles/tokens.css`](src/styles/tokens.css) and are
exposed to Tailwind through its `@theme` block, so every value below has exactly
one definition.

---

## 1. Product design direction

**The product is an inspection report, not a dashboard.**

A creator pastes one message and receives one verdict with the evidence behind
it. Nothing is monitored over time, there is no fleet of assets, and there are
no live metrics. The interface is therefore modelled on a *forensic document
review*: the original message sits on the left, the findings sit on the right,
and the evidence found in the message is marked up in place.

### How the direction was chosen

The `ui-ux-pro-max` design-system search was run twice:

| Query | Result | Decision |
|---|---|---|
| "cybersecurity threat intelligence security tool" | Cyberpunk UI: `#00FF41` matrix green on black, Share Tech Mono, glitch and scanline effects | **Rejected.** It is the "hacker" trope. The audience is creators and small businesses who are anxious about one message, not SOC analysts. Neon green also collides with the *Low risk* semantic colour. |
| "fraud detection risk report trust" | Minimalism, trust blue `#2563EB`, orange CTA, Outfit / Work Sans | **Partly kept.** Trust blue as the action colour was kept. The orange CTA was rejected because orange means *High risk* here. Outfit/Work Sans were replaced (see Typography). |

A follow-up typography search returned "Developer Mono" (JetBrains Mono + IBM
Plex Sans). Its reasoning was kept, and the family was unified to IBM Plex.

### Light or dark?

**Light, deliberately.** Reasons tied to the product:

1. The output is a long report that is *read*, often on a phone in daylight,
   while the person decides whether to reply to a brand.
2. The four risk hues (green, amber, orange, red) keep their meaning and reach
   4.5:1 text contrast more reliably as dark text on light tints than as
   glowing text on black. Amber in particular turns muddy on dark surfaces.
3. Dark-neon is the cliché for "security"; calm and legible is the
   differentiator for this audience.

Tokens are named semantically (`--color-surface`, `--color-ink`), so a dark
theme can be added later by redefining them, without touching components.

---

## 2. Brand personality

| Is | Is not |
|---|---|
| A careful second opinion | An alarm |
| Specific: points at the exact words | Vague ("looks suspicious") |
| Honest about what it could not check | Falsely reassuring |
| Calm and plain-spoken | Hacker, sci-fi, or gamified |

**Voice:** second person, active voice, sentence case. A low score is never
called "safe". Failures say what happened and what to do next.

---

## 3. Colour

### Core palette

| Name | Hex | Token | Role |
|---|---|---|---|
| Ink | `#17202E` | `--color-ink` | Primary text, header band, primary icon colour |
| Ink muted | `#4A5567` | `--color-ink-muted` | Secondary text (7.6:1 on white) |
| Ink subtle | `#667085` | `--color-ink-subtle` | Captions and meta only (4.9:1 on white) |
| Paper | `#F4F6F8` | `--color-paper` | Page background (cool, not cream) |
| Surface | `#FFFFFF` | `--color-surface` | Report sheet, input |
| Line | `#DCE1E7` | `--color-line` | Borders and dividers |
| Line strong | `#8A94A3` | `--color-line-strong` | Input and secondary-button borders (3:1 against white, as WCAG requires for UI components) |
| Signal blue | `#1F4FBF` | `--color-action` | Primary action, links, focus ring (7.1:1 on white) |
| Signal blue hover | `#183F99` | `--color-action-hover` | Hover/pressed state |

**Why signal blue:** it is the only hue left free once the four risk colours are
reserved, so an action never looks like a verdict.

### Semantic risk colours

Each level has three tokens: `fg` (text/icons, ≥4.5:1 on its tint and on white),
`tint` (backgrounds), and `solid` (bars and markers, ≥3:1 on white).

| Level | Score | fg | tint | solid | Icon |
|---|---|---|---|---|---|
| Low | 0–29 | `#17663B` | `#E6F4EC` | `#2E9D5B` | `ShieldCheck` |
| Medium | 30–59 | `#7A4F00` | `#FDF2D8` | `#C98A00` | `AlertTriangle` |
| High | 60–79 | `#9A3F06` | `#FDE9DA` | `#DD6512` | `AlertOctagon` |
| Critical | 80–100 | `#A61B12` | `#FCE7E5` | `#D12A1E` | `ShieldAlert` |
| Unavailable / unknown | — | `#4A5567` | `#EDF0F3` | `#98A1AE` | `CircleSlash` / `HelpCircle` |

Indicator *severity* (`high`, `medium`, `low`) reuses the High (orange) and
Medium (amber) rows. A **low-severity finding uses the neutral grey row, not
green**: it is still a concern, and green is reserved for the overall *Low risk*
verdict. For the same reason, a flagged link check is never drawn in green.

**Colour is never the only signal.** Every risk or severity mark also has a
text label ("High") and a distinct icon shape. The score scale also shows the
numeric thresholds.

### Evidence highlight

| Token | Value | Use |
|---|---|---|
| `--color-mark-high` | `#FCD9C2` | Matched text from a high-severity rule |
| `--color-mark-medium` | `#FCE7B2` | Matched text from a medium-severity rule |
| `--color-mark-low` | `#D9EFE1` | Reserved; low-severity matches use the neutral tint `--color-none-tint` |

Marks also get a 2px bottom border in the severity `solid` colour, so they still
read when printed in greyscale or seen by someone with colour-vision deficiency.

### Source colour (rule-based vs AI)

AI findings are not given a "more trustworthy" colour. The two sources are told
apart by **shape and label**, not hue:

- Rule-based findings use a solid left rule and the label "Pattern match".
- Gemini findings use a dashed left rule and the label "Model assessment". They
  also carry a permanent note that model output can be wrong.

---

## 4. Typography

**IBM Plex Sans** for the interface, **IBM Plex Mono** for literal evidence.

Why Plex:
- It was designed for engineering and enterprise software, so it reads as
  precise without the sci-fi feel.
- **Plex Mono separates look-alike glyphs** (`l` `1` `I`, `0` `O`, `rn` `m`).
  That is not decoration here: telling `paypa1.com` from `paypal.com` is the
  job. Mono is used **only** for text quoted from the message or the network
  (URLs, domains, matched phrases, IP addresses, RDAP status codes). It is never
  used for labels.
- One superfamily keeps the two faces in harmony. Plex is self-hosted with
  `@fontsource`, so the user's browser makes no third-party font request.

### Scale (1.2 minor third, 16px base)

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `text-display` | 44 / 48 | 600 | The risk score number only |
| `text-h1` | 28 / 34 | 600 | Page heading |
| `text-h2` | 20 / 28 | 600 | Report section headings |
| `text-h3` | 16 / 24 | 600 | Finding titles |
| `text-body` | 16 / 26 | 400 | Body copy, the message textarea |
| `text-sm` | 14 / 22 | 400 / 500 | Secondary text, table cells |
| `text-xs` | 13 / 18 | 500 | Meta, counters, tags (the smallest size used) |

Rules:
- Body text is never below 16px on mobile. Inputs are 16px so iOS doesn't zoom.
- Line length is capped at about 70 characters (`max-w-prose`).
- Headings use `text-wrap: balance`, paragraphs use `text-wrap: pretty`.
- Numbers that are compared (scores, counts, days) use `tabular-nums`.
- No all-caps labels and no tracked-out eyebrows.

---

## 5. Spacing

4px base unit, using Tailwind's default spacing scale (`1` = 4px).

| Step | px | Typical use |
|---|---|---|
| 1 | 4 | Icon-to-text gap inside tags |
| 2 | 8 | Gap between related inline items |
| 3 | 12 | Padding inside tags and table cells |
| 4 | 16 | Mobile page gutter; gap between rows of a finding |
| 6 | 24 | Padding inside a report section (mobile) |
| 8 | 32 | Padding inside a report section (desktop); gap between columns |
| 12 | 48 | Separation between major regions |

Density is "standard" (ui-ux-pro-max density 7/10). It is dense enough to scan
a full report, with enough air that a worried user isn't overwhelmed.

---

## 6. Borders, radius and elevation

Radius follows hierarchy rather than one value everywhere:

| Token | Value | Applies to |
|---|---|---|
| `--radius-xs` | 3px | Evidence marks, inline code |
| `--radius-sm` | 6px | Tags, buttons, inputs |
| `--radius-md` | 10px | The report sheet and the input panel |

Elevation has two levels only:

| Token | Value | Use |
|---|---|---|
| `--shadow-sheet` | `0 1px 2px rgb(23 32 46 / 6%), 0 8px 24px -12px rgb(23 32 46 / 12%)` | The report sheet and input panel, the two "documents" |
| none | — | Everything else. Sections inside the sheet are separated by 1px `--color-line` dividers, not by nested cards. |

---

## 7. Components

### Buttons

| Variant | Look | Use |
|---|---|---|
| Primary | Signal blue fill, white text, 6px radius, 44px high | One per view: **Analyze message** |
| Secondary | White fill, `line-strong` border, ink text | Cancel, Try again |
| Quiet | No border, ink-muted text, underline on hover | Clear |

- Minimum hit area is 44×44px, including icon-only buttons.
- Disabled buttons drop to 50% opacity and keep a clear text label. The Analyze
  button stays enabled when the input is empty, so pressing it shows the
  validation message (as the Web Interface Guidelines require).
- Loading swaps the leading icon for a spinner, and the label becomes "Analyzing…".

### Inputs and forms

- There is always a visible `<label>`, with helper text below it, tied to the
  field with `aria-describedby`.
- The border is `line-strong`. On focus it gets a 2px signal-blue ring with a
  2px offset.
- On error the border turns `critical.solid`, a message with an icon appears
  under the field, and `aria-invalid="true"` is set.
- The character counter reads "1,204 / 10,000" in tabular figures. Near the
  limit (more than 9,000) it turns `medium.fg`, and past it, `critical.fg`.

### Navigation and header

- The header is a single 56px ink band with the logo, the product name and the
  API status. V1 has one page, so there are **no nav links**. The app doesn't
  invent History, Settings or Account.
- The API status is a real `GET /api/health` check, labelled "API online",
  "API offline" or "Checking API…".
- A "Skip to report" link is the first focusable element.

### Tags

A small rectangle with a 6px radius, 13px text and an icon followed by a label.
Pill shapes are not used.

### Report sections

Each section inside the sheet has:
- A heading row: `h2`, then a section **status tag** (Complete / Partial /
  Unavailable / Not applicable).
- A body built for that section's data, so sections deliberately do *not* look
  alike:
  - Risk: score, scale and component bars.
  - Message signals: a list of findings with evidence marks.
  - Links: one block per URL with a check table.
  - Domain: a definition grid.
  - Model assessment: a summary plus a numbered action checklist.

---

## 8. Data visualisation

Only two charts exist, and both encode real values from the response:

1. **Risk scale.** A horizontal 0–100 track split at the backend's real
   thresholds (30, 60, 80) into four coloured bands, each with its text label.
   A marker sits at `riskScore`. It shows *where* the score falls, not just the
   number.
2. **Component scores.** One thin horizontal bar per component present in
   `riskAssessment.componentScores` (Text, URL, Gemini), each showing its value.
   Components missing from the response appear as a grey "Not included" row,
   never as 0.

There are no donut charts, sparklines or made-up statistics.

---

## 9. Motion

- Respect `prefers-reduced-motion: reduce`. When it is set, all transitions
  drop to 0ms and the spinner is replaced by static text.
- Allowed motion:
  - 150ms colour and border transitions on interactive controls.
  - The spinner while a request runs.
  - One 200ms opacity fade when the report replaces the loading state.
- Not used: scroll reveals, staggered entrances, parallax, glitch effects, glow.
- Only `opacity` and `transform` are animated. `transition: all` is never used.

---

## 10. Responsive breakpoints

Mobile-first, using Tailwind's default breakpoints:

| Name | Min width | Layout |
|---|---|---|
| base | 0 | Single column, 16px gutters. The report follows the input. |
| `sm` | 640px | Wider gutters (24px) |
| `md` | 768px | Two-column check tables in Links and Domain |
| `lg` | 1024px | Two columns: input panel (sticky, 5/12) and report (7/12) |
| `xl` | 1280px | Content max width 1280px, centred |

The page is tested at 390, 768 and 1440px, and must never scroll horizontally.
Long URLs and domains wrap with `overflow-wrap: anywhere`.

---

## 11. Accessibility

- Text contrast is at least 4.5:1, and UI component contrast at least 3:1. The
  values in §3 were chosen to meet this.
- Every interactive element shows a focus ring: 2px signal blue with a 2px
  offset, via `:focus-visible`.
- Headings follow one order: `h1` for the page, `h2` per report section, `h3`
  per finding.
- The report region uses `aria-live="polite"` and `aria-busy` while loading.
  When results arrive, focus moves to the report heading.
- Validation errors are linked to the field and announced.
- Decorative icons have `aria-hidden="true"`, and icon-only buttons have an
  `aria-label`.
- Literal evidence (URLs, domains) is marked `translate="no"` so auto-translate
  doesn't alter it.
- Suspicious URLs are **never rendered as links**. They are shown defanged
  (`hxxps://example[.]com`) as plain text, so nobody is one mis-tap away from a
  phishing page.

---

## 12. Layout concepts

### Desktop (≥1024px)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ [mark] Scam Detector                                   ● API online  │  ink band, 56px
├──────────────────────────────────────────────────────────────────────┤
│ Check a brand collaboration message                                  │  h1 + one line
│                                                                      │
│ ┌─ Message ───────────────────┐  ┌─ Report ───────────────────────┐  │
│ │ label + helper              │  │ Coverage: 4 of 4 checks ran    │  │
│ │ ┌─────────────────────────┐ │  │ ──────────────────────────────  │  │
│ │ │ textarea (16px)         │ │  │ 72  High risk        [scale]   │  │
│ │ │  after analysis: the    │ │  │ classification + explanation   │  │
│ │ │  message is shown with  │ │  │ component bars                 │  │
│ │ │  evidence marked up     │ │  │ ──────────────────────────────  │  │
│ │ └─────────────────────────┘ │  │ Message signals                │  │
│ │ 1,204 / 10,000   Clear      │  │ Links                          │  │
│ │ [ Analyze message ]         │  │ Domain registration            │  │
│ └─────────────── sticky ──────┘  │ Model assessment (Gemini)      │  │
│                                  └────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile (390px)

```text
┌────────────────────────────┐
│ [mark] Scam Detector    ●  │
├────────────────────────────┤
│ Check a brand              │
│ collaboration message      │
│ ┌────────────────────────┐ │
│ │ textarea               │ │
│ └────────────────────────┘ │
│ 0 / 10,000         Clear   │
│ [   Analyze message     ]  │  full width
│                            │
│ Report (focus moves here)  │
│ score, scale, sections…    │
└────────────────────────────┘
```

Content is left-aligned throughout. Centred text is used only inside the empty
state.

### The one bold element

The **annotated message**. After analysis, the input panel switches to a
read-only view of the user's own message, with every phrase the rule engine
matched highlighted at its severity. Users see exactly which words triggered
which warning. Everything else stays quiet so that this view carries the
design. An **Edit message** button returns to the textarea.
