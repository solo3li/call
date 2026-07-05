-------
name: FoodyBoard
description: Neo-Brutalist Restaurant SaaS Dashboard
colors:
  primary: "#FF6B35"
  secondary: "#FFD700"
  tertiary: "#00E676"
  neutral-bg: "#FFFBEB"
  neutral-card: "#FFFFFF"
  border: "#1A1A1A"
  brand-pink: "#FF69B4"
  brand-blue: "#448AFF"
  brand-purple: "#AA00FF"
  brand-red: "#FF1744"
  brand-cyan: "#00E5FF"
  brand-lime: "#C6FF00"
typography:
  display:
    fontFamily: "Cairo, sans-serif"
    fontWeight: 900
  body:
    fontFamily: "Cairo, sans-serif"
    fontWeight: 700
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
components:
  neo-card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.lg}"
    padding: "24px"
  neo-btn:
    rounded: "{rounded.md}"
    padding: "12px 24px"
---

# Design System: FoodyBoard

## 1. Overview

**Creative North Star: "The Energetic Kitchen Ledger"**

FoodyBoard is a high-energy, functional dashboard that uses Neo-Brutalism to evoke the fast-paced, high-stakes environment of a professional kitchen. It rejects the "clean" and "sterile" aesthetics of modern SaaS in favor of bold clarity and tactile confidence.

**Key Characteristics:**
- Thick black borders (2px) on every functional element.
- Heavy, non-blurry shadows (box-shadow: 2px 2px 0px).
- Vibrant, saturated brand colors used as functional markers.
- Arabic typography (Cairo) prioritized for readability and weight.

## 2. Colors

The palette is a "Full Palette" strategy, where every color has a specific emotional or functional role.

### Primary
- **Chef Orange** (#FF6B35): Used for primary actions, branding, and urgent operational statuses.

### Secondary
- **Warning Yellow** (#FFD700): Used for highlights, pending states, and interactive toggles.

### Tertiary
- **Success Green** (#00E676): Used for completed states, growth metrics, and "Available" status.

### Neutral
- **Paper Beige** (#FFFBEB): The background of the entire system, providing a warm, non-white base.
- **Ink Black** (#1A1A1A): Used for all borders, text, and shadows.

**The Contrast Rule.** Never place two brand colors side-by-side without a 2px Ink Black border between them.

## 3. Typography

**Display Font:** Cairo (Black 900)
**Body Font:** Cairo (Bold 700)

### Hierarchy
- **Display** (Black 900, 2rem): Used for page titles and hero metrics.
- **Headline** (Black 900, 1.25rem): Used for card titles and section headers.
- **Body** (Bold 700, 1rem): Used for all general text, descriptions, and labels.

## 4. Elevation

Depth is conveyed through structural layering and hard shadows, not gradients or blurs.

### Shadow Vocabulary
- **Resting Shadow** (3px 3px 0px #1A1A1A): The default state for cards and buttons.
- **Active Shadow** (1px 1px 0px #1A1A1A): Used when a button is clicked or an element is "pressed."

**The Anti-Blur Rule.** Soft blurs and gradients are strictly prohibited. Every shadow must be a solid, hard-edged offset.

## 5. Components

### Buttons
- **Shape:** Rounded (8px)
- **Style:** 2px border + 2px shadow. Transitions to 1px shadow on active.
- **Color:** Background varies by role; text is always Ink Black.

### Cards
- **Corner Style:** Large Rounded (12px)
- **Background:** Usually White (#FFFFFF) or a Brand tint.
- **Border:** Constant 2px Ink Black.

### Inputs
- **Style:** 2px Ink Black border + 2px shadow.
- **Focus:** Shadow shifts to Brand Blue (#448AFF).

## 6. Do's and Don'ts

### Do:
- **Do** use emojis as functional icons in card headers.
- **Do** maintain 2px borders even on small elements like badges.
- **Do** use Arabic numerals for all metric displays.

### Don't:
- **Don't** use border-left/right as a color indicator. Use full background tints instead.
- **Don't** use transparency or glassmorphism. Everything must be opaque and solid.
- **Don't** use em-dashes or thin font weights.
