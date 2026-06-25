# Urban Help - UI/UX Design Specification

## 1. Design System Overview

Urban Help uses a modern, professional design system inspired by platforms like Airtasker, Hipages, and ServiceSeeking. The design prioritizes:

- **Trust**: Professional, clean appearance
- **Simplicity**: Clear hierarchy and intuitive navigation
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile-First**: Optimized for smaller screens first
- **Consistency**: Cohesive visual language across all pages

---

## 2. Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Dark Blue | #003366 | RGB(0, 51, 102) | Primary brand color, headers, CTAs |
| Orange (Accent) | #FF6B35 | RGB(255, 107, 53) | Highlights, alerts, CTAs, interactive elements |
| White | #FFFFFF | RGB(255, 255, 255) | Backgrounds, text on dark |
| Light Grey | #F5F5F5 | RGB(245, 245, 245) | Secondary backgrounds, cards |

### Secondary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Dark Grey | #333333 | RGB(51, 51, 51) | Body text, dark elements |
| Medium Grey | #999999 | RGB(153, 153, 153) | Secondary text, borders |
| Light Blue | #E8F4F8 | RGB(232, 244, 248) | Information backgrounds |
| Success Green | #27AE60 | RGB(39, 174, 96) | Success messages, confirmations |
| Error Red | #E74C3C | RGB(231, 76, 60) | Errors, warnings |
| Warning Orange | #F39C12 | RGB(243, 156, 18) | Warnings, alerts |

### Color Accessibility

- All text has minimum 4.5:1 contrast ratio against backgrounds
- Color not used as sole indicator of information
- Colorblind-friendly palette

---

## 3. Typography

### Font Family
- **Primary**: Inter (sans-serif) - for UI and body text
- **Secondary**: Poppins (sans-serif) - for headings and emphasis
- **Fallback**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, system-ui, sans-serif

### Font Sizes & Weight

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|-----------------|
| **Headings** |
| H1 | 32px | 700 | 1.4 | -0.5px |
| H2 | 28px | 700 | 1.4 | -0.3px |
| H3 | 24px | 600 | 1.4 | 0px |
| H4 | 20px | 600 | 1.4 | 0px |
| H5 | 18px | 600 | 1.4 | 0px |
| H6 | 16px | 600 | 1.4 | 0px |
| **Body** |
| Large | 16px | 400 | 1.6 | 0px |
| Regular | 14px | 400 | 1.6 | 0px |
| Small | 12px | 400 | 1.5 | 0px |
| **Labels** |
| Label | 12px | 500 | 1.5 | 0.5px |
| **Buttons** |
| Button | 14px | 600 | 1.4 | 0px |

### Typography Hierarchy

```
H1: Brand messaging, page titles (Hero section)
H2: Section headings (How It Works, Reviews)
H3: Card titles (Business cards, review titles)
H4: Form sections, sidebar titles
Body Large: Introductory text, important content
Body Regular: Default body text, descriptions
Small: Captions, timestamps, secondary info
Label: Form labels, tags
```

---

## 4. Spacing System

### Base Unit: 8px Grid

All spacing follows a 8px base unit for consistency.

| Value | Pixels | Usage |
|-------|--------|-------|
| xs | 4px | Micro spacing (rarely used) |
| sm | 8px | Small spacing between elements |
| md | 16px | Default padding/margin |
| lg | 24px | Section spacing |
| xl | 32px | Large section spacing |
| 2xl | 48px | Between major sections |
| 3xl | 64px | Between page sections |

### Examples

- Card padding: 16px (md)
- Button padding: 12px vertical, 16px horizontal
- Section gap: 32-48px (xl to 2xl)
- Card gap: 16px (md)

---

## 5. Component Library

### 5.1 Buttons

