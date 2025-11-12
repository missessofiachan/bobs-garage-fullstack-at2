
# 🎨 sofia's personal stylist guide 

A design system guide with a Trans Pride colour scheme, accessibility-first approach, and modern CSS-in-JS architecture. Use this guide to implement the same styling system across your projects.

---

## Table of Contents

1. Overview
2. Colour Palette
3. Typography
4. Spacing & Layout
5. Theme System
6. Layout & Structure
7. Component Patterns
8. Animation Patterns
9. Accessibility Features
10. Implementation Guide
11. Bootstrap Integration
12. Best Practices
13. Resources
14. License

---

## 1) Overview

This design system uses:
- Vanilla Extract for zero-runtime CSS-in-JS with TypeScript support
- Sprinkles for utility-first spacing and layout
- Bootstrap 5 with theme overrides
- WCAG AA compliant color contrasts (12.6:1 baseline targets)

Key features:
- Trans Pride colour scheme (blue and pink accents)
- True dark mode with accessible contrast
- Type-safe tokens and theme contracts
- Responsive, mobile-first by default
- Easy brand customization

---

## 2) Colour Palette

Brand Colours (Trans Pride Theme)
- Primary Blue (Brand)
  - Light Mode: #55CDFC
  - Dark Mode:  #7DD3FC
  - Hover (Light): #3BB5E8
  - Hover (Dark):  #93DAFF
- Accent Pink (Secondary)
  - All Modes: #F7A8B8
  - Hover (Light): #F59BB0
  - Hover (Dark):  #F9B0C2

Neutral / Supporting
- Light Theme Background: #ffffff
- Light Text: #111827
- Muted Text: #6b7280
- Light Border: #e5e7eb

- Dark Theme Background: #121212
- Dark Text: #f3f4f6
- Dark Muted: #d1d5db
- Dark Border: #374151

Semantic Colors
- Success: #10b981
- Error:   #ef4444
- Warning: #F7A8B8
- Info:    #55CDFC

Gray Scale (extended)
- gray-50:  #f9fafb
- gray-100: #f3f4f6
- gray-200: #e5e7eb
- gray-300: #d1d5db
- gray-400: #9ca3af
- gray-500: #6b7280
- gray-600: #4b5563
- gray-700: #374151
- gray-800: #1f2937
- gray-900: #111827

Code-friendly colour tokens (TypeScript)
```ts
// src/styles/tokens.css.ts
export const colors = {
  brand: {
    light: "#55CDFC",
    dark:  "#7DD3FC",
    hoverLight: "#3BB5E8",
    hoverDark:  "#93DAFF",
  },
  accent: {
    pink: "#F7A8B8",
    pinkHoverLight: "#F59BB0",
    pinkHoverDark:  "#F9B0C2",
  },
  bg: {
    light: "#ffffff",
    dark:  "#121212",
  },
  text: {
    light: "#111827",
    dark:  "#f3f4f6",
  },
  border: {
    light: "#e5e7eb",
    dark:  "#374151",
  },
  neutral: {
    muted: "#6b7280",
  },
  // semantic
  success: "#10b981",
  error:   "#ef4444",
  info:    "#55CDFC",
  warning: "#F7A8B8",
};
```

Typography, for quick reference
```ts
// fonts
export const typography = {
  fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto',
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

WCAG-friendly tones
- Light: ensure contrast > 4.5:1 (text vs background)
- Dark: ensure contrast > 7:1 for body text, higher for headlines

---

## 3) Typography

- Font: Inter (or your preferred clean sans)
- Sizes: xs → 0.75rem, base → 1rem, up to 5xl
- Weights: normal 400, medium 500, semibold 600, bold 700
- Usage examples provided with Vanilla Extract + Sprinkles

Code example (inline + Sprinkles)
```tsx
import { style } from "@vanilla-extract/css";
import { sprinkles } from "./styles/sprinkles.css";

const heading = style({
  fontSize: typography.sizes["2xl"],
  fontWeight: typography.weights.semibold,
  color: "var(--text-color)",
});
```

---

## 4) Spacing & Layout

Spacing scale (typical, mobile-first)
```ts
{
  "0": "0",
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "8": "32px",
  "10": "40px",
  "12": "48px",
  "16": "64px",
  "20": "80px",
  "24": "96px",
}
```

Border Radius
```ts
{
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
}
```

Shadows
```ts
{
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
}
```

Breakpoints (mobile-first)
```ts
{
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
}
```

Sprinkles usage (spacing)
```tsx
import { sprinkles } from "./styles/sprinkles.css";

<div className={sprinkles({ padding: "md", margin: "lg", gap: "sm" })}>
  Content
