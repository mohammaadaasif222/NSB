## Figma → code fidelity rules

### Workflow
- Always fetch BOTH design context AND screenshot for the node. Use the node link, not "current selection".
- After implementing, render the component, screenshot it, and compare to the Figma screenshot. List every difference (radius, border, shadow, glow, spacing, font) and fix before finishing.
- Use exact values from Figma. Never round to the nearest Tailwind class; use arbitrary values (`h-[66px]`, `rounded-[999px]`, `gap-[14px]`) when needed.
- Do not simplify effects. If Figma has a gradient stroke, inner shadow, drop shadow, or background blur, all of them must exist in code.

### Borders (Figma strokes)
- A Figma gradient stroke CANNOT be done with `border-color`. Use the gradient-border technique (pseudo-element + mask), not a flat border.
- Check stroke position: inside/center/outside changes the final size. Inside stroke = `box-sizing: border-box`; outside stroke = use `box-shadow: 0 0 0 1px` or pseudo-element with negative inset.
- Stroke opacity and gradient stops must be copied exactly (including the direction/angle).

### Glass buttons
- Fill: copy the gradient fill, not a single solid color.
- Inner shadow in Figma → `box-shadow: inset ...` (keep x, y, blur, spread, color alpha exactly).
- Drop shadow / glow in Figma → outer `box-shadow` (stack multiple with commas, in the same order).
- Layer blur / background blur → `backdrop-filter: blur(Npx)` (add `-webkit-backdrop-filter`). Figma blur value ≈ CSS blur value / 2 may be needed; verify visually.
- Fully rounded pill = `border-radius: 9999px`, not a small fixed radius.
- Active/selected state is a separate variant: gold gradient border + gold glow + tinted fill. Build it as a prop/class, not by overriding inline.

### Reusable primitives (create once, reuse everywhere)
- `.glass-pill` (base), `.glass-pill--active` (gold glow variant).
- Put tokens (gold color, border gradient stops, glow color, blur) in CSS variables at `:root`.

### Typography and icons
- Match font family, weight, size, line-height and letter-spacing from Figma exactly; confirm the font is actually loaded.
- Icons: use the exported SVG from Figma (same stroke width and size). Do not substitute a similar icon library icon.