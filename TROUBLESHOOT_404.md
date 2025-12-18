# Troubleshooting 404 NOT_FOUND Error

The error `404: NOT_FOUND` with ID format `sin1::...` is a **Supabase error**, indicating a missing resource (table, bucket, or row).

## 🔍 Quick Diagnosis

### Step 1: Check Which Resource is Missing

The error could be from:
1. **Missing Database Table** - Most common
2. **Missing Storage Bucket** - For images/proofs
3. **Missing Row** - Querying non-existent data
4. **Wrong Supabase Project** - Environment variables point to wrong project

### Step 2: Verify Database Tables

Run this in **Supabase SQL Editor** to check which tables exist:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Required tables that should exist:**
- [ ] `user_profiles`
- [ ] `products`
- [ ] `product_translations`
- [ ] `product_images`
- [ ] `orders`
- [ ] `order_items`
- [ ] `order_status_history`
- [ ] `order_tracking_tokens`
- [ ] `order_emails`
- [ ] `deposit_transfer_proofs`
- [ ] `product_reviews`
- [ ] `guides`
- [ ] `guide_translations`

### Step 3: Run Missing Migrations

If any tables are missing, run these SQL files in order:

1. **Main Schema:**
   ```sql
   -- Run: supabase/schema.sql
   ```

2. **Order Tracking:**
   ```sql
   -- Run: supabase/CREATE_ORDER_TRACKING_TOKENS_TABLE.sql
   ```

3. **Order Emails:**
   ```sql
   -- Run: supabase/CREATE_ORDER_EMAILS_TABLE.sql
   ```

4. **Deposit Reservations:**
   ```sql
   -- Run: supabase/ADD_DEPOSIT_RESERVATION_FIELDS.sql
   -- Run: supabase/CREATE_DEPOSIT_TRANSFER_PROOFS_TABLE.sql
   -- Run: supabase/ADD_DEPOSIT_RESERVATION_INDEXES.sql
   ```

### Step 4: Verify Storage Buckets

In **Supabase Dashboard → Storage → Buckets**, check:

- [ ] `product-images` bucket exists (should be **public**)
- [ ] `deposit_proofs` bucket exists (can be private or public)

**To create missing buckets:**

1. Go to **Storage → Buckets**
2. Click **New bucket**
3. For `product-images`:
   - Name: `product-images`
   - Public: ✅ **Enabled**
   - File size limit: 10MB
4. For `deposit_proofs`:
   - Name: `deposit_proofs`
   - Public: ✅ **Enabled** (or private if you prefer)
   - File size limit: 5MB

### Step 5: Check Environment Variables

Verify in **Vercel Dashboard → Settings → Environment Variables**:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Should match your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Should match your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Should match your Supabase service role key

**To verify:**
1. Go to Supabase Dashboard → Settings → API
2. Compare the URLs and keys with your Vercel environment variables

### Step 6: Check Where Error Occurs

**In Browser DevTools:**
1. Open **Network** tab
2. Find the failed request
3. Check the **Request URL** - this tells you which API endpoint failed
4. Check the **Response** - look for which table/bucket is missing

**Common failing endpoints:**
- `/api/orders` → Missing `orders` table
- `/api/order/track` → Missing `order_tracking_tokens` table
- Product pages → Missing `products` or `product_images` table
- Image loading → Missing `product-images` bucket
- Deposit proofs → Missing `deposit_transfer_proofs` table or `deposit_proofs` bucket

## 🔧 Quick Fixes

### Fix 1: Missing Tables

**Run all migrations in Supabase SQL Editor:**

```sql
-- 1. Main schema
-- Copy and paste entire contents of: supabase/schema.sql

-- 2. Order tracking
-- Copy and paste entire contents of: supabase/CREATE_ORDER_TRACKING_TOKENS_TABLE.sql

-- 3. Order emails
-- Copy and paste entire contents of: supabase/CREATE_ORDER_EMAILS_TABLE.sql

-- 4. Deposit fields
-- Copy and paste entire contents of: supabase/ADD_DEPOSIT_RESERVATION_FIELDS.sql

-- 5. Deposit proofs table
-- Copy and paste entire contents of: supabase/CREATE_DEPOSIT_TRANSFER_PROOFS_TABLE.sql

-- 6. Indexes
-- Copy and paste entire contents of: supabase/ADD_DEPOSIT_RESERVATION_INDEXES.sql
```

### Fix 2: Missing Storage Buckets

**Create in Supabase Dashboard:**

1. **Storage → Buckets → New bucket**
   - Name: `product-images`
   - Public: ✅ Enabled
   - Click **Create**

2. **Storage → Buckets → New bucket**
   - Name: `deposit_proofs`
   - Public: ✅ Enabled (or Private)
   - Click **Create**

### Fix 3: Wrong Supabase Project

**If environment variables point to wrong project:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy (Vercel will auto-redeploy when env vars change)

## 🧪 Test After Fix

After running migrations and creating buckets:

1. **Test homepage:**
   - Visit your deployed URL
   - Should load without 404 errors

2. **Test product page:**
   - Visit `/product/[any-slug]`
   - Should load product details

3. **Test API:**
   ```bash
   curl https://your-domain.com/api/orders \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

## 📋 Complete Checklist

- [ ] All SQL migrations are run in Supabase
- [ ] All required tables exist (check with SQL query above)
- [ ] `product-images` bucket exists and is public
- [ ] `deposit_proofs` bucket exists
- [ ] Environment variables are correct in Vercel
- [ ] Supabase project URL matches environment variables
- [ ] Redeployed after fixing (if needed)

## 🆘 Still Getting 404?

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for the exact error message
   - Note which API route is failing

2. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Look for failed queries
   - Note which table/bucket is missing

3. **Test Locally:**
   - Run `npm run dev`
   - Check if same error occurs
   - Compare local vs deployed behavior

4. **Verify Database Connection:**
   ```sql
   -- In Supabase SQL Editor
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM orders;
   ```
   If these queries fail, tables don't exist.

## ✅ Success Indicators

You've fixed the issue when:
- ✅ Homepage loads without errors
- ✅ Product pages load
- ✅ No 404 errors in browser console
- ✅ API endpoints respond correctly
- ✅ Images load from storage

