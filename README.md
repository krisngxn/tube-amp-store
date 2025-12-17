# Restore The Basic - Premium E-commerce Store

A premium, classic-styled e-commerce website specialized in tube amplifiers (vintage and modern handmade), built with **Next.js 16**, **next-intl**, and **locale-wrapped routing**.

## 🎯 Project Overview

This is a fully internationalized (i18n) e-commerce platform designed for audiophiles, featuring:

- **Locale-first architecture**: All routes wrapped under `[locale]` segment
- **Split translation files**: Modular namespaces per feature/route
- **Classic audiophile design**: Dark theme with brass/copper accents
- **Conversion-focused**: Direct purchase, deposit reservations, and matching consultation
- **Future-proof**: Easy to add new locales by adding translation files

### Supported Locales

- **Vietnamese (vi)** - Default locale
- **English (en)** - Secondary locale

## 🏗️ Architecture

### Locale-Wrapped Routing

All storefront pages live under `app/[locale]/...`:

```
app/
├── [locale]/
│   ├── layout.tsx              # Locale-specific layout with NextIntlClientProvider
│   ├── page.tsx                # Home page
│   ├── tube-amplifiers/
│   │   └── page.tsx            # Collection page
│   ├── product/[slug]/
│   │   └── page.tsx            # Product detail page
│   ├── cart/
│   │   └── page.tsx            # Shopping cart
│   ├── checkout/
│   │   └── page.tsx            # Checkout flow
│   ├── guides/
│   │   └── page.tsx            # Educational guides
│   ├── contact/
│   │   └── page.tsx            # Contact page
│   └── reviews/
│       └── page.tsx            # Customer reviews
├── layout.tsx                  # Root layout (passes through to locale layout)
└── globals.css                 # Global styles & design system
```

### Translation Files Structure

Translations are split by namespace for modularity:

```
messages/
├── vi/                         # Vietnamese translations
│   ├── common.json            # Shared UI elements
│   ├── nav.json               # Navigation labels
│   ├── footer.json            # Footer content
│   ├── home.json              # Home page
│   ├── collection.json        # Collection page
│   ├── product.json           # Product detail page
│   ├── cart.json              # Cart page
│   ├── checkout.json          # Checkout page
│   ├── order.json             # Order confirmation
│   ├── guide.json             # Guides section
│   ├── policies.json          # Policy pages
│   └── admin.json             # Admin panel
└── en/                         # English translations
    ├── common.json
    ├── nav.json
    ├── footer.json
    ├── home.json
    ├── collection.json
    ├── product.json
    ├── cart.json
    ├── checkout.json
    ├── order.json
    ├── guide.json
    ├── policies.json
    └── admin.json
```

### i18n Configuration

**`src/i18n/request.ts`** - Loads and composes split translation files:

```typescript
// Dynamically imports all namespace files for the selected locale
// and composes them into a single messages object
const messages = {
  common: {...},
  nav: {...},
  footer: {...},
  home: {...},
  // ... all other namespaces
}
```

**`src/i18n/routing.ts`** - Defines routing configuration:

```typescript
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'always'
});
```

**`src/middleware.ts`** - Handles automatic locale detection and routing

## 🎨 Design System

### Classic Audiophile Theme

- **Background**: Charcoal/near-black (`#0a0a0a`)
- **Accents**: Brass/copper/gold (`#d4a574`) for CTAs and highlights
- **Typography**:
  - Headings: `Cormorant Garamond` (classic serif)
  - Body: `Inter` (clean sans-serif)
- **UI Philosophy**: Minimal color usage, generous spacing, subtle borders, soft shadows

### CSS Variables

All design tokens are defined in `globals.css`:

```css
:root {
  /* Colors */
  --color-bg-primary: #0a0a0a;
  --color-accent-primary: #d4a574;
  --color-text-primary: #f5f5f5;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-md: 1rem;
  --space-xl: 2rem;
  
  /* Transitions */
  --transition-base: 250ms ease;
}
```

### Utility Classes

