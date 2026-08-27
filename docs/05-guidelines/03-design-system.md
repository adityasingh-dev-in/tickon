# Design System

> Design principles, UI architecture, component guidelines, accessibility standards, and visual consistency rules for ProjectOS.

---

# Goals

The design system exists to keep the entire application:

- Consistent
- Fast
- Accessible
- Easy to maintain
- Easy to scale

Every page and component should feel like part of the same application.

---

# Core Design Principles

## 1. Clarity Over Cleverness

Users should instantly understand what every element does.

Avoid decorative UI that sacrifices usability.

Good:

- Clear labels
- Obvious buttons
- Predictable layouts

Avoid:

- Hidden actions
- Unclear icons
- Fancy animations that reduce usability

---

## 2. Consistency Over Novelty

Solve similar problems the same way.

Examples:

- Every delete button looks identical.
- Every modal behaves the same.
- Every table has identical spacing.
- Every form uses identical validation.

Users shouldn't relearn the interface on every page.

---

## 3. Speed Is a Feature

Performance affects user experience as much as appearance.

Prioritize:

- Optimistic updates
- Skeleton loading
- Instant navigation
- Lazy loading
- Code splitting
- Virtualized lists

Avoid unnecessary animations.

---

## 4. Simplicity First

Every screen should answer:

- Where am I?
- What can I do?
- What should I do next?

If extra UI doesn't help answer those questions, remove it.

---

## 5. Accessibility Is Required

Accessibility is not optional.

Every feature must be usable by:

- Keyboard
- Screen readers
- High contrast users
- Reduced motion users

---

# Overall UI Style

ProjectOS follows a modern dashboard style.

Characteristics:

- Clean layouts
- Minimal shadows
- Rounded corners
- Plenty of spacing
- Neutral colors
- Bright accent color
- Dense but readable information
- Fast interactions

Think:

- Linear
- GitHub
- Vercel Dashboard

instead of

- Heavy enterprise software
- Overly colorful admin templates

---

# Theme Support

ProjectOS supports:

- Light mode
- Dark mode

Theme switching uses:

```
next-themes
```

Tailwind configured with:

```
darkMode: "class"
```

Never hardcode colors.

Always use semantic color tokens.

---

# Color System

Never use raw Tailwind colors throughout the application.

Use semantic tokens instead.

| Token                    | Purpose                 |
| ------------------------ | ----------------------- |
| `background`             | App background          |
| `foreground`             | Primary text            |
| `card`                   | Cards                   |
| `card-foreground`        | Card text               |
| `popover`                | Popovers                |
| `primary`                | Primary actions         |
| `primary-foreground`     | Text on primary         |
| `secondary`              | Secondary buttons       |
| `secondary-foreground`   | Secondary text          |
| `muted`                  | Muted backgrounds       |
| `muted-foreground`       | Secondary text          |
| `accent`                 | Hover states            |
| `accent-foreground`      | Accent text             |
| `destructive`            | Errors & delete actions |
| `destructive-foreground` | Text on destructive     |
| `border`                 | Borders                 |
| `input`                  | Inputs                  |
| `ring`                   | Focus ring              |
| `success`                | Success state           |
| `warning`                | Warning state           |
| `info`                   | Informational state     |

---

# Typography

## Font

Primary

```
Inter
```

Fallback

```
system-ui
```

Monospace

```
JetBrains Mono
```

---

## Text Scale

| Usage         | Tailwind                 |
| ------------- | ------------------------ |
| Page title    | `text-3xl font-bold`     |
| Page heading  | `text-2xl font-semibold` |
| Section title | `text-xl font-semibold`  |
| Card title    | `text-lg font-semibold`  |
| Body          | `text-sm`                |
| Small text    | `text-xs`                |
| Labels        | `text-sm font-medium`    |
| Code          | `font-mono text-sm`      |

---

# Spacing

Use Tailwind spacing scale only.

Never use arbitrary spacing unless absolutely necessary.

| Class | Pixels |
| ----- | ------ |
| p-1   | 4      |
| p-2   | 8      |
| p-3   | 12     |
| p-4   | 16     |
| p-5   | 20     |
| p-6   | 24     |
| p-8   | 32     |
| p-10  | 40     |
| p-12  | 48     |

Recommended layout spacing:

Page padding

```
p-6 lg:p-8
```

Card padding

```
p-4
```

Section gap

```
gap-6
```

Page gap

```
gap-8
```

---

# Border Radius

Use only predefined radius values.

| Class        | Usage            |
| ------------ | ---------------- |
| rounded      | Small            |
| rounded-md   | Inputs           |
| rounded-lg   | Cards            |
| rounded-xl   | Large containers |
| rounded-full | Avatars          |

---

# Shadows

Use shadows sparingly.

| Component | Shadow    |
| --------- | --------- |
| Card      | shadow-sm |
| Dropdown  | shadow-md |
| Modal     | shadow-lg |

Avoid large dramatic shadows.

---

# Icons

Library

```
Lucide React
```

Sizes

| Usage      | Size    |
| ---------- | ------- |
| Inline     | 16px    |
| Buttons    | 18–20px |
| Sidebar    | 20px    |
| Navigation | 24px    |

