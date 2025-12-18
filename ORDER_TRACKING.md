# Order Tracking System

**Last Updated:** December 12, 2025  
**Status:** ✅ Complete

## Overview

The order tracking system allows customers to track their orders (including deposit reservations) without authentication. Customers can track orders using either:
1. **Form-based tracking**: Order code + email/phone verification
2. **Token-based tracking**: Secure link from email with short-lived token

## Features

- ✅ Form-based order tracking (`/order/track`)
- ✅ Token-based tracking via email links (`/order/track/[code]?t=<token>`)
- ✅ Order status timeline with history
- ✅ Deposit reservation details display
- ✅ Payment status tracking
- ✅ Rate limiting to prevent abuse
- ✅ Generic error messages to prevent enumeration
- ✅ Full localization (Vietnamese/English)
- ✅ Email integration with tracking links

## Architecture

### Repository Layer (`src/lib/repositories/orders/tracking.ts`)

**Functions:**
- `trackOrderByCodeAndContact(orderCode, emailOrPhone)` - Validates order code and contact info, returns sanitized order DTO
- `trackOrderByToken(orderCode, token)` - Validates token and returns order DTO
- `generateTrackingToken(orderId, orderCode)` - Generates secure token (7-day expiry)
- `validateTrackingToken(orderCode, token)` - Validates token and returns orderId

**Token Storage:**
- In-memory Map (MVP)
- Tokens expire after 7 days
- Automatic cleanup of expired tokens

**Security:**
- Uses service role client to bypass RLS
- Normalizes contact info for comparison (case-insensitive, whitespace-agnostic)
- Returns generic "not found" for mismatches to prevent enumeration

### API Routes

#### POST `/api/order/track`

**Request:**
```json
{
  "orderCode": "ORD-20241212-000001",
  "emailOrPhone": "customer@example.com"
}
```

**Response (Success):**
```json
{
  "order": {
    "orderCode": "ORD-20241212-000001",
    "createdAt": "2024-12-12T10:00:00Z",
    "status": "confirmed",
    "paymentStatus": "paid",
    "orderType": "standard",
    "orderItems": [...],
    "statusHistory": [...],
    "subtotal": 1000000,
    "total": 1000000,
    ...
  }
}
```

**Response (Error):**
```json
{
  "error": "Order not found"
}
```

**Rate Limiting:**
- 10 requests per 15 minutes per IP
- Returns 429 status if rate limited

#### GET `/api/order/track-token?code=...&t=...`

**Query Parameters:**
- `code` - Order code
- `t` - Tracking token

**Response:** Same as POST `/api/order/track`

### Pages

#### `/order/track` (Form Page)

**Features:**
- Form with order code and email/phone fields
- Client-side form submission
- Displays order details on success
- Shows error messages for invalid input or not found

**Components:**
- Order header with status badge
- Status timeline (chronological)
- Order items list
- Totals breakdown
- Deposit details (if applicable)
- Payment status

#### `/order/track/[code]` (Token Page)

**Features:**
- Server-side rendered
- Validates token from query parameter
- Redirects to form page if token missing/invalid/expired
- Shows same order details as form page

**Security:**
- Token must be present in URL
- Token validated server-side
- Redirects with error if invalid

### Email Integration

**Order Confirmation Email:**
- Automatically generates tracking token
- Includes tracking link in email
- Link format: `/order/track/[orderCode]?t=[token]`
- Token expires in 7 days

**Tracking Link Format:**
```
https://yourdomain.com/order/track/ORD-20241212-000001?t=abc123...
```

**Localization:**
- Tracking link text localized based on order locale
- Supports Vietnamese and English

## Security Considerations

### Order Enumeration Prevention

1. **Form Method:**
   - Requires both order code AND email/phone match
   - Returns generic "not found" for any mismatch
   - Does not reveal which field was wrong

2. **Token Method:**
   - Token is cryptographically secure (32 bytes random)
   - Token expires after 7 days
   - Token validated server-side
   - Order code must match token's order

### Rate Limiting