The project includes **300+ Tailwind-like utility classes** for rapid development:

**Spacing:** `.p-4`, `.px-6`, `.py-8`, `.mt-4`, `.mb-6`, `.gap-4`  
**Colors:** `.bg-primary`, `.text-accent`, `.border-subtle`  
**Layout:** `.flex`, `.grid`, `.items-center`, `.justify-between`  
**Sizing:** `.w-full`, `.max-w-4xl`, `.h-auto`  

See **[CSS_UTILITIES.md](./CSS_UTILITIES.md)** for complete reference.

**Pro Tip:** Use `.p-4` for cards and `.py-16` for sections to prevent content from sticking together!

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Navigate to project directory
cd tube-amp-store

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Access the Application

- **Vietnamese (default)**: http://localhost:3000/vi
- **English**: http://localhost:3000/en
- **Auto-redirect**: http://localhost:3000 → redirects to default locale

## 📄 Key Pages

### Home Page (`/[locale]/page.tsx`)

- Hero section with gradient title
- Quick entry tiles (4 pre-filtered categories)
- Featured products (tabbed: Best Sellers / New Arrivals / Vintage)
- Matching advice tool (speaker/room compatibility checker)
- Trust badges (6 key trust factors)
- Customer setups gallery
- Guides preview

### Collection Page (`/[locale]/tube-amplifiers/page.tsx`)

- Sidebar filters:
  - Topology (SE/PP)
  - Tube type (300B, 2A3, EL34, KT88, etc.)
  - Power range
  - Condition (new/like-new/vintage)
  - Price range
- Sorting options
- Product grid with cards

### Product Detail Page (`/[locale]/product/[slug]/page.tsx`)

- Image gallery with thumbnails
- Pricing and availability
- 10-second summary (3 key bullets)
- Trust micro-copy
- Matching guidance section
- Tabbed content:
  - Overview
  - Specifications
  - Sound character
  - Matching notes
  - Condition report (for vintage)
  - Testing checklist
  - Shipping/Warranty/Returns
  - FAQ
  - Reviews
- Related products

### Cart Page (`/[locale]/cart/page.tsx`)

- Cart items with quantity controls
- Order summary sidebar
- Empty state with CTA
- Matching advice prompt

### Checkout Page (`/[locale]/checkout/page.tsx`)

- Shipping information form
- Payment method selection (COD / Bank Transfer)
- Order summary
- Form validation

## 🌐 Adding a New Locale

To add a new locale (e.g., Japanese `ja`):

1. **Update locale configuration** (`src/config/locales.ts`):
   ```typescript
   export const locales = ['vi', 'en', 'ja'] as const;
   ```

2. **Create translation files** (`messages/ja/`):
   ```bash
   mkdir messages/ja
   # Copy and translate all JSON files from messages/en/
   ```

3. **Update i18n request** (`src/i18n/request.ts`):
   - No changes needed! Dynamic imports automatically handle new locales

4. **Done!** The new locale is now available at `/ja/*`

## 🔑 Key Features

### 1. Locale Switching

The `LocaleSwitcher` component allows users to switch languages while maintaining the current route:

```typescript
// Switches from /vi/product/amp-1 to /en/product/amp-1
<LocaleSwitcher />
```

### 2. Type-Safe Navigation

Using next-intl's typed navigation utilities:

```typescript
import { Link, useRouter, usePathname } from '@/i18n/routing';

// Automatically prefixes with current locale
<Link href="/tube-amplifiers">Browse</Link>
```