</div>
```

---

## 5) Theme System

Theme contract
```ts
export const vars = createThemeContract({
  color: { bg: null, text: null, border: null, brand: null, accent: null, muted: null },
  space: { xs: null, sm: null, md: null, lg: null },
  radius: { sm: null, md: null, lg: null },
});
```

Light Theme (brand-aware)
```ts
export const lightTheme = createTheme(vars, {
  color: {
    bg: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    brand: "#55CDFC",  // Trans pride blue
    accent: "#F7A8B8", // Trans pride pink
    border: "#e5e7eb",
  },
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
  radius: { sm: "4px", md: "8px", lg: "12px" },
});
```

Dark Theme
```ts
export const darkTheme = createTheme(vars, {
  color: {
    bg: "#121212",
    text: "#f3f4f6",
    muted: "#d1d5db",
    brand: "#7DD3FC",
    accent: "#F7A8B8",
    border: "#374151",
  },
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
  radius: { sm: "4px", md: "8px", lg: "12px" },
});
```

Applying themes (example)
```tsx
import { lightTheme, darkTheme } from "./styles/theme.css";

document.documentElement.className = lightTheme; // or darkTheme

// Use vars in components
import { vars } from "./styles/theme.css";
import { style } from "@vanilla-extract/css";

const card = style({
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  borderColor: vars.color.border,
  borderRadius: vars.radius.md,
  padding: vars.space.md,
});
```

---

## 6) Layout & Structure

Main App Layout (flex column)
```tsx
<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
  <a href="#main-content" className="visually-hidden-focusable">Skip to main content</a>

  <NavBar />
  <Container id="main-content" className="py-4" style={{ flex: 1 }}>
    {/* Page content */}
  </Container>

  <Footer />
</div>
```

Page patterns
- Hero Section
- Filter/Controls (Bootstrap grid)
- Responsive Card Grid
- Card with Image
- Dashboard Layout (cards with stats)

Example: Responsive Card Grid
```tsx
<Row xs={1} sm={2} md={3} lg={4} className="g-4">
  {items.map((item) => (
    <Col key={item.id}>
      <Card className="h-100 shadow-sm"> {/* content */} </Card>
    </Col>
  ))}
