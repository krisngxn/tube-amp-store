# Deposit Reservation System

**Last Updated:** December 16, 2025  
**Status:** 🚧 In Progress

## Overview

The Deposit Reservation system allows customers to reserve high-value or vintage products by placing a deposit. This prevents overselling and gives admins clear operational control over reservation lifecycle.

## Features

- ✅ Product-level deposit configuration
- ✅ Checkout flow for deposit reservations
- ✅ Inventory locking for reserved items
- ✅ Admin actions (mark deposit received, expire, cancel)
- ✅ Email notifications for deposit orders
- ✅ Full localization (vi/en)
- 🚧 Storefront UI updates (in progress)
- 🚧 Cart validation (in progress)
- 🚧 Automated expiry (manual only for MVP)

## Database Schema

### Products Table

New/Updated fields:
- `deposit_type` (enum: 'percent' | 'fixed')
- `deposit_due_hours` (integer, default: 24)
- `reservation_policy_note` (text, optional)

Existing fields:
- `allow_deposit` (boolean)
- `deposit_amount` (decimal, for fixed deposits)
- `deposit_percentage` (integer, for percent deposits)

### Orders Table

New/Updated fields:
- `order_type` (enum: 'standard' | 'deposit_reservation')
- `deposit_amount_vnd` (decimal)
- `deposit_due_at` (timestamptz)
- `deposit_received_at` (timestamptz)

Existing fields:
- `is_deposit_order` (boolean, legacy)
- `deposit_paid` (decimal, legacy)
- `remaining_amount` (decimal)
- `deposit_paid_at` (timestamptz, legacy)

### Payment Status Enum

Extended to include:
- `deposit_pending` - Deposit not yet received
- `deposited` - Deposit received, awaiting balance

### Order Status Enum

Extended to include:
- `expired` - Deposit reservation expired

## Business Rules

### Eligibility

- Products with `allow_deposit = true` can be reserved with a deposit
- Typically used for vintage or limited stock items

### Deposit Amount

Two strategies supported:
1. **Percent**: `deposit_type = 'percent'`, uses `deposit_percentage` (e.g., 20%)
2. **Fixed**: `deposit_type = 'fixed'`, uses `deposit_amount` (e.g., 5,000,000 VND)

### Reservation Window

- Default: 24 hours (`deposit_due_hours`)
- Configurable per product
- If deposit not received by deadline → reservation expires

### Order Composition (MVP)

- Deposit orders should contain exactly 1 deposit-eligible product, quantity 1
- Or allow multiple items but only one deposit-eligible item

## Workflow

### Customer Flow

1. **Product Detail Page**
   - Shows "Deposit Reservation Available" badge if `allow_deposit = true`
   - Displays deposit amount and deadline policy
   - Explains reservation process

2. **Cart**
   - Validates deposit order rules (single deposit item)
   - Shows warning if cart contains multiple deposit items

3. **Checkout**
   - If order contains deposit-eligible product:
     - Shows "Deposit Amount Due Now"
     - Shows "Remaining Balance"
     - Shows payment instructions
     - Shows deadline timestamp
   - Creates order with:
     - `order_type = 'deposit_reservation'`
     - `payment_status = 'deposit_pending'`
     - `deposit_amount_vnd` calculated
     - `deposit_due_at` set (created_at + deposit_due_hours)

4. **Order Confirmation**
   - Displays deposit amount prominently
   - Shows due date/time
   - Shows payment instructions
   - Status reflects deposit state

### Admin Flow

1. **Order Detail Page**
   - Shows deposit information for deposit orders
   - Actions available:
     - **Mark Deposit Received**: Sets `payment_status = 'deposited'`, `deposit_received_at = now()`, `status = 'confirmed'`
     - **Expire Reservation**: Sets `status = 'expired'`, releases inventory
     - **Cancel Reservation**: Sets `status = 'cancelled'`, releases inventory

2. **Product Management**
   - Toggle deposit eligibility
   - Choose deposit type (percent/fixed)
   - Set deposit value
   - Set deposit due hours
   - Add reservation policy note

## Inventory Locking

### On Deposit Reservation Creation

When a deposit order is created:
- Inventory is locked immediately (stock decremented)
- Prevents others from purchasing the same item

### On Expiry/Cancel

When reservation expires or is cancelled:
- Inventory is restored (stock incremented)
- Item becomes available again

**Implementation**: Uses existing stock decrement trigger, restores on expiry/cancel.

## Email Notifications

### Order Confirmation (Deposit Order)

If `order_type = 'deposit_reservation'`:
- Subject indicates deposit reservation
- Includes deposit amount
- Includes due time
- Includes payment instructions
- Includes expiry warning

### Deposit Received

When admin marks deposit received:
- Status update email sent
- Confirms deposit receipt
- Next steps: shipping coordination / balance payment

## Localization

Translation keys added in:
- `checkout` - Deposit checkout flow
- `order` - Order confirmation for deposits
- `product` - Product detail deposit info
- `emails` - Deposit email templates
- `admin` - Admin deposit actions

## Migration

Run the migration script:

```bash
psql -f supabase/ADD_DEPOSIT_RESERVATION_FIELDS.sql
```

Or execute in Supabase SQL Editor.

## Testing Checklist

- [ ] Admin can configure deposit rules on product
- [ ] Product detail shows deposit messaging for eligible products
- [ ] Checkout creates deposit reservation order correctly
- [ ] Inventory locks when reservation created
- [ ] Admin can mark deposit received
- [ ] Admin can expire reservation
- [ ] Admin can cancel reservation
- [ ] Inventory restores on expiry/cancel
- [ ] Emails include correct deposit info
- [ ] All text is localized (vi/en)

## Future Enhancements

- [ ] Automated expiry job (scheduled task)
- [ ] Online deposit payment (Stripe/checkout)
- [ ] Refund automation
- [ ] Multi-item deposit logic
- [ ] Deposit reminder emails
- [ ] Deposit expiry warnings

---

**Implementation Status:** 🚧 In Progress  
**Last Updated:** December 16, 2025

