# Classic Tube Amps - Project Overview

## 📖 What is This Project?

**Classic Tube Amps** is a premium e-commerce platform specialized in selling tube amplifiers (both vintage and modern handmade). The project is designed for audiophiles who appreciate high-quality sound equipment and want a sophisticated, trust-first shopping experience.

### 🎯 Business Model

The store offers:
- **New Handmade Tube Amplifiers** - Premium, handcrafted amplifiers
- **Vintage Tube Amplifiers** - Rare, restored classic equipment from the 1960s-1980s
- **Deposit Reservations** - For high-value vintage items, customers can reserve with a deposit
- **Matching Consultation** - Expert advice on pairing amplifiers with speakers and rooms

### 🌍 Target Market

- **Primary:** Vietnam (Vietnamese language)
- **Secondary:** International audiophiles (English language)
- **Audience:** Serious music listeners, audiophiles, collectors, and vintage equipment enthusiasts

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Vanilla CSS with 300+ utility classes (Tailwind-like)
- **Internationalization:** next-intl with split translation files
- **Fonts:** Cormorant Garamond (serif) + Inter (sans-serif)

### Backend & Database
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for product images)
- **API:** Supabase JavaScript Client

### Design Philosophy
- **Classic Audiophile Aesthetic:** Dark theme (#0a0a0a) with brass/copper/gold accents (#d4a574)
- **Premium Feel:** Generous spacing, elegant typography, subtle animations
- **Trust-First:** Multiple trust signals, detailed product information, transparent policies

---

## 📁 Project Structure

```
tube-amp-store/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Locale-wrapped routes
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── tube-amplifiers/   # Collection page
│   │   │   ├── product/[slug]/    # Product detail
│   │   │   ├── cart/              # Shopping cart
│   │   │   ├── checkout/          # Checkout flow
│   │   │   ├── guides/            # Educational content
│   │   │   ├── contact/           # Contact page
│   │   │   └── reviews/           # Customer reviews
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Design system + utilities
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Navigation header
│   │   │   └── Footer.tsx         # Site footer
│   │   └── LocaleSwitcher.tsx     # Language switcher
│   ├── config/
│   │   └── locales.ts             # Locale configuration
│   └── i18n/
│       ├── request.ts             # Translation loader
│       ├── routing.ts             # Routing config
│       └── middleware.ts          # Locale middleware
├── messages/
│   ├── vi/                        # Vietnamese translations
│   │   ├── common.json
│   │   ├── nav.json
│   │   ├── home.json
│   │   ├── product.json
│   │   └── ... (12 namespaces)
│   └── en/                        # English translations
│       └── ... (same structure)
├── supabase/
│   ├── schema.sql                 # Database schema
│   ├── seed.sql                   # Sample data
│   ├── SETUP_GUIDE.md            # Setup instructions
│   └── SCHEMA_DIAGRAM.md         # ER diagram
└── public/
    └── images/                    # Static assets
```

---

## 🚀 Current Project Status

### ✅ Phase 1: Foundation (COMPLETED)

#### 1.1 Project Setup
- ✅ Next.js 16 project initialized
- ✅ TypeScript configured
- ✅ Development server running
- ✅ Production build verified

#### 1.2 Internationalization (i18n)
- ✅ next-intl installed and configured
- ✅ Locale-wrapped routing (`/vi/*`, `/en/*`)
- ✅ Split translation files (12 namespaces × 2 locales = 24 files)
- ✅ Locale switcher component
- ✅ Type-safe navigation utilities
- ✅ Middleware for automatic locale detection

#### 1.3 Design System
- ✅ Classic audiophile color palette
- ✅ Typography system (serif + sans)
- ✅ 300+ CSS utility classes
- ✅ Responsive grid system
- ✅ Component styles (buttons, cards, inputs, badges)
- ✅ Animations and transitions
- ✅ Automatic section spacing

#### 1.4 Core Pages (UI Only)
- ✅ Home page with all sections
- ✅ Collection/catalog page with filters
- ✅ Product detail page with tabs
- ✅ Shopping cart page
- ✅ Checkout page
- ✅ Guides listing page
- ✅ Contact page
- ✅ Reviews page

#### 1.5 Layout Components
- ✅ Header with navigation
- ✅ Footer with links and trust badges
- ✅ Locale switcher
- ✅ Mobile responsive menu

#### 1.6 Database Design
- ✅ Complete PostgreSQL schema (15+ tables)
- ✅ Multilingual product support
- ✅ Order management with deposit flow
- ✅ User authentication structure
- ✅ Reviews and ratings
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers (timestamps, order numbers, stock)
- ✅ Sample seed data (3 products, guides, reviews)

#### 1.7 Documentation
- ✅ Main README with architecture
- ✅ Database setup guide
- ✅ Schema diagram
- ✅ CSS utilities reference
- ✅ Spacing best practices guide
- ✅ Translation file structure

---

## 🎯 Next Steps (Phase 2: Backend Integration)

### 2.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Run schema.sql
- [ ] Run seed.sql
- [ ] Configure environment variables
- [ ] Set up Storage bucket for images

### 2.2 Data Integration
- [ ] Install Supabase client
- [ ] Create Supabase utility functions
- [ ] Fetch real products from database
- [ ] Implement product filtering and sorting
- [ ] Connect search functionality

### 2.3 User Authentication
- [ ] Implement sign-up flow
- [ ] Implement login flow
- [ ] User profile management
- [ ] Password reset
- [ ] Protected routes

### 2.4 E-commerce Functionality
- [ ] Shopping cart state management
- [ ] Add to cart functionality
- [ ] Cart persistence (localStorage + database)
- [ ] Checkout form validation
- [ ] Order creation
- [ ] Deposit reservation logic
- [ ] Order confirmation emails

### 2.5 Product Management
- [ ] Image upload to Supabase Storage
- [ ] Product CRUD operations
- [ ] Inventory tracking
- [ ] Stock alerts

### 2.6 Content Management
- [ ] Guide articles (full content)
- [ ] Customer setup gallery
- [ ] Review submission and moderation
- [ ] FAQ management

---

## 🔮 Future Phases

### Phase 3: Advanced Features
- Payment gateway integration (Stripe/local payment)
- Advanced matching algorithm
- Live chat support
- Email notifications (order updates, shipping)
- Order tracking
- Wishlist functionality
- Product recommendations

### Phase 4: Admin Panel
- Admin dashboard
- Product management interface
- Order management
- Customer management
- Analytics and reporting
- Inventory management

### Phase 5: Optimization & Growth
- SEO optimization
- Performance optimization
- Analytics integration (Google Analytics, Meta Pixel)
- A/B testing
- Marketing automation
- Customer loyalty program

---

## 📊 Project Statistics

### Code
- **Total Files:** 50+
- **Lines of Code:** ~5,000+
- **Translation Keys:** 200+ per language
- **CSS Utility Classes:** 300+
- **Database Tables:** 15+

### Features
- **Languages:** 2 (Vietnamese, English)
- **Pages:** 8+ fully designed pages
- **Components:** 10+ reusable components
- **Namespaces:** 12 translation namespaces

### Database
- **Tables:** 15+ with relationships
- **Triggers:** 5 automatic triggers
- **Views:** 2 optimized views
- **RLS Policies:** 10+ security policies
- **Sample Products:** 3 (SE 300B, PP EL34, Vintage 2A3)

---

## 🎨 Design Highlights

### Color Palette
- **Background:** #0a0a0a (near-black)
- **Accent:** #d4a574 (brass/copper/gold)
- **Text:** #f5f5f5 (off-white)
- **Secondary:** #a8a8a8 (muted gray)

### Typography
- **Headings:** Cormorant Garamond (classic serif)
- **Body:** Inter (modern sans-serif)
- **Hierarchy:** 6 heading levels with responsive sizing

### Key Features
- Generous spacing (prevents content sticking)
- Subtle animations and transitions
- Glassmorphism effects
- Gradient accents
- Premium card designs
- Trust badges throughout

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Access the app
# Vietnamese: http://localhost:3000/vi
# English: http://localhost:3000/en
```

---

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `CSS_UTILITIES.md` | Complete CSS utility class reference |
| `SPACING_GUIDE.md` | Spacing best practices with examples |
| `supabase/SETUP_GUIDE.md` | Database setup instructions |
| `supabase/SCHEMA_DIAGRAM.md` | Database entity relationships |
| `PROJECT_STATUS.md` | This file - project overview and status |

---

## 🎯 Success Criteria

### MVP (Minimum Viable Product)
- [x] Professional, premium design
- [x] Fully internationalized (vi/en)
- [x] All core pages designed
- [x] Database schema complete
- [ ] Products display from database
- [ ] Shopping cart works
- [ ] Checkout creates orders
- [ ] User authentication
- [ ] Admin can manage products

### Launch Ready
- [ ] Payment integration
- [ ] Email notifications
- [ ] SEO optimized
- [ ] Performance optimized
- [ ] Analytics integrated
- [ ] Customer reviews working
- [ ] Matching advice functional

---

## 👥 Team & Roles

### Current Phase (Development)
- **Developer:** Building frontend and backend
- **Designer:** Design system implemented
- **Content:** Translation files populated

### Future Needs
- **Product Manager:** Inventory and catalog management
- **Customer Support:** Handle inquiries and orders
- **Marketing:** SEO, content, social media
- **Operations:** Shipping, logistics, vintage sourcing

---

## 📈 Business Metrics to Track

Once live, track these KPIs:
- **Conversion Rate:** Visitors → Customers
- **Average Order Value (AOV)**
- **Cart Abandonment Rate**
- **Customer Acquisition Cost (CAC)**
- **Customer Lifetime Value (CLV)**
- **Product Page Views**
- **Matching Advice Usage**
- **Deposit Reservation Rate**

---

## 🚀 Deployment Strategy

### Recommended Hosting
- **Frontend:** Vercel (automatic Next.js optimization)
- **Database:** Supabase (managed PostgreSQL)
- **Images:** Supabase Storage or Cloudinary
- **Domain:** Custom domain with SSL

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## 💡 Key Differentiators

What makes this store special:

1. **Niche Focus:** Specialized in tube amplifiers only
2. **Multilingual:** Serves both Vietnamese and international markets
3. **Vintage Expertise:** Deposit reservation system for rare items
4. **Matching Advice:** Helps customers choose the right amplifier
5. **Trust-First:** Detailed specs, condition reports, testing checklists
6. **Premium Design:** Reflects the quality of the products
7. **Educational:** Guides help customers understand tube amplifiers

---

## 📞 Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **next-intl Docs:** https://next-intl-docs.vercel.app
- **Supabase Docs:** https://supabase.com/docs
- **CSS Utilities:** See `CSS_UTILITIES.md`
- **Spacing Guide:** See `SPACING_GUIDE.md`

---

**Last Updated:** December 10, 2025  
**Version:** 1.0.0 (MVP Foundation Complete)  
**Status:** ✅ Phase 1 Complete, Ready for Phase 2 (Backend Integration)
