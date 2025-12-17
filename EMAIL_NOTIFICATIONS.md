# Email Notifications System

**Last Updated:** December 12, 2025  
**Status:** ✅ Complete

## Overview

The email notification system sends transactional emails to customers for order confirmations and status updates. It uses Resend as the email provider and integrates seamlessly with the existing Supabase-backed order system.

## Features

- ✅ Order confirmation emails sent immediately after checkout
- ✅ Status update emails for key order status changes (confirmed, shipped, delivered, cancelled)
- ✅ Full localization support (Vietnamese/English)
- ✅ Email logging and tracking in database
- ✅ Idempotency (no duplicate emails)
- ✅ Graceful error handling (email failures don't break order creation)
- ✅ Admin visibility of email send status

## Setup

### 1. Install Dependencies

The Resend package is already installed:

```bash
npm install resend
```

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email sender address (must be verified in Resend)
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Bank transfer information (optional, for bank transfer payment emails)
BANK_NAME=Your Bank Name
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=Your Account Name
```

### 3. Database Migration

Run the SQL migration to create the `order_emails` table:

```bash
# In Supabase SQL Editor or via CLI
psql -f supabase/CREATE_ORDER_EMAILS_TABLE.sql
```

Or manually execute the SQL in `supabase/CREATE_ORDER_EMAILS_TABLE.sql`.

### 4. Resend Domain Setup

1. Sign up for a Resend account at https://resend.com
2. Add and verify your sending domain
3. Get your API key from the dashboard
4. Add the API key to your environment variables

**Note:** In development, you can use the default Resend sandbox domain (`onboarding@resend.dev`), but emails will be limited. For production, you must verify your own domain.

## Architecture

### Email Service (`src/lib/emails/service.ts`)

The email service handles:
- Email template generation (HTML + plain text)
- Sending emails via Resend API
- Logging email attempts to database
- Idempotency checks
- Error handling

### Email Types

#### 1. Order Confirmation

**Trigger:** Immediately after successful order creation  
**Recipient:** `customer_email` from order  
**Content:**
- Order code
- Order summary (items, quantities, prices)
- Total amount
- Shipping address
- Payment instructions (COD or bank transfer)

**Idempotency:** One email per order (enforced by unique constraint)

#### 2. Status Update

**Trigger:** When admin updates order status  
**Recipient:** `customer_email` from order  
**Statuses that trigger emails:**
- `confirmed`
- `shipped`
- `delivered`
- `cancelled`

**Content:**
- Order code
- New status (localized)
- Status description
- Optional admin note

**Idempotency:** One email per (order_id, status) combination

### Database Schema

The `order_emails` table tracks all email sends:

```sql
CREATE TABLE order_emails (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    type TEXT CHECK (type IN ('order_confirmation', 'status_update')),
    to_email TEXT NOT NULL,
    locale TEXT DEFAULT 'vi',
    status TEXT CHECK (status IN ('queued', 'sent', 'failed', 'skipped_no_email')),
    provider_message_id TEXT,
    error_message TEXT,
    metadata_status TEXT, -- For status_update: the status that triggered this email
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE(order_id, type), -- For order_confirmation
    UNIQUE(order_id, type, metadata_status) -- For status_update
);
```

### Localization

Email content is localized based on:
1. `orders.locale` field (stored at checkout time)
2. Fallback to `NEXT_LOCALE` cookie
3. Final fallback: Vietnamese (`vi`)

Translation files:
- `messages/vi/emails.json` - Vietnamese translations
- `messages/en/emails.json` - English translations

## Integration Points

### Order Creation (`src/app/api/orders/route.ts`)

After order and order_items are successfully created:

```typescript
// Send order confirmation email (non-blocking)
if (body.customerInfo.email) {
    sendOrderConfirmationEmail(order.id, {
        orderCode: order.order_number,
        customerName: body.customerInfo.fullName,
        // ... other payload fields
        locale,
    }).catch((error) => {
        console.error('Failed to send order confirmation email:', error);
        // Don't throw - email failure shouldn't break order creation
    });
}
```

### Status Update (`src/lib/repositories/admin/orders.ts`)

After order status is successfully updated:

```typescript
// Send status update email (non-blocking)
if (currentOrder.customer_email) {
    sendStatusUpdateEmail(currentOrder.id, {
        orderCode,
        customerName: currentOrder.customer_name,
        customerEmail: currentOrder.customer_email,
        oldStatus: currentStatus,
        newStatus,
        note,
        locale: locale as Locale,
    }).catch((error) => {
        console.error('Failed to send status update email:', error);
        // Don't throw - email failure shouldn't break status update
    });
}
```

## Admin UI

The admin order detail page (`src/app/admin/orders/[orderCode]/page.tsx`) displays email status:

- **Confirmation Email Status:** Shows if order confirmation email was sent, failed, or skipped
- **Last Status Update Email:** Shows the most recent status update email status

Email statuses are displayed with color-coded badges:
- 🟡 Queued
- 🟢 Sent
- 🔴 Failed
- ⚪ Skipped (No Email)

## Email Templates

Email templates are generated as HTML with inline CSS for maximum compatibility. They include:

- Responsive design (mobile-friendly)
- Plain text fallback
- Brand colors (dark background + brass accent)
- Clear call-to-actions
- Payment instructions
- Support contact information

Templates are defined in `src/lib/emails/service.ts`:
- `generateOrderConfirmationEmail()` - Order confirmation template
- `generateStatusUpdateEmail()` - Status update template

## Error Handling

### Email Failures

Email sending failures are handled gracefully:

1. **Order Creation:** Email failure does not prevent order creation
2. **Status Update:** Email failure does not prevent status update
3. **Logging:** All failures are logged to `order_emails` table with error messages
4. **Admin Visibility:** Failed emails are visible in admin UI

### Common Issues

#### 1. "Invalid API Key"

**Solution:** Check that `RESEND_API_KEY` is set correctly in environment variables.

#### 2. "Domain not verified"

**Solution:** Verify your sending domain in Resend dashboard, or use the sandbox domain for testing.

#### 3. "Email skipped (no email)"

**Solution:** This is expected behavior when customer doesn't provide an email. Order creation still succeeds.

#### 4. "Email already sent"

**Solution:** This is expected due to idempotency. The system prevents duplicate emails.

## Testing

### Manual Testing

1. **Order Confirmation:**
   - Place a test order with a valid email
   - Check email inbox for confirmation
   - Verify email content is correct
   - Check admin order detail page for email status

2. **Status Update:**
   - Update order status to `confirmed`
   - Check email inbox for status update
   - Verify email content is correct
   - Check admin order detail page for email status

3. **Localization:**
   - Place orders with Vietnamese locale (cookie set to `vi`)
   - Place orders with English locale (cookie set to `en`)
   - Verify emails are in correct language

4. **Error Handling:**
   - Place order without email (should skip gracefully)
   - Use invalid API key (should log error, not break order)

### Database Verification

Check email logs:

```sql
SELECT * FROM order_emails 
WHERE order_id = 'your-order-id'
ORDER BY created_at DESC;
```

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is set correctly
2. Verify domain is verified in Resend (or use sandbox)
3. Check server logs for error messages
4. Verify `order_emails` table exists and has correct schema
5. Check that customer email is provided in order

### Emails Sending But Not Received

1. Check spam/junk folder
2. Verify email address is correct
3. Check Resend dashboard for delivery status
4. Verify domain SPF/DKIM records are set correctly

### Duplicate Emails

The system has idempotency built-in. If you see duplicates:

1. Check `order_emails` table for duplicate entries
2. Verify unique constraints are working
3. Check for race conditions in concurrent requests

## Future Enhancements

Potential improvements:

- [ ] Email retry mechanism (automatic retry for failed emails)
- [ ] Email template designer UI
- [ ] Email preview in admin panel
- [ ] Manual "Resend" button in admin UI
- [ ] Email analytics dashboard
- [ ] A/B testing for email templates
- [ ] PDF invoice attachments
- [ ] SMS notifications integration

## Security Considerations

- ✅ API keys stored in environment variables (never in code)
- ✅ Email sending is server-side only (no client exposure)
- ✅ Admin-only access to email status
- ✅ No user input directly in email content (sanitized)
- ✅ Idempotency prevents email spam

## Support

For issues or questions:
- Check Resend documentation: https://resend.com/docs
- Review server logs for detailed error messages
- Check `order_emails` table for email send history

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 12, 2025

