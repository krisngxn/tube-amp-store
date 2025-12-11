# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the Classic Tube Amps e-commerce store.

## 📋 Prerequisites

- A Supabase account (free tier is fine for development)
- Access to Supabase SQL Editor

## 🚀 Setup Steps

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `classic-tube-amps` (or your choice)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Singapore for Vietnam)
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

### 2. Run the Schema SQL

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. Wait for completion (should take 5-10 seconds)
7. You should see: "Success. No rows returned"

### 3. Run the Seed Data (Optional)

1. In SQL Editor, click **"New query"**
2. Copy the entire contents of `supabase/seed.sql`
3. Paste into the SQL editor
4. Click **"Run"**
5. This will insert sample products, guides, and reviews

### 4. Verify the Setup

1. Go to **Table Editor** in the sidebar
2. You should see all tables:
   - `user_profiles`
   - `products`
   - `product_translations`
   - `product_images`
   - `orders`
   - `order_items`
   - `product_reviews`
   - `guides`
   - And more...

3. Click on `products` table
4. If you ran seed.sql, you should see 3 sample products

### 5. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (keep this secret!)

### 6. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (for server-side operations only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: Add `.env.local` to your `.gitignore` to keep keys secret!

## 📊 Database Schema Overview

### Core Tables

#### **products**
Main product information (price, stock, tube specs)
- Supports deposit reservations
- Tube-specific fields: topology, tube_type, power_watts, taps, min_speaker_sensitivity

#### **product_translations**
Multilingual content (name, description, etc.)
- One row per locale per product
- Currently supports: `vi`, `en`

#### **product_images**
Product photos with ordering
- `is_primary` flag for main image
- `position` for gallery ordering

#### **orders**
Customer orders with full details
- Supports both regular and deposit orders
- Tracks payment status and order status
- Stores shipping address

#### **order_items**
Individual items in each order
- Snapshots product data at time of order
- Tracks quantity and pricing

#### **user_profiles**
Extended user data (linked to Supabase Auth)
- Role-based access (customer, admin, super_admin)
- Preferred locale

#### **product_reviews**
Customer reviews with ratings
- Verified purchase flag
- Approval workflow

#### **guides**
Educational content
- Categorized (beginner, technical, matching)
- Multilingual via `guide_translations`

### Key Features

#### 🔒 Row Level Security (RLS)
All tables have RLS enabled with policies:
- Public can view published products
- Users can only view/edit their own data
- Admins have full access

#### 🔄 Automatic Triggers
- `updated_at` auto-updates on row changes
- Order numbers auto-generate (ORD-YYYYMMDD-XXXXXX)
- Order status changes are tracked in history
- Product stock updates automatically when orders are placed

#### 📈 Views
- `products_with_translations`: Products joined with translations
- `order_summary`: Orders with item counts and user info

## 🔐 Setting Up Admin Users

### Method 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in email and password
4. Click **"Create user"**
5. Copy the user's UUID
6. Go to **SQL Editor** and run:

```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES ('paste-user-uuid-here', 'admin@example.com', 'Admin Name', 'admin');
```

### Method 2: Via Sign-up Flow

1. Create a normal user via your app's sign-up
2. Find their UUID in Authentication → Users
3. Update their role in SQL Editor:

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

## 📝 Common Queries

### Get all products with Vietnamese translations

```sql
SELECT * FROM products_with_translations
WHERE locale = 'vi' AND is_published = true
ORDER BY created_at DESC;
```

### Get product with all translations

```sql
SELECT 
    p.*,
    json_agg(
        json_build_object(
            'locale', pt.locale,
            'name', pt.name,
            'description', pt.description
        )
    ) as translations
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id
WHERE p.slug = 'classic-se-300b-amplifier'
GROUP BY p.id;
```

### Get orders for a user

```sql
SELECT * FROM order_summary
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;
```

### Get product reviews with average rating

```sql
SELECT 
    p.slug,
    pt.name,
    COUNT(pr.id) as review_count,
    AVG(pr.rating) as average_rating
FROM products p
LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.locale = 'vi'
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
GROUP BY p.id, p.slug, pt.name;
```

## 🔧 Maintenance

### Backup Database

1. Go to **Settings** → **Database**
2. Scroll to **Database Backups**
3. Click **"Download backup"**

### Monitor Performance

1. Go to **Database** → **Query Performance**
2. Review slow queries
3. Add indexes if needed

### Update Schema

When you need to modify the schema:

1. Write migration SQL
2. Test in development project first
3. Run in production during low-traffic period
4. Always backup before major changes

## 🐛 Troubleshooting

### "relation does not exist" error
- Make sure you ran schema.sql completely
- Check you're in the correct schema (public)

### RLS blocking queries
- Check your RLS policies
- Use service_role key for admin operations
- Verify user authentication

### Foreign key constraint errors
- Ensure referenced records exist first
- Check cascade delete settings

### Performance issues
- Add indexes on frequently queried columns
- Use views for complex joins
- Enable query caching

## 📚 Next Steps

1. **Install Supabase Client**:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Client** (`src/lib/supabase.ts`):
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

3. **Fetch Products**:
   ```typescript
   const { data: products } = await supabase
     .from('products_with_translations')
     .select('*')
     .eq('locale', 'vi')
     .eq('is_published', true)
   ```

4. **Enable Storage** (for product images):
   - Go to **Storage** in Supabase dashboard
   - Create bucket: `product-images`
   - Set public access policies

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

**Need help?** Check the Supabase Discord or documentation for support.