Rules

Decorative icons

```
aria-hidden="true"
```

Icon-only buttons

Must include

```
aria-label
```

---

# Tailwind Rules

## Good

```tsx
<Button className="w-full" />
```

```tsx
<div className="flex items-center gap-2">
```

## Bad

```tsx
<div className="p-3.25">
```

```tsx
<div className="text-[#444444]">
```

Avoid arbitrary values whenever possible.

---

# Utility Helpers

Use

```ts
cn();
```

for conditional class merging.

Example

```tsx
cn("flex items-center", isActive && "bg-primary");
```

---

# Component Architecture

Shared UI components belong in

```
packages/ui
```

Feature-specific components belong in

```
apps/web/src/components
```

---

# Shared Components

Examples

- Button
- Input
- Select
- Avatar
- Badge
- Dialog
- Drawer
- Sheet
- Tooltip
- Popover
- Dropdown Menu
- Checkbox
- Switch
- Tabs
- Table
- Card
- Skeleton
- Spinner
- Toast

These components:

- contain no business logic
- are reusable
- are presentation-only

---

# Feature Components

Examples

Authentication

- LoginForm
- RegisterForm

Projects

- ProjectCard
- ProjectList

Kanban

- Board
- Column
- TaskCard

Tasks

- TaskDetails
- TaskEditor

Notifications

- NotificationBell
- NotificationPanel

These components may:

- use hooks
- use Zustand
- call APIs
- manage local state

---

# Component Rules

Every component should:

- Have one responsibility
- Have typed props
- Be reusable when appropriate
- Support dark mode
- Support loading state
- Support disabled state
- Support error state if applicable

---

# Responsive Design

Mobile-first.

Breakpoints

| Prefix  | Width |
| ------- | ----- |
| default | 0     |
| sm      | 640   |
| md      | 768   |
| lg      | 1024  |
| xl      | 1280  |
| 2xl     | 1536  |

Rules

Mobile

- Single column

Tablet

- Responsive grids

Desktop

- Sidebar + content

---

# Forms

Every form must have:

- Labels
- Validation
- Error messages
- Loading state
- Disabled submit while processing

Required fields

Must display

```
*
```

Validation

Uses

```
Zod
```

Client

```
React Hook Form
```

Server validation always runs regardless of client validation.

---

# Buttons

Primary

Main action.

Secondary

Alternative action.

Outline

Less important actions.

Ghost

Toolbar actions.

Destructive

Delete actions.

Loading buttons

- spinner
- disabled

---

# Tables

All tables should support:

- Sorting
- Empty state
- Loading state
- Responsive layout
- Keyboard navigation

Future:

- Pagination
- Filtering
- Column visibility

---

# Empty States

Every feature needs an empty state.

Include:

- Illustration or icon
- Short explanation
- Primary CTA

Example

```
No projects yet

Create your first project to get started.
```

---

# Loading States

Prefer skeletons.

Avoid page-wide spinners whenever possible.

Use optimistic updates for:

- Tasks
- Comments
- Notifications
- Kanban
- Member management

---

# Animations

Use minimal animation.

Allowed:

- Fade
- Slide
- Scale
- Toast animations
- Dialog transitions

Duration

```
150ms–250ms
```

Respect

```
prefers-reduced-motion
```

---

# Accessibility Standards

Every interactive component must support:

- Keyboard navigation
- Screen readers
- Focus management
- Visible focus ring
- Proper contrast

---

# Required Accessibility

## Keyboard

Everything must be usable without a mouse.

---

## Focus

Visible focus

```
focus-visible:ring-2
focus-visible:ring-ring
```

---

## Contrast

Follow WCAG AA.

Text

Minimum

```
4.5 : 1
```

---

## Images

Every image

```
alt=""
```

must be meaningful.

Decorative images

```
alt=""
```

---

## ARIA

Only use ARIA when semantic HTML isn't enough.

Examples

Dialog

```
role="dialog"
```

Tabs

```
role="tablist"
```

Toast

```
role="alert"
```

Dropdown

```
aria-expanded
```

---

# Standard Component States

Every interactive component should define:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Success
- Error

No component should visually "jump" between states.

---

# Notifications

Success

- Green
- Check icon

Warning

- Yellow
- Alert icon

Error

- Red
- X icon

Info

- Blue
- Info icon

---

# Dashboard Layout

Standard application layout

```
AppLayout
├── Sidebar
├── Header
│   ├── Search
│   ├── Notifications
│   ├── User Menu
├── Main Content
└── Global Toaster
```

Every authenticated page should use this layout.

---

# Future Design Guidelines

Planned improvements

- Design tokens package
- Shared theme package
- Motion guidelines
- Component playground (Storybook)
- Figma design system
- Icon guidelines
- Illustration library
- Design QA checklist

---

# Related Documents

- [System Diagram](../02-architecture/01-system-diagram.md)
- [Coding Standards](02-coding-standards.md)
- [Kanban Board](../03-features/kanban-board/README.md)
- [Authentication](../03-features/authentication/README.md)
