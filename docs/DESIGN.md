# Design System

## Theme & Context
The physical scene: "A busy chef glancing at a large touchscreen mounted above the prep station in a bright, hot, fast-paced commercial kitchen."
The interface uses a Neo-Brutalist approach with stark contrasts and vibrant colors to ensure maximum legibility and tactile affordance.

## Color Strategy
**Full palette** (Neo-Brutalist utility colors on high-contrast backgrounds).
- **Background**: `#FFFBEB` (Warm off-white)
- **Cards/Surfaces**: `#FFFFFF`
- **Text & Borders**: `#1A1A1A` (Near black, stark contrast)
- **Accents**:
  - `Brand Orange` (`#FF6B35`): Used for "Pending" or urgent states.
  - `Brand Purple` (`#AA00FF`): Used for "Preparing" states.
  - `Brand Green` (`#00E676`): Used for "Completed" or success actions.
  - `Brand Yellow` (`#FFD700`): Highlighting and warnings.

## Typography
**Font**: Cairo (sans-serif)
**Strategy**: Cap body line lengths for readability. Use extreme weight contrast (e.g., `font-black` vs `font-bold`) to establish hierarchy, rather than relying solely on font size. Numbers (like order numbers) should be massive and unmistakable.

## Layout & Components
- **Borders & Shadows**: 2px-4px solid black borders (`--color-neo-border`) with hard drop shadows (`3px 3px 0px #1A1A1A`).
- **Cards**: Used only when representing a physical object metaphor (like an order ticket). Do not use identical card grids for structural layout.
- **Spacing**: Generous and varied to create rhythm.
- **Buttons**: Tactile, heavy, with clear press states (shadow reduction on active).

## Motion
- **Transformations**: Subtle, snappy translations (`-1px, -1px` on hover, `1px, 1px` on active).
- **State Changes**: Ease-out exponential curves. No bounces.

## Avoid
- **Side-stripe borders**: Do not use `border-l-8` to color-code cards. Color the whole surface or use a top-block.
- **Hero-metric templates**: Do not waste top space with massive numbers; integrate stats into the active workspace.
- **Identical card grids**: Do not repeat the exact same layout for cards; vary them based on order state or urgency.
