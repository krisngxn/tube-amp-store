# Project Progress - Restore The Basic

**Last Updated:** December 17, 2025  
**Current Phase:** Phase 2 - Backend Integration & Features

---

## 🎯 Recent Updates

### ✅ Customer Order Cancellation & Change Requests (December 17, 2025)

**Status:** ✅ Complete and Production Ready

#### Overview
Implemented customer-initiated order cancellation and change request features for guest checkout orders. Customers can cancel eligible orders or submit change requests directly from the order tracking page, without requiring authentication.

#### Features Implemented

1. **Cancel Order**
   - Cancel button on order tracking page (only for eligible statuses)
   - Eligibility: `pending`, `deposit_pending`, `deposited`, `confirmed`
   - Confirmation modal with cancellation reason selection
   - API endpoint with token validation
   - Automatic inventory restoration
   - Status history entry
   - Cancellation email notification to customer

2. **Request Change**
   - Button always visible on tracking page (for any order status)
   - Form with category selection and message textarea
   - Categories: Change Items, Change Address, Cancel & Refund, Other
   - Logs request in `admin_note` for admin visibility
   - Sends email notification to admin
   - No automatic order modification (admin handles manually)

3. **Security & Access Control**
   - Requires valid tracking token
   - Generic error messages prevent order enumeration
   - Service role client for database access
   - No sensitive fields exposed

