# Post-Deployment Verification Checklist

Your deployment was **successful**! ✅ Now verify everything is working correctly.

## 🔍 Quick Health Checks

### 1. Site is Accessible
- [ ] Visit your deployed URL (e.g., `https://your-project.vercel.app`)
- [ ] Homepage loads without errors
- [ ] No console errors in browser DevTools

### 2. Environment Variables
Check Vercel Dashboard → Settings → Environment Variables. All these should be set:

**Critical (Required):**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL` (should be your Vercel URL or custom domain)
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`

**Bank Transfer (Required for deposits):**
- [ ] `VIETQR_BANK_BIN` or `BANK_BIN`
- [ ] `VIETQR_ACCOUNT_NUMBER` or `BANK_ACCOUNT_NUMBER`
- [ ] `VIETQR_ACCOUNT_NAME` or `BANK_ACCOUNT_NAME`

**Optional:**
- [ ] `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using Stripe)
- [ ] `ADMIN_ALLOWLIST_EMAILS`
- [ ] `CRON_SECRET`
- [ ] `DEPOSIT_EXPIRY_HOURS` (defaults to 24 if not set)

### 3. Database Setup
In Supabase SQL Editor, verify these tables exist:
- [ ] `orders`
- [ ] `order_items`
- [ ] `order_tracking_tokens`
- [ ] `order_emails`
- [ ] `deposit_transfer_proofs`
- [ ] `products`
- [ ] `user_profiles`

### 4. Storage Buckets
In Supabase Dashboard → Storage:
- [ ] `product-images` bucket exists and is **public**
- [ ] `deposit_proofs` bucket exists (can be private or public)

### 5. Test Core Features

#### Product Pages
- [ ] Visit a product page (e.g., `/product/[slug]`)
- [ ] Product images load correctly
- [ ] Add to cart works

#### Checkout
- [ ] Add item to cart
- [ ] Go to checkout page
- [ ] Fill out form
- [ ] Test both payment methods:
  - [ ] Stripe checkout (if configured)
  - [ ] Bank transfer deposit

#### Order Success
- [ ] Complete a test order
- [ ] Order success page loads
- [ ] For bank transfer: VietQR code displays
- [ ] Bank details are shown correctly

#### Order Tracking
- [ ] Visit `/order/track`
- [ ] Enter order code and email
- [ ] Order details display correctly
- [ ] For deposit orders: proof upload section appears

#### Admin Panel
- [ ] Visit `/admin/login`
- [ ] Login with admin credentials
- [ ] Admin email is in `ADMIN_ALLOWLIST_EMAILS`
- [ ] Can view orders
- [ ] Can view products
- [ ] Can approve/reject deposit proofs (if applicable)

### 6. Email Notifications
- [ ] Create a test order
- [ ] Check email inbox for order confirmation
- [ ] Email contains correct order details
- [ ] Tracking link in email works

### 7. API Endpoints
Test these critical endpoints (use Postman or curl):

```bash
# Order tracking
curl https://your-domain.com/api/order/track \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"orderCode":"TEST-001","emailOrPhone":"test@example.com"}'

# Cron endpoint (should require auth)
curl https://your-domain.com/api/cron/expire-deposits \
  -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 8. Error Monitoring
Check Vercel Dashboard → Logs:
- [ ] No critical errors in function logs
- [ ] No 500 errors in access logs
- [ ] API routes respond correctly

## 🐛 Common Post-Deployment Issues

### Issue: "Supabase client not initialized"
**Solution:** 
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check they match your Supabase project

### Issue: Images not loading
**Solution:**
- Verify `product-images` bucket exists in Supabase Storage
- Check bucket is set to **public**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### Issue: Bank transfer QR code not showing
**Solution:**
- Check `VIETQR_BANK_BIN` or `BANK_BIN` is set
- Check `VIETQR_ACCOUNT_NUMBER` or `BANK_ACCOUNT_NUMBER` is set
- Check `VIETQR_ACCOUNT_NAME` or `BANK_ACCOUNT_NAME` is set

### Issue: Emails not sending
**Solution:**
- Verify `RESEND_API_KEY` is set correctly
- Verify `RESEND_FROM_EMAIL` matches a verified domain in Resend
- Check Resend dashboard for delivery status

### Issue: Admin panel access denied
**Solution:**
- Verify admin email is in `ADMIN_ALLOWLIST_EMAILS` (comma-separated)
- Create admin user in Supabase Auth
- Make sure email matches exactly (case-sensitive)

### Issue: Cron job not running
**Solution:**
- Verify `vercel.json` exists with cron configuration
- Check `CRON_SECRET` is set
- Wait 15 minutes and check if deposits are expiring
- Or test manually with the curl command above

## 📊 Monitoring

### Vercel Analytics
- [ ] Enable Vercel Analytics (optional)
- [ ] Monitor page views and errors

### Supabase Monitoring
- [ ] Check Supabase Dashboard → Logs
- [ ] Monitor database usage
- [ ] Check storage usage

## ✅ Success Criteria

Your deployment is fully working when:
1. ✅ Homepage loads without errors
2. ✅ Products display correctly
3. ✅ Checkout process completes
4. ✅ Orders are created in database
5. ✅ Email notifications are sent
6. ✅ Order tracking works
7. ✅ Admin panel is accessible
8. ✅ No critical errors in logs

## 🆘 Still Having Issues?

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for error messages

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   - Double-check all variables are set correctly
   - Make sure there are no typos
   - Ensure values match your Supabase/Resend/Stripe accounts

4. **Test Locally:**
   - Run `npm run build` locally
   - Test with `npm run dev`
   - Compare local vs deployed behavior

5. **Check Database:**
   - Verify all migrations are run
   - Check RLS policies are correct
   - Verify storage buckets exist

## 🎉 You're Done!

Once all items are checked, your store is ready for customers!

