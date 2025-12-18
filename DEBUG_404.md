# Debug 404 NOT_FOUND Error

## Step 1: Identify WHERE the error occurs

The 404 error could be happening in different places. We need to identify the exact location.

### Check Browser Console

1. Open your deployed site
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for the error message
5. Note:
   - **Which page** you're on when it happens
   - **The full error message**
   - **Any stack trace**

### Check Network Tab

1. In DevTools, go to **Network** tab
2. Refresh the page
3. Look for requests with **404 status** (red)
4. Click on the failed request
5. Check:
   - **Request URL** - Which endpoint failed?
   - **Response** - What's the error message?
   - **Headers** - What was requested?

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → **Logs**
2. Look for errors around the time you saw the 404
3. Check for:
   - Failed API routes
   - Database query errors
   - Missing environment variables

## Step 2: Common 404 Sources

### A. Missing Database Table

**Symptoms:**
- Error when loading products
- Error when creating orders
- Error when tracking orders

**Check:**
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'deposit_transfer_proofs',
    'order_tracking_tokens',
    'order_emails',
    'products',
    'orders'
)
ORDER BY table_name;
```

**Fix:** Run missing migration files

### B. Missing Storage Bucket

**Symptoms:**
- Product images don't load
- Deposit proof uploads fail
- 404 when accessing image URLs

**Check:**
```sql
-- Run in Supabase SQL Editor
SELECT name, public 
FROM storage.buckets 
WHERE name IN ('product-images', 'deposit_proofs');
```

**Fix:** Create missing buckets (you already did this)

### C. Missing Row/Data

**Symptoms:**
- Specific product page 404s
- Specific order can't be found
- `.single()` queries fail

**Check:** The query is looking for data that doesn't exist

**Fix:** Verify the data exists in the database

### D. Wrong Supabase Project

**Symptoms:**
- Everything 404s
- Tables/buckets exist but queries fail

**Check:** Environment variables in Vercel match your Supabase project

**Fix:** Update `NEXT_PUBLIC_SUPABASE_URL` and keys

### E. RLS Policy Blocking Access

**Symptoms:**
- Queries return 404 instead of empty results
- Works with service role but not with anon key

**Check:** RLS policies might be too restrictive

**Fix:** Review and adjust RLS policies

## Step 3: Specific Diagnostic Queries

Run these in Supabase SQL Editor to check everything:

```sql
-- 1. Check all required tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') 
        THEN '✅' ELSE '❌' 
    END as products,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') 
        THEN '✅' ELSE '❌' 
    END as orders,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deposit_transfer_proofs') 
        THEN '✅' ELSE '❌' 
    END as deposit_transfer_proofs,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_tracking_tokens') 
        THEN '✅' ELSE '❌' 
    END as order_tracking_tokens,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_emails') 
        THEN '✅' ELSE '❌' 
    END as order_emails;

-- 2. Check storage buckets
SELECT 
    name,
    CASE WHEN public THEN '✅ PUBLIC' ELSE '❌ PRIVATE' END as status
FROM storage.buckets
WHERE name IN ('product-images', 'deposit_proofs');

-- 3. Check if you have any products
SELECT COUNT(*) as product_count FROM products;

-- 4. Check if orders table has required columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('bank_transfer_memo', 'deposit_due_at', 'payment_method')
ORDER BY column_name;
```

## Step 4: Test Specific Endpoints

Test these endpoints directly to see which one fails:

```bash
# Test homepage (should work)
curl https://your-domain.com/

# Test products API (if you have products)
curl https://your-domain.com/api/products

# Test order creation (will fail without proper data, but shouldn't 404)
curl https://your-domain.com/api/orders -X POST -H "Content-Type: application/json" -d '{}'
```

## Step 5: Check Environment Variables

In Vercel Dashboard → Settings → Environment Variables, verify:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Matches your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Matches your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Matches your service role key

**To verify:**
1. Go to Supabase Dashboard → Settings → API
2. Compare URLs and keys with Vercel environment variables
3. Make sure they match exactly

## Step 6: Check Specific Error Context

The error ID `sin1::kxrhz-1766019890048-2ce8f126fac0` is a Supabase error.

**To get more details:**
1. Check Supabase Dashboard → Logs
2. Look for errors around timestamp `1766019890048` (Unix timestamp)
3. The log will show which query/operation failed

## What to Share

To help debug further, please share:

1. **Which page/URL** shows the 404?
   - Homepage?
   - Product page?
   - Order tracking?
   - Admin panel?

2. **Browser Console error** (full message)

3. **Network tab** - Which request returns 404?

4. **Vercel Logs** - Any errors in function logs?

5. **Supabase Logs** - Any failed queries?

This will help pinpoint the exact issue!