4. **Email Notifications**
   - Customer cancellation confirmation email (with tracking link)
   - Admin change request notification email
   - Both emails are non-blocking (failures don't break the flow)

#### Files Created

- `src/app/order/track/[code]/OrderActions.tsx` - Client component for cancel/change actions
- `src/app/api/order/cancel/[orderCode]/route.ts` - Cancel order API endpoint
- `src/app/api/order/change-request/[orderCode]/route.ts` - Change request API endpoint

#### Files Modified

- `src/app/order/track/[code]/page.tsx` - Added OrderActions component
- `src/app/order/track/[code]/page.module.css` - Added modal styles
- `src/lib/emails/service.ts` - Added cancellation and change request email functions
- `messages/en/tracking.json` - Added cancel/change request translations
- `messages/vi/tracking.json` - Added Vietnamese translations
- `messages/en/emails.json` - Added cancellation email translations
- `messages/vi/emails.json` - Added Vietnamese email translations

#### Technical Details

**Eligibility Rules:**
- Cancellable statuses: `pending`, `deposit_pending`, `deposited`, `confirmed`
- Non-cancellable: `processing`, `shipped`, `delivered`, `cancelled`, `expired`
- Paid orders are not auto-refunded (admin handles refund manually)

**Cancellation Flow:**
1. Customer clicks "Cancel Order" on tracking page
2. Modal shows with reason selection (Ordered by mistake, Want to change items, Other)
3. Customer confirms → API validates token and eligibility
4. Order status → `cancelled`, inventory restored
5. Status history entry created with reason
6. Cancellation email sent to customer

**Change Request Flow:**
1. Customer clicks "Request Changes" on tracking page
2. Form shows with category dropdown and message textarea
3. Customer submits → API logs request in `admin_note`
4. Admin receives email notification with order details and message
5. Customer sees confirmation message

---

### ✅ Deposit Reservation with COD Payment (December 17, 2025)

**Status:** ✅ Complete and Production Ready

#### Overview
Updated the deposit reservation system to allow customers to pay deposits via Cash on Delivery (COD). Previously, deposit mode required online payment; now customers can choose to pay the deposit amount when receiving the order.

#### Changes Made

1. **Removed Validation Restriction**
   - Removed API validation that blocked deposit mode with COD
   - Deposit reservations can now be used with any payment method

2. **Updated Payment Status Logic**
   - Deposit + COD: `payment_status = 'deposit_pending'` (customer pays deposit on delivery)
   - Deposit + Online: `payment_status = 'deposit_pending'` (customer pays deposit now)
   - Regular COD: `payment_status = 'pending'`

3. **Updated Checkout UI**
   - COD option remains available when deposit mode is selected
   - Order summary shows "Pay Deposit on Delivery" for deposit + COD
   - Order summary shows "Due Now" for deposit + online payment

4. **Added Translations**
   - English: "Pay Deposit on Delivery" message
   - Vietnamese: "Trả Cọc Khi Nhận Hàng" message
   - Updated COD description for deposit context

#### Files Modified

- `src/app/api/orders/route.ts` - Removed deposit + COD restriction, updated payment status logic
- `src/app/checkout/page.tsx` - Updated UI to allow COD with deposit, updated order summary display
- `messages/en/checkout.json` - Added deposit + COD translations
- `messages/vi/checkout.json` - Added Vietnamese deposit + COD translations

#### Technical Details

**Order Creation (Deposit + COD):**
- `order_type = 'deposit_reservation'`
- `payment_method = 'cod'`
- `payment_status = 'deposit_pending'`
- `deposit_amount_vnd = [calculated deposit]`
- Customer pays deposit amount when receiving the order
- Remaining balance handled by admin after deposit received

---

### ✅ Order-Level Optional Deposit Logic (December 17, 2025)

**Status:** ✅ Complete and Production Ready

#### Overview
Refactored deposit logic from product-level defaults to order-level decisions. Deposit is now driven exclusively by checkout `paymentMode` selection (`deposit` | `full` | `cod`), ensuring deposits are only applied when customers explicitly choose the deposit option.

#### Core Principle
- **Single Source of Truth:** `paymentMode` is the only variable that determines deposit amounts, order type, and payment calculations
- **Order-Level Decision:** Deposit is not a product-level default - products define eligibility, checkout defines reality
- **Explicit Selection:** Customers must explicitly choose deposit mode at checkout

#### Features Implemented

1. **Payment Mode Selection** (`src/app/checkout/page.tsx`)
   - Added `paymentMode` state: `'deposit' | 'full' | 'cod'`
   - Payment mode selection UI (shown only if cart has deposit-eligible products)
   - Real-time calculation updates based on `paymentMode`
   - Deposit amounts only calculated when `paymentMode === 'deposit'`

2. **Order Creation API** (`src/app/api/orders/route.ts`)
   - Accepts `paymentMode` in request body
   - Validates `paymentMode` and `paymentMethod` consistency
   - Calculates deposit only when `paymentMode === 'deposit'`
   - Sets `order_type` based on `paymentMode`:
     - `deposit` → `deposit_reservation`
     - `full` or `cod` → `standard`
   - Enforces validation: `order_type !== 'deposit_reservation'` → deposit = 0

3. **Cart Item Changes** (`src/app/product/[slug]/ProductActions.tsx`)
   - Removed `requiresDeposit` flag from cart items
   - Still stores deposit config (for checkout UI eligibility check only)
   - Deposit selection happens at checkout, not when adding to cart

4. **Financial Calculations**
   - **Deposit Mode:** `payNow = depositAmount`, `remainingBalance = total - depositAmount`
   - **Full Payment Mode:** `payNow = total`, `depositAmount = 0`, `remainingBalance = 0`
   - **COD Mode:** `payNow = 0`, `depositAmount = 0`, `remainingBalance = total`

#### Files Modified

**Checkout Flow:**
- `src/app/checkout/page.tsx` - Added payment mode selection, updated calculations
- `src/app/product/[slug]/ProductActions.tsx` - Removed item-level deposit flags
- `src/app/api/orders/route.ts` - Updated to use `paymentMode` instead of item flags

**Translations:**
- `messages/en/checkout.json` - Added payment mode translations
- `messages/vi/checkout.json` - Added payment mode translations

#### Technical Details

**Order Type Mapping:**
- `paymentMode === 'deposit'` → `order_type = 'deposit_reservation'`
- `paymentMode === 'full'` → `order_type = 'standard'`
- `paymentMode === 'cod'` → `order_type = 'standard'`

**Validation Rules:**
- If `order_type !== 'deposit_reservation'`, deposit must be 0
- Deposit mode can use any payment method (including COD - pay deposit on delivery)
- COD mode requires payment method COD
- Products must support deposits if `paymentMode === 'deposit'`

**UI Behavior:**
- Payment mode selection only shown if cart has deposit-eligible products
- Switching payment modes recalculates totals immediately
- Deposit values disappear when switching away from deposit mode
- No deposit wording shown unless `paymentMode === 'deposit'`

#### Testing Notes

**Deposit Mode:**
1. Add deposit-eligible product to cart
2. Select "Deposit Reservation" payment mode
3. Verify deposit amount calculated and shown
4. Complete order → Verify `order_type = 'deposit_reservation'`, deposit charged

**Full Payment Mode:**
1. Add deposit-eligible product to cart
2. Select "Full Payment" payment mode
3. Verify no deposit shown, full amount displayed
4. Complete order → Verify `order_type = 'standard'`, no deposit stored

**COD Mode:**
1. Add deposit-eligible product to cart
2. Select "Cash on Delivery" payment mode
3. Verify no deposit shown, "Pay on Delivery" displayed
4. Complete order → Verify `order_type = 'standard'`, no deposit stored

---

### ✅ Stripe Refunds Integration (December 17, 2025)

**Status:** ✅ Complete and Production Ready

#### Overview
Implemented comprehensive Stripe refund processing with webhook-first architecture. Refund state is finalized and persisted only via Stripe webhooks (never trusting client/admin response as final truth). Supports both full and partial refunds for normal orders and deposit reservations.

#### Features Implemented

1. **Admin Refund API** (`/api/admin/orders/[orderCode]/refund`)
   - Requires admin authentication
   - Validates refundable states (`paid`, `deposited`, `partially_refunded`)
   - Supports full and partial refunds
   - "Refund & Restock" option (cancels order + restores inventory)
   - Sets `payment_status = 'refund_pending'` (intermediate state)
   - Creates Stripe refund server-side

2. **Stripe Webhook Handling** (`/api/stripe/webhook`)
   - Processes `charge.refunded` and `refund.updated` events
   - Idempotent processing (prevents duplicates)
   - Updates `payment_status`:
     - `partially_refunded` if `total_refunded < paid_amount`
     - `refunded` if `total_refunded >= paid_amount`
   - Sends email notifications automatically

3. **Repository Functions** (`src/lib/repositories/admin/orders.ts`)
   - `markOrderRefundPendingFromStripe()` - Sets refund pending state
   - `markOrderRefundedFromStripe()` - Finalizes refund state
   - `appendStripeRefundToMetadata()` - Safe metadata updates
   - Updated `PaymentStatus` type: `refund_pending`, `partially_refunded`, `refunded`

4. **Email Notifications** (`src/lib/emails/service.ts`)
   - Full refund email notifications
   - Partial refund email notifications
   - Includes tracking links
   - Idempotent (prevents duplicates)

5. **Admin UI** (`src/app/admin/orders/[orderCode]/OrderDetailContent.tsx`)
   - Refund section showing paid/refunded/remaining amounts
   - Refund modal with amount, reason, restock options
   - Success/error messages

#### Files Created

**Refund System:**
- `src/app/api/admin/orders/[orderCode]/refund/route.ts` - Admin refund API endpoint
- `REFUNDS.md` - Complete refund system documentation

#### Files Modified

**Core Implementation:**
- `src/lib/stripe/server.ts` - Extended `StripeMetadata` interface with refund info
- `src/lib/repositories/admin/orders.ts` - Added refund repository functions
- `src/app/api/stripe/webhook/route.ts` - Extended webhook handler for refund events
- `src/lib/emails/service.ts` - Added refund email notifications

**UI Components:**
- `src/app/admin/orders/[orderCode]/OrderDetailContent.tsx` - Added refund section and modal
- `src/app/admin/orders/[orderCode]/page.module.css` - Added modal styles
- `src/app/admin/orders/OrdersFilters.tsx` - Added refund status filter options

**Translations:**
- `messages/en/admin.json` - Added refund UI translations
- `messages/en/emails.json` - Added refund email translations
- `messages/vi/admin.json` - Added Vietnamese refund translations
- `messages/vi/emails.json` - Added Vietnamese refund email translations

#### Technical Details

**State Model:**
- `refund_pending` - Refund requested, waiting for webhook
- `partially_refunded` - Partial refund completed
- `refunded` - Full refund completed

**Inventory Rules:**
- Default: Do NOT restore inventory automatically (refund might be compensation)
- "Refund & Restock" option: Cancels order + restores inventory before refund
- Prevents double-restoration via metadata tracking

**Metadata Storage:**
- Refund info stored in `orders.admin_note` as JSON
- Tracks total refunded amount, currency, refund IDs, status
- Stores `inventory_restored_at` timestamp if restock requested

#### Testing Notes

**Full Refund:**
1. Create paid order → Admin triggers refund → Webhook arrives
2. Verify `payment_status = 'refunded'` → Email sent

**Partial Refund:**
1. Create paid order → Admin triggers partial refund → Webhook arrives
2. Verify `payment_status = 'partially_refunded'` → Email sent
3. Admin triggers another partial refund → Verify total = sum of refunds

**Refund & Restock:**
1. Create paid order → Admin triggers refund with `restock = true`
2. Verify order cancelled + inventory restored BEFORE refund request
3. Webhook arrives → Verify final state

**Idempotency:**
1. Process refund webhook → Replay same event
2. Verify no duplicate state changes → Verify no duplicate emails

---

### ✅ Stripe Payments Integration (Test Mode) (December 17, 2025)

**Status:** ✅ Complete and Production Ready

#### Overview
Implemented Stripe test environment payments with webhook-first architecture, supporting both full payment for normal orders and deposit payment for deposit reservations. Payment state is persisted via webhooks only (never trusts client redirects), with automatic inventory restoration on cancellation.

#### Features Implemented

1. **Stripe Server Utilities** (`src/lib/stripe/server.ts`)
   - Singleton Stripe instance initialization
   - Webhook signature verification helper
   - Stripe metadata parsing/serialization (stores in `admin_note` as JSON)
   - Supports VND currency with automatic USD fallback for test mode

2. **Checkout Session Creation** (`/api/stripe/create-checkout-session`)
   - Creates Stripe Checkout Session server-side
   - Validates order is payable (not already paid/cancelled/expired)
   - Calculates correct amount:
     - Deposit orders → charges deposit amount only
     - Normal orders → charges full total
   - Handles VND currency with USD fallback for test mode
   - Stores session ID in order metadata

3. **Webhook Handler** (`/api/stripe/webhook`)
   - Verifies webhook signatures for security
   - Handles events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Idempotent processing (prevents duplicate state changes)
   - Updates order payment status and order status:
     - Normal orders: `payment_status = 'paid'`, `status = 'confirmed'`
     - Deposit orders: `payment_status = 'deposited'`, `status = 'deposited'`
   - Sends email notifications with tracking links
   - Restores inventory on payment failure

4. **Payment Flow**
   - User selects Stripe payment method at checkout
   - Order created first (inventory decremented)
   - Stripe Checkout Session created and user redirected
   - Webhook confirms payment and updates order state
   - Success page shows processing message (doesn't mark paid - webhook only)
   - Cancellation automatically restores inventory

5. **Inventory Restoration**
   - Automatic restoration when Stripe payment cancelled
   - Automatic restoration when payment fails via webhook
   - API endpoint `/api/orders/[orderCode]/cancel` for manual cancellation
   - Uses RPC function or direct update fallback

6. **Repository Functions**
   - `setStripeCheckoutSession()` - Store session ID
   - `markOrderPaidFromStripe()` - Mark normal orders as paid
   - `markOrderDepositPaidFromStripe()` - Mark deposit orders as paid
   - `markOrderPaymentFailedFromStripe()` - Handle failed payments
   - `hasStripeEventBeenProcessed()` / `markStripeEventAsProcessed()` - Idempotency
   - `restoreOrderInventory()` - Restore inventory for cancelled orders

#### Files Created

**Stripe Integration:**
- `src/lib/stripe/server.ts` - Stripe utilities and webhook verification
- `src/app/api/stripe/create-checkout-session/route.ts` - Checkout session creation
- `src/app/api/stripe/webhook/route.ts` - Webhook handler with idempotency
- `src/app/api/stripe/session-status/route.ts` - Optional session status endpoint

**Order Management:**
- `src/app/api/orders/[orderCode]/cancel/route.ts` - Cancel order and restore inventory

#### Files Modified

**Checkout Flow:**
- `src/app/checkout/page.tsx` - Added Stripe payment method, redirect to Stripe, cancellation handling

**Order Success:**
- `src/app/order-success/[orderCode]/page.tsx` - Handle Stripe redirects with session_id

**Repository:**
- `src/lib/repositories/admin/orders.ts` - Added Stripe payment functions and inventory restoration

**Translations:**
- `messages/en/checkout.json` - Added Stripe payment method and error messages
- `messages/vi/checkout.json` - Added Stripe payment method and error messages
- `messages/en/order.json` - Added Stripe success messages
- `messages/vi/order.json` - Added Stripe success messages

#### Technical Details

**Payment Flow:**
1. User selects Stripe payment → Order created → Stripe session created → Redirect to Stripe
2. User pays at Stripe → Webhook receives event → Order updated → Email sent
3. User cancels → Redirected back → Inventory restored → Order cancelled

**Currency Handling:**
- Primary: VND (Vietnamese Dong) - no decimals
- Fallback: USD for test mode if VND not supported
- Automatic conversion at 1 USD ≈ 25,000 VND rate

**Security:**
- Webhook-first architecture (never trusts client)
- Signature verification on all webhooks
- Idempotent event processing
- Service role client for database access
- No Stripe secrets exposed to client

**Idempotency:**
- Tracks processed event IDs in order metadata
- Prevents duplicate state changes
- Prevents duplicate emails

**Inventory Management:**
- Inventory decremented when order created
- Automatically restored on payment cancellation
- Automatically restored on payment failure
- Uses database RPC function or direct update fallback

#### Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Testing Notes

**Full Payment Order:**
1. Create order with Stripe payment
2. Complete payment at Stripe Checkout
3. Verify webhook updates: `payment_status = 'paid'`, `status = 'confirmed'`
4. Verify email sent with tracking link

**Deposit Reservation:**
1. Create deposit reservation order with Stripe payment
2. Complete deposit payment at Stripe Checkout
3. Verify webhook updates: `payment_status = 'deposited'`, `status = 'deposited'`
4. Verify email sent with tracking link

**Cancellation:**
1. Create order with Stripe payment
2. Cancel at Stripe Checkout
3. Verify redirected to checkout with cancellation message
4. Verify inventory restored
5. Verify order status = 'cancelled'

**Idempotency:**
1. Replay same webhook event
2. Verify no duplicate state changes
3. Verify no duplicate emails

#### Known Limitations

1. **Currency:** VND may not be supported in Stripe test mode (automatic USD fallback)
2. **Rate Limiting:** Create session endpoint uses basic in-memory rate limiting
3. **Refunds:** Not implemented (stubbed for future)

---

### ✅ Database-Backed Order Tracking Tokens (December 17, 2025)

**Status:** ✅ Complete and Production Ready

#### Overview
Migrated order tracking tokens from in-memory storage to a secure, persistent database-backed system. Tokens are now stored as SHA-256 hashes (never plaintext) with proper expiry, revocation, and access tracking.

#### Features Implemented

1. **Database Table** (`order_tracking_tokens`)
   - Stores token hashes (SHA-256) instead of plaintext
   - 7-day expiry with automatic cleanup
   - Revocation support via `revoked_at` field
   - Access tracking (`last_accessed_at`, `access_count`)
   - RLS policies ensure service-role only access

2. **Token Management** (`src/lib/orderTrackingTokens.ts`)
   - `generateToken()` - Cryptographically secure base64url tokens
   - `hashToken()` - SHA-256 hashing with optional pepper
   - `createTrackingToken()` - Creates and stores tokens in DB
   - `verifyTokenForOrder()` - Verifies tokens and updates access metadata
   - `getOrCreateTrackingToken()` - Gets or creates tokens for emails

3. **Email Integration**
   - Order confirmation emails include tracking links
   - Status update emails include tracking links
   - Tokens automatically created/reused when sending emails
   - Tracking URLs use cookie-based locale (no URL prefix)

4. **Route Handling** (`/order/track/[code]`)
   - Server-side token verification
   - Shows order details if token is valid
   - Falls back to tracking form if token is missing/invalid/expired
   - Displays error banner for invalid tokens

5. **Security Features**
   - Tokens stored as SHA-256 hashes (never plaintext)
   - Optional pepper via `ORDER_TRACKING_TOKEN_PEPPER` env var
   - 7-day expiry (configurable)
   - Reusable until expiry
   - Revocable via `revoked_at` field
   - Access tracking for analytics
   - Service-role only access (RLS policies)

#### Files Created

**Database Migration:**
- `supabase/CREATE_ORDER_TRACKING_TOKENS_TABLE.sql` - Table schema and RLS policies

**Token Management:**
- `src/lib/orderTrackingTokens.ts` - Token generation, hashing, and verification

**Components:**
- `src/app/order/track/TrackingForm.tsx` - Reusable tracking form component

#### Files Modified

- `src/lib/repositories/orders/tracking.ts` - Updated to use database-backed tokens
- `src/lib/emails/service.ts` - Integrated token creation/reuse in emails
- `src/app/order/track/[code]/page.tsx` - Added token verification with fallback form
- `messages/en/tracking.json` - Added error messages for invalid links
- `messages/vi/tracking.json` - Added error messages for invalid links
- `messages/en/emails.json` - Added tracking link text to status update emails
- `messages/vi/emails.json` - Added tracking link text to status update emails

#### Technical Details

**Token Generation:**
- Uses `crypto.randomBytes(32).toString('base64url')` for URL-safe tokens
- SHA-256 hashing with optional pepper for additional security
- Tokens are 32 bytes (256 bits) for strong security

**Database Schema:**
- `id` (uuid) - Primary key
- `order_id` (uuid) - Foreign key to orders
- `token_hash` (text, unique) - SHA-256 hash of token
- `expires_at` (timestamptz) - 7 days from creation
- `revoked_at` (timestamptz, nullable) - Revocation timestamp
- `created_at` (timestamptz) - Creation timestamp
- `last_accessed_at` (timestamptz, nullable) - Last access timestamp
- `access_count` (int) - Number of times token was used
- `created_by` (text) - Source of creation (e.g., "checkout", "status_email")

**Verification Flow:**
1. User clicks tracking link: `/order/track/[code]?t=[token]`
2. Server extracts order code and token from URL
3. Looks up order by code to get `order_id`
4. Hashes incoming token and queries database
5. Verifies: hash matches, not revoked, not expired, belongs to order
6. Updates `last_accessed_at` and increments `access_count`
7. Returns order data or shows fallback form

#### Migration Notes

**From In-Memory to Database:**
- Old system used `Map<string, TrackingToken>` in memory
- New system uses PostgreSQL table with proper indexing
- Tokens are now persistent across server restarts
- Better security with hash storage instead of plaintext

**Breaking Changes:**
- None - system is backward compatible
- Old in-memory tokens will expire naturally
- New orders automatically use database tokens

---

### ✅ Admin Deposit Status Fix (December 17, 2025)

**Status:** ✅ Complete

#### Issues Fixed

1. **Deposit Received Status**
   - **Problem:** When marking deposit as received, order status changed to `confirmed` instead of `deposited`
   - **Solution:** Updated `adminMarkDepositReceived()` to set status to `deposited`
   - **Result:** Order status now correctly shows "Đã đặt cọc" (Deposited) after marking deposit received

2. **Page Refresh**
   - **Problem:** Order status didn't update in UI after marking deposit received
   - **Solution:** Added `revalidatePath()` to server actions for proper cache invalidation
   - **Result:** Page refreshes immediately showing updated status

3. **Status History**
   - **Problem:** Status history wasn't properly recorded when deposit received
   - **Solution:** Fixed status history creation to handle database trigger and update with note/changed_by
   - **Result:** Status history correctly shows transition to `deposited` status

#### Files Modified

- `src/lib/repositories/admin/orders.ts` - Fixed status to `deposited`, improved status history handling
- `src/app/admin/orders/[orderCode]/actions.ts` - Added `revalidatePath()` for cache invalidation
- `src/app/admin/orders/[orderCode]/OrderDetailContent.tsx` - Removed setTimeout delay

#### Technical Details

**Status Flow:**
- Order created → `status: 'pending'`, `payment_status: 'deposit_pending'`
- Deposit received → `status: 'deposited'`, `payment_status: 'deposited'`
- Processing → `status: 'processing'`
- Shipped → `status: 'shipped'`
- Delivered → `status: 'delivered'`

**Revalidation:**
- Uses Next.js `revalidatePath()` to invalidate cache
- Revalidates both order detail page and orders list page
- Ensures UI shows latest data immediately

---

### ✅ Order Tracking System (December 17, 2025)

**Status:** ✅ Complete and Production Ready

#### Overview
Implemented a comprehensive order tracking system that allows customers to track their orders (including deposit reservations) without authentication. The system supports both form-based and token-based tracking methods.

#### Features Implemented

1. **Form-Based Tracking** (`/order/track`)
   - Order code + email/phone verification
   - Rate limiting (10 requests per 15 minutes per IP)
   - Generic error messages to prevent order enumeration
   - Full order details display with status timeline

2. **Token-Based Tracking** (`/order/track/[code]?t=<token>`)
   - Secure links from order confirmation emails
   - 7-day token expiry
   - Server-side token validation
   - No need to re-enter contact information

3. **Order Display Features**
   - Order status with visual badges
   - Status timeline with history (chronological)
   - Order items summary with images
   - Totals breakdown (subtotal, shipping, tax, discount)
   - Deposit details for deposit reservations
   - Payment status and method
   - Fully responsive design

4. **Email Integration**
   - Tracking links automatically included in order confirmation emails
   - Token generation on email send
   - Localized link text (Vietnamese/English)
   - Proper URL formatting based on order locale

5. **Security Features**
   - Service role client bypasses RLS (server-side only)
   - Contact normalization for matching (case-insensitive)
   - Generic "not found" errors prevent enumeration
   - Rate limiting prevents abuse
   - Token expiry (7 days)
   - No PII exposure beyond what customer provided

#### Files Created

**Repository Layer:**
- `src/lib/repositories/orders/tracking.ts` - Core tracking logic

**API Routes:**
- `src/app/api/order/track/route.ts` - Form-based tracking endpoint
- `src/app/api/order/track-token/route.ts` - Token-based tracking endpoint

**Pages:**
- `src/app/order/track/page.tsx` - Tracking form page (client component)
- `src/app/order/track/page.module.css` - Form page styles
- `src/app/order/track/[code]/page.tsx` - Token-based detail page (server component)
- `src/app/order/track/[code]/page.module.css` - Detail page styles

**Translations:**
- `messages/en/tracking.json` - English translations
- `messages/vi/tracking.json` - Vietnamese translations
- Updated `messages/en/emails.json` - Added tracking link translations
- Updated `messages/vi/emails.json` - Added tracking link translations

**Documentation:**
- `ORDER_TRACKING.md` - Complete system documentation

#### Files Modified

- `src/lib/emails/service.ts` - Added tracking token generation and email links
- `src/i18n/request.ts` - Added tracking namespace
- `src/middleware.ts` - Updated to handle locale prefixes correctly
- `src/i18n/routing.ts` - Updated locale prefix configuration

#### Technical Details

**Token Management:**
- ~~In-memory Map storage (MVP - can be moved to Redis/DB later)~~ **MIGRATED TO DATABASE**
- Database-backed storage with SHA-256 hashing
- Cryptographically secure tokens (32 bytes random, base64url encoded)
- Automatic cleanup of expired tokens (via database queries)
- 7-day expiry period

**Rate Limiting:**
- Simple in-memory IP-based rate limiting
- 10 requests per 15 minutes per IP
- Automatic cleanup of expired entries
- Returns 429 status when rate limited

**DTO Design:**
- Sanitized order data (no admin notes, no internal fields)
- Only customer-facing information exposed
- No PII beyond what customer provided

#### Testing Notes

**Form-Based Tracking:**
1. Navigate to `/order/track`
2. Enter order code and email/phone
3. Verify order details display correctly

**Token-Based Tracking:**
1. Create an order (via checkout)
2. Check email for tracking link
3. Click tracking link
4. Verify order details display without form

**Error Cases:**
- Invalid order code → Shows "not found"
- Wrong email/phone → Shows "not found" (doesn't reveal which field)
- Missing token → Redirects to form page
- Invalid/expired token → Redirects to form page

#### Known Limitations (MVP)

1. ~~**Token Storage:** In-memory Map (not persistent across server restarts)~~ ✅ **FIXED** - Now using database storage

2. **Rate Limiting:** Simple IP-based (can be bypassed with VPN)
   - **Future:** Implement Redis-based rate limiting with CAPTCHA

3. ~~**Token Revocation:** Not supported~~ ✅ **FIXED** - Tokens can be revoked via `revoked_at` field

---

### ✅ Middleware & Routing Fixes (December 17, 2025)

**Status:** ✅ Complete

#### Issues Fixed

1. **Homepage 404 Error**
   - **Problem:** Homepage was redirecting to `/en` or `/vi` causing 404
   - **Solution:** Created custom middleware that doesn't redirect root path
   - **Result:** Homepage now works at `/` without redirect

2. **Locale Routing**
   - **Problem:** next-intl middleware was auto-redirecting all routes
   - **Solution:** Custom middleware handles locale prefixes manually
   - **Result:** 
     - Root routes work without prefix (`/`, `/order/track`)
     - Locale-prefixed routes work (`/en/order/track`, `/vi/order/track`)
     - Tracking links from emails work correctly

3. **Translation Namespace**
   - **Problem:** Missing `tracking` namespace in i18n request
   - **Solution:** Added tracking namespace to translation loader
   - **Result:** All tracking translations load correctly

#### Files Modified

- `src/middleware.ts` - Custom middleware for locale handling
- `src/i18n/routing.ts` - Updated to `localePrefix: 'never'`
- `src/i18n/request.ts` - Added tracking namespace, improved locale detection

---

### ✅ Admin Panel Translation Fixes (December 17, 2025)

**Status:** ✅ Complete

#### Issues Fixed

1. **Missing Payment Status Translations**
   - Added `deposit_pending` and `deposited` to payment status translations
   - Added filter options for deposit statuses
   - Fixed in both English and Vietnamese

2. **Missing Order Detail Status Translations**
   - Added `status` and `paymentStatus` objects under `orders.detail`
   - Fixed duplicate key issue by renaming labels
   - Updated component to use correct translation keys

#### Files Modified

- `messages/en/admin.json` - Added missing payment status translations
- `messages/vi/admin.json` - Added missing payment status translations
- `src/app/admin/orders/OrdersFilters.tsx` - Added deposit status filter options
- `src/app/admin/orders/[orderCode]/OrderDetailContent.tsx` - Fixed translation keys

---

### ✅ Admin Layout Hydration Fix (December 17, 2025)

**Status:** ✅ Complete

#### Issue Fixed

- **Problem:** Hydration error - `lang` attribute mismatch between server and client
- **Cause:** Admin layout was creating its own `<html>` tag conflicting with root layout
- **Solution:** Removed `<html>` and `<body>` tags from admin layout (only root layout should have them)
- **Result:** No more hydration errors

#### Files Modified

- `src/app/admin/layout.tsx` - Removed duplicate HTML structure

---

## 📊 Current Project Statistics

### Code Metrics
- **Total Files:** 80+
- **Lines of Code:** ~8,000+
- **Translation Keys:** 250+ per language
- **API Routes:** 10+
- **Pages:** 15+

### Features Completed
- ✅ Order creation with deposit reservations (order-level selection via paymentMode)
- ✅ Order tracking (form + token-based with database storage)
- ✅ Email notifications (order confirmation, status updates, refunds, cancellations with tracking links)
- ✅ Admin panel (products, orders management)
- ✅ Deposit reservation management (supports both online and COD payment)
- ✅ Stripe payments (test mode) - full payment and deposit reservations
- ✅ Stripe refunds (webhook-first, full and partial refunds)
- ✅ Order-level optional deposit logic (paymentMode as single source of truth)
- ✅ Customer order cancellation (self-service with inventory restoration)
- ✅ Customer change requests (non-automated, admin-handled)
- ✅ Full localization (vi/en)
- ✅ Responsive design (mobile, tablet, desktop)

### Database
- **Tables:** 16+ with relationships (added `order_tracking_tokens`)
- **Triggers:** 5+ automatic triggers
- **RLS Policies:** 16+ security policies (added token table RLS)
- **Email Logging:** Order email tracking table
- **Token Storage:** Database-backed with SHA-256 hashing

---

## 🎯 Next Steps

### Immediate Priorities
1. ✅ Order tracking system - **COMPLETE**
2. ✅ Stripe payments integration (test mode) - **COMPLETE**
3. [ ] Shipping address validation
4. ✅ Order cancellation flow with inventory restoration - **COMPLETE**
5. ✅ Refund processing (Stripe refunds) - **COMPLETE**
6. ✅ Order-level optional deposit logic - **COMPLETE**
7. ✅ Customer self-service cancellation - **COMPLETE**
8. ✅ Customer change requests - **COMPLETE**
9. ✅ Deposit reservation with COD payment - **COMPLETE**

### Short-term Goals
- [ ] SMS notifications for order updates
- [ ] Order history for authenticated users
- [ ] Export order details as PDF
- [ ] Advanced order search and filtering
- [ ] Order analytics dashboard

### Long-term Enhancements
- [ ] Move token storage to Redis/database
- [ ] Implement Redis-based rate limiting
- [ ] Add CAPTCHA for rate-limited requests
- [ ] Token revocation functionality
- [ ] Order tracking analytics

---

## 🐛 Known Issues & Limitations

### MVP Limitations
1. ~~**Token Storage:** In-memory (not persistent)~~ ✅ **FIXED** - Now using database storage
2. **Rate Limiting:** Simple IP-based (can be bypassed)
3. ~~**No Token Revocation:** Tokens valid until expiry~~ ✅ **FIXED** - Tokens can be revoked via `revoked_at` field
4. **No Order History:** Only current order view

### Future Improvements
- ~~Move to Redis for token storage~~ ✅ **COMPLETE** - Using database instead
- Implement more robust rate limiting
- ~~Add token revocation~~ ✅ **COMPLETE** - Via `revoked_at` field
- Add order history for users
- Add PDF export functionality

---

## 📝 Documentation Updates

### New Documentation
- ✅ `ORDER_TRACKING.md` - Complete order tracking system documentation
- ✅ `REFUNDS.md` - Complete Stripe refunds system documentation

### Updated Documentation
- Translation files updated with tracking namespace
- Email templates updated with tracking links

---

## 🔧 Technical Debt

### High Priority
- ~~[ ] Move token storage from in-memory to persistent storage~~ ✅ **COMPLETE**
- [ ] Implement Redis-based rate limiting
- [ ] Add comprehensive error logging
- ✅ Order-level deposit logic refactoring - **COMPLETE**
- ✅ Stripe refunds implementation - **COMPLETE**

### Medium Priority
- [ ] Add unit tests for tracking repository
- [ ] Add integration tests for tracking API
- [ ] Add E2E tests for tracking flow

### Low Priority
- [ ] Optimize token cleanup interval
- [ ] Add token usage analytics
- [ ] Add tracking link click tracking

---

**Last Updated:** December 17, 2025  
**Version:** 1.6.0 (Customer Self-Service & Deposit+COD)  
**Status:** ✅ Customer Cancellation/Change Requests, Deposit+COD Support, Ready for Production
