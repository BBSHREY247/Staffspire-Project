---
name: StaffSpire
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424656'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d6'
  primary: '#0050cb'
  on-primary: '#ffffff'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#565a5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#6f7274'
  on-tertiary-container: '#f6f8fa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-tablet: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is engineered to evoke a sense of institutional stability blended with cutting-edge agility. Targeting mid-to-large scale enterprise HR departments, the aesthetic prioritizes clarity, high-speed information density, and a "premium utility" feel. 

The style is **Modern SaaS**, drawing inspiration from the precision of developer tools like Linear and the refined layering of Stripe. It utilizes a **Glassmorphic** elevation model to maintain a sense of depth and context, while high-quality whitespace ensures that complex HR data remains digestible and unintimidating. The visual narrative is one of "Invisible Infrastructure"—a tool that feels powerful yet disappears to let the user's work take center stage.

## Colors

The palette centers on a pristine **White (#FFFFFF)** foundation to ensure maximum readability and a clean "canvas" feel. 

- **Primary:** Vibrant Blue (#0066FF) is used exclusively for primary actions, focus states, and progress indicators, providing a clear path for user intent.
- **Secondary:** Deep Navy (#0F172A) provides grounding and authority, used primarily for text, iconography, and heavy side navigation components.
- **Tertiary/Surfaces:** A range of soft grays (Slate 50-100) are utilized to define layout containers and background contrasts without creating visual noise.
- **Accents:** Functional colors for success, error, and warning should be desaturated to maintain the professional, understated atmosphere of the enterprise environment.

## Typography

The design system relies on **Inter** for its entire type scale, leveraging its systematic, utilitarian nature to provide exceptional legibility across dense data tables and complex forms. 

Tighten letter spacing for larger display sizes to create a "locked-in" editorial look. For body text, maintain standard spacing to maximize readability during long periods of use. Use `label-sm` in all-caps for metadata and secondary headers to create visual hierarchy without increasing font size.

## Layout & Spacing

This design system uses a **fluid-to-fixed grid** hybrid. Main dashboard views utilize a 12-column fluid grid with 24px gutters to accommodate varying monitor sizes, but content containers are capped at 1440px to prevent excessive line lengths.

The spacing rhythm is built on a **4px base unit**. Dashboards should feel spacious, utilizing large internal paddings (32px - 48px) within primary cards to denote distinct functional areas. On mobile, the layout collapses to a single column, and padding is reduced to 16px to maximize the utility of the smaller viewport.

## Elevation & Depth

Elevation is achieved through a combination of **Glassmorphism** and soft, multi-layered shadows. 

- **Surface Layers:** Main background is solid white. Secondary containers use a subtle tint (#F8FAFC) with a 1px border (#E2E8F0).
- **Glass Effects:** Overlays such as modals, dropdowns, and sticky headers must use a backdrop-blur (minimum 12px) and semi-transparent white background (80% opacity). 
- **Shadows:** Use "Ambient Shadows"—extremely low-opacity (2-4%) Navy tints with a large spread (20px-40px) to simulate natural light rather than digital "glow." This creates a sense of the interface floating above the canvas.

## Shapes

The design system embraces a generous roundedness to soften the corporate nature of HRIS software. All primary containers and cards use a **16px radius (rounded-lg)**. Secondary elements like input fields and buttons use **8px (rounded-md)** to maintain a sense of precision within the larger, softer layout containers. This contrast between the "macro" softness and "micro" sharpness creates a modern, balanced silhouette.

## Components

- **Buttons:** Primary buttons use a solid vibrant blue with white text. Hover states should transition to a slightly darker navy. Tertiary buttons are ghost-styled with no border, appearing as simple text until interaction.
- **Input Fields:** Use a subtle 1px border (#E2E8F0) and a soft gray background (#F8FAFC). On focus, the border transitions to vibrant blue with a 3px soft-blue outer glow.
- **Cards:** Cards are the primary unit of the layout. They feature 16px corner radii, a subtle 1px border, and a faint ambient shadow. Internal padding should be a minimum of 24px.
- **Chips/Badges:** Used for status indicators (e.g., "Active," "Onboarding"). Use a "Pill" shape (fully rounded) with a low-opacity background fill of the status color (e.g., 10% green for "Active").
- **Lists & Tables:** Rows should have high horizontal padding and a subtle hover state (#F8FAFC). Avoid vertical borders between columns; use alignment and whitespace to define columns instead.
- **Glass Modals:** Center-screen overlays must feature a significant backdrop blur to maintain focus on the task while keeping the dashboard context visible.