# UI/UX Audit & Visual Polish Plan
## Restore The Basic - Tube Amp Store

**Date:** December 18, 2025  
**Status:** Comprehensive Audit Complete  
**Priority:** P0 (Critical) → P1 (High Impact) → P2 (Polish)

---

## A) UI Quality Report

### Global Issues Found

#### 1. Typography Consistency ⚠️ P1
**Issues:**
- Inconsistent heading sizes across pages (some use inline styles, some use CSS modules)
- Body text line-height varies (1.5 vs 1.6)
- Missing consistent caption/small text scale
- Some pages use `font-size: 2rem` directly instead of heading classes

**Impact:** Visual hierarchy unclear, feels unprofessional

**Recommendation:** Standardize type scale, enforce via CSS variables

---

#### 2. Spacing Inconsistency ⚠️ P0
**Issues:**
- Mixed use of utility classes (`py-16`) and CSS modules (`margin-bottom: var(--space-xl)`)
- Inconsistent gaps in grids (some use `gap-4`, others `gap: var(--space-lg)`)
- Section padding varies (some `py-16`, some `py-20`, some custom)
- Form field spacing inconsistent

**Impact:** Content feels cramped or too loose, lacks rhythm

**Recommendation:** Enforce spacing scale, audit all pages

---

#### 3. Button Variants Missing ⚠️ P1
**Issues:**
- No `.btn-sm` (small) variant defined in globals.css
- No `.btn-large` variant (referenced but not defined)
- No `.btn-danger` variant (used in admin but not styled)
- Inconsistent button padding across pages

**Impact:** Buttons look inconsistent, especially in admin panel

**Recommendation:** Add missing button variants to globals.css

---

#### 4. Form Input States ⚠️ P1
**Issues:**
- Error states not consistently styled
- Missing disabled state styling
- Focus rings inconsistent (some use box-shadow, some outline)
- Placeholder text color too subtle

**Impact:** Poor accessibility, unclear validation feedback

**Recommendation:** Standardize form states, add error/disabled styles

---

#### 5. Loading States ⚠️ P2
**Issues:**
- Skeleton loaders exist but inconsistently applied
- No loading spinners for async actions
- Button loading states missing (disabled + spinner)
- Page transitions feel abrupt

**Impact:** Perceived performance suffers

**Recommendation:** Add loading components, improve transitions

---

#### 6. Empty States ⚠️ P1
**Issues:**
- Empty cart has good design ✓
- Empty product list missing
- Empty order history missing
- Empty search results missing

**Impact:** Users see blank screens, unclear what to do

**Recommendation:** Create reusable EmptyState component

---

#### 7. Error States ⚠️ P0
**Issues:**
- Error banners inconsistent (some use card, some use div)
- No global error toast system
- Form errors inline but not visually prominent
- API errors sometimes show raw messages

**Impact:** Users confused by errors, poor UX

**Recommendation:** Standardize error display, add toast system

---

#### 8. Status Badges ⚠️ P1
**Issues:**
- Order status badges inconsistent between admin and customer views
- Payment status colors not standardized
- Badge sizes vary (some too small to read)
- Missing semantic colors for all statuses

**Impact:** Status unclear, unprofessional appearance

**Recommendation:** Create StatusBadge component with semantic colors

---

#### 9. Modal/Dialog Consistency ⚠️ P1
**Issues:**
- Cancel order modal uses custom styles
- Change request modal uses custom styles
- Refund modal uses custom styles
- No shared modal component

**Impact:** Inconsistent UX, harder to maintain

**Recommendation:** Create reusable Modal component

---

#### 10. Mobile Responsiveness ⚠️ P0
**Issues:**
- Product detail page grid breaks on tablet (2-column → 1-column too abrupt)
- Cart layout needs better mobile stacking
- Checkout form fields too narrow on mobile
- Admin tables overflow on mobile (no horizontal scroll)

**Impact:** Poor mobile experience, lost conversions

**Recommendation:** Improve breakpoints, add mobile-first patterns

---

### Accessibility Issues ⚠️ P0

1. **Focus States:**
   - Some buttons missing visible focus rings
   - Focus trap missing in modals
   - Skip links missing

2. **Color Contrast:**
   - `--color-text-tertiary` (#6b6b6b) may fail WCAG AA on dark backgrounds
   - Placeholder text too subtle

3. **Keyboard Navigation:**
   - Modal close buttons not keyboard accessible
   - Quantity selectors need keyboard support
   - Image gallery needs keyboard nav (partially implemented ✓)

4. **ARIA Labels:**
   - Icon-only buttons missing aria-labels
   - Form fields missing error aria-live regions
   - Status changes not announced

---

## B) Design System Proposal

### Type Scale (Standardized)

```css
/* Add to globals.css */
:root {
  /* Type Scale */
  --font-size-xs: 0.75rem;      /* 12px - Captions */
  --font-size-sm: 0.875rem;     /* 14px - Small text */
  --font-size-base: 1rem;       /* 16px - Body */
  --font-size-lg: 1.125rem;      /* 18px - Large body */
  --font-size-xl: 1.25rem;       /* 20px - Small headings */
  --font-size-2xl: 1.5rem;       /* 24px - H4 */
  --font-size-3xl: 2rem;         /* 32px - H3 */
  --font-size-4xl: 2.5rem;       /* 40px - H2 */
  --font-size-5xl: 3rem;         /* 48px - H1 */
  
  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Spacing Scale (Enforced)

```css
/* Already defined, but add missing sizes */
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  --space-4xl: 6rem;     /* 96px */
  
  /* Component Spacing */
  --component-padding: var(--space-md);
  --section-padding: var(--space-3xl);
  --card-padding: var(--space-xl);
  --form-field-gap: var(--space-md);
}
```

### Border Radius Rules

```css
:root {
  --radius-xs: 2px;   /* Buttons, badges */
  --radius-sm: 4px;   /* Small elements */
  --radius-md: 8px;   /* Default (inputs, cards) */
  --radius-lg: 12px;  /* Large cards */
  --radius-xl: 16px;  /* Hero sections */
  --radius-full: 9999px; /* Pills, avatars */
}
```

### Shadow/Elevation Rules

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 24px var(--color-accent-glow);
  
  /* Elevation levels */
  --elevation-1: var(--shadow-sm);   /* Cards */
  --elevation-2: var(--shadow-md);   /* Modals */
  --elevation-3: var(--shadow-lg);   /* Dropdowns */
}
```

### Standard Components

#### Button Variants

```css
/* Add to globals.css */
.btn-sm {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
}

.btn-large {
  padding: var(--space-md) var(--space-2xl);
  font-size: var(--font-size-lg);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-danger:hover {
  background: #b85a5a;
  filter: brightness(1.1);
}

.btn:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

#### Input States

```css
/* Add to globals.css */
.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(201, 107, 107, 0.15);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-bg-secondary);
}

.input-error-message {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-error);
}
```

#### Status Badge Component

```css
/* Create src/components/ui/StatusBadge.module.css */
.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-sm);
  border: 1px solid;
}

/* Status Colors */
.statusBadge.pending {
  background: rgba(201, 160, 95, 0.15);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.statusBadge.confirmed {
  background: rgba(107, 155, 110, 0.15);
  color: var(--color-success);
  border-color: var(--color-success);
}

.statusBadge.cancelled {
  background: rgba(201, 107, 107, 0.15);
  color: var(--color-error);
  border-color: var(--color-error);
}

.statusBadge.paid {
  background: rgba(107, 155, 110, 0.15);
  color: var(--color-success);
  border-color: var(--color-success);
}

.statusBadge.refunded {
  background: rgba(201, 107, 107, 0.15);
  color: var(--color-error);
  border-color: var(--color-error);
}
```

#### Modal Component

```css
/* Create src/components/ui/Modal.module.css */
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.modalContent {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.modalClose {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
}

.modalClose:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
```

#### Empty State Component

```css
/* Create src/components/ui/EmptyState.module.css */
.emptyState {
  text-align: center;
  padding: var(--space-4xl) var(--space-xl);
}

.emptyStateIcon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-lg);
  color: var(--color-text-tertiary);
}

.emptyStateTitle {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.emptyStateDescription {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
```

---

## C) Page-by-Page Recommendations

### Storefront Pages

#### 1. Homepage (`/page.tsx`) ⚠️ P1
**Issues:**
- Hero section spacing inconsistent
- Trust badges grid could be tighter
- Featured products section needs better visual separation

**Recommendations:**
- Standardize section padding to `py-16` or `py-20`
- Add subtle dividers between major sections
- Improve hero typography hierarchy

**Files:** `src/app/page.tsx`, `src/app/HomePage.module.css`

---

#### 2. Product List (`/tube-amplifiers/page.tsx`) ⚠️ P0
**Issues:**
- Grid layout breaks awkwardly on tablet
- Filter sidebar too narrow on desktop
- Empty state missing
- Loading state missing

**Recommendations:**
- Improve responsive breakpoints (3-col → 2-col → 1-col)
- Add EmptyState component for no results
- Add skeleton loaders for product grid
- Increase filter sidebar width to 300px

**Files:** `src/app/tube-amplifiers/page.tsx`, `src/app/tube-amplifiers/ProductGrid.tsx`

---

#### 3. Product Detail (`/product/[slug]/page.tsx`) ⚠️ P0
**Issues:**
- Gallery and info section gap too large on desktop
- Trust badges section spacing inconsistent
- Add to cart button needs loading state
- Related products section spacing

**Recommendations:**
- Reduce grid gap from `var(--space-3xl)` to `var(--space-2xl)`
- Standardize trust badges spacing
- Add button loading spinner
- Improve mobile stacking (better breakpoint)

**Files:** `src/app/product/[slug]/page.tsx`, `src/app/product/[slug]/ProductPage.module.css`

---

#### 4. Cart (`/cart/page.tsx`) ⚠️ P1
**Issues:**
- Empty state good ✓
- Cart item cards need better spacing
- Quantity selector buttons too small (touch target)
- Summary card spacing

**Recommendations:**
- Increase quantity button size to 44x44px (touch target)
- Add hover states to cart items
- Improve summary card visual hierarchy
- Add loading state for quantity updates

**Files:** `src/app/cart/page.tsx`, `src/app/cart/page.module.css`

---

#### 5. Checkout (`/checkout/page.tsx`) ⚠️ P0
**Issues:**
- Form fields too narrow on mobile
- Payment mode selection UI needs better visual distinction
- Error messages not prominent enough
- Submit button needs loading state

**Recommendations:**
- Improve form field widths (full width on mobile)
- Add visual cards for payment mode selection
- Make error messages more prominent (red background + icon)
- Add loading spinner to submit button
- Improve payment method cards (better hover states)

**Files:** `src/app/checkout/page.tsx`, `src/app/checkout/page.module.css`

---

#### 6. Order Tracking (`/order/track/[code]/page.tsx`) ⚠️ P1
**Issues:**
- Status timeline needs better visual design
- Order totals section spacing
- Action buttons (cancel/change) need better placement
- Deposit proof upload UI needs polish

**Recommendations:**
- Redesign status timeline (vertical line + dots)
- Improve order totals card layout
- Group action buttons better
- Add visual feedback for deposit proof upload

**Files:** `src/app/order/track/[code]/page.tsx`, `src/app/order/track/[code]/page.module.css`

---

### Admin Pages

#### 7. Admin Orders List (`/admin/orders/page.tsx`) ⚠️ P0
**Issues:**
- Table overflow on mobile (no horizontal scroll)
- Status badges inconsistent
- Filter UI needs better visual design
- Loading state missing

**Recommendations:**
- Add horizontal scroll wrapper for table
- Use StatusBadge component consistently
- Improve filter UI (card-based)
- Add skeleton loaders

**Files:** `src/app/admin/orders/page.tsx`, `src/app/admin/orders/page.module.css`

---

#### 8. Admin Order Detail (`/admin/orders/[orderCode]/page.tsx`) ⚠️ P1
**Issues:**
- Status update buttons need better grouping
- Refund modal uses custom styles (should use Modal component)
- Deposit management section spacing
- Action buttons inconsistent sizes

**Recommendations:**
- Group status actions in card
- Refactor modals to use shared Modal component
- Standardize button sizes
- Improve section spacing

**Files:** `src/app/admin/orders/[orderCode]/page.tsx`, `src/app/admin/orders/[orderCode]/page.module.css`

---

#### 9. Admin Products (`/admin/products/page.tsx`) ⚠️ P1
**Issues:**
- Product list table needs better spacing
- Image thumbnails too small
- Action buttons need consistent styling
- Empty state missing

**Recommendations:**
- Increase table row padding
- Larger product image thumbnails
- Use button variants consistently
- Add EmptyState component

**Files:** `src/app/admin/products/page.tsx`, `src/app/admin/products/page.module.css`

---

### Shared Components

#### 10. Header (`/components/layout/Header.tsx`) ⚠️ P1
**Issues:**
- Mobile menu animation abrupt
- Cart count badge positioning
- Search button not functional (placeholder)

**Recommendations:**
- Add smooth slide-in animation for mobile menu
- Improve cart badge positioning
- Add search functionality or remove button

**Files:** `src/components/layout/Header.tsx`, `src/components/layout/Header.module.css`

---

#### 11. Footer (`/components/layout/Footer.tsx`) ⚠️ P2
**Issues:**
- Trust section spacing could be tighter
- Links need better hover states
- Mobile layout could be improved

**Recommendations:**
- Reduce trust grid gap slightly
- Add underline hover effect to links
- Improve mobile stacking

**Files:** `src/components/layout/Footer.tsx`, `src/components/layout/Footer.module.css`

---

## D) Implementation Plan

### Phase 1: Foundation (P0) - Week 1

**Priority:** Critical fixes that affect usability

1. **Add Missing Button Variants**
   - Add `.btn-sm`, `.btn-large`, `.btn-danger` to globals.css
   - Update all admin buttons to use variants
   - **Files:** `src/app/globals.css`

2. **Standardize Form Inputs**
   - Add `.input-error`, `.input-error-message` styles
   - Add disabled state styling
   - Update all forms to use error states
   - **Files:** `src/app/globals.css`, all form pages

3. **Fix Mobile Responsiveness**
   - Improve product detail grid breakpoints
   - Fix cart layout on mobile
   - Add horizontal scroll to admin tables
   - **Files:** Product, Cart, Admin pages CSS modules

4. **Add Loading States**
   - Create LoadingSpinner component
   - Add to all async buttons
   - Add skeleton loaders to product grid
   - **Files:** New component + updates to pages

5. **Standardize Error Display**
   - Create ErrorBanner component
   - Update all error displays
   - Add toast system (optional, can use browser alerts for MVP)
   - **Files:** New component + error pages

---

### Phase 2: Components (P1) - Week 2

**Priority:** High-impact improvements

1. **Create StatusBadge Component**
   - Implement with semantic colors
   - Replace all status badges
   - **Files:** `src/components/ui/StatusBadge.tsx`

2. **Create Modal Component**
   - Reusable modal with overlay
   - Replace cancel/change/refund modals
   - **Files:** `src/components/ui/Modal.tsx`

3. **Create EmptyState Component**
   - Reusable empty state
   - Add to product list, order history, etc.
   - **Files:** `src/components/ui/EmptyState.tsx`

4. **Improve Typography**
   - Add type scale variables
   - Update all headings to use scale
   - Standardize body text
   - **Files:** `src/app/globals.css`, all pages

5. **Standardize Spacing**
   - Audit all pages for spacing consistency
   - Replace custom margins with utility classes
   - **Files:** All CSS modules

---

### Phase 3: Polish (P2) - Week 3

**Priority:** Visual refinement

1. **Micro-interactions**
   - Add hover states to all interactive elements
   - Improve focus states
   - Add subtle animations
   - **Files:** All CSS modules

2. **Accessibility Improvements**
   - Add focus traps to modals
   - Improve ARIA labels
   - Add skip links
   - **Files:** Components + pages

3. **Visual Hierarchy**
   - Improve section spacing
   - Add subtle dividers
   - Improve card designs
   - **Files:** All pages

4. **Status Timeline Redesign**
   - Better visual design for order tracking
   - **Files:** `src/app/order/track/[code]/page.module.css`

---

## E) Concrete Code Changes

### 1. Add Missing Button Variants to globals.css

```css
/* Add after existing .btn styles */

.btn-sm {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  min-height: 32px;
}

.btn-large {
  padding: var(--space-md) var(--space-2xl);
  font-size: var(--font-size-lg);
  min-height: 48px;
}

.btn-danger {
  background: var(--color-error);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-danger:hover:not(:disabled) {
  background: #b85a5a;
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### 2. Add Form Input Error States

```css
/* Add after existing .input styles */

.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(201, 107, 107, 0.15);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-bg-secondary);
}

.input-error-message {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.input-error-message::before {
  content: '⚠';
  font-size: 1em;
}
```

### 3. Create StatusBadge Component

**File:** `src/components/ui/StatusBadge.tsx`

```typescript
'use client';

import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment';
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Order statuses
  pending: { label: 'Pending', className: 'pending' },
  confirmed: { label: 'Confirmed', className: 'confirmed' },
  deposited: { label: 'Deposited', className: 'confirmed' },
  processing: { label: 'Processing', className: 'confirmed' },
  shipped: { label: 'Shipped', className: 'confirmed' },
  delivered: { label: 'Delivered', className: 'confirmed' },
  cancelled: { label: 'Cancelled', className: 'cancelled' },
  expired: { label: 'Expired', className: 'cancelled' },
  
  // Payment statuses
  paid: { label: 'Paid', className: 'confirmed' },
  deposit_pending: { label: 'Deposit Pending', className: 'pending' },
  deposited: { label: 'Deposited', className: 'confirmed' },
  refunded: { label: 'Refunded', className: 'cancelled' },
  partially_refunded: { label: 'Partially Refunded', className: 'pending' },
};

export default function StatusBadge({ status, type = 'order', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'pending' };
  
  return (
    <span className={`${styles.statusBadge} ${styles[config.className]} ${className}`}>
      {config.label}
    </span>
  );
}
```

**File:** `src/components/ui/StatusBadge.module.css`

```css
.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-sm);
  border: 1px solid;
}

.statusBadge.pending {
  background: rgba(201, 160, 95, 0.15);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.statusBadge.confirmed {
  background: rgba(107, 155, 110, 0.15);
  color: var(--color-success);
  border-color: var(--color-success);
}

.statusBadge.cancelled {
  background: rgba(201, 107, 107, 0.15);
  color: var(--color-error);
  border-color: var(--color-error);
}
```

### 4. Create EmptyState Component

**File:** `src/components/ui/EmptyState.tsx`

```typescript
'use client';

import Link from 'next/link';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.emptyStateIcon}>{icon}</div>}
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      <p className={styles.emptyStateDescription}>{description}</p>
      {action && (
        <Link href={action.href} className="btn btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
```

### 5. Fix Product Detail Page Spacing

**File:** `src/app/product/[slug]/ProductPage.module.css`

```css
/* Update .productMain */
.productMain {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl); /* Changed from var(--space-3xl) */
    margin-bottom: var(--space-3xl);
}

/* Add responsive breakpoint */
@media (max-width: 1024px) {
    .productMain {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
    }
}
```

### 6. Improve Cart Quantity Selector Touch Targets

**File:** `src/app/cart/page.module.css`

```css
/* Add or update quantity selector */
.quantitySelector {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-xs);
}

.quantitySelector button {
    min-width: 44px; /* Touch target */
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-tertiary);
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.quantitySelector button:hover {
    background: var(--color-bg-elevated);
    color: var(--color-accent-primary);
}

.quantitySelector button:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
}
```

### 7. Add Loading Spinner Component

**File:** `src/components/ui/LoadingSpinner.tsx`

```typescript
'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`${styles.spinner} ${styles[size]} ${className}`} aria-label="Loading">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
```

**File:** `src/components/ui/LoadingSpinner.module.css`

```css
.spinner {
  display: inline-block;
  position: relative;
}

.spinner div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  border: 2px solid var(--color-accent-primary);
  border-radius: 50%;
  animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--color-accent-primary) transparent transparent transparent;
}

.spinner.sm {
  width: 16px;
  height: 16px;
}

.spinner.md {
  width: 24px;
  height: 24px;
}

.spinner.lg {
  width: 32px;
  height: 32px;
}

.spinner.sm div {
  width: 16px;
  height: 16px;
  margin: 2px;
  border-width: 2px;
}

.spinner.md div {
  width: 24px;
  height: 24px;
  margin: 3px;
  border-width: 3px;
}

.spinner.lg div {
  width: 32px;
  height: 32px;
  margin: 4px;
  border-width: 4px;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

### 8. Improve Checkout Form Mobile Layout

**File:** `src/app/checkout/page.module.css`

```css
/* Add or update form group */
.formGroup {
    margin-bottom: var(--space-lg);
}

.formGroup label {
    display: block;
    margin-bottom: var(--space-sm);
    font-weight: var(--font-weight-medium);
}

.formGroup input,
.formGroup select,
.formGroup textarea {
    width: 100%;
    padding: var(--space-md);
    font-size: var(--font-size-base);
}

/* Improve payment mode selection */
.paymentModeSelection {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
}

.paymentModeCard {
    padding: var(--space-lg);
    border: 2px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
}

.paymentModeCard:hover {
    border-color: var(--color-border-medium);
    background: var(--color-bg-tertiary);
}

.paymentModeCard.selected {
    border-color: var(--color-accent-primary);
    background: var(--color-accent-glow);
}

@media (max-width: 768px) {
    .paymentModeSelection {
        grid-template-columns: 1fr;
    }
    
    .formGroup input,
    .formGroup select {
        font-size: 16px; /* Prevents zoom on iOS */
    }
}
```

---

## F) Quick Wins (Can Implement Immediately)

1. **Add button variants** (15 min)
   - Copy code from section E.1
   - Test in admin panel

2. **Fix product detail grid gap** (5 min)
   - Change `var(--space-3xl)` to `var(--space-2xl)`

3. **Add form error states** (20 min)
   - Copy code from section E.2
   - Update checkout form

4. **Improve cart quantity buttons** (15 min)
   - Copy code from section E.6
   - Test touch targets

5. **Add loading spinner** (30 min)
   - Copy component from section E.7
   - Add to submit buttons

---

## G) Migration Strategy

### Step 1: Foundation (Do First)
1. Add missing button variants to globals.css
2. Add form input error states
3. Create LoadingSpinner component
4. Test across all pages

### Step 2: Components (Do Second)
1. Create StatusBadge component
2. Replace all status badges
3. Create EmptyState component
4. Add to product list, order history

### Step 3: Pages (Do Third)
1. Fix spacing on high-traffic pages
2. Improve mobile responsiveness
3. Add loading states
4. Standardize error displays

### Step 4: Polish (Do Last)
1. Add micro-interactions
2. Improve accessibility
3. Visual hierarchy improvements
4. Final QA pass

---

## H) Success Metrics

After implementation, verify:

- ✅ All buttons have consistent styling
- ✅ All forms have error states
- ✅ All pages are mobile-responsive
- ✅ Loading states on all async actions
- ✅ Empty states on all list pages
- ✅ Status badges consistent everywhere
- ✅ Modals use shared component
- ✅ Focus states visible on all interactive elements
- ✅ Touch targets ≥ 44x44px on mobile
- ✅ No horizontal scroll on mobile

---

**Next Steps:**
1. Review this audit with team
2. Prioritize P0 items
3. Start with Phase 1 (Foundation)
4. Test incrementally
5. Deploy improvements gradually

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2025


