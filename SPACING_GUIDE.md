# Spacing Best Practices - Before & After Examples

## ❌ BEFORE (Content Sticking Together)

```html
<!-- BAD: No spacing -->
<section>
  <div class="container">
    <h2>Products</h2>
    <div class="grid grid-3">
      <div class="card">
        <h3>Product 1</h3>
        <p>Description</p>
        <button>Buy</button>
      </div>
    </div>
  </div>
</section>
```

**Problems:**
- Section has no vertical padding
- Card has no internal padding
- Elements inside card are cramped
- No spacing between grid items

---

## ✅ AFTER (Proper Spacing)

```html
<!-- GOOD: Proper spacing -->
<section class="py-16">
  <div class="container">
    <h2 class="mb-8">Products</h2>
    <div class="grid grid-3 gap-6">
      <div class="card p-6">
        <h3 class="mb-4">Product 1</h3>
        <p class="mb-6">Description</p>
        <button class="btn btn-primary">Buy</button>
      </div>
    </div>
  </div>
</section>
```

**Improvements:**
- ✅ `.py-16` - Section has 4rem vertical padding
- ✅ `.mb-8` - Title has 2rem bottom margin
- ✅ `.gap-6` - Grid items have 1.5rem gap
- ✅ `.p-6` - Card has 1.5rem internal padding
- ✅ `.mb-4`, `.mb-6` - Elements have proper spacing

---

## 📐 Spacing Hierarchy

### Page Level
```html
<section class="py-16">  <!-- Large vertical padding -->
  <div class="container">
    <!-- Content -->
  </div>
</section>
```

### Section Level
```html
<div class="container">
  <h2 class="mb-8">Section Title</h2>  <!-- Large margin below titles -->
  <div class="grid grid-3 gap-6">      <!-- Medium gap between items -->
    <!-- Cards -->
  </div>
</div>
```

### Card Level
```html
<div class="card p-6">              <!-- Medium padding inside -->
  <h3 class="mb-4">Card Title</h3>  <!-- Medium margin below -->
  <p class="mb-4">Paragraph 1</p>   <!-- Medium margin below -->
  <p class="mb-6">Paragraph 2</p>   <!-- Larger margin before CTA -->
  <button class="btn">Action</button>
</div>
```

---

## 🎯 Common Spacing Patterns

### Hero Section
```html
<section class="py-20">  <!-- Extra large padding -->
  <div class="container">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="mb-6">Hero Title</h1>
      <p class="text-secondary mb-8">Hero description</p>
      <div class="flex gap-4 justify-center">
        <button class="btn btn-primary">Primary CTA</button>
        <button class="btn btn-secondary">Secondary CTA</button>
      </div>
    </div>
  </div>
</section>
```

### Product Grid
```html
<section class="py-16">
  <div class="container">
    <h2 class="mb-8">Featured Products</h2>
    <div class="grid grid-3 gap-6">
      <div class="card p-6">
        <div class="mb-4"><!-- Product image --></div>
        <h3 class="mb-2">Product Name</h3>
        <p class="text-accent mb-4">$99.00</p>
        <button class="btn btn-primary w-full">Add to Cart</button>
      </div>
    </div>
  </div>
</section>
```

### Form Layout
```html
<div class="card p-8">
  <h2 class="mb-6">Contact Form</h2>
  <form class="stack stack-lg">  <!-- Vertical stack with large gap -->
    <div>
      <label class="label">Name</label>
      <input type="text" class="input" />
    </div>
    <div>
      <label class="label">Email</label>
      <input type="email" class="input" />
    </div>
    <div>
      <label class="label">Message</label>
      <textarea class="input textarea"></textarea>
    </div>
    <button class="btn btn-primary">Submit</button>
  </form>
</div>
```

### Content Article
```html
<article class="max-w-3xl mx-auto px-4 py-12">
  <h1 class="mb-6">Article Title</h1>
  <div class="content-spacing">  <!-- Auto-spacing between children -->
    <p>Paragraph 1 with automatic spacing...</p>
    <p>Paragraph 2 with automatic spacing...</p>
    <h2>Subheading</h2>
    <p>More content...</p>
  </div>
</article>
```

---

## 📏 Spacing Scale Quick Reference

Use these as your go-to values:

| Class | Value | Use Case |
|-------|-------|----------|
| `.p-4` | 1rem (16px) | Default card/container padding |
| `.p-6` | 1.5rem (24px) | Comfortable card padding |
| `.p-8` | 2rem (32px) | Large card/modal padding |
| `.py-12` | 3rem (48px) | Small section padding |
| `.py-16` | 4rem (64px) | Default section padding |
| `.py-20` | 6rem (96px) | Hero/large section padding |
| `.gap-4` | 1rem (16px) | Default grid/flex gap |
| `.gap-6` | 1.5rem (24px) | Comfortable grid gap |
| `.mb-4` | 1rem (16px) | Default element spacing |
| `.mb-6` | 1.5rem (24px) | Spacing before CTAs |
| `.mb-8` | 2rem (32px) | Spacing after titles |

---

## 🎨 Visual Spacing Guide

```
┌─────────────────────────────────────┐
│  Section (py-16 = 4rem padding)     │
│  ┌───────────────────────────────┐  │
│  │  Container                    │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Title (mb-8 = 2rem)    │  │  │
│  │  │                         │  │  │
│  │  │  ▼ 2rem gap             │  │  │
│  │  │                         │  │  │
│  │  │  Grid (gap-6 = 1.5rem)  │  │  │
│  │  │  ┌────┐ ◄1.5rem► ┌────┐ │  │  │
│  │  │  │Card│         │Card│ │  │  │
│  │  │  │p-6 │         │p-6 │ │  │  │
│  │  │  └────┘         └────┘ │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│  ▲ 4rem padding                     │
└─────────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Sections:** Always use `.py-16` or `.py-20` for sections
2. **Cards:** Use `.p-6` for comfortable internal spacing
3. **Grids:** Use `.gap-6` for grid layouts
4. **Titles:** Use `.mb-8` for section titles
5. **CTAs:** Add `.mb-6` before buttons to create breathing room
6. **Forms:** Use `.stack-lg` for form fields
7. **Content:** Use `.content-spacing` for article-style content

---

**Remember:** Generous spacing makes your design feel premium and professional. Don't be afraid to add more space!
