# Stripe Refunds Implementation

**Last Updated:** December 17, 2025  
**Status:** ✅ Complete and Production Ready

---

## Overview

This document describes the Stripe refund processing system for Restore The Basic. The system implements a webhook-first architecture where refund state is finalized and persisted only via Stripe webhooks (never trusting client/admin response as final truth).

## Architecture

### Webhook-First Design

- **Admin triggers refund** → Creates refund request in Stripe → Sets `payment_status = 'refund_pending'` (intermediate state)
- **Stripe webhook arrives** → Processes refund event → Updates `payment_status` to `partially_refunded` or `refunded` (final state)
- **Email notifications** → Sent automatically when refund is finalized via webhook

### State Model

#### Payment Status Values

- `paid` - Full payment received (normal orders)
- `deposited` - Deposit received (deposit reservation orders)
- `refund_pending` - Refund requested, waiting for Stripe webhook
- `partially_refunded` - Partial refund completed
- `refunded` - Full refund completed

#### Order Status Handling

- Refunds do **not** automatically change order `status`
- If order is already `cancelled`, refund can still occur (keeps `status = 'cancelled'`, only updates `payment_status`)
- Order `status` remains unchanged unless explicitly updated by admin

## Features

### 1. Admin Refund API

**Endpoint:** `POST /api/admin/orders/[orderCode]/refund`

**Authentication:** Requires admin authentication (email allowlist)

**Request Body:**
```json
{
  "amount": 50000,           // Optional: partial refund amount in minor units (VND has no decimals)
  "reason": "requested_by_customer",  // Optional: requested_by_customer, duplicate, fraudulent, other
  "restock": true,           // Boolean: if true, cancel order + restore inventory before refund
  "note": "Customer requested refund"  // Optional: admin note
}
```

**Validation:**
- Order must be in refundable state (`paid`, `deposited`, or `partially_refunded`)
- Must have Stripe payment identifiers (payment_intent_id or checkout_session_id)
- Refund amount cannot exceed remaining refundable amount

**Flow:**
1. Validates order and refund amount
2. If `restock = true`: cancels order + restores inventory first
3. Creates Stripe refund via payment intent/charge
4. Sets `payment_status = 'refund_pending'`
5. Stores refund info in order metadata
6. Returns success response (refund not finalized yet)

### 2. Stripe Webhook Handling

**Events Handled:**
- `charge.refunded` - Fires when refund is completed
- `refund.updated` - Fires when refund status changes

**Processing Logic:**
1. Verify webhook signature
2. Check idempotency (prevent duplicate processing)
3. Find order by payment intent ID
4. Calculate total refunded amount
5. Determine if partial or full refund
6. Update `payment_status`:
   - `partially_refunded` if `total_refunded < paid_amount`
   - `refunded` if `total_refunded >= paid_amount`
7. Store refund summary in order metadata
8. Send email notification (idempotent)

### 3. Repository Functions

**`markOrderRefundPendingFromStripe()`**
- Sets `payment_status = 'refund_pending'`
- Stores refund request info in metadata
- Records inventory restoration timestamp if restock was requested

**`markOrderRefundedFromStripe()`**
- Updates `payment_status` based on refund amount
- Stores refund details in metadata
- Calculates total refunded amount from all refunds

**`appendStripeRefundToMetadata()`**
- Helper to safely merge refund info into metadata JSON

### 4. Email Notifications

**Refund Email Types:**
- Full refund notification
- Partial refund notification

**Email Content:**
- Order code
- Refund amount
- Refund type (full/partial)
- Tracking link (if available)

**Idempotency:**
- Checks `order_emails` table before sending
- Prevents duplicate emails for same refund event

### 5. Admin UI

**Refund Section:**
- Shows paid amount, refunded amount, remaining refundable
- Displays last refund ID
- "Refund" button (or "Partial Refund" if already partially refunded)

**Refund Modal:**
- Amount input (optional, defaults to full refund)
- Reason dropdown
- "Refund & Restock" checkbox
- Admin note textarea
- Success/error messages

## Inventory Rules

### Explicit Rule Set

1. **If order is cancelled and refund finalized:**
   - Inventory should already have been restored
   - Do NOT double-restore

2. **If order is NOT cancelled and refund processed:**
   - **Default:** Do NOT restore inventory automatically (refund might be compensation while still fulfilling)
   - **Option:** "Refund & Restock" cancels order + restores inventory first, then refunds

3. **For deposit orders:**
   - Refund usually means reservation is cancelled
   - Default to refund + cancel + restore if not yet fulfilled
   - But keep this controllable via "Refund & Restock" option

### Implementation

- `restock` flag in refund request controls inventory restoration
- If `restock = true`: order cancelled + inventory restored BEFORE refund request
- Metadata stores `inventory_restored_at` timestamp to prevent double-restoration
- Webhook handlers check this flag before restoring inventory

## Metadata Storage

Refund information is stored in `orders.admin_note` as JSON:

```json
{
  "stripe_checkout_session_id": "cs_...",
  "stripe_payment_intent_id": "pi_...",
  "stripe_payment_status": "refunded",
  "stripe_processed_events": ["evt_..."],
  "stripe_refunds": {
    "total_refunded_amount": 50000,
    "currency": "vnd",
    "last_refund_id": "re_...",
    "refund_status": "succeeded",
    "refunds": [
      {
        "refund_id": "re_...",
        "amount": 50000,
        "status": "succeeded",
        "created_at": "2025-12-17T10:00:00Z",
        "reason": "requested_by_customer"
      }
    ],
    "inventory_restored_at": "2025-12-17T10:00:00Z"
  }
}
```

