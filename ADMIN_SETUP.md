# Admin Panel Setup Guide

## Overview

The admin panel provides product management functionality for Restore The Basic. It uses Supabase Auth for authentication and an email allowlist for authorization.

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Admin email allowlist (comma-separated)
ADMIN_ALLOWLIST_EMAILS=admin@example.com,another@example.com

# Service role key (required for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It's only used server-side.

### 2. Create Admin User in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and password for admin user
4. Make sure the email matches one in `ADMIN_ALLOWLIST_EMAILS`

### 3. Access Admin Panel

1. Navigate to `/[locale]/admin/login` (e.g., `/vi/admin/login` or `/en/admin/login`)
2. Sign in with admin credentials
3. You'll be redirected to `/admin/products`

## Features

### Product Management

- **List Products**: View all products with search, filters, and pagination
- **Create Product**: Add new products as drafts
- **Edit Product**: Update product details and translations
- **Publish/Unpublish**: Toggle product visibility on storefront

### Product Fields

**Core Fields:**
- Slug (unique identifier)
- Price (VND)
- Compare at Price (optional)
- Stock Quantity
- Condition (New/Like New/Vintage)
- Topology (SE/PP)
- Tube Type
- Power (Watts)
- Speaker Taps
- Minimum Speaker Sensitivity

**Translations (VI + EN):**
- Name
- Short Description
- Description

**Publishing:**
- Published status
- Featured flag
- Vintage flag

## Security

- Admin routes are protected by authentication check
- Only emails in `ADMIN_ALLOWLIST_EMAILS` can access admin
- All mutations use service role key (server-side only)
- RLS policies don't apply to admin operations (bypassed by service role)

## Routes

- `/[locale]/admin/login` - Admin login page
- `/[locale]/admin/products` - Products list
- `/[locale]/admin/products/new` - Create new product
- `/[locale]/admin/products/[id]` - Edit product

## API Routes

- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `GET /api/admin/products/[id]/translations/[locale]` - Get translation

## Notes

- Products created as drafts won't appear on storefront until published
- Slug must be unique and URL-friendly (lowercase, hyphens)
- All prices are in VND
- Translations are required for Vietnamese, English is optional