- Simple in-memory rate limiting (MVP)
- 10 requests per 15 minutes per IP
- Automatic cleanup of expired entries
- **Note:** For production, consider Redis-based rate limiting

### Data Exposure

- DTO only includes customer-facing information
- No admin notes or internal fields exposed
- No PII beyond what customer provided

## DTO Structure

```typescript
interface TrackedOrderDTO {
    orderCode: string;
    createdAt: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    orderType: 'standard' | 'deposit_reservation';
    depositAmountVnd?: number;
    depositDueAt?: string;
    depositReceivedAt?: string;
    remainingAmount?: number;
    paymentMethod: 'cod' | 'bank_transfer';
    orderItems: OrderItem[];
    statusHistory: OrderStatusHistory[];
    subtotal: number;
    shippingFee: number;
    tax: number;
    discount: number;
    total: number;
}
```

## Localization

### Translation Files

- `messages/en/tracking.json` - English translations
- `messages/vi/tracking.json` - Vietnamese translations
- `messages/en/emails.json` - Email tracking link text (English)
- `messages/vi/emails.json` - Email tracking link text (Vietnamese)

### Translation Keys

**Tracking Page:**
- `tracking.title` - Page title
- `tracking.form.orderCode` - Order code label
- `tracking.order.status` - Status label
- `tracking.status.*` - Status labels
- `tracking.paymentStatus.*` - Payment status labels

**Email:**
- `emails.orderConfirmation.trackOrder` - Tracking section title
- `emails.orderConfirmation.trackButton` - Tracking button text
- `emails.orderConfirmation.trackNote` - Tracking note

## Testing

### Test Form-Based Tracking

1. Create an order (via checkout)
2. Navigate to `/order/track`
3. Enter order code and email/phone
4. Verify order details display correctly

### Test Token-Based Tracking

1. Create an order (via checkout)
2. Check email for tracking link
3. Click tracking link
4. Verify order details display without form
5. Test expired token (wait 7+ days or manually expire)

### Test Error Cases

1. Invalid order code → Should show "not found"
2. Wrong email/phone → Should show "not found" (not reveal which field)
3. Missing token → Should redirect to form page
4. Invalid token → Should redirect to form page
5. Expired token → Should redirect to form page

### Test Rate Limiting

1. Make 10+ requests from same IP within 15 minutes
2. Verify 11th request returns 429 status
3. Wait 15 minutes and verify rate limit resets

## Environment Variables

**Required:**
- `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_VERCEL_URL` - Base URL for tracking links (defaults to localhost)

**Optional:**
- None (uses existing Supabase and email service config)

## Future Enhancements

1. **Token Storage:**
   - Move from in-memory Map to Redis or database
   - Support token revocation
   - Track token usage analytics

2. **Rate Limiting:**
   - Implement Redis-based rate limiting
   - Add per-order rate limiting
   - Add CAPTCHA after multiple failures

3. **Features:**
   - Email notifications on status changes with tracking links
   - SMS tracking links
   - Order history for authenticated users
   - Export order details as PDF

4. **Security:**
   - Add CSRF protection
   - Add request signing
   - Add IP allowlisting for admin endpoints

## Troubleshooting

### Tracking Link Not Working

1. Check `NEXT_PUBLIC_SITE_URL` environment variable
2. Verify token generation is working (check logs)
3. Check token expiry (7 days)
4. Verify order code matches token's order

### Rate Limiting Issues

1. Check IP detection (x-forwarded-for header)
2. Verify rate limit map cleanup is running
3. Consider increasing rate limit for testing

### Email Not Including Tracking Link

1. Check email service logs
2. Verify token generation is called
3. Check email template includes tracking section
4. Verify translations exist for tracking keys

## Related Files

- `src/lib/repositories/orders/tracking.ts` - Repository layer
- `src/app/api/order/track/route.ts` - Form-based API
- `src/app/api/order/track-token/route.ts` - Token-based API
- `src/app/order/track/page.tsx` - Form page
- `src/app/order/track/[code]/page.tsx` - Token page
- `src/lib/emails/service.ts` - Email service (generates tokens)
- `messages/*/tracking.json` - Translations
- `messages/*/emails.json` - Email translations