### 3. Translation Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('home');
  return <h1>{t('hero.title')}</h1>;
}
```

### 4. Matching Advice Tool (MVP)

A rule-based compatibility checker that takes:
- Speaker sensitivity (dB)
- Impedance (Ω)
- Room size
- Listening level
- Music genres

And outputs:
- **Fit** / **Consider** / **Not Recommended**
- 2-4 reasons
- Recommended products
- Chat CTA with pre-filled message

### 5. Deposit Reservation

Selected products allow "Reserve with Deposit":
- Configurable deposit amount (fixed or percentage)
- Creates order in "deposited/reserved" status
- Clear terms: reservation window, remaining payment, cancellation rules

## 📦 Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Sticky header with nav & locale switcher
│   │   └── Footer.tsx          # Footer with links & trust badges
│   └── LocaleSwitcher.tsx      # Language dropdown
├── app/
│   └── [locale]/               # All locale-wrapped pages
├── config/
│   └── locales.ts              # Locale configuration
└── i18n/
    ├── request.ts              # Translation loader
    ├── routing.ts              # Routing configuration
    └── middleware.ts           # Locale middleware
```

## 🎯 SEO & Best Practices

- **Title Tags**: Proper, descriptive titles per page
- **Meta Descriptions**: Compelling descriptions
- **Heading Structure**: Single `<h1>` per page with proper hierarchy
- **Semantic HTML**: HTML5 semantic elements throughout
- **Performance**: Image optimization, lazy loading
- **Accessibility**: High contrast, keyboard navigation

## 🔮 Future Enhancements

### Phase 2
- [ ] Admin panel for product/order management
- [ ] Real product data integration
- [ ] Image uploads and optimization
- [ ] Advanced matching algorithm
- [ ] Customer authentication
- [ ] Order tracking
- [ ] Email notifications

### Phase 3
- [ ] Payment gateway integration
- [ ] Inventory management
- [ ] Customer reviews system
- [ ] Wishlist functionality
- [ ] Live chat integration
- [ ] Analytics dashboard

## 📝 Translation Key Naming Conventions

- Use stable, descriptive keys
- Avoid excessive nesting (max 4 levels)
- Support interpolation: `{variable}`
- Support plurals where needed

Example:
```json
{
  "hero": {
    "title": "Authentic Tube Sound",
    "cta": {
      "primary": "Browse Tube Amps",
      "secondary": "Get Matching Advice"
    }
  },
  "results": {
    "showing": "Showing {count} products"
  }
}
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **i18n**: next-intl
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS (Vanilla, CSS-in-JS with styled-jsx)
- **Typography**: Google Fonts (Cormorant Garamond, Inter)
- **Language**: TypeScript
- **Package Manager**: npm

## 🗄️ Database (Supabase)

The application uses **Supabase** (PostgreSQL) for data storage with a comprehensive schema supporting:

- **Multilingual product content** (Vietnamese/English)
- **Product management** with tube-specific attributes
- **Order management** with deposit reservations
- **Customer accounts** and authentication
- **Reviews and ratings**
- **Educational guides**
- **Row-level security (RLS)** for data protection

### Database Files

- **`supabase/schema.sql`** - Complete database schema with tables, indexes, triggers, and RLS policies
- **`supabase/seed.sql`** - Sample data (3 products, guides, reviews) for testing
- **`supabase/SETUP_GUIDE.md`** - Step-by-step setup instructions
- **`supabase/SCHEMA_DIAGRAM.md`** - Visual entity relationship diagram

### Quick Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. (Optional) Run `supabase/seed.sql` for sample data
4. Copy your API keys to `.env.local`
5. See `supabase/SETUP_GUIDE.md` for detailed instructions

### Key Database Features

- **15+ tables** with proper relationships and constraints
- **Automatic triggers** for timestamps, order numbers, stock updates
- **Row Level Security** for secure multi-tenant data access
- **Multilingual support** via translation tables
- **Audit trails** for order status changes
- **Optimized indexes** for fast queries

### Sample Query (Get Products with Translations)

```typescript
const { data: products } = await supabase
  .from('products_with_translations')
  .select('*')
  .eq('locale', 'vi')
  .eq('is_published', true)
  .order('created_at', { ascending: false });
```

## 📄 License

This project is proprietary. All rights reserved.

## 🤝 Contributing

This is a client project. For internal team members:

1. Follow the established translation file structure
2. Maintain design system consistency
3. Test all locale routes before committing
4. Update this README for significant changes

---

**Built with ❤️ for audiophiles who appreciate both classic sound and modern web experiences.**