</Row>
```

Navigation & Footer
- Theme-aware backgrounds
- Active states in Trans Pride pink
- Accessible focus states

---

## 7) Component Patterns

Buttons
- Primary (Trans Pride Blue)
- Secondary (Trans Pride Pink)

Light mode primary
```css
.btn-primary {
  background-color: #55CDFC;
  border-color: #55CDFC;
  color: #0a0a0a;
  font-weight: 600;
}
.btn-primary:hover { background-color: #3BB5E8; border-color: #3BB5E8; }
```

Dark mode primary
```css
.btn-primary {
  background-color: #7DD3FC;
  border-color: #7DD3FC;
  color: #0a0a0a;
}
```

Secondary button
```css
.btn-secondary {
  background-color: #F7A8B8;
  border-color: #F7A8B8;
  color: #0a0a0a;
  font-weight: 600;
}
.btn-secondary:hover { background-color: #F59BB0; border-color: #F59BB0; }
```

Form Inputs
```css
.form-control:focus,
.form-select:focus {
  border-color: #55CDFC;
  box-shadow: 0 0 0 0.25rem rgba(85, 205, 252, 0.25);
  outline: 2px solid #55CDFC;
}
```

Navigation Links
```css
.nav-link:hover { background-color: #F7A8B8; color: #fff; border-radius: 4px; }
.nav-link:focus-visible { outline: 3px solid #F7A8B8; outline-offset: 2px; border-radius: 4px; }
```

Alerts & Loading
```tsx
<Alert variant="danger" className="d-flex align-items-center justify-content-between">
  <div>Error message</div>
  <Button size="sm" variant="outline-light" onClick={handleRetry}>Retry</Button>
</Alert>

<div className="d-flex justify-content-center align-items-center py-5">
  <Spinner animation="border" role="status" className="text-primary" />
  <span className="ms-3">Loading message...</span>
</div>
```

Cards (light/dark)
```css
.card { background-color: #ffffff; border-color: #e5e7eb; color: #111827; border-radius: 8px; }
.dark .card { background-color: #1f2937; border-color: #374151; color: #f3f4f6; }
```

---

## 8) Animation Patterns

Framer Motion for transitions
- Page Transitions
```tsx
import { motion } from "framer-motion";

<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
  {/* Page content */}
</motion.div>
```

- Fade In Up
```tsx
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

<motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
  {/* Content */}
</motion.div>
```

- Hover lift
```tsx
<motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
  <Card> {/* Card content */} </Card>
</motion.div>
```

- Theme Toggle
```tsx
<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme}>
  {theme === "light" ? <MdDarkMode /> : <MdLightMode />}
</motion.button>
```

- Reduced Motion
```tsx
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

<motion.div animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}>
  {/* Content */}
</motion.div>
```

---

## 9) Accessibility Features

- Contrast: WCAG AA targets (light/dark modes)
- Focus indicators: clear keyboard focus rings
- Skip-to-content: visible for keyboard users
- Reduced Motion: respect user system preference
- Semantic HTML: appropriate headings, lists, buttons, and ARIA where needed

High contrast helpers (example)
```ts
export const highContrast = style({});
globalStyle(`html.${highContrast}`, {
  filter: "contrast(1.5) brightness(1.1)",
});
```

Font size preferences
- Small: 0.875rem
- Medium: 1rem (default)
- Large: 1.125rem

---

## 10) Implementation Guide

Step 1: Install dependencies
```bash
npm install @vanilla-extract/css @vanilla-extract/sprinkles framer-motion
# or
yarn add @vanilla-extract/css @vanilla-extract/sprinkles framer-motion
```

Step 2: Design tokens
```ts
// src/styles/tokens.css.ts
export const tokens = {
  space: { "0": "0", "1": "4px", "2": "8px", "4": "16px", "6": "24px", "8": "32px", "10": "40px" },
  colors: {
    brand: "#55CDFC",
    brandDark: "#7DD3FC",
    brandHover: "#3BB5E8",
    accent: "#F7A8B8",
    accentHover: "#F59BB0",
    bg: { light: "#ffffff", dark: "#121212" },
    text: { light: "#111827", dark: "#f3f4f6" },
    border: { light: "#e5e7eb", dark: "#374151" },
    muted: "#6b7280",
    success: "#10b981",
    error: "#ef4444",
    info: "#55CDFC",
    warning: "#F7A8B8",
  },
  radius: { sm: "4px", md: "8px", lg: "12px" },
};
```

Step 3: Theme contract
```ts
// src/styles/theme.css.ts
import { createTheme, createThemeContract } from "@vanilla-extract/css";

export const vars = createThemeContract({
  color: { bg: null, text: null, border: null, brand: null, accent: null, muted: null },
  space: { xs: null, sm: null, md: null, lg: null },
  radius: { sm: null, md: null, lg: null },
});

export const lightTheme = createTheme(vars, {
  color: {
    bg: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    brand: "#55CDFC",
    accent: "#F7A8B8",
    border: "#e5e7eb",
  },
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
  radius: { sm: "4px", md: "8px", lg: "12px" },
});

export const darkTheme = createTheme(vars, {
  color: {
    bg: "#121212",
    text: "#f3f4f6",
    muted: "#d1d5db",
    brand: "#7DD3FC",
    accent: "#F7A8B8",
    border: "#374151",
  },
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
  radius: { sm: "4px", md: "8px", lg: "12px" },
});
```

Step 4: Sprinkles utilities
```ts
// src/styles/sprinkles.css.ts
import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles";
import { tokens } from "./tokens.css";

const spaceProperties = defineProperties({
  properties: {
    padding: tokens.space,
    margin: tokens.space,
    gap: tokens.space,
  },
});

export const sprinkles = createSprinkles(spaceProperties);
```

Step 5: Build tool integration (Vite)
```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
});
```

Step 6: Theme application in app
```tsx
import { useEffect, useState } from "react";
import { lightTheme, darkTheme } from "./styles/theme.css";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.className = theme === "light" ? lightTheme : darkTheme;
  }, [theme]);

  return <div>Your app</div>;
}
```

Step 7: Brand customization
- Replace brand and accent tokens with your brand colors
- Re-check contrast and accessibility
- Update theme overrides accordingly

---

## 11) Bootstrap Integration

If you use Bootstrap with this system:
1. Import Bootstrap CSS
2. Import bootstrap-dark-overrides.css
3. Use data-bs-theme on the root

```tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/bootstrap-dark-overrides.css";

document.documentElement.setAttribute("data-bs-theme", "dark");
```

---

## 12) Best Practices

- Always use theme variables (no hard-coded colours)
- Test WCAG contrast (AA or higher as needed)
- Include dark mode variants
- Prefer Sprinkles for spacing and layout
- Ensure type safety across tokens
- Prioritize accessibility in all components

---

## 13) Resources

- Vanilla Extract: https://vanilla-extract.style/
- Sprinkles: https://vanilla-extract.style/documentation/packages/sprinkles/
- WCAG Contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

---


Happy styling! 🎨✨
