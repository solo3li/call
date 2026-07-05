# FoodRMS — Design System

## Foundation

FoodRMS uses a **Neo-Brutalist** design language across all UIs (web portal, KDS, POS, desktop apps). The system was designed with a specific physical scene in mind:

> "A busy chef glancing at a large touchscreen mounted above the prep station in a bright, hot, fast-paced commercial kitchen."

This scene drives every design decision: contrast ratios, type sizes, touch target dimensions, and color loudness.

---

## Core Principles

| Principle | Rule |
|-----------|------|
| **Unignorable Clarity** | Information hierarchy must survive being read from 6 feet away |
| **Zero Ambiguity** | State changes must be absolute and obvious |
| **High Energy Utility** | Design must match the intense energy of a commercial kitchen |
| **Immediate Affordance** | Buttons must feel tactile and unmissable |

---

## Color System

### Strategy: Full Palette (Neo-Brutalist)

3–4 named utility roles used deliberately for semantic meaning. Not decorative.

### Base Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--neo-bg` | `#FFFBEB` | Page background (warm off-white) |
| `--neo-border` | `#1A1A1A` | All borders, text, shadows (near-black) |
| White | `#FFFFFF` | Card/surface backgrounds |

### Semantic Accent Colors

| Token | Hex | Semantic Meaning |
|-------|-----|-----------------|
| `--brand-orange` | `#FF6B35` | Pending orders, urgent state, CTA |
| `--brand-purple` | `#AA00FF` | Preparing state, secondary CTA |
| `--brand-green` | `#00E676` | Completed/success, Ready state |
| `--brand-yellow` | `#FFD700` | Warnings, highlights, marquee |
| `--brand-blue` | `#1565C0` | Feature section backgrounds |
| `--brand-pink` | `#FF4081` | Marketing sections, CTA blocks |
| `--brand-cyan` | `#00BCD4` | Decorative accents |
| `--brand-lime` | `#C6FF00` | Badges, launch labels |

### Order Status → Color Mapping

| Status | Color | Rationale |
|--------|-------|-----------|
| Pending | Orange (`#FF6B35`) | Urgency, action required |
| Preparing | Purple (`#AA00FF`) | In-progress, transforming |
| Ready | Green (`#00E676`) | Success, pick up |
| Delivering | Yellow (`#FFD700`) | In motion, attention needed |
| Done | Gray / white | Resolved, receded |

---

## Typography

### Font

**Cairo** — Google Fonts, Arabic-optimized sans-serif.

```html
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

### Scale & Hierarchy

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Order number | `4xl–6xl` | 900 (Black) | Must be readable from 6ft |
| Section heading | `5xl–8xl` | 900 | Marketing pages |
| Card title | `3xl` | 900 | Kitchen cards |
| Body copy | `xl–2xl` | 700 | High-weight for kitchen light |
| Label/meta | `lg` | 700 | Status labels, timestamps |
| Button | `2xl–3xl` | 900 | Large touch targets |

Rule: **Hierarchy through scale + weight contrast.** Never rely on color alone.

---

## Layout & Spacing

### Border System (Neo-Brutalist)

All interactive elements use:
- `border: 2px–4px solid #1A1A1A` (never hairline borders)
- Hard drop shadow: `box-shadow: 4px 4px 0px #1A1A1A` (no blur, no spread)

### Button Tactility

Buttons simulate physical press via shadow reduction:

```css
.neo-btn {
  box-shadow: 8px 8px 0px #1A1A1A;
  transition: all 0.1s ease-out;
}

.neo-btn:hover {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0px #1A1A1A;
}

.neo-btn:active {
  transform: translate(4px, 4px);
  box-shadow: 2px 2px 0px #1A1A1A;
}
```

### Spacing Rhythm

Spacing is deliberately **varied** to create rhythm:
- Sections: `py-24` to `py-32`
- Cards: `p-10`
- Small elements: `px-6 py-4`

**Do not use identical padding everywhere** — monotony kills the high-energy feel.

### Touch Targets

Minimum button size: `px-10 py-5` (Tailwind) ≈ 56px height. Designed for gloved hands.

---

## Cards

