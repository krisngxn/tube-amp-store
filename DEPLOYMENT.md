# Deployment Guide

This guide will help you deploy the Restore The Basic tube amp store to production.

## 🚀 Quick Start

### Prerequisites

1. **Vercel Account** (recommended for Next.js)
2. **Supabase Project** (database and storage)
3. **Resend Account** (for email notifications)
4. **Stripe Account** (for payment processing, optional)

## 📋 Required Environment Variables

Add these environment variables in your Vercel project settings (Settings → Environment Variables):

### Core Configuration (Required)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site URL (for email links and redirects)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Admin Panel
ADMIN_ALLOWLIST_EMAILS=admin@yourdomain.com,another@yourdomain.com
```

### Email Configuration (Required)

```env
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Bank Transfer Info (for email templates)
BANK_NAME=Your Bank Name
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=Your Account Name
```

### Bank Transfer / VietQR (Required for deposit reservations)

```env
# VietQR Configuration
VIETQR_BANK_BIN=970436
# OR use these (backward compatible):
BANK_BIN=970436
VIETQR_ACCOUNT_NUMBER=1234567890123
# OR:
BANK_ACCOUNT_NUMBER=1234567890123
VIETQR_ACCOUNT_NAME=RESTORE THE BASIC
# OR:
BANK_ACCOUNT_NAME=RESTORE THE BASIC

# Deposit Expiry (optional, defaults to 24 hours)
DEPOSIT_EXPIRY_HOURS=24
```

### Stripe Configuration (Optional - only if using Stripe payments)

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Cron Job Configuration (Required for auto-expiring deposits)

```env
# Cron Secret (for protecting the expire-deposits endpoint)
CRON_SECRET=your-secure-random-secret-here
```

## 🗄️ Database Setup

### 1. Run SQL Migrations

In your Supabase SQL Editor, run these files in order:

1. `supabase/schema.sql` - Main schema
2. `supabase/CREATE_ORDER_TRACKING_TOKENS_TABLE.sql` - Order tracking
3. `supabase/CREATE_ORDER_EMAILS_TABLE.sql` - Email logging
4. `supabase/ADD_DEPOSIT_RESERVATION_FIELDS.sql` - Deposit fields
5. `supabase/CREATE_DEPOSIT_TRANSFER_PROOFS_TABLE.sql` - Deposit proofs
6. `supabase/ADD_DEPOSIT_RESERVATION_INDEXES.sql` - Indexes

### 2. Create Storage Buckets

In Supabase Dashboard → Storage:

1. Create bucket: `product-images`
   - Set to **Public**
   - Enable RLS policies

2. Create bucket: `deposit_proofs`
   - Set to **Private** (or Public if you want)
   - Enable RLS policies

## 🔄 Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

### 2. Configure Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 3. Add Environment Variables

1. Go to Project Settings → Environment Variables
2. Add all variables from the "Required Environment Variables" section above
3. Make sure to set them for **Production**, **Preview**, and **Development** environments as needed

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your site will be live at `your-project.vercel.app`

## ⏰ Cron Job Setup

The deposit expiry cron job needs to run periodically. You have two options:

### Option 1: Vercel Cron (Recommended)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-deposits",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

This runs every 15 minutes. Make sure `CRON_SECRET` is set in environment variables.

### Option 2: External Cron Service

Use a service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Cronitor](https://cronitor.io)

Configure it to POST to: `https://yourdomain.com/api/cron/expire-deposits`

With header: `Authorization: Bearer YOUR_CRON_SECRET`

## ✅ Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database migrations are run
- [ ] Storage buckets are created
- [ ] Admin user is created in Supabase Auth
- [ ] Admin email is in `ADMIN_ALLOWLIST_EMAILS`
- [ ] Resend domain is verified
- [ ] Stripe webhook is configured (if using Stripe)
- [ ] Cron job is set up for deposit expiry
- [ ] Test order creation
- [ ] Test email notifications
- [ ] Test bank transfer deposit flow
- [ ] Test admin panel access
- [ ] Test order tracking

## 🐛 Common Deployment Issues

### Build Fails

**Error: Missing environment variable**
- Solution: Add all required environment variables in Vercel settings

**Error: TypeScript errors**
- Solution: Run `npm run build` locally first to catch errors

### Runtime Errors

**Error: "Supabase client not initialized"**
- Solution: Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

**Error: "Service role key required"**
- Solution: Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables

**Error: "Bank account not configured"**
- Solution: Set `VIETQR_ACCOUNT_NUMBER` or `BANK_ACCOUNT_NUMBER` environment variable

### Email Not Working

**Emails not sending**
- Check `RESEND_API_KEY` is set correctly
- Verify domain in Resend dashboard
- Check `RESEND_FROM_EMAIL` matches verified domain

### Cron Job Not Running

**Deposits not expiring**
- Verify `vercel.json` has cron configuration
- Check `CRON_SECRET` is set
- Test endpoint manually: `POST /api/cron/expire-deposits` with `Authorization: Bearer YOUR_SECRET`

## 🔒 Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **never** exposed to client (server-side only)
- [ ] `CRON_SECRET` is a strong random string
- [ ] `STRIPE_SECRET_KEY` is kept secure
- [ ] Admin emails are restricted via `ADMIN_ALLOWLIST_EMAILS`
- [ ] RLS policies are enabled on all tables
- [ ] Storage buckets have proper access policies

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables are set
4. Test locally with `npm run build` first

## 🎉 You're Done!

Once deployed, your store will be live and ready to accept orders!