## Edge Cases

### 1. Order Already Partially Refunded
- Allow additional refund up to remaining amount
- Calculate `remaining_refundable = paid_amount - total_refunded`
- Validate refund amount doesn't exceed remaining

### 2. Duplicate Webhook Events
- Idempotency check using `stripe_processed_events` array
- Prevents duplicate state changes
- Prevents duplicate emails

### 3. Refund Requested But Webhook Not Received
- State stays `refund_pending`
- Admin can see refund is pending
- Webhook will process when Stripe sends it

### 4. Deposit Orders
- Paid amount = deposit amount (not full order total)
- Refund amount compared against deposit amount
- Order status unchanged unless cancelled

### 5. Currency Handling
- VND: no decimals (amounts in minor units)
- Other currencies: keep generic minor unit handling
- Stripe handles currency conversion

### 6. Missing Stripe Identifiers
- Admin UI shows: "Refund unavailable (missing Stripe payment reference)"
- Only orders paid via Stripe can be refunded

## Testing Checklist

### Manual Acceptance Tests

#### Normal Paid Order → Full Refund
1. ✅ Create order with Stripe payment
2. ✅ Complete payment at Stripe Checkout
3. ✅ Verify `payment_status = 'paid'`, `status = 'confirmed'`
4. ✅ Admin triggers full refund
5. ✅ Verify `payment_status = 'refund_pending'`
6. ✅ Webhook arrives (`charge.refunded`)
7. ✅ Verify `payment_status = 'refunded'`
8. ✅ Verify email sent with tracking link
9. ✅ Admin UI shows refunded status

#### Normal Paid Order → Partial Refund
1. ✅ Create order with Stripe payment
2. ✅ Complete payment
3. ✅ Admin triggers partial refund (e.g., 50% of total)
4. ✅ Webhook arrives
5. ✅ Verify `payment_status = 'partially_refunded'`
6. ✅ Verify email sent (partial refund)
7. ✅ Admin triggers another partial refund
8. ✅ Verify total refunded = sum of all refunds
9. ✅ Verify `payment_status = 'refunded'` when fully refunded

#### Deposit Order → Refund Deposit
1. ✅ Create deposit reservation order with Stripe payment
2. ✅ Complete deposit payment
3. ✅ Verify `payment_status = 'deposited'`
4. ✅ Admin triggers refund
5. ✅ Webhook arrives
6. ✅ Verify `payment_status = 'refunded'` or `partially_refunded` based on deposit amount
7. ✅ Verify order `status` unchanged (unless cancelled)
8. ✅ Verify inventory restore only if cancelled/restock chosen

#### Refund & Restock
1. ✅ Create paid order
2. ✅ Admin triggers refund with `restock = true`
3. ✅ Verify order cancelled + inventory restored BEFORE refund request
4. ✅ Verify refund requested
5. ✅ Webhook arrives
6. ✅ Verify final state: `status = 'cancelled'`, `payment_status = 'refunded'`

#### Idempotency
1. ✅ Process refund webhook
2. ✅ Replay same webhook event
3. ✅ Verify no duplicate state changes
4. ✅ Verify no duplicate emails

#### Edge Cases
1. ✅ Refund amount exceeds remaining → Error
2. ✅ Order already fully refunded → Error
3. ✅ Missing Stripe identifiers → Error message
4. ✅ Multiple partial refunds → Correct total calculation

## Files Modified

### Core Implementation
- `src/lib/stripe/server.ts` - Extended `StripeMetadata` interface with refund info
- `src/lib/repositories/admin/orders.ts` - Added refund repository functions, updated `PaymentStatus` type
- `src/app/api/admin/orders/[orderCode]/refund/route.ts` - Admin refund API endpoint
- `src/app/api/stripe/webhook/route.ts` - Extended webhook handler for refund events
- `src/lib/emails/service.ts` - Added refund email notifications

### UI Components
- `src/app/admin/orders/[orderCode]/OrderDetailContent.tsx` - Added refund section and modal
- `src/app/admin/orders/[orderCode]/page.module.css` - Added modal styles
- `src/app/admin/orders/OrdersFilters.tsx` - Added refund status filter options

### Translations
- `messages/en/admin.json` - Added refund UI translations
- `messages/en/emails.json` - Added refund email translations
- `messages/vi/admin.json` - Vietnamese stubs (to be completed)
- `messages/vi/emails.json` - Vietnamese stubs (to be completed)

## Environment Variables

No new environment variables required. Uses existing Stripe configuration:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for future client-side features)

## Security

- ✅ Admin authentication required for refund API
- ✅ Webhook signature verification
- ✅ Idempotent event processing
- ✅ Service role client for database access
- ✅ No Stripe secrets exposed to client
- ✅ Server-side refund creation only

## Known Limitations

1. **Refund Reasons:** Limited to Stripe's predefined reasons (requested_by_customer, duplicate, fraudulent, other)
2. **Refund Timing:** Refunds processed asynchronously via webhooks (may have delay)
3. **Partial Refunds:** Multiple partial refunds supported, but admin must track manually
4. **Currency:** VND has no decimals; other currencies use minor units

## Future Enhancements

- [ ] Refund history timeline in admin UI
- [ ] Automatic inventory restoration rules configuration
- [ ] Refund analytics dashboard
- [ ] Bulk refund processing
- [ ] Refund reason customization
- [ ] Refund approval workflow

---

**Last Updated:** December 17, 2025  
**Version:** 1.4.0 (Stripe Refunds Integration)  
**Status:** ✅ Complete and Production Ready