Cards represent **physical objects** (order tickets). Rules:

- Use cards only when there's a physical-object metaphor
- Do **not** use identical grids of same-sized cards
- Vary card size/rotation/color by state or urgency
- Use `rotate-[N]` subtle rotation for "paper ticket" feel

```html
<!-- Pending order card -->
<div class="bg-brand-orange border-4 border-neo-border shadow-[8px_8px_0px_#1A1A1A] rotate-[-1deg] p-8 rounded-2xl">
  ...
</div>

<!-- Completed order card -->
<div class="bg-white border-4 border-neo-border shadow-[4px_4px_0px_#1A1A1A] p-8 rounded-2xl opacity-75">
  ...
</div>
```

---

## Motion

### Principles
- Ease out with exponential curves (`ease-out-quart` / `quint`)
- **No bounce, no elastic, no spring**
- Animate `transform` and `opacity` only — never layout properties

### Framer Motion Presets

```tsx
// Order card entrance
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }  // expo-out
  }
};

// Status change flash
const flashVariants = {
  flash: {
    backgroundColor: ["#FF6B35", "#FFFBEB"],
    transition: { duration: 0.6 }
  }
};
```

### Marquee

Used in the marketing homepage for social proof ticker:

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 20s linear infinite;
}
```

---

## RTL Layout

The entire app is RTL-first (Arabic language):

```html
<html dir="rtl" lang="ar">
```

```css
.dir-rtl {
  direction: rtl;
  text-align: right;
}
```

Tailwind RTL variants (`rtl:`) are used where directional behavior differs.

---

## Absolute Bans

Never use these patterns — they signal generic AI-generated output:

| Ban | Alternative |
|-----|------------|
| `border-left: 4px solid color` (stripe accent) | Full border or background tint |
| `background-clip: text` gradient text | Solid color with weight/size emphasis |
| Glassmorphism cards as default | Use only sparingly, purposefully |
| Hero-metric: big number + small label | Integrate stats into the active workspace |
| Identical card grids | Vary size/color/rotation by state |
| Modals as first solution | Inline / progressive disclosure first |
| Em dashes (—) in copy | Use commas, colons, or parens |

---

## Tailwind Configuration Extract

```css
/* globals.css */
@theme {
  --color-neo-bg: #FFFBEB;
  --color-neo-border: #1A1A1A;
  --color-brand-orange: #FF6B35;
  --color-brand-purple: #AA00FF;
  --color-brand-green: #00E676;
  --color-brand-yellow: #FFD700;
  --color-brand-blue: #1565C0;
  --color-brand-pink: #FF4081;
  --color-brand-cyan: #00BCD4;
  --color-brand-lime: #C6FF00;
  
  --font-cairo: "Cairo", sans-serif;
  
  --shadow-neo: 4px 4px 0px var(--color-neo-border);
  --shadow-neo-lg: 8px 8px 0px var(--color-neo-border);
  --shadow-neo-xl: 12px 12px 0px var(--color-neo-border);
}
```

---

## Component Conventions

### Status Badge

```tsx
const STATUS_STYLES = {
  Pending:    "bg-brand-orange text-white border-4 border-neo-border shadow-neo",
  Preparing:  "bg-brand-purple text-white border-4 border-neo-border shadow-neo",
  Ready:      "bg-brand-green text-neo-border border-4 border-neo-border shadow-neo",
  Delivering: "bg-brand-yellow text-neo-border border-4 border-neo-border shadow-neo",
  Done:       "bg-white text-neo-border border-4 border-neo-border opacity-60",
};

export function StatusBadge({ status }) {
  return (
    <span className={`px-4 py-1 font-black text-lg rounded ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
```

### Neo Button

```tsx
export function NeoButton({ children, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-brand-purple text-white",
    danger:  "bg-brand-orange text-white",
    ghost:   "bg-white text-neo-border",
  };
  
  return (
    <button
      className={`
        neo-btn border-4 border-neo-border font-black text-xl
        px-8 py-4 rounded-xl
        shadow-[6px_6px_0px_#1A1A1A]
        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#1A1A1A]
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_#1A1A1A]
        transition-all duration-75
        ${variants[variant]}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
```
