---
name: Executive Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#005a82'
  on-tertiary: '#ffffff'
  tertiary-container: '#0074a6'
  on-tertiary-container: '#e4f2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.55'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for high-performance enterprise HR environments. It balances the authority required for data-sensitive workflows with a contemporary, spacious aesthetic that reduces cognitive load. 

The style is **Corporate Modern** with a strong leaning toward **Minimalism** and **Glassmorphism**. It prioritizes clarity and functional beauty, utilizing significant white space to delineate complex information architectures. The emotional response is one of reliability, efficiency, and calm precision—essential for professionals managing human capital.

## Colors
The palette is rooted in a professional "Enterprise Blue" that signifies trust. The neutral scale is carefully stepped to provide depth without clutter.

- **Primary & Info:** Used for core actions, progress indicators, and active states.
- **Surface & Background:** A clean `#F8FAFC` background provides a soft canvas for pure white `#FFFFFF` cards, creating a natural "lift" effect.
- **Feedback:** Standard semantic colors for Success, Warning, and Danger are used sparingly to ensure critical information commands immediate attention.
- **Borders:** Low-contrast `#E5E7EB` ensures structural integrity without visual noise.

## Typography
This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian, yet refined feel. 

Hierarchy is established primarily through font weight and subtle tracking adjustments on larger headings. Body text is optimized for readability with a generous 1.5x line-height. Labels and small metadata use medium or semi-bold weights to maintain legibility against varying background tones.

## Layout & Spacing
The system employs a strict **8px spacing grid**. Layouts should prioritize breathing room to emphasize the "Spacious" brand pillar.

- **Desktop:** 12-column fluid grid with 24px gutters. Use a maximum container width of 1440px for content-heavy dashboards.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.
- **Alignment:** All elements, including icons and text baselines, must snap to the 8px grid to ensure pixel-perfect harmony.

## Elevation & Depth
Depth is communicated through a mix of **Tonal Layering** and **Ambient Shadows**.

1.  **Level 0 (Background):** `#F8FAFC` - The base canvas.
2.  **Level 1 (Cards/Surface):** `#FFFFFF` - White surfaces with a subtle `1px` border in `#E5E7EB`.
3.  **Level 2 (Dropdowns/Modals):** Elevated with a soft, diffused shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)`.
4.  **Glassmorphism:** Use for persistent navigation or headers: `backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.8);`.

## Shapes
The shape language is "Rounded," utilizing a standard radius of **8px (0.5rem)** for smaller components like inputs and buttons. Large containers and cards should use **16px (1rem)** for a softer, more modern appearance.

Icons should follow suit with rounded terminals and a consistent stroke weight (typically 1.5px or 2px) to match the Inter typeface's geometry.

## Components

- **Buttons:** Primary buttons use the Primary Blue with white text. Hover states should darken the background by 10%. Use "Ghost" variants (borderless) for secondary actions in dense headers.
- **Cards:** Always use the `rounded-lg` (16px) corner radius. Cards should have no shadow when resting on the background, only the subtle `#E5E7EB` border, unless they are interactive (on hover, apply a soft shadow).
- **Inputs:** Fields should be 40px in height (Large) or 32px (Small). Use a 1px border. Focus state must use a 2px Primary Blue ring with a 2px white offset.
- **Chips/Badges:** Use a "Soft" color treatment: a 10% opacity background of the semantic color with 100% opacity text (e.g., Success green text on a very pale green background).
- **Lists & Tables:** Use generous row heights (56px for standard tables). Horizontal dividers only; avoid vertical grid lines to maintain a clean, "Linear-style" look.
- **Icons:** Use Lucide icons exclusively. Ensure icons are optically centered within buttons and maintain a consistent 20px or 24px bounding box.