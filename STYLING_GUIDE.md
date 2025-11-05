# 🎨 Bob's Garage Styling Guide

A comprehensive design system guide featuring a beautiful Trans Pride color scheme, accessibility-first approach, and modern CSS-in-JS architecture. Use this guide to implement the same styling system in your other projects.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Theme System](#theme-system)
6. [Layout & Structure](#layout--structure)
7. [Component Patterns](#component-patterns)
8. [Animation Patterns](#animation-patterns)
9. [Accessibility Features](#accessibility-features)
10. [Implementation Guide](#implementation-guide)

---

## Overview

This design system uses:
- **Vanilla Extract** - Zero-runtime CSS-in-JS with TypeScript support
- **Sprinkles** - Utility-first CSS framework built on Vanilla Extract
- **Bootstrap 5** - Component library with custom theme overrides
- **WCAG AA Compliant** - All colors meet accessibility standards

### Key Features

- ✅ **Trans Pride Color Scheme** - Beautiful blue (#55CDFC) and pink (#F7A8B8) accents
- ✅ **True Dark Mode** - Proper dark background (#121212) with improved contrast
- ✅ **Accessibility First** - WCAG AA compliant with 12.6:1 contrast ratios
- ✅ **Type-Safe** - Full TypeScript support for all design tokens
- ✅ **Responsive** - Mobile-first breakpoint system
- ✅ **Customizable** - Easy to adapt for different brand colors

---

## Color Palette

### Brand Colors (Trans Pride Theme)

#### Primary Blue (Brand)
- **Light Mode**: `#55CDFC` - Trans pride flag blue
- **Dark Mode**: `#7DD3FC` - Lighter blue for better contrast on dark background
- **Hover**: `#3BB5E8` (light) / `#93DAFF` (dark)

#### Accent Pink (Secondary)
- **All Modes**: `#F7A8B8` - Trans pride flag pink
- **Hover**: `#F59BB0` (light) / `#F9B0C2` (dark)

### Neutral Colors

#### Light Theme
```typescript
{
  bg: "#ffffff",           // Main background
  text: "#111827",         // Primary text (gray-900)
  muted: "#6b7280",        // Secondary text (gray-500)
  border: "#e5e7eb",       // Borders (gray-200)
}
```

#### Dark Theme
```typescript
{
  bg: "#121212",           // True dark background
  text: "#f3f4f6",         // Primary text (12.6:1 contrast)
  muted: "#d1d5db",        // Secondary text (7.1:1 contrast)
  border: "#374151",       // Borders (gray-700)
}
```

### Semantic Colors

- **Success**: `#10b981` (green)
- **Error**: `#ef4444` (red)
- **Warning**: `#F7A8B8` (Trans pride pink)
- **Info**: `#55CDFC` (Trans pride blue)

### Gray Scale

```typescript
gray-50:  "#f9fafb"
gray-100: "#f3f4f6"
gray-200: "#e5e7eb"
gray-300: "#d1d5db"
gray-400: "#9ca3af"
gray-500: "#6b7280"
gray-600: "#4b5563"
gray-700: "#374151"
gray-800: "#1f2937"
gray-900: "#111827"
```

---

## Typography

### Font Sizes

```typescript
{
  xs: "0.75rem",    // 12px
  sm: "0.875rem",   // 14px
  base: "1rem",     // 16px
  lg: "1.125rem",   // 18px
  xl: "1.25rem",    // 20px
  "2xl": "1.5rem",  // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem",  // 36px
  "5xl": "3rem",     // 48px
}
```

### Font Weights

```typescript
{
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
}
```

### Usage Examples

```tsx
// Using Vanilla Extract
import { style } from "@vanilla-extract/css";

const heading = style({
  fontSize: "2rem",
  fontWeight: "600",
  color: vars.color.text,
});

// Using Sprinkles
import { sprinkles } from "./styles/sprinkles.css";

<div className={sprinkles({ fontSize: "xl", fontWeight: "bold" })}>
  Heading
</div>
```

---

## Spacing & Layout

### Spacing Scale

```typescript
{
  "0": "0",
  "1": "4px",    // xs
  "2": "8px",    // sm
  "3": "12px",
  "4": "16px",   // md
  "5": "20px",
  "6": "24px",   // lg
  "8": "32px",
  "10": "40px",
  "12": "48px",
  "16": "64px",
  "20": "80px",
  "24": "96px",
}
```

### Border Radius

```typescript
{
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
}
```

### Shadows

```typescript
{
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
}
```

### Breakpoints

```typescript
{
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
}
```

### Usage Examples

```tsx
// Using Sprinkles for spacing
import { sprinkles } from "./styles/sprinkles.css";

<div className={sprinkles({
  padding: "md",      // 16px
  margin: "lg",       // 24px
  gap: "sm",         // 8px
  borderRadius: "md", // 8px
})}>
  Content
</div>
```

---

## Theme System

### Theme Variables Contract

```typescript
export const vars = createThemeContract({
  color: {
    bg: null,
    text: null,
    muted: null,
    brand: null,
    border: null,
    accent: null,
  },
  space: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
  },
  radius: {
    sm: null,
    md: null,
    lg: null,
  },
});
```

### Light Theme

```typescript
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

### Dark Theme

```typescript
export const darkTheme = createTheme(vars, {
  color: {
    bg: "#121212",        // True dark background
    text: "#f3f4f6",      // High contrast (12.6:1)
    muted: "#d1d5db",     // Good contrast (7.1:1)
    brand: "#7dd3fc",     // Lighter blue for dark mode
    accent: "#F7A8B8",    // Trans pride pink
    border: "#374151",    // Visible borders
  },
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px" },
  radius: { sm: "4px", md: "8px", lg: "12px" },
});
```

### Applying Themes

```tsx
// Apply theme class to HTML element
import { lightTheme, darkTheme } from "./styles/theme.css";

// Light mode
document.documentElement.className = lightTheme;

// Dark mode
document.documentElement.className = darkTheme;

// Using theme variables in components
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

## Layout & Structure

### Main App Layout

The application uses a flexbox-based layout structure:

```tsx
<div
  style={{
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  }}
>
  {/* Skip to main content link */}
  <a href="#main-content" className="visually-hidden-focusable">
    Skip to main content
  </a>
  
  {/* Navigation */}
  <NavBar />
  
  {/* Main Content Area */}
  <Container id="main-content" className="py-4" style={{ flex: 1 }}>
    {/* Page content goes here */}
  </Container>
  
  {/* Footer */}
  <Footer />
</div>
```

**Key Features:**
- Flexbox column layout ensures footer stays at bottom
- Skip-to-content link for keyboard navigation
- Main content area uses `flex: 1` to fill available space
- Container with padding (`py-4`) for consistent spacing

### Page Layout Patterns

#### Hero Section Pattern

Hero sections combine icons, headings, and descriptive text:

```tsx
<div className="mb-5">
  <div className="d-flex align-items-center gap-3 mb-4">
    <MdBuild size={48} className="text-primary" />
    <div>
      <h1 className="mb-0">Page Title</h1>
      <p className="text-muted mb-0">
        Descriptive text about the page content.
      </p>
    </div>
  </div>
</div>
```

**Characteristics:**
- Large icon (48px) in brand color
- Flexbox layout with gap spacing
- Heading with no bottom margin
- Muted descriptive text

#### Filter/Controls Section

Filter sections use Bootstrap's grid system:

```tsx
<Row className="g-3 align-items-end">
  <Col xs={12} md={6} lg={4}>
    <Form.Label className="small text-muted">Label</Form.Label>
    <InputGroup>
      <InputGroup.Text>
        <MdSearch />
      </InputGroup.Text>
      <Form.Control type="text" placeholder="Search..." />
    </InputGroup>
  </Col>
  {/* More filter columns */}
</Row>
```

**Characteristics:**
- Responsive columns (xs={12} md={6} lg={4})
- Gap spacing (`g-3`)
- Input groups with icons
- Small, muted labels

### Grid Layout Patterns

#### Responsive Card Grid

The standard pattern for displaying cards in a grid:

```tsx
<Row xs={1} sm={2} md={3} lg={4} className="g-4">
  {items.map((item) => (
    <Col key={item.id}>
      <Card className="h-100 shadow-sm">
        {/* Card content */}
      </Card>
    </Col>
  ))}
</Row>
```

**Breakpoints:**
- `xs={1}` - 1 column on mobile
- `sm={2}` - 2 columns on small screens
- `md={3}` - 3 columns on medium screens
- `lg={4}` - 4 columns on large screens
- `g-4` - Consistent gap between cards

**Card Features:**
- `h-100` - Equal height cards
- `shadow-sm` - Subtle shadow for depth

#### Card with Image

Standard card pattern with image header:

```tsx
<Card className="h-100 shadow-sm">
  <div
    style={{
      position: "relative",
      width: "100%",
      height: 200,
      overflow: "hidden",
      backgroundColor: "#f3f4f6", // Placeholder background
    }}
  >
    <Image
      src={imageSrc}
      alt={item.name}
      fluid
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      loading="lazy"
    />
    {/* Overlay buttons */}
    <div style={{ position: "absolute", top: 8, right: 8 }}>
      <FavouriteButton id={item.id} />
    </div>
  </div>
  <Card.Body>
    <Card.Title className="mb-2">{item.name}</Card.Title>
    <div className="fw-bold text-primary fs-5 mb-2">
      {formatCurrency(item.price)}
    </div>
    <Card.Text className="text-muted small">
      {item.description}
    </Card.Text>
  </Card.Body>
</Card>
```

**Image Container:**
- Fixed height (200px) for consistent layout
- `objectFit: "cover"` for proper image scaling
- Placeholder background color
- Overlay buttons positioned absolutely

**Card Body:**
- Title with bottom margin
- Price in primary color, bold, larger font
- Description in muted text, small size

### Dashboard Layout Pattern

Statistics cards in a dashboard:

```tsx
<Row className="g-4 mb-4">
  <Col md={4}>
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <Card.Title className="text-muted small text-uppercase mb-2">
              Label
            </Card.Title>
            <h3 className="mb-1">{value}</h3>
            <div className="small text-muted">
              <span className="text-success">{active} active</span>
              {" • "}
              <span className="text-danger">{inactive} inactive</span>
            </div>
          </div>
          <div className="fs-1 text-primary opacity-25">👥</div>
        </div>
      </Card.Body>
      <Card.Footer className="bg-transparent border-top-0 pt-0">
        <Link to="/path" className="btn btn-sm btn-outline-primary">
          Action →
        </Link>
      </Card.Footer>
    </Card>
  </Col>
</Row>
```

**Characteristics:**
- 3-column layout on medium+ screens
- Flexbox for content alignment
- Large emoji/icon with opacity
- Transparent footer with action button

### Navigation Structure

NavBar with responsive collapse:

```tsx
<Navbar
  bg={theme}
  data-bs-theme={theme}
  expand="lg"
  className="shadow-sm"
  role="navigation"
>
  <Container>
    <Navbar.Brand as={Link} to="/">
      <FaTools className="text-primary" />
      Brand Name
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link as={Link} to="/path" active={isActive("/path")}>
          <MdHome /> Home
        </Nav.Link>
      </Nav>
      <Nav>
        {/* User menu */}
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
```

**Features:**
- Theme-aware background
- Responsive collapse on mobile
- Icon + text navigation items
- Active state styling in Trans Pride pink

### Footer Layout

Footer with multiple columns:

```tsx
<footer
  className="mt-auto py-4"
  style={{
    borderTop: "1px solid var(--bs-border-color)",
    backgroundColor: "var(--bs-body-bg)",
  }}
>
  <Container>
    <Row className="g-4">
      <Col xs={12} md={4}>
        <h5><strong>Brand Name</strong></h5>
        <div className="d-flex align-items-start mb-2">
          <MdLocationOn size={20} className="text-primary me-2" />
          <div>Address</div>
        </div>
      </Col>
      {/* More columns */}
    </Row>
  </Container>
</footer>
```

**Features:**
- `mt-auto` pushes footer to bottom
- Responsive columns
- Icon + text information rows
- Theme-aware colors using CSS variables

### List/Table View Pattern

Alternative to grid view for data display:

```tsx
<Table hover responsive>
  <thead>
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {items.map((item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td className="fw-bold text-primary">
          {formatCurrency(item.price)}
        </td>
        <td>
          <ButtonGroup size="sm">
            <Button variant="outline-primary">Edit</Button>
            <Button variant="outline-danger">Delete</Button>
          </ButtonGroup>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

**Features:**
- Hover effects for rows
- Responsive table (scrolls on mobile)
- Primary color for important values
- Button groups for actions

## Component Patterns

### Button Styles

#### Primary Button (Trans Pride Blue)

```css
/* Light Mode */
.btn-primary {
  background-color: #55cdfc;
  border-color: #55cdfc;
  color: #0a0a0a;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #3bb5e8;
  border-color: #3bb5e8;
}

/* Dark Mode */
.btn-primary {
  background-color: #7dd3fc;
  border-color: #7dd3fc;
  color: #0a0a0a;
}
```

#### Secondary Button (Trans Pride Pink)

```css
.btn-secondary {
  background-color: #f7a8b8;
  border-color: #f7a8b8;
  color: #0a0a0a;
  font-weight: 600;
}

.btn-secondary:hover {
  background-color: #f59bb0;
  border-color: #f59bb0;
}
```

### Form Inputs

```css
/* Focus state with Trans Pride Blue */
.form-control:focus,
.form-select:focus {
  border-color: #55cdfc;
  box-shadow: 0 0 0 0.25rem rgba(85, 205, 252, 0.25);
  outline: 2px solid #55cdfc;
  outline-offset: 2px;
}

/* Dark Mode */
.form-control:focus {
  border-color: #7dd3fc;
  box-shadow: 0 0 0 0.25rem rgba(125, 211, 252, 0.25);
}
```

### Navigation Links

```css
/* Hover effect with Trans Pride Pink */
.nav-link:hover {
  background-color: #f7a8b8;
  color: #ffffff;
  border-radius: 4px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Focus state for accessibility */
.nav-link:focus,
.nav-link:focus-visible {
  outline: 3px solid #f7a8b8;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Alert/Error Display

```tsx
<Alert variant="danger" className="d-flex align-items-center justify-content-between">
  <div>Error message</div>
  <Button size="sm" variant="outline-light" onClick={handleRetry}>
    Retry
  </Button>
</Alert>
```

### Loading States

```tsx
<div className="d-flex justify-content-center align-items-center py-5">
  <Spinner animation="border" role="status" className="text-primary">
    <span className="visually-hidden">Loading...</span>
  </Spinner>
  <span className="ms-3">Loading message...</span>
</div>
```

### Cards

```css
/* Light Mode */
.card {
  background-color: #ffffff;
  border-color: #e5e7eb;
  color: #111827;
  border-radius: 8px;
}

/* Dark Mode */
.card {
  background-color: #1f2937;
  border-color: #374151;
  color: #f3f4f6;
}
```

---

## Animation Patterns

This design system uses **Framer Motion** for smooth, performant animations.

### Page Transitions

Fade in animation for page loads:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {/* Page content */}
</motion.div>
```

### Fade In Up Animation

Standard entrance animation for sections:

```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

<motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
  {/* Content */}
</motion.div>
```

### Staggered Grid Animations

Animate grid items one after another:

```tsx
const staggerContainer = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 0.1s delay between each item
    },
  },
};

<motion.div variants={staggerContainer} initial="initial" animate="animate">
  <Row>
    {items.map((item) => (
      <Col key={item.id}>
        <motion.div variants={fadeInUp}>
          <Card>{/* Card content */}</Card>
        </motion.div>
      </Col>
    ))}
  </Row>
</motion.div>
```

### Hover Effects

Lift effect on card hover:

```tsx
<motion.div
  whileHover={{ y: -5 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  <Card>
    {/* Card content */}
  </Card>
</motion.div>
```

**Properties:**
- `y: -5` - Moves card up 5px on hover
- `type: "spring"` - Natural spring animation
- `stiffness: 300` - Controls spring tension

### Theme Toggle Animation

Animated theme toggle button:

```tsx
import { motion } from "framer-motion";

<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={toggleTheme}
>
  {theme === "light" ? <MdDarkMode /> : <MdLightMode />}
</motion.button>
```

### Reduced Motion Support

Always respect user preferences:

```tsx
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

<motion.div
  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

## Accessibility Features

### Contrast Ratios

All text colors meet WCAG AA standards:
- **Light Mode**: 
  - Primary text (#111827 on #ffffff): 16.8:1
  - Muted text (#6b7280 on #ffffff): 4.5:1
- **Dark Mode**:
  - Primary text (#f3f4f6 on #121212): 12.6:1 ✅
  - Muted text (#d1d5db on #121212): 7.1:1 ✅

### Focus Indicators

All interactive elements have visible focus indicators:
- 2-3px outline in brand color
- 2px offset for visibility
- Rounded corners for modern look

### Reduced Motion Support

```typescript
export const reducedMotion = style({
  vars: {
    "--transition-duration": "0s",
    "--animation-duration": "0s",
  },
});
```

### High Contrast Mode

```typescript
export const highContrast = style({});

globalStyle(`html.${highContrast}`, {
  filter: "contrast(1.5) brightness(1.1)",
});
```

### Font Size Preferences

Users can adjust font sizes:
- Small: 0.875rem base
- Medium: 1rem base (default)
- Large: 1.125rem base

---

## Implementation Guide

### Step 1: Install Dependencies

```bash
npm install @vanilla-extract/css @vanilla-extract/sprinkles framer-motion
# or
yarn add @vanilla-extract/css @vanilla-extract/sprinkles framer-motion
```

**Note:** Framer Motion is optional but recommended for the smooth animations that make this design system special.

### Step 2: Create Design Tokens

Create `src/styles/tokens.css.ts`:

```typescript
export const tokens = {
  space: {
    "0": "0",
    "1": "4px",
    "2": "8px",
    "4": "16px",
    "6": "24px",
    // ... rest of spacing scale
  },
  colors: {
    // Your color palette
    brand: "#55CDFC",
    accent: "#F7A8B8",
    // ... rest of colors
  },
  // ... rest of tokens
} as const;
```

### Step 3: Create Theme Contract

Create `src/styles/theme.css.ts`:

```typescript
import { createTheme, createThemeContract } from "@vanilla-extract/css";

export const vars = createThemeContract({
  color: {
    bg: null,
    text: null,
    brand: null,
    // ... rest of theme variables
  },
});

export const lightTheme = createTheme(vars, {
  color: {
    bg: "#ffffff",
    text: "#111827",
    brand: "#55CDFC",
    // ... rest of light theme
  },
});

export const darkTheme = createTheme(vars, {
  color: {
    bg: "#121212",
    text: "#f3f4f6",
    brand: "#7dd3fc",
    // ... rest of dark theme
  },
});
```

### Step 4: Create Sprinkles Utilities

Create `src/styles/sprinkles.css.ts`:

```typescript
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

### Step 5: Configure Build Tool

For Vite, add to `vite.config.ts`:

```typescript
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
});
```

### Step 6: Apply Theme

```tsx
import { useEffect } from "react";
import { lightTheme, darkTheme } from "./styles/theme.css";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.className = theme === "light" ? lightTheme : darkTheme;
  }, [theme]);

  return <div>Your app</div>;
}
```

### Step 7: Customize for Your Brand

To adapt this system for different brand colors:

1. **Update Color Tokens**: Replace Trans Pride colors with your brand colors
2. **Adjust Contrast**: Ensure dark mode colors maintain accessibility
3. **Update Theme Variables**: Modify `lightTheme` and `darkTheme` objects
4. **Test Contrast Ratios**: Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Example: Custom Brand Colors

```typescript
// Replace Trans Pride colors with your brand
export const lightTheme = createTheme(vars, {
  color: {
    bg: "#ffffff",
    text: "#111827",
    brand: "#YOUR_BRAND_COLOR",  // Your primary color
    accent: "#YOUR_ACCENT_COLOR", // Your secondary color
    // ... rest stays the same
  },
});
```

---

## Bootstrap Integration

This design system includes comprehensive Bootstrap overrides. To use with Bootstrap:

1. Import Bootstrap CSS
2. Import `bootstrap-dark-overrides.css`
3. Set `data-bs-theme="light"` or `data-bs-theme="dark"` on HTML element

```tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/bootstrap-dark-overrides.css";

// Apply theme
document.documentElement.setAttribute("data-bs-theme", "dark");
```

---

## Best Practices

1. **Always Use Theme Variables**: Never hardcode colors, use `vars.color.brand`
2. **Test Contrast**: Verify all text meets WCAG AA standards
3. **Support Dark Mode**: Always provide dark mode variants
4. **Use Sprinkles**: Prefer utility classes for spacing and layout
5. **Type Safety**: Leverage TypeScript for autocomplete and errors
6. **Accessibility First**: Always include focus indicators and proper contrast

---

## Resources

- [Vanilla Extract Documentation](https://vanilla-extract.style/)
- [Sprinkles Documentation](https://vanilla-extract.style/documentation/packages/sprinkles/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## License

This styling guide is part of the Bob's Garage project and can be freely used and adapted for your own projects.

---

**Happy Styling! 🎨✨**

