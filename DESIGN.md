---
name: Obsidian Precision
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: '0'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: -0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.02em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for deep focus, operational speed, and dense data orchestration. Built for high-leverage product teams, operators, and founders, the design language communicates quiet technical mastery, low visual friction, and absolute reliability.

Drawing directly from high-performance developer tools, the style balances structured density with refined minimalism. It avoids superfluous decoration, relying instead on razor-thin precision borders, deep slate surfaces, disciplined spatial density, and subtle luminous accents. Key surfaces utilize subtle glassmorphism and crisp hairline outlines to demarcate hierarchical levels without visual noise, evoking a responsive, terminal-grade operational cockpit.

## Colors

The palette operates in strict dark mode, structured around deep slate steps rather than pure black to preserve depth, contrast ratios, and tactile separation.

- **Canvas / Root Background (`#090D16`):** Deep Slate-950 foundation providing high-contrast grounding for all views.
- **Surface / Containers (`#0F172A`):** Slate-900 layer for kanban boards, issue feeds, table containers, and sidebar groups.
- **Elevated Surfaces (`#1E293B`):** Slate-800 for command palettes, floating menus, modals, and popovers.
- **Borders & Separators:** Base hairline borders are `#1E293B`, elevated interactive borders utilize `#334155`, and active focus states trigger `#6366F1`.
- **Primary Accent (`#6366F1`):** Electric Indigo reserved strictly for primary actions, active navigation states, and focus indicators. Transitions to `#4F46E5` on hover.
- **Status & Priority Spectrum:**
  - **Urgent (`#EF4444`):** Accompanied by a diffused, low-opacity glow (`rgba(239, 68, 68, 0.15)`).
  - **High (`#F97316`):** Crisp warning orange for critical delivery tracks.
  - **Medium (`#3B82F6`):** Cool slate-blue for standard active priority.
  - **Low (`#64748B`):** Muted slate for non-blocking backlog items.
  - **Success & Live State (`#10B981`):** Vivid emerald for completed tracks and real-time operational indicators.
  - **Role & Attention (`#F59E0B`):** Warm amber for permissions, access badges, and billing warnings.
- **Content Hierarchy:** Titles and active headings use `#F8FAFC` (Slate-50); secondary meta, tags, and descriptive copy use `#94A3B8` (Slate-400); inactive placeholders use `#475569` (Slate-600).

## Typography

Typography prioritizes fast scanning, clear visual grouping, and tabular numerical alignment.

- **Primary UI (`Inter`):** Handles structural navigation, dashboard metrics, modal headings, and long-form task notes. Tight negative letter-spacing is applied to headings (`-0.02em` to `-0.025em`) to produce a sharp, editorial tech feel.
- **Monospace Engine (`JetBrains Mono`):** Applied systematically to status badges, keyboard shortcut badges (`⌘K`), issue IDs (`TIC-1042`), currency metrics, and timestamps. Its fixed character width prevents layout shifts during live data re-renders and quick-filtering.

## Layout & Spacing

The layout is built upon an adaptive fluid grid optimized for high-density desktop usage with resilient fallback down to mobile viewports.

- **Desktop Framework:** A persistent 240px collapsable left utility sidebar, followed by a dynamic, full-bleed multi-column kanban or data-table canvas. Main workspace views use 24px outer margins and 16px to 24px gutters.
- **Density System:** Compact 4px base units govern spacing. Element gaps in lists and control bars strictly use `space-xs` (4px) and `space-sm` (8px) to reduce empty travel distance for mouse-driven and keyboard-driven power users.
- **Glassmorphic Top Bar:** The application header is sticky, fixed at 48px height with a 12px backdrop blur (`backdrop-filter: blur(12px)`), rendered over `rgba(9, 13, 22, 0.8)` with a 1px bottom border of `#1E293B`.
- **Responsive Reflow:** Under 768px, multi-column board views automatically transform into single-column swipeable decks or stacked data cards; the sidebar collapses into a drawer anchored to the bottom sheet.

## Elevation & Depth

Depth is established through low-contrast hairline borders, backdrop diffusion, and calibrated dark-mode ambient shadows rather than stark elevation jumps.

- **Tier 0 (Root / Canvas):** `#090D16`. Fully opaque, matte.
- **Tier 1 (Surface Containers & Cards):** `#0F172A` resting on `#090D16`, outlined with a 1px solid `#1E293B` boundary.
- **Tier 2 (Popovers, Flyouts & Modals):** `#1E293B` elevated with an ambient box-shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)`. Outlined with a top highlight border in `#334155` to emulate directional top-lit light.
- **Tier 3 (Urgent & Spotlight Overlays):** Interactive focused elements deploy a subtle outer halo: `0 0 0 1px #6366F1, 0 0 16px rgba(99, 102, 241, 0.25)`. Urgent elements carry an equivalent red glow: `0 0 12px rgba(239, 68, 68, 0.2)`.

## Shapes

The geometric framework balances technical precision with modern ergonomics using an 8px to 12px envelope:

- **Standard Elements (8px / `0.5rem`):** Buttons, input fields, dropdown trigger targets, keyboard shortcut tags, and table cells.
- **Containers & Surfaces (12px / `0.75rem`):** Kanban columns, dashboard cards, slide-over panels, and command palettes.
- **Micro Badges (4px / `0.25rem`):** Priority tags and status pips maintain tighter radii to preserve typographic balance.

## Components

### Buttons
- **Primary:** Background `#6366F1`, text `#FFFFFF`, border `1px solid transparent`. Hover: `#4F46E5`. Active: scale transform down to `0.985`. Height 32px (dense) or 36px (regular).
- **Secondary / Ghost:** Background `rgba(30, 41, 59, 0.5)`, text `#F8FAFC`, border `1px solid #1E293B`. Hover: background `#1E293B`, border `#334155`.
- **Destructive:** Background `rgba(239, 68, 68, 0.1)`, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.2)`. Hover: background `rgba(239, 68, 68, 0.2)`.

### Chips & Status Badges
- Displayed with `label-sm` font (`JetBrains Mono`). Height 20px, horizontal padding 6px.
- Background uses a 10% alpha fill of the status color, border uses a 20% alpha stroke, and text matches the solid hue (e.g., Success: bg `rgba(16, 185, 129, 0.1)`, border `rgba(16, 185, 129, 0.25)`, text `#10B981`).

### Form Inputs & Selectors
- Background `#090D16`, text `#F8FAFC`, placeholder `#475569`.
- Default border `1px solid #1E293B`. Focus state transitions to border `#6366F1` with an indigo ambient glow (`0 0 0 1px #6366F1`). Height: 32px for filters, 36px for edit forms.

### Cards & Kanban Columns
- Background `#0F172A`, 1px border `#1E293B`, radius 12px.
- Task cards nested within columns feature `#090D16` or `#131D31` background, 8px radius, and subtle top border highlight on hover (`#334155`).

### Command Palette (Raycast / Linear Style)
- Fixed center-screen modal, width 640px. Background `rgba(15, 23, 42, 0.85)` with `backdrop-filter: blur(16px)`. Border `1px solid #334155`.
- Integrated input field with zero border, leading icon, and trailing `ESC` shortcut chip in `JetBrains Mono`.

### Checkboxes & Selection Controls
- Custom 16x16px frame with 4px border radius. Border `1px solid #334155`, background `#090D16`. Checked state transitions fill to `#6366F1` with an interior white check icon.