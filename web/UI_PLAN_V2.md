# Web UI — Iteration 2 Plan

## Problems with iteration 1

- **Low contrast everywhere.** Labels at `white/35`, descriptions at `white/40`, metadata at `white/25` — nothing pops. The eye has no anchor.
- **Background gradient is a whisper.** Barely visible on any monitor except a calibrated one.
- **Platform pills are uniform and timid.** No visual identity per platform, too small, feel interchangeable.
- **Cards barely lift off the background.** `border-white/8` on `oklch(0.12)` is effectively invisible.
- **No hierarchy moment.** The biggest text on screen is `text-2xl`. Nothing makes you feel anything.
- **Single narrow column layout.** Safe, forgettable.

---

## Changes

### 1. Background — make it undeniable
- Two overlapping radial glows, opacity raised to ~0.5–0.6
- CSS dot grid overlay on top: 3–4px dots, 32px spacing, `white/[0.03]`
- Glow fills upper ~40% of page with deep indigo-violet — not a hint, a presence

### 2. Header — go big
- Remove small icon+title. Replace with centred hero block.
- `"Workflow Bench"` at `text-5xl font-bold` with **gradient text** (indigo → violet → sky via `bg-clip-text`)
- Tagline at `text-lg text-white/60`
- Thin horizontal rule below

### 3. Platform identity colours
Each platform gets its own brand colour used consistently across pills, cards, run monitoring, and results.

| Platform | Colour | Hex |
|----------|--------|-----|
| inngest  | violet  | `#8B5CF6` |
| mastra   | orange  | `#F97316` |
| hatchet  | emerald | `#10B981` |
| restate  | sky     | `#0EA5E9` |
| (custom) | accent  | `#6366F1` |

Platform pills become larger (`px-5 py-2.5 text-sm`).
- **Unselected:** subtle left border in platform colour, very dim bg
- **Selected:** 20% filled bg in platform colour, full-strength border, white text, glow shadow

### 4. Workflow choice cards — real feature cards
- Taller, more content-dense
- Selected state: `border-l-4` indigo stripe, white heading, glow box-shadow
- Descriptions at `white/70` (up from `white/35`)

### 5. CTA button
- Gradient background: `from-indigo-600 via-violet-600 to-indigo-500`
- `text-base h-12` — larger
- Disabled: dims gradient opacity, not entire element opacity

### 6. Run page — mission control
- Full-width overall progress bar above the platform grid (completed steps / total steps across all platforms)
- Platform cards: `2px` left border in platform's identity colour
- Status dot is larger and more prominent next to platform name
- Step list uses `text-sm` not `text-xs`
- Log panel: `bg-black` with coloured top accent bar per platform colour

### 7. Score cards — dramatic numbers
- Composite score (0–100) displayed as a **circular arc gauge** (SVG `stroke-dasharray`) at top of each card
- Centre of gauge: score number at `text-4xl font-bold`
- Below gauge: 3×2 grid of key stats at readable size
- Score bars: taller (`h-2`), rounded, gradient fill (red → amber → green)
- Platform name rendered in its identity colour

### 8. Comparison table
- Platform name column headers get their identity colour as a `2px` top border
- Alternating row backgrounds (`white/[0.02]` → transparent)
- Section break rows rendered as a distinct background block, not just a label

### 9. Text contrast — minimum values
| Role | v1 | v2 |
|------|-----|-----|
| Labels / descriptions | `white/35–40` | `white/65` |
| Metadata / timestamps | `white/25` | `white/40` |
| Section headings | `white/35 uppercase xs` | `white/60 uppercase xs` |
| Primary text | `white` | `white` |
