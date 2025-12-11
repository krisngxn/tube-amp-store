# Database Schema Diagram

## Entity Relationship Overview

```
┌─────────────────────┐
│   auth.users        │ (Supabase Auth)
│  (managed by Auth)  │
└──────────┬──────────┘
           │
           │ 1:1
           ▼
┌─────────────────────┐
│  user_profiles      │
│  ─────────────────  │
│  id (FK)            │
│  email              │
│  full_name          │
│  role               │◄─────────┐
│  preferred_locale   │          │
└──────────┬──────────┘          │
           │                     │
           │ 1:N                 │
           ▼                     │
┌─────────────────────┐          │
│  user_addresses     │          │
│  ─────────────────  │          │
│  user_id (FK)       │          │
│  address_line       │          │
│  city, district     │          │
└─────────────────────┘          │
                                 │
┌─────────────────────┐          │
│     products        │          │
│  ─────────────────  │          │
│  id (PK)            │          │
│  slug               │          │
│  price              │          │
│  stock_quantity     │          │
│  condition          │          │
│  topology           │          │
│  tube_type          │          │
│  power_watts        │          │
│  taps[]             │          │
│  specifications     │          │
│  allow_deposit      │          │
└──────────┬──────────┘          │
           │                     │
           ├─────────────────────┼─────────────┐
           │ 1:N                 │ 1:N         │ 1:N
           ▼                     ▼             ▼
┌─────────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│product_translations │ │ product_images  │ │  product_tags    │
│  ─────────────────  │ │  ─────────────  │ │  ──────────────  │
│  product_id (FK)    │ │  product_id(FK) │ │  product_id (FK) │
│  locale (vi/en)     │ │  url            │ │  tag             │
│  name               │ │  is_primary     │ └──────────────────┘
│  description        │ │  position       │
│  sound_character    │ └─────────────────┘
│  matching_notes     │
└─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│  product_reviews    │
│  ─────────────────  │
│  product_id (FK)    │
│  user_id (FK)       │
│  rating (1-5)       │
│  content            │
│  is_approved        │
└─────────────────────┘


┌─────────────────────┐
│      orders         │
│  ─────────────────  │
│  id (PK)            │
│  order_number       │
│  user_id (FK)       │◄─────────────────┐
│  customer_email     │                  │
│  customer_name      │                  │
│  shipping_address   │                  │
│  total              │                  │
│  payment_method     │                  │
│  payment_status     │                  │
│  status             │                  │
│  is_deposit_order   │                  │
│  deposit_paid       │                  │
└──────────┬──────────┘                  │
           │                             │
           ├─────────────────────────────┤
           │ 1:N                         │ N:1
           ▼                             │
┌─────────────────────┐                  │
│   order_items       │                  │
│  ─────────────────  │                  │
│  order_id (FK)      │                  │
│  product_id (FK)    │──────────────────┘
│  product_name       │ (snapshot)
│  unit_price         │
│  quantity           │
│  subtotal           │
└─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│order_status_history │
│  ─────────────────  │
│  order_id (FK)      │
│  from_status        │
│  to_status          │
│  changed_by (FK)    │
└─────────────────────┘


┌─────────────────────┐
│      guides         │
│  ─────────────────  │
│  id (PK)            │
│  slug               │
│  category           │
│  is_published       │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│ guide_translations  │
│  ─────────────────  │
│  guide_id (FK)      │
│  locale (vi/en)     │
│  title              │
│  content            │
└─────────────────────┘


┌─────────────────────┐
│ customer_setups     │
│  ─────────────────  │
│  user_id (FK)       │
│  title              │
│  image_url          │
│  products[] (FK)    │
│  is_approved        │
└─────────────────────┘


┌─────────────────────┐
│ matching_requests   │
│  ─────────────────  │
│  user_id (FK)       │
│  speaker_sensitivity│
│  speaker_impedance  │
│  room_size          │
│  recommended_prods[]│
└─────────────────────┘
```

## Key Relationships

### 1. User Management
- `auth.users` (Supabase) → `user_profiles` (1:1)
- `user_profiles` → `user_addresses` (1:N)
- `user_profiles` → `orders` (1:N)

### 2. Product Catalog
- `products` → `product_translations` (1:N) - Multilingual content
- `products` → `product_images` (1:N) - Gallery
- `products` → `product_tags` (1:N) - Categorization
- `products` → `product_reviews` (1:N) - Customer reviews

### 3. Orders & Commerce
- `orders` → `order_items` (1:N)
- `order_items` → `products` (N:1) - Reference only
- `orders` → `order_status_history` (1:N) - Audit trail

### 4. Content
- `guides` → `guide_translations` (1:N) - Multilingual guides

## Data Flow Examples

### Creating an Order
```
1. User adds products to cart (frontend state)
2. User proceeds to checkout
3. Create order record in `orders` table
4. Create order_items records for each product
5. Trigger updates product stock (automatic)
6. Trigger creates order_status_history entry (automatic)
7. Send confirmation email (application logic)
```

### Product Display (Multilingual)
```
1. Query products table
2. Join with product_translations WHERE locale = 'vi'
3. Join with product_images WHERE is_primary = true
4. Calculate average rating from product_reviews
5. Return combined data to frontend
```

### Deposit Reservation Flow
```
1. User selects "Reserve with Deposit"
2. Create order with is_deposit_order = true
3. Set deposit_paid = calculated amount
4. Set remaining_amount = total - deposit
5. Status = 'deposited'
6. Track reservation expiry (application logic)
```

## Indexes for Performance

All important foreign keys and frequently queried columns have indexes:

- `products.slug` - For URL lookups
- `products.is_published` - For filtering
- `product_translations.locale` - For language filtering
- `orders.user_id` - For user order history
- `orders.order_number` - For order lookup
- `orders.status` - For admin filtering

## Security (RLS Policies)

- **Public**: Can view published products and approved reviews
- **Authenticated Users**: Can view/edit own profile, addresses, orders
- **Admins**: Full access to all tables
- **Service Role**: Bypasses RLS (use carefully!)

## Triggers & Automation

1. **Auto-update timestamps**: All `updated_at` columns
2. **Generate order numbers**: ORD-YYYYMMDD-XXXXXX format
3. **Track status changes**: Automatic history logging
4. **Update stock**: Decrements on order, increments on cancellation
