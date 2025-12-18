# Debug Supabase 404 NOT_FOUND Error

## The Error
You're getting: `404: NOT_FOUND` with ID `sin1::45r2z-1766020443148-880a32d6f637`

This is a **Supabase error**, meaning a query is trying to access a resource that doesn't exist.

## Step 1: Identify WHERE the error occurs

### Check Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project → **Logs**
2. Look for errors around the timestamp `1766020443148` (Unix timestamp)
3. Find the **exact error message** and **which function/route** failed

### Check Browser Network Tab

1. Open your deployed site
2. Press **F12** → **Network** tab
3. Refresh the page
4. Look for requests with **404 status**
5. Click on the failed request
6. Check:
   - **Request URL** - Which endpoint?
   - **Response** - Full error message
   - **Headers** - What was requested?

## Step 2: Common Causes

### A. Missing Table (Most Likely)

**Symptoms:**
- Error happens on page load
- Error happens when accessing a specific feature

**Check:**
Run this in Supabase SQL Editor:

```sql
-- Check if critical tables exist
SELECT 
    table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    VALUES 
        ('products'),
        ('product_translations'),
        ('product_images'),
        ('orders'),
        ('deposit_transfer_proofs'),
        ('order_tracking_tokens'),
        ('order_emails')
) AS t(table_name);
```

**Fix:** Run missing migration files

### B. Missing Storage Bucket

**Symptoms:**
- Images don't load
- 404 when accessing image URLs

**Check:**
```sql
SELECT name, public FROM storage.buckets 
WHERE name IN ('product-images', 'deposit_proofs');
```

**Fix:** Create missing buckets in Supabase Dashboard

### C. RLS Policy Blocking Access

**Symptoms:**
- Works locally but fails in production
- Error happens with anon key but not service role

**Check:** RLS might be too restrictive

**Fix:** Review RLS policies

### D. Wrong Supabase Project

**Symptoms:**
- Everything 404s
- Tables exist but queries fail

**Check:** Environment variables in Vercel match your Supabase project

## Step 3: Quick Diagnostic

Run `supabase/CHECK_SUPABASE_404.sql` in Supabase SQL Editor. It will:
- ✅ Check all required tables
- ✅ Check storage buckets
- ✅ Check RLS status
- ✅ Test queries

## Step 4: Most Likely Fix

Based on the error pattern, the most common issue is **missing `deposit_transfer_proofs` table**.

**Quick Fix:**
1. Go to Supabase SQL Editor
2. Run: `supabase/CREATE_DEPOSIT_TRANSFER_PROOFS_TABLE.sql`
3. Verify it was created:
   ```sql
   SELECT COUNT(*) FROM deposit_transfer_proofs;
   ```
4. Redeploy on Vercel

## Step 5: Check Vercel Environment Variables

Make sure these are set correctly in **Vercel Dashboard → Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL` - Should match your Supabase project URL exactly
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Should match your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Should match your service role key

**To verify:**
1. Go to Supabase Dashboard → Settings → API
2. Compare URLs and keys with Vercel environment variables
3. Make sure there are no extra spaces or characters

## Step 6: Check Supabase Logs

1. Go to **Supabase Dashboard → Logs**
2. Look for errors around the time you saw the 404
3. The log will show:
   - Which query failed
   - Which table/bucket was missing
   - The exact error

## What to Share

To help debug further, please share:

1. **Vercel Logs** - Copy the error from Function Logs
2. **Which page/URL** shows the 404
3. **Browser Console** - Any additional errors
4. **Results of CHECK_SUPABASE_404.sql** - What's missing?

## Quick Test

After fixing, test these endpoints:

```bash
# Test homepage (should work)
curl https://your-domain.com/

# Test products (if you have products)
curl https://your-domain.com/tube-amplifiers

# Test API
curl https://your-domain.com/api/orders -X POST -H "Content-Type: application/json" -d '{}'
```