#### Primary Button
- **Background**: Dark Blue (#003366)
- **Text Color**: White
- **Padding**: 12px 24px
- **Border Radius**: 6px
- **Font Weight**: 600
- **Font Size**: 14px
- **Hover**: Dark Blue slightly darker (#001F4D)
- **Active**: Dark Blue darker (#001633)
- **Disabled**: Light Grey (#999999) background, grey text

#### Secondary Button
- **Background**: Light Grey (#F5F5F5)
- **Text Color**: Dark Blue (#003366)
- **Border**: 1px solid Dark Blue
- **Padding**: 12px 24px
- **Border Radius**: 6px
- **Hover**: Light Blue background
- **Active**: Slightly darker blue background

#### Accent Button (CTA)
- **Background**: Orange (#FF6B35)
- **Text Color**: White
- **Padding**: 12px 24px
- **Border Radius**: 6px
- **Font Weight**: 600
- **Hover**: Darker Orange (#E55A28)
- **Active**: Even darker Orange (#D34A1F)
- **Shadow**: 0 2px 8px rgba(255, 107, 53, 0.3)

#### Button States

| State | Appearance |
|-------|-----------|
| Default | As specified above |
| Hover | Darken background 10%, add subtle shadow |
| Active/Pressed | Darken background 20% |
| Disabled | Grey background, grey text, 50% opacity |
| Loading | Add spinner, disable pointer |
| Focus | Add 2px outline in brand color |

#### Mobile Button Size
- Minimum 48x48px for touch targets
- Padding: 12px 20px for mobile
- Full width on mobile forms

### 5.2 Form Inputs

#### Text Input
- **Height**: 40px (desktop), 44px (mobile)
- **Padding**: 8px 12px
- **Border**: 1px solid Medium Grey (#999999)
- **Border Radius**: 6px
- **Font Size**: 14px
- **Font Color**: Dark Grey (#333333)
- **Placeholder Color**: Medium Grey (#999999)
- **Focus**: 2px outline in Dark Blue, border color to Dark Blue
- **Error**: Border color to Error Red, error text below field

#### Textarea
- **Min Height**: 100px
- **Padding**: 12px
- **Border**: 1px solid Medium Grey
- **Border Radius**: 6px
- **Resize**: Vertical only
- **Font Size**: 14px
- **Line Height**: 1.5

#### Select Dropdown
- **Height**: 40px
- **Padding**: 8px 12px
- **Border**: 1px solid Medium Grey
- **Border Radius**: 6px
- **Font Size**: 14px
- **Arrow Icon**: On right, Dark Blue color

#### Checkbox
- **Size**: 18px x 18px
- **Border Radius**: 4px
- **Border**: 2px solid Medium Grey
- **When Checked**: 
  - **Background**: Dark Blue
  - **Checkmark**: White, centered
- **Focus**: 2px outline in Dark Blue

#### Radio Button
- **Size**: 18px diameter
- **Border**: 2px solid Medium Grey
- **When Selected**:
  - **Border Color**: Dark Blue
  - **Inner Dot**: 6px diameter, Dark Blue
- **Focus**: 2px outline in Dark Blue

#### Toggle Switch
- **Width**: 44px
- **Height**: 24px
- **Border Radius**: 12px
- **Background (off)**: Light Grey (#D5D5D5)
- **Background (on)**: Success Green (#27AE60)
- **Switch**: White, 20px diameter, with transition animation

### 5.3 Cards

#### Business Card (Search Results)
- **Background**: White
- **Padding**: 0 (image takes full width)
- **Border Radius**: 8px
- **Border**: 1px solid Light Grey
- **Box Shadow**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **Hover**: Box shadow 0 4px 12px rgba(0, 0, 0, 0.15), slight scale up (1.02)
- **Transition**: 200ms ease-in-out

#### Card Content Layout
```
┌─────────────────────────────────────┐
│ Distance | Service Type (top right) │
│                                     │
│         [Image - Full Width]        │
│                                     │
│ Business Name (bottom, white text)  │
│ Rating: ★★★★★ X (Y reviews)         │
└─────────────────────────────────────┘
```

#### Profile Card
- **Background**: White
- **Padding**: 24px
- **Border Radius**: 8px
- **Border**: 1px solid Light Grey
- **Box Shadow**: 0 1px 3px rgba(0, 0, 0, 0.08)

### 5.4 Header/Navigation

#### Main Header
- **Height**: 64px (desktop), 56px (mobile)
- **Background**: Dark Blue (#003366)
- **Padding**: 0 32px (desktop), 0 16px (mobile)
- **Position**: Fixed/Sticky at top
- **Z-index**: 100
- **Shadow**: 0 1px 3px rgba(0, 0, 0, 0.1)

#### Logo
- **Height**: 40px (fits in header)
- **Color**: White
- **Font Size**: 20px
- **Font Weight**: 700
- **Letter Spacing**: -0.5px

#### Navigation Links (Desktop)
- **Color**: White
- **Font Size**: 14px
- **Padding**: 8px 16px
- **Hover**: Accent Orange background
- **Active**: Orange underline (2px)

#### Mobile Menu
- **Trigger**: Hamburger icon (3 lines), White, 24px
- **Drawer**: Slide from left, Dark Blue background
- **Width**: 280px or 75% viewport (whichever is smaller)
- **Padding**: 16px
- **Menu Items**: Full width, 12px padding, stacked vertically

### 5.5 Rating Component

#### Star Rating Display
- **Stars**: Orange (#FF6B35) when filled, Light Grey (#D5D5D5) when empty
- **Size**: 16px (search results), 24px (profile)
- **Spacing**: 2px between stars
- **Text**: "4.8 (235 reviews)" in Dark Grey

#### Star Rating Input
- **Size**: 32px per star
- **Cursor**: Pointer
- **Hover**: Stars turn Orange with scale effect (1.1)
- **Click**: Select rating, change to solid Orange
- **Animation**: Smooth 200ms transition

### 5.6 Modal/Dialog

#### Modal Backdrop
- **Background**: rgba(0, 0, 0, 0.5)
- **Blur**: Optional, 2px
- **Animation**: Fade in 200ms

#### Modal Content
- **Background**: White
- **Border Radius**: 12px
- **Padding**: 24px
- **Box Shadow**: 0 8px 24px rgba(0, 0, 0, 0.15)
- **Max Width**: 500px (desktop), 90vw (mobile)
- **Position**: Center of screen
- **Close Button**: Top right, X icon

#### Modal Buttons
- **Alignment**: Right-aligned, stacked vertically on mobile
- **Spacing**: 12px between buttons
- **Primary Action**: Accent button (right)
- **Secondary Action**: Secondary button (left)

### 5.7 Badges & Tags

#### Verified Badge
- **Background**: Light Blue (#E8F4F8)
- **Text Color**: Dark Blue (#003366)
- **Text**: "✓ Verified" or checkmark icon
- **Font Size**: 12px
- **Font Weight**: 600
- **Padding**: 4px 8px
- **Border Radius**: 4px

#### Status Badge
- **Success**: Green background, white text
- **Pending**: Orange background, white text
- **Declined**: Red background, white text
- **Padding**: 6px 12px
- **Border Radius**: 12px
- **Font Size**: 12px
- **Font Weight**: 600

### 5.8 Alerts & Messages

#### Success Alert
- **Background**: #E8F5E9 (light green)
- **Border Left**: 4px solid #27AE60
- **Text Color**: #1B5E20
- **Icon**: Checkmark (green)
- **Padding**: 16px
- **Border Radius**: 6px

#### Error Alert
- **Background**: #FFEBEE (light red)
- **Border Left**: 4px solid #E74C3C
- **Text Color**: #B71C1C
- **Icon**: Error icon (red)
- **Padding**: 16px
- **Border Radius**: 6px

#### Warning Alert
- **Background**: #FFF3E0 (light orange)
- **Border Left**: 4px solid #F39C12
- **Text Color**: #E65100
- **Icon**: Warning icon (orange)
- **Padding**: 16px
- **Border Radius**: 6px

#### Info Alert
- **Background**: #E8F4F8 (light blue)
- **Border Left**: 4px solid #003366
- **Text Color**: #003366
- **Icon**: Info icon (blue)
- **Padding**: 16px
- **Border Radius**: 6px

---

## 6. Responsive Design

### Breakpoints

```css
Mobile: 320px - 600px
Tablet: 600px - 1024px
Desktop: 1024px+
Large Desktop: 1440px+
```

### Mobile-First Approach

1. Design for mobile first (320px+)
2. Add features at tablet breakpoint (600px+)
3. Expand layout at desktop (1024px+)

### Key Responsive Changes

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Header Height | 56px | 60px | 64px |
| Padding | 16px | 20px | 32px |
| Margin | 12px | 16px | 24px |
| Font Size (Body) | 14px | 14px | 16px |
| Button Height | 44px | 40px | 40px |
| Card Layout | 1 col | 1-2 col | 2-3 col |
| Navigation | Menu | Menu | Horizontal |

---

## 7. Interactive States

### Hover States
- Buttons: Darken 10%, add 0 2px 8px shadow
- Links: Underline appears, color to brand
- Cards: Box shadow increases, slight scale up (1.02)

### Active States
- Buttons: Darken 20%, inset shadow
- Links: Color to brand, underline
- Cards: Border color changes to brand

### Focus States
- All interactive elements: 2px outline in brand color, 2px offset
- Keyboard navigation visible (no outline removal)

### Disabled States
- Opacity: 50%
- Cursor: not-allowed
- Color: Grey
- No hover effects

### Loading States
- Show spinner animation (3-second rotation)
- Disable interactions
- Show "Loading..." text
- Skeleton screens for data loading

---

## 8. Animations & Transitions

### Transition Durations
- **Fast**: 150ms (hover effects on small elements)
- **Normal**: 200ms (standard transitions, modals)
- **Slow**: 300ms (page transitions, major layout changes)

### Animation Examples

#### Fade In (Page Load)
```
Opacity: 0 → 1
Duration: 300ms
Easing: ease-in-out
```

#### Slide Up (Content Reveal)
```
Transform: translateY(20px) → translateY(0)
Opacity: 0 → 1
Duration: 300ms
Easing: ease-in-out
```

#### Scale (Button Hover)
```
Transform: scale(1) → scale(1.05)
Duration: 200ms
Easing: ease-out
```

#### Spinner (Loading)
```
Transform: rotate(0deg) → rotate(360deg)
Duration: 3s
Easing: linear
Infinite loop
```

---

## 9. Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast
- Text on background: 4.5:1 minimum
- Large text (18px+ bold): 3:1 minimum
- UI components: 3:1 minimum

#### Keyboard Navigation
- All interactive elements focusable via Tab
- Focus indicators visible (2px outline, 2px offset)
- Tab order logical (left-to-right, top-to-bottom)
- Escape key closes modals
- Enter/Space activates buttons

#### Screen Readers
- ARIA labels for icon buttons
- Form labels associated with inputs
- Alt text for all images
- Semantic HTML (nav, main, aside, article)
- Skip to main content link

#### Mobile Accessibility
- Minimum 48x48px touch targets
- Labels above inputs on mobile
- Large, readable font sizes
- Clear form validation messages

---

## 10. Dark Mode (Future Enhancement)

### Dark Mode Color Scheme

| Light Mode | Dark Mode |
|-----------|-----------|
| White | #1E1E1E (dark bg) |
| Light Grey | #2D2D2D (dark cards) |
| Dark Blue | #4A7BA7 (lighter blue) |
| Dark Grey | #E0E0E0 (light text) |
| Medium Grey | #A0A0A0 (secondary text) |

### Implementation
- CSS custom properties for colors
- `prefers-color-scheme` media query
- User preference toggle in settings
- LocalStorage persistence

---

## 11. Image Guidelines

### Hero Image
- **Size**: 1920x1080px (desktop), 1080x1440px (mobile)
- **Format**: WebP with JPEG fallback
- **Quality**: 75% compression for web
- **Content**: Tradespeople working in professional settings
- **Aspect Ratio**: 16:9 (desktop), 9:16 (mobile)

### Business Profile Images
- **Dimensions**: Square preferred (1:1)
- **Min Size**: 400x400px
- **Max Size**: 2048x2048px
- **Format**: WebP with JPEG fallback
- **Quantity**: 3-10 images per business
- **File Size**: Max 500KB per image
- **CDN Delivery**: CloudFront with image optimization

### Product/Service Images
- **Aspect Ratio**: 3:4 (portrait)
- **Resolution**: 1080x1440px minimum
- **Format**: WebP
- **Optimization**: Lazy loading below fold

### Icon Guidelines
- **Format**: SVG for scalability
- **Size**: 16px, 24px, 32px (multiples of 8)
- **Stroke Width**: 1.5px to 2px
- **Color**: Inherit from text or icon-specific color
- **Consistency**: Unified icon set (e.g., Feather, Material)

---

## 12. Micro-interactions

### Form Validation
- **Error Indicator**: Red border on input, error text below
- **Success Indicator**: Green checkmark on right of input
- **Timing**: Show immediately on blur or after 3 seconds of typing
- **Animation**: Shake animation (20px left-right) for errors

### Search Auto-complete
- **Dropdown**: Appear 200ms after input
- **Highlight**: Matched text bold in suggestions
- **Selection**: Highlight on hover, scroll with arrow keys
- **Animation**: Fade in 150ms

### Loading States
- **Skeleton Screen**: Show placeholder cards while loading
- **Spinner**: 3-second rotation loop
- **Progress Bar**: For multi-step forms (show completion %)

### Empty States
- **Icon**: Large (64px) secondary color icon
- **Title**: "No results found"
- **Description**: "Try adjusting your search criteria"
- **CTA**: "Browse all services" link

---

## 13. Brand Voice & Tone

### Tone
- **Professional**: Expert, knowledgeable
- **Friendly**: Approachable, helpful
- **Trustworthy**: Honest, reliable
- **Clear**: Simple language, no jargon

### Microcopy Examples

| Scenario | Copy |
|----------|------|
| Form Error | "Please enter a valid email address" (not "Invalid email") |
| Empty State | "No bookings yet. Start by searching for a service." |
| Success | "Booking confirmed! Check your email for details." |
| Loading | "Finding nearby professionals..." |
| CTA | "Find a Professional" (action-oriented) |

---

## 14. Performance Optimization

### Lighthouse Targets
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 95+

### Optimization Strategies
- Image compression (WebP format)
- Lazy loading for below-fold images
- Code splitting by route
- CSS-in-JS with automatic critical CSS
- Minimal dependencies
- CDN for static assets

---

## 15. Design Tokens (CSS Variables)

```css
--color-primary: #003366;
--color-accent: #FF6B35;
--color-success: #27AE60;
--color-error: #E74C3C;
--color-warning: #F39C12;
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F5F5F5;
--color-text-primary: #333333;
--color-text-secondary: #999999;

--font-primary: 'Inter', sans-serif;
--font-heading: 'Poppins', sans-serif;

--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-full: 999px;

--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);

--transition-fast: 150ms ease-in-out;
--transition-normal: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Draft
