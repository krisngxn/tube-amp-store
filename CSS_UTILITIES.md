# CSS Utility Classes Reference

## 🎨 Semantic Color Classes

### Background Colors
- `.bg-primary` - Main dark background (#0a0a0a)
- `.bg-secondary` - Secondary dark (#141414)
- `.bg-tertiary` - Tertiary dark (#1a1a1a)
- `.bg-elevated` - Elevated surface (#1f1f1f)
- `.bg-accent` - Brass/gold gradient
- `.bg-accent-subtle` - Subtle brass glow

### Text Colors
- `.text-primary` - Main text (#f5f5f5)
- `.text-secondary` - Secondary text (#a8a8a8)
- `.text-tertiary` - Tertiary text (#6b6b6b)
- `.text-accent` - Brass/gold accent
- `.text-success` - Success green
- `.text-warning` - Warning yellow
- `.text-error` - Error red

### Border Colors
- `.border-subtle` - Subtle border
- `.border-medium` - Medium border
- `.border-accent` - Accent border

## 📏 Spacing Utilities (Tailwind-like)

### Padding
- `.p-{size}` - All sides: 0, 1, 2, 3, 4, 5, 6, 8, 12, 16
- `.px-{size}` - Horizontal (left + right)
- `.py-{size}` - Vertical (top + bottom)
- `.pt-{size}` - Top only
- `.pb-{size}` - Bottom only

**Examples:**
```html
<div class="p-4">Padding 1rem all sides</div>
<div class="px-6 py-8">Padding 1.5rem horizontal, 2rem vertical</div>
<section class="py-16">Section with 4rem vertical padding</section>
```

### Margin
- `.m-{size}` - All sides: 0, 1, 2, 4, 6, 8, auto
- `.mx-{size}` - Horizontal
- `.my-{size}` - Vertical: 0, 2, 4, 6, 8, 12, 16
- `.mt-{size}` - Top: 0, 2, 4, 6, 8, 12, 16
- `.mb-{size}` - Bottom: 0, 2, 4, 6, 8, 12, 16
- `.mx-auto` - Center horizontally

### Gap (for Flex/Grid)
- `.gap-{size}` - 0, 1, 2, 3, 4, 6, 8, 12

## 📐 Layout Utilities

### Display
- `.block`, `.inline-block`, `.inline`
- `.flex`, `.inline-flex`
- `.grid`
- `.hidden`

### Flexbox
- `.flex-row`, `.flex-col`
- `.flex-wrap`, `.flex-nowrap`
- `.justify-start`, `.justify-end`, `.justify-center`, `.justify-between`, `.justify-around`
- `.items-start`, `.items-end`, `.items-center`, `.items-baseline`, `.items-stretch`

### Width
- `.w-full`, `.w-auto`
- `.w-1/2`, `.w-1/3`, `.w-2/3`, `.w-1/4`, `.w-3/4`

### Max Width
- `.max-w-xs` (320px) through `.max-w-7xl` (1280px)
- `.max-w-full`

## 🎯 Section Spacing (Auto-applied)

All `<section>` elements automatically get:
- `padding: 4rem 0` (desktop)
- `padding: 3rem 0` (mobile)

### Section Variants
- `.section-sm` - Small padding (3rem)
- `.section-md` - Medium padding (4rem) - default
- `.section-lg` - Large padding (6rem)

## 📦 Content Spacing Helpers

### Stack (Vertical Flex with Gap)
```html
<div class="stack stack-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Variants:
- `.stack-sm` - Small gap (0.5rem)
- `.stack-md` - Medium gap (1rem)
- `.stack-lg` - Large gap (1.5rem)
- `.stack-xl` - XL gap (2rem)

### Content Spacing (Margin between children)
```html
<div class="content-spacing">
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
  <p>Paragraph 3</p>
</div>
```

Variants:
- `.content-spacing-sm` - 1rem between items
- `.content-spacing` - 1.5rem between items
- `.content-spacing-lg` - 2rem between items

## 🔲 Border Utilities

### Border
- `.border` - All sides
- `.border-0` - No border
- `.border-t`, `.border-b`, `.border-l`, `.border-r` - Single side

### Border Radius
- `.rounded-none`, `.rounded-sm`, `.rounded`, `.rounded-md`, `.rounded-lg`, `.rounded-xl`, `.rounded-full`

## 💡 Common Patterns

### Card with Proper Spacing
```html
<div class="card p-6">
  <h3 class="mb-4">Card Title</h3>
  <p class="mb-4">Card content with proper spacing</p>
  <button class="btn btn-primary">Action</button>
</div>
```

### Section with Content
```html
<section class="py-16">
  <div class="container">
    <h2 class="mb-8">Section Title</h2>
    <div class="grid grid-3 gap-6">
      <div class="card p-6">Card 1</div>
      <div class="card p-6">Card 2</div>
      <div class="card p-6">Card 3</div>
    </div>
  </div>
</section>
```

### Centered Content
```html
<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-center mb-6">Centered Title</h1>
  <p class="text-center text-secondary">Centered content</p>
</div>
```

### Flex Layout
```html
<div class="flex items-center justify-between gap-4 p-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

## 🎨 Spacing Scale Reference

- `0` = 0
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `3` = 0.75rem (12px)
- `4` = 1rem (16px) ⭐ Most common
- `5` = 1.25rem (20px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)
- `12` = 3rem (48px)
- `16` = 4rem (64px)
- `20` = 6rem (96px)

## 📱 Responsive Behavior

- Sections automatically reduce padding on mobile
- Container padding adjusts on mobile
- Grid columns stack on mobile (< 768px)

---

**Pro Tip:** Use `.p-4` as your default padding for cards and containers. It provides comfortable 1rem (16px) spacing that prevents content from sticking together!
