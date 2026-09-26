# 🎨 StockSense — Complete UI/UX Design Document

> **Version:** 1.0  
> **Date:** September 26, 2026  
> **Based on:** StockSense PRD v1.0 + SAD v1.0  
> **Status:** Implementation-Ready

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens — Colors, Typography, Spacing](#2-design-tokens)
3. [Component Library](#3-component-library)
4. [Navigation & Information Architecture](#4-navigation--information-architecture)
5. [User Journeys](#5-user-journeys)
6. [Screen Specifications](#6-screen-specifications)
   - 6.1 [Authentication Screens](#61-authentication-screens)
   - 6.2 [Dashboard](#62-dashboard)
   - 6.3 [Products](#63-products)
   - 6.4 [Receipts](#64-receipts)
   - 6.5 [Delivery Orders](#65-delivery-orders)
   - 6.6 [Stock Adjustments](#66-stock-adjustments)
   - 6.7 [Move History / Ledger](#67-move-history--ledger)
   - 6.8 [Settings](#68-settings)
7. [Interaction Patterns](#7-interaction-patterns)
8. [Forms — Field Specs & Validation](#8-forms--field-specs--validation)
9. [Loading / Error / Empty States](#9-loading--error--empty-states)
10. [Alerts & Notifications](#10-alerts--notifications)
11. [Responsive Behavior](#11-responsive-behavior)
12. [Accessibility](#12-accessibility)
13. [Role-Based UI Differences](#13-role-based-ui-differences)

---

## 1. Design Principles

| # | Principle | Application |
|---|-----------|-------------|
| **P1** | **Clarity First** | Every screen has one primary action. Labels are plain English, never jargon. |
| **P2** | **Status Always Visible** | Badges, progress bars, or chips show the current status of every record (Draft → Done). |
| **P3** | **Fail Safely** | Destructive or irreversible actions (Validate, Approve) require confirmation. Over-delivery is blocked before submit. |
| **P4** | **Role Awareness** | Manager-only controls are hidden (not just disabled) for Staff. No "Access Denied" frustration. |
| **P5** | **Real-Time Feedback** | Dashboard KPIs animate on change. Toast confirmations appear within 500ms of any operation. |
| **P6** | **Progressive Disclosure** | Forms show only necessary fields. Advanced filters collapse behind a "More Filters" toggle. |
| **P7** | **Consistency** | Same status badge colors, same table column order, same button placement across all list views. |

---

## 2. Design Tokens

### 2.1 Color Palette

#### Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand-primary` | `#4F6EF7` | Primary buttons, active nav items, links |
| `--color-brand-secondary` | `#7C3AED` | Accent, badges, highlights |
| `--color-brand-gradient` | `linear-gradient(135deg, #4F6EF7, #7C3AED)` | Hero elements, KPI card accents |

#### Semantic / Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#10B981` | Done status, stock within range, success toasts |
| `--color-warning` | `#F59E0B` | Low stock alert, Waiting status, pending items |
| `--color-danger` | `#EF4444` | Out-of-stock, error toasts, destructive actions |
| `--color-info` | `#3B82F6` | Info toasts, Draft status, neutral badges |
| `--color-neutral` | `#6B7280` | Cancelled status, disabled states |

#### Status Badge Color Map
| Status | Background | Text |
|--------|------------|------|
| Draft | `#EFF6FF` | `#3B82F6` |
| Waiting | `#FFFBEB` | `#D97706` |
| Ready | `#F0FDF4` | `#16A34A` |
| Done | `#DCFCE7` | `#15803D` |
| Cancelled | `#F3F4F6` | `#6B7280` |
| Pending Approval | `#FEF3C7` | `#B45309` |
| Approved | `#D1FAE5` | `#065F46` |
| Rejected | `#FEE2E2` | `#991B1B` |

#### Surface Colors (Dark Mode as Default)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-base` | `#0F1117` | Page background |
| `--color-bg-surface` | `#1A1D27` | Cards, sidebar, modals |
| `--color-bg-elevated` | `#252836` | Dropdowns, popovers, hover states |
| `--color-bg-input` | `#1E2130` | Form inputs |
| `--color-border` | `#2E3348` | Card borders, dividers, input borders |
| `--color-border-focus` | `#4F6EF7` | Input focus ring |

#### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#F1F5F9` | Headings, body |
| `--color-text-secondary` | `#94A3B8` | Labels, metadata, placeholders |
| `--color-text-disabled` | `#475569` | Disabled text |
| `--color-text-inverse` | `#0F1117` | Text on light/brand backgrounds |

---

### 2.2 Typography

**Font:** `Inter` (Google Fonts) — loaded via `@import` in global CSS.

| Scale Token | Size | Weight | Line Height | Usage |
|-------------|------|--------|-------------|-------|
| `--text-xs` | `11px` | 400 | 16px | Metadata, helper text |
| `--text-sm` | `13px` | 400 | 20px | Table cells, form labels |
| `--text-base` | `15px` | 400 | 24px | Body, descriptions |
| `--text-md` | `16px` | 500 | 24px | Button text, nav items |
| `--text-lg` | `18px` | 600 | 28px | Section headings, modal titles |
| `--text-xl` | `22px` | 700 | 32px | Page titles |
| `--text-2xl` | `28px` | 700 | 36px | KPI card values |
| `--text-3xl` | `36px` | 800 | 44px | Hero / auth brand text |

---

### 2.3 Spacing Scale

Uses an 8px base grid. All spacing values are multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight gaps (icon + label) |
| `--space-2` | `8px` | Internal padding (badges, chips) |
| `--space-3` | `12px` | Form field spacing |
| `--space-4` | `16px` | Card padding, section gaps |
| `--space-5` | `20px` | Between form groups |
| `--space-6` | `24px` | Page section separation |
| `--space-8` | `32px` | Between major page sections |
| `--space-10` | `40px` | Page-level vertical padding |
| `--space-12` | `48px` | Header height |

---

### 2.4 Border Radius & Shadow

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Badges, chips, inputs |
| `--radius-md` | `10px` | Cards, dropdowns |
| `--radius-lg` | `16px` | Modals, panels |
| `--radius-full` | `9999px` | Pills, avatar |

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.3)` | Input, chip |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Card |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Modal, dropdown |
| `--shadow-glow-primary` | `0 0 20px rgba(79,110,247,0.25)` | Focus state, active KPI card |

---

## 3. Component Library

### 3.1 Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| **Primary** | Brand gradient bg, white text, shadow-glow on hover | Main CTA per screen (Validate, Create, Save) |
| **Secondary** | Transparent bg, border `--color-border`, white text | Secondary actions (Edit, Filter) |
| **Danger** | `--color-danger` bg on hover, red border | Destructive actions (Cancel, Reject) |
| **Ghost** | No bg, no border, muted text | Tertiary / nav actions |
| **Icon Only** | Square, `--radius-sm`, icon centered | Table row actions (edit, view) |

**Sizes:** `sm` (32px height) | `md` (40px height) | `lg` (48px height)

**States:** Default → Hover (brightness +10%, slight scale 1.02) → Active (scale 0.98) → Loading (spinner replaces label) → Disabled (50% opacity, cursor not-allowed)

---

### 3.2 Form Inputs

All inputs share:
- Background: `--color-bg-input`
- Border: `1px solid --color-border`
- Focus: border-color `--color-border-focus`, box-shadow `--shadow-glow-primary`
- Height: `40px` (standard), `36px` (compact/filter)
- Border-radius: `--radius-sm`
- Transition: `border-color 0.15s, box-shadow 0.15s`

| Component | Details |
|-----------|---------|
| **Text Input** | Standard single-line |
| **Number Input** | Type=number, min=0, no negatives |
| **Select / Dropdown** | Custom styled, searchable via react-select or shadcn Select |
| **Textarea** | 3-row minimum, resizable vertically only |
| **Search Input** | Left icon (magnifier), clear button on right when filled |
| **Date Picker** | shadcn DatePicker, ISO format display |

---

### 3.3 Status Badge

```
[●  Draft]    [●  Waiting]    [✓  Done]    [!  Low Stock]
```

- Pill shape (`--radius-full`)
- Small dot or icon prefix
- Color-coded per status table in §2.1
- `--text-xs` / `font-weight: 600`
- No interaction (display-only)

---

### 3.4 KPI Card

```
┌─────────────────────────────────────┐
│  📦 Total Products                  │
│                                     │
│           1,247                     │  ← --text-2xl, bold
│                                     │
│  ↑ 12 added this week               │  ← --text-xs, secondary
└─────────────────────────────────────┘
```

- Background: `--color-bg-surface`
- Left accent bar (4px wide, brand gradient)
- Icon top-left (24px, colored by semantic meaning)
- Value: `--text-2xl`, `font-weight: 700`
- Subtitle: `--text-xs`, `--color-text-secondary`
- Hover: subtle lift (translateY -2px), `--shadow-md`
- On real-time update: value does a subtle "count-up" animation (500ms)
- Alert cards (Low Stock, Out of Stock): left accent uses `--color-warning` / `--color-danger`

---

### 3.5 Data Table

```
┌──────────────────────────────────────────────────────────┐
│  [Search ____________] [Status ▾] [Warehouse ▾] [+ Create]│
├──────────┬───────────┬───────────┬─────────┬─────────────┤
│ ID       │ Product   │ Qty       │ Status  │ Actions     │
├──────────┼───────────┼───────────┼─────────┼─────────────┤
│ RCT-001  │ Widget A  │ 50 units  │ ● Done  │ [👁 View]   │
│ RCT-002  │ Widget B  │ 20 units  │ ● Ready │ [👁] [✓Val] │
└──────────┴───────────┴───────────┴─────────┴─────────────┘
│ Showing 1–20 of 48        [< Prev]  1  2  3  [Next >]    │
└──────────────────────────────────────────────────────────┘
```

- Header row: sticky, `--color-bg-elevated`, `--text-sm`, `font-weight: 600`
- Row hover: `--color-bg-elevated`
- Selected row: left border `4px solid --color-brand-primary`
- Striping: none (hover is sufficient)
- Empty state: centered illustration + message (see §9)
- Pagination: 20 rows/page default; page size selector (20 / 50 / 100)
- Actions column: always right-aligned, icon buttons only
- Sortable columns: `↑↓` icon on hover, sorted column shows directional arrow

---

### 3.6 Modal / Dialog

```
┌────────────────────────────────────────┐
│  Title                           [✕]   │
├────────────────────────────────────────┤
│                                        │
│   Content / Form                       │
│                                        │
├────────────────────────────────────────┤
│              [Cancel]  [Confirm]       │
└────────────────────────────────────────┘
```

- Max width: `560px` (form modals), `720px` (detail modals)
- Backdrop: `rgba(0,0,0,0.6)` blur `4px`
- Animation: fade + scale from 95% → 100% (200ms ease-out)
- Escape key closes; click outside closes (except destructive confirm)
- Footer always shows Cancel + Primary action

---

### 3.7 Toast Notifications

- Position: top-right, `16px` from edge
- Auto-dismiss: 4s (success/info), 6s (warning), sticky (error — requires manual dismiss)
- Stack: up to 3 toasts; older ones push down

| Type | Icon | Left Border Color |
|------|------|-------------------|
| Success | ✓ | `--color-success` |
| Error | ✕ | `--color-danger` |
| Warning | ⚠ | `--color-warning` |
| Info | ℹ | `--color-info` |

---

### 3.8 Sidebar Navigation

```
┌──────────────┐
│  📦 StockSense│
├──────────────┤
│ 🏠 Dashboard  │ ← active (brand underline + bg)
│ 📋 Products   │
│ 📥 Receipts   │
│ 🚚 Deliveries │
│ ⚖ Adjustments│
│ 📖 Ledger     │
│ ⚙  Settings  │ ← Manager only
├──────────────┤
│ [Avatar]     │
│ Jane Mgr     │
│ Manager      │
│ [Log Out]    │
└──────────────┘
```

- Width: `240px` expanded, `64px` collapsed (icon-only mode)
- Collapse toggle: `<<` arrow at bottom-left
- Active item: `--color-brand-primary` left border (3px), background `--color-bg-elevated`
- Hover item: `--color-bg-elevated` transition 150ms
- User profile section: fixed at bottom with avatar (initials if no image), name, role chip, logout button
- Role chip: `Manager` in purple, `Staff` in blue

---

### 3.9 Page Header

```
┌─────────────────────────────────────────────────────────┐
│  Receipts                           [+ Create Receipt]  │
│  Manage incoming stock from suppliers                   │
└─────────────────────────────────────────────────────────┘
```

- Title: `--text-xl`
- Subtitle: `--text-sm`, `--color-text-secondary`
- Primary CTA: right-aligned, `Primary` button variant
- Separator: `1px solid --color-border` below header

---

### 3.10 Breadcrumb

`Dashboard / Receipts / RCT-0042`

- Separator: `/`
- Active (last): `--color-text-primary`, not clickable
- Previous segments: `--color-text-secondary`, clickable links

---

### 3.11 Stepper (Workflow Progress)

Used in Receipt and Delivery detail pages.

```
[● Draft] ──── [● Waiting] ──── [○ Ready] ──── [○ Done]
```

- Completed steps: filled circle, `--color-success`
- Current step: filled circle, `--color-brand-primary`, pulsing ring animation
- Upcoming steps: hollow circle, `--color-border`
- Step labels below circles, `--text-xs`

---

## 4. Navigation & Information Architecture

### 4.1 Route Map

```
/                     → redirects to /dashboard (if logged in) or /login

── Public ────────────────────────────────────────────
/login
/signup
/reset-password
/otp-verify

── Protected (All Roles) ──────────────────────────────
/dashboard
/products                 → list
/products/:id             → detail (read-only for Staff)
/receipts                 → list
/receipts/new             → create form
/receipts/:id             → detail + status actions
/deliveries               → list
/deliveries/new           → create form
/deliveries/:id           → detail + status actions
/adjustments              → list (Staff: own | Manager: all)
/adjustments/new          → create form
/adjustments/:id          → detail + approve/reject (Manager)
/ledger                   → move history table

── Protected (Manager Only) ───────────────────────────
/products/new             → create form
/products/:id/edit        → edit form
/settings                 → warehouse + user management
/settings/warehouses      → warehouse list + add/edit
/settings/users           → user list
```

### 4.2 Sidebar Navigation Order

1. Dashboard *(all roles)*
2. Products *(all roles)*
3. Receipts *(all roles)*
4. Deliveries *(all roles)*
5. Adjustments *(all roles)*
6. Ledger *(all roles)*
7. — divider —
8. Settings *(Manager only — hidden for Staff)*

### 4.3 Tab Navigation (within pages)

Used on Settings page:
- `Warehouses` | `Users` (tabs at top of content area)

Used on Dashboard:
- No tabs; filters are inline chips above the summary table.

---

## 5. User Journeys

### 5.1 Inventory Manager — Daily Start Journey

```
Login → Dashboard
  ├── Scan KPI cards (Total Products, Low Stock, Out of Stock, Pending Receipts, Pending Deliveries)
  ├── Notices: "3 Low Stock" alert banner → clicks → goes to Products (filtered: Low Stock)
  ├── Reviews pending adjustments → Adjustments list → approves 2, rejects 1
  └── Checks yesterday's receipts → Ledger (filtered: yesterday, type: receipt)
```

### 5.2 Warehouse Staff — Incoming Goods Journey

```
Login → Dashboard (limited view)
  └── Click [Create Receipt]
        → Fill supplier name
        → Add products + quantities (search by SKU)
        → Select warehouse
        → Save (status: Draft)
        → Change status → Waiting → Ready (as goods arrive)
        → Click [Validate]
        → Confirmation modal: "Validate 50 units of Widget A?"
        → Confirm → Success toast: "Receipt validated. Stock updated."
        → Redirected back to Receipt detail (status: Done)
```

### 5.3 Warehouse Staff — Outgoing Delivery Journey

```
Dashboard → [Create Delivery]
  → Fill customer reference
  → Add products + quantities
  → Select source warehouse
  → Save → status: Draft → Waiting → Ready
  → [Validate]
    → If stock OK → Success → status: Done
    → If insufficient → Inline error: "Only 15 units of Widget B available"
```

### 5.4 Warehouse Staff — Stock Adjustment Journey

```
Dashboard → Adjustments → [New Adjustment]
  → Select product
  → Select warehouse
  → System shows Recorded Qty (read-only, from DB)
  → Enter Physical Qty
  → System auto-calculates Delta (shown in real time)
  → Enter Reason/Notes
  → [Submit]
  → Status: Pending Approval
  → Toast: "Adjustment submitted. Awaiting manager approval."
```

### 5.5 Manager — Approve Adjustment Journey

```
Dashboard → sees "2 Pending Adjustments" badge on Adjustments nav item
  → Adjustments list (filtered: Pending Approval)
  → Click row → Adjustment detail
  → Reviews: Product / Recorded 80 / Physical 72 / Delta -8 / Reason: "Damage"
  → [Approve] or [Reject]
  → Confirmation modal
  → Approve → stock corrected → ledger entry created
  → Toast: "Adjustment approved. Stock updated."
```

### 5.6 New User — Onboarding Journey

```
Landing (/) → [Sign Up]
  → Enter name, email, password, role (Manager/Staff)
  → Submit → OTP sent to email → OTP entry screen
  → Verify OTP → Redirected to Dashboard
  → (First run) If no warehouses exist → Warning banner:
      "No warehouses configured. [Go to Settings →]"
```

---

## 6. Screen Specifications

### 6.1 Authentication Screens

#### Login Page `/login`

**Layout:** Split — left branding panel (40%), right form panel (60%)

**Left panel:**
- Full-height gradient background (`--color-brand-gradient`)
- StockSense logo (icon + wordmark), centered vertically
- Tagline: *"Real-time inventory, zero guesswork."*
- Decorative abstract warehouse/box illustration below tagline

**Right panel (form):**
- Background: `--color-bg-base`
- Vertically centered form card (max-width: 420px)
- Card: `--color-bg-surface`, `--radius-lg`, `--shadow-lg`

**Form Fields:**
| Field | Type | Placeholder | Validation |
|-------|------|-------------|------------|
| Email | email | `you@company.com` | Required, valid email |
| Password | password | `••••••••` | Required, min 8 chars |

**Actions:**
- `[Log In]` — Primary button, full width
- `Forgot password?` — Ghost link below password field
- `Don't have an account? Sign Up` — link at bottom

**Error States:**
- Invalid credentials: red inline message below form — *"Invalid email or password."*
- Account not verified: *"Please verify your email first. [Resend OTP]"*

---

#### Sign Up Page `/signup`

**Same split layout as Login.**

**Form Fields:**
| Field | Type | Placeholder | Validation |
|-------|------|-------------|------------|
| Full Name | text | `Jane Doe` | Required, min 2 chars |
| Email | email | `you@company.com` | Required, valid email, unique |
| Password | password | `Min 8 characters` | Required, min 8 chars |
| Confirm Password | password | `Re-enter password` | Must match password |
| Role | select | `Select your role` | Required — Manager / Staff |

**Note:** Role selector is a visible dropdown, not hidden. Only 2 options.

**Actions:**
- `[Create Account]` — Primary, full width
- `Already have an account? Log In` — link

---

#### OTP Verification Page `/otp-verify`

**Layout:** Centered single-column card, max-width 400px.

**Content:**
- Heading: "Check your inbox"
- Sub: "We sent a 6-digit code to `user@email.com`"
- 6 individual digit input boxes (focus auto-advances on each digit entry)
- `[Verify Code]` — Primary, full width
- Timer: "Code expires in 09:42" (countdown)
- `[Resend Code]` link (enabled after countdown hits 0)

---

#### Forgot Password `/reset-password`

**Step 1 — Email Entry:**
- Single email field
- `[Send Reset Code]` primary button
- Back to login link

**Step 2 — OTP + New Password:**
- OTP input (same 6-box style)
- New Password field
- Confirm Password field
- `[Reset Password]` primary button

---

### 6.2 Dashboard

**URL:** `/dashboard`

**Layout:** Sidebar (fixed left, 240px) + main content area

#### Header Section
- Page title: "Dashboard"
- Warehouse filter dropdown (top-right of content area): "All Warehouses ▾"
- Last refreshed indicator: `Live • Updated just now` (green dot pulsing)

#### KPI Cards Row (5 cards, responsive grid)

| # | Card | Icon | Alert Color |
|---|------|------|-------------|
| 1 | Total Products in Stock | 📦 box | Brand |
| 2 | Low Stock Items | ⚠ warning | Warning yellow |
| 3 | Out of Stock Items | 🔴 circle | Danger red |
| 4 | Pending Receipts | 📥 inbox | Brand |
| 5 | Pending Deliveries | 🚚 truck | Brand |

- Cards 2 & 3 are "alert cards" — if value > 0, their left accent uses warning/danger colors
- Clicking card 2 → navigates to `/products?filter=low_stock`
- Clicking card 3 → navigates to `/products?filter=out_of_stock`
- Clicking card 4 → navigates to `/receipts?filter=pending`
- Clicking card 5 → navigates to `/deliveries?filter=pending`

#### Low Stock Alert Banner
*Only visible if Low Stock Items > 0.*

```
⚠  3 products are below their reorder threshold.  [View Low Stock Items →]
```
- Background: `#FEF3C7`, border-left `4px solid --color-warning`
- Dismissible (X button) — persists until restocked; re-appears on next login if still low

#### Summary Table (Recent Activity)
Below KPI cards — tabbed or filtered table:

**Filter Chips (horizontal row):**
`All` | `Receipts` | `Deliveries` | `Adjustments`

**Status Filter:**
`All Statuses ▾` dropdown

**Table Columns:** Date | Type | Reference ID | Product(s) | Warehouse | Status | Created By

**Manager view:** all records  
**Staff view:** only their own records

#### Quick Action Buttons (Manager only)
Below summary table, right side:
- `[+ New Receipt]`
- `[+ New Delivery]`
- `[+ New Adjustment]`

---

### 6.3 Products

**URL:** `/products`

#### Product List Page

**Header:** "Products" | `[+ Add Product]` (Manager only)

**Filter Row:**
- Search bar: "Search by name or SKU..."
- Category filter: dropdown
- Stock filter: `All` | `In Stock` | `Low Stock` | `Out of Stock`
- Warehouse filter: dropdown

**Table Columns:**
| Column | Notes |
|--------|-------|
| SKU | Monospace font, copyable |
| Name | Bold |
| Category | Plain text |
| UOM | Abbreviation (pcs, kg, L) |
| Stock (per warehouse) | One column per warehouse; or collapsed "Total: 240" with tooltip |
| Reorder Threshold | Shows `—` if not set |
| Status | Badge: In Stock / Low Stock / Out of Stock |
| Actions | View | Edit (Manager only) |

**Empty state:** No products yet. Managers see `[+ Add Product]` CTA.

---

#### Create Product `/products/new` (Manager only)

**Layout:** Centered form card, max-width 640px

**Form:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Product Name | text | ✅ | |
| SKU / Code | text | ✅ | Real-time uniqueness check with debounce |
| Category | select or creatable | ✅ | Can type new category |
| Unit of Measure | select | ✅ | pcs, kg, L, m, box, etc. |
| Initial Stock | number | ❌ | Default: 0. Only for initial setup |
| Reorder Threshold | number | ❌ | Min 0. Helper text: "Alert triggers below this quantity" |
| Warehouse | select | ✅ | Must exist first |

**SKU validation:** Inline check — shows "✓ Available" or "✕ SKU already in use" within 500ms of typing stop.

**Actions:** `[Cancel]` `[Save Product]`

**Success:** Toast "Product created." + redirect to `/products/:id`

---

#### Product Detail `/products/:id`

**Header:** Product name (h1) + SKU chip + Status badge

**Info Grid:**
- Category | UOM | Reorder Threshold | Created by | Created at

**Stock by Warehouse Table:**
| Warehouse | Location | Current Qty | Status |
|-----------|----------|-------------|--------|
| WH-Main | Shelf A | 250 | ✅ In Stock |
| WH-East | — | 0 | 🔴 Out of Stock |

**Recent Movements (last 5):** Mini ledger table — Date | Type | Delta | Reference

**Actions (Manager only):** `[Edit Product]` button in header

---

### 6.4 Receipts

**URL:** `/receipts`

#### Receipt List

**Header:** "Receipts" | `[+ Create Receipt]`

**Filters:** Search | Status | Warehouse | Date range

**Table Columns:**
| Column | Notes |
|--------|-------|
| Receipt ID | `RCT-NNNN` format, monospace |
| Supplier | |
| Warehouse | |
| # Products | Count of line items |
| Date | Relative: "2h ago" with tooltip for full date |
| Status | Badge |
| Actions | View | Validate (if Ready, any role) |

---

#### Create Receipt `/receipts/new`

**Layout:** Full-width form with line item table

**Header fields:**
| Field | Type | Required |
|-------|------|----------|
| Supplier Name | text | ✅ |
| Destination Warehouse | select | ✅ |
| Date | date (default: today) | ✅ |
| Notes | textarea | ❌ |

**Product Line Items Table:**
```
[+ Add Product]

┌──────────────────────────┬──────────────┬──────────┬──────┐
│ Product (search by SKU)  │ UOM          │ Quantity │  ✕   │
├──────────────────────────┼──────────────┼──────────┼──────┤
│ Widget A (SKU: WGT-001)  │ pcs          │ [  50  ] │  ✕   │
│ [Search or SKU...]       │              │ [      ] │      │
└──────────────────────────┴──────────────┴──────────┴──────┘
```

- Products auto-filled from search/select
- UOM is read-only (from product)
- Min 1 line item to save
- [+ Add Product] appends a new empty row

**Actions:** `[Save as Draft]` `[Cancel]`

**Note:** Status starts as `Draft`. User must manually advance to `Waiting` → `Ready` before validating.

---

#### Receipt Detail `/receipts/:id`

**Layout:** Header + stepper + detail card + line items table + action buttons

**Header:** Receipt ID | Status badge | Created by | Created at

**Stepper:**
```
[● Draft] ──── [● Waiting] ──── [● Ready] ──── [○ Done]
```

**Detail Card:**
- Supplier | Warehouse | Date | Notes

**Line Items Table:**
| Product | SKU | UOM | Qty Received | Current Stock (after) |
|---------|-----|-----|--------------|----------------------|
*Current Stock column only shows after status = Done*

**Action Buttons (context-aware):**
| Status | Available Actions |
|--------|-------------------|
| Draft | `[Mark as Waiting]` `[Cancel Receipt]` |
| Waiting | `[Mark as Ready]` `[Back to Draft]` `[Cancel]` |
| Ready | `[Validate Receipt]` `[Back to Waiting]` `[Cancel]` |
| Done | (No actions — read-only) |
| Cancelled | (No actions — read-only) |

**Validate action:** Opens confirmation modal:
> *"Validate this receipt? This will add 50× Widget A and 20× Widget B to WH-Main."*  
> `[Cancel]` `[Confirm & Validate]`

---

### 6.5 Delivery Orders

**URL:** `/deliveries`

*Mirrors the Receipts pattern with the following differences:*

- **"Supplier"** replaced by **"Customer / Reference"**
- **"Destination Warehouse"** replaced by **"Source Warehouse"** (stock comes from here)
- **Validate action** checks stock availability before confirming
- **Insufficient stock error** shows inline in confirmation modal:
  > *"⚠ Insufficient stock: Widget B has 15 units available, requested 30."*
  > Validate button remains disabled until quantities are corrected.

**Columns unique to Deliveries:**
| Column | Notes |
|--------|-------|
| Delivery ID | `DLV-NNNN` |
| Customer Ref | |
| Source Warehouse | |

**Status flow:** `Draft → Waiting → Ready → Done`

---

### 6.6 Stock Adjustments

**URL:** `/adjustments`

#### Adjustment List

**Header:** "Stock Adjustments" | `[+ New Adjustment]`

**Manager view:** All adjustments, all users
**Staff view:** Only own submissions

**Filters:** Status (All / Pending / Approved / Rejected) | Product search | Date range

**Table Columns:**
| Column | Notes |
|--------|-------|
| Adjustment ID | `ADJ-NNNN` |
| Product | |
| Warehouse | |
| Delta | Shows `+8` or `-12` with color (green/red) |
| Reason | Truncated, tooltip for full text |
| Submitted By | |
| Status | Badge |
| Actions | View | Approve/Reject (Manager only, Pending only) |

---

#### New Adjustment `/adjustments/new`

| Field | Type | Notes |
|-------|------|-------|
| Product | search-select | Required |
| Warehouse | select | Required |
| Recorded Qty | number | **Read-only.** Auto-populated from DB after product + warehouse selected |
| Physical Qty | number | User-entered; min 0 |
| Delta | calculated | `Physical − Recorded`. Auto-shown in real time. Color: green if positive, red if negative. |
| Reason / Notes | textarea | Required |

**Actions:** `[Cancel]` `[Submit for Approval]`

**On submit:** Status = `Pending Approval`. Redirected to adjustment detail.

---

#### Adjustment Detail `/adjustments/:id`

**Header:** Adjustment ID | Status badge

**Detail:**
- Product | Warehouse | Recorded Qty | Physical Qty | Delta | Reason
- Submitted By | Submitted At
- Reviewed By | Reviewed At (if actioned)

**Manager actions (only for Pending):**
- `[Approve]` — green, opens confirmation modal
- `[Reject]` — red, opens modal with optional rejection notes field

**Confirmation modal (Approve):**
> *"Approve this adjustment? Stock for Widget A in WH-Main will change from 80 → 72 (−8 units)."*

---

### 6.7 Move History / Ledger

**URL:** `/ledger`

**Header:** "Move History"  
*(No create action — read-only log)*

**Filter Bar:**
| Filter | Type |
|--------|------|
| Search | by SKU, product name, reference ID |
| Type | Receipt / Delivery / Adjustment / All |
| Warehouse | dropdown |
| Date Range | from–to date pickers |
| User | text search (Manager only) |

**Table Columns:**
| Column | Notes |
|--------|-------|
| Timestamp | Full date + time; relative on hover |
| Type | Badge (Receipt/Delivery/Adjustment) |
| Reference | Clickable → links to source record |
| Product | SKU + Name |
| Delta | `+50` or `−12` colored |
| Before → After | `100 → 150` |
| Warehouse | |
| Performed By | Name + Role chip |

**Pagination:** 50 rows/page for Ledger (more dense)

**Export:** *(Post-MVP; button shown but disabled with tooltip "Coming soon")*

---

### 6.8 Settings

**URL:** `/settings` (Manager only)

**Layout:** Tabs — `Warehouses` | `Users` | `Odoo Integration`

#### Warehouses Tab

**List:** Name | Location | Created By | Created At | Actions (Edit)

**Add Warehouse form (inline or modal):**
| Field | Required |
|-------|----------|
| Warehouse Name | ✅ |
| Location / Address | ❌ |

#### Users Tab

**List:** Name | Email | Role | Joined | Status

**Note:** Users cannot be created from here; they self-register. Manager can only view the list. (Role change: Post-MVP.)

#### Odoo Integration Tab

```
┌──────────────────────────────────────────────┐
│  Odoo ERP Integration                        │
│                                              │
│  Status:  ● Not Connected                   │
│                                              │
│  Odoo Host:   [______________________]       │
│  Port:        [8069  ]                       │
│  Database:    [______________________]       │
│  Username:    [______________________]       │
│  Password:    [••••••••••]                   │
│                                              │
│  [Test Connection]  [Save & Sync Products]   │
└──────────────────────────────────────────────┘
```

- "Test Connection" button → shows inline result: ✓ Connected / ✕ Failed
- "Save & Sync Products" → pulls product catalog from Odoo and creates/updates products

---

## 7. Interaction Patterns

### 7.1 Status Advancement

- Status changes are triggered by explicit button clicks, never automatic.
- Each status button shows the **next state** it transitions to: `[Mark as Ready]` not `[Change Status]`.
- Regression (Back buttons) only appear for non-validated statuses.

### 7.2 Inline Editing

- Not used for complex records (receipts, products).
- Only used for simple single fields, like warehouse name in Settings.

### 7.3 Optimistic UI

- Applied to status chip on status change: the badge updates instantly while the API call is in-flight.
- On API error: badge reverts + error toast shown.

### 7.4 Confirmation Dialogs

Required before:
- Validate a Receipt or Delivery (irreversible stock change)
- Approve or Reject an Adjustment
- Cancel a Receipt or Delivery

Not required for:
- Status changes Draft → Waiting → Ready (easily reversible)
- Creating records (no data loss)

### 7.5 Search with Debounce

All search inputs use 300ms debounce before triggering API call. While loading: spinner inside search input. Empty result shows empty state inline within the table.

### 7.6 Real-Time KPI Updates

- Supabase Realtime WebSocket subscription active when Dashboard is in view.
- On stock change event: affected KPI card value animates with a `count-up` transition (500ms).
- A subtle flash/pulse on the card border signals the update.

### 7.7 Keyboard Navigation

- `Tab` through form fields in logical order.
- `Enter` on form submits primary action.
- `Escape` closes modals and dropdowns.
- Sidebar nav: `Arrow Up/Down` navigates items when focused.

---

## 8. Forms — Field Specs & Validation

### 8.1 General Validation Rules

| Rule | Behavior |
|------|----------|
| Required field empty | Red border + helper text "This field is required" on blur |
| Invalid format | Inline message on blur |
| Duplicate SKU | Shown in real-time, 500ms after typing stops |
| Quantity = 0 | Warn "Quantity must be at least 1" |
| Negative quantity | Not allowed; number input prevents it |
| Over-delivery | Shown in validation confirmation modal, blocks confirm |

### 8.2 Validation Timing

- **On blur:** Format and required checks.
- **On submit:** Full form validation; shows all errors at once.
- **Real-time:** SKU uniqueness only.

### 8.3 Error Message Placement

- Below the field, in `--color-danger`, `--text-sm`, left-aligned.
- Field border switches to `--color-danger`.
- Accessible: `aria-describedby` links field to error message.

### 8.4 Form Auto-Save (Draft)

- Receipt and Delivery forms auto-save to localStorage every 30s as Draft.
- On page reload: "Resume unsaved draft?" prompt with `[Resume]` / `[Discard]` options.

---

## 9. Loading / Error / Empty States

### 9.1 Page Loading State

- Full-page: show sidebar + header skeleton immediately.
- Content area: Card skeletons (animated shimmer effect, `--color-bg-elevated` base, `--color-border` shimmer).
- Target: skeleton visible for no more than 500ms at P95.

### 9.2 Table Loading State

- Skeleton rows: 5 rows with gray bars, animated shimmer.
- Row height matches real data rows.

### 9.3 KPI Card Loading State

- Skeleton: number replaced by animated shimmer bar.

### 9.4 Empty States

Each list page has a tailored empty state:

| Page | Illustration | Message | CTA |
|------|-------------|---------|-----|
| Products | Box icon | "No products yet. Add your first product to start tracking inventory." | `[+ Add Product]` (Manager) / "Contact your manager to add products." (Staff) |
| Receipts | Inbox icon | "No receipts found. Create one when goods arrive from a supplier." | `[+ Create Receipt]` |
| Deliveries | Truck icon | "No deliveries yet. Create one to dispatch stock." | `[+ Create Delivery]` |
| Adjustments | Scale icon | "No adjustments submitted yet." | `[+ New Adjustment]` |
| Ledger | Book icon | "No movements recorded yet. Start by validating a receipt or delivery." | — |

Empty state with active filters: "No results for your current filters." + `[Clear Filters]` button.

### 9.5 Error States

#### API Error (generic)

```
┌─────────────────────────────────────────────┐
│  ⚠  Something went wrong                    │
│  We couldn't load this data. Check your     │
│  connection and try again.                  │
│                      [Retry]                │
└─────────────────────────────────────────────┘
```

#### 404 Page

- Message: "Page not found."
- `[← Back to Dashboard]` link

#### 403 Forbidden

- Message: "You don't have permission to view this page."
- `[← Back to Dashboard]` link
- No exposure of why or what the route is.

#### Offline / No Connection

- Top banner (full width, `--color-danger` background):
  `⚠ You are offline. Real-time updates are paused.`
- Disappears automatically when connection is restored (with a `✓ Back online` success banner).

---

## 10. Alerts & Notifications

### 10.1 Low Stock Alert Banner

**Trigger:** Any product's stock < reorder_threshold  
**Location:** Below page header on Dashboard  
**Dismissible:** Yes (per session)  
**Content:** "⚠ N products are below reorder threshold. [View →]"

### 10.2 Out of Stock Alert Banner

**Trigger:** Any product's quantity = 0  
**Urgency:** Higher than Low Stock  
**Color:** Danger red background  
**Content:** "🔴 N products are out of stock. [View →]"

### 10.3 Badge on Sidebar Nav Item

- `Adjustments` nav item: shows badge count of pending approvals (Manager only)
- `Receipts` / `Deliveries`: shows badge count of Ready items awaiting validation

```
│ ⚖ Adjustments  [3]  │   ← badge is a small orange pill
```

### 10.4 Toast Messages (Summary)

| Trigger | Toast |
|---------|-------|
| Receipt validated | ✅ "Receipt validated. Stock updated successfully." |
| Delivery validated | ✅ "Delivery validated. Stock decremented." |
| Adjustment submitted | ℹ "Adjustment submitted for approval." |
| Adjustment approved | ✅ "Adjustment approved. Stock corrected." |
| Adjustment rejected | ✕ "Adjustment rejected. No stock change." |
| Product created | ✅ "Product saved successfully." |
| SKU duplicate | ✕ "SKU already exists. Please use a unique code." |
| Over-delivery blocked | ✕ "Cannot deliver more than available stock." |
| Session expired | ⚠ "Session expired. Please log in again." |

---

## 11. Responsive Behavior

### 11.1 Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `sm` | `< 640px` | Mobile (not primary, but usable) |
| `md` | `640–1024px` | Tablet / small laptop |
| `lg` | `1024–1440px` | Standard desktop *(primary target)* |
| `xl` | `> 1440px` | Wide desktop |

### 11.2 Layout Behavior

| Component | lg (Default) | md (Tablet) | sm (Mobile) |
|-----------|-------------|-------------|-------------|
| Sidebar | 240px, fixed | 240px, slide-out drawer | Hidden, hamburger toggle |
| KPI Cards Grid | 5 columns | 3 columns (wrap) | 1 column |
| Data Table | Full columns | Horizontal scroll | Horizontal scroll + column hiding |
| Form layout | 2-column grid | 1-column | 1-column |
| Modal width | 560px | 90vw | 100vw (bottom sheet) |

### 11.3 Mobile Adaptations

- Sidebar becomes a bottom sheet/drawer opened via hamburger icon in top nav bar.
- Tables show only the most critical 3 columns; "..." button expands row to full details.
- Action buttons move to a floating action button (FAB) bottom-right.
- Confirmation modals become bottom sheets on mobile.

> **Note:** Mobile is a secondary target; primary use is desktop. No mobile-native app in MVP.

---

## 12. Accessibility

### 12.1 Semantic HTML

| Element | Usage |
|---------|-------|
| `<main>` | Primary content area |
| `<nav>` | Sidebar navigation |
| `<header>` | Page header per section |
| `<h1>` | One per page (page title) |
| `<h2>` | Section headings |
| `<table>` with `<th scope>` | All data tables |
| `<button>` | All interactive actions (not `<div>`) |
| `<label for="">` | All form inputs |
| `<dialog>` | Modals |

### 12.2 Keyboard Interaction

- All interactive elements reachable via `Tab`.
- Focus trap inside modals and dialogs while open.
- Skip-to-main-content link visible on first `Tab` press.
- Custom dropdowns implement `ArrowUp/Down` for option navigation.

### 12.3 Color & Contrast

- All text on background meets **WCAG AA** contrast ratio (minimum 4.5:1 for body, 3:1 for large text).
- Status indicators never rely on color alone — always paired with icon or text label.
- Focus indicators are visible (2px `--color-border-focus` outline, not removed with `outline: none`).

### 12.4 ARIA

- `aria-label` on all icon-only buttons.
- `aria-live="polite"` on toast container.
- `aria-busy="true"` on loading regions.
- `aria-invalid="true"` + `aria-describedby` on invalid form fields.
- `aria-expanded` on sidebar toggle, dropdowns.
- `role="alert"` on inline error messages.

### 12.5 Screen Reader

- KPI card values announced as: "Total Products: 1,247 — up 12 added this week."
- Status badges: `<span aria-label="Status: Done">` pattern.
- Live updates announced with `aria-live="polite"` (not "assertive" to avoid interrupting reading).

---

## 13. Role-Based UI Differences

### 13.1 Element Visibility Matrix

| UI Element | Manager | Staff |
|-----------|---------|-------|
| KPI Dashboard — all 5 KPIs | ✅ | ✅ (limited: no user-specific KPIs) |
| `[+ Add Product]` button | ✅ | ❌ Hidden |
| Product Edit button | ✅ | ❌ Hidden |
| `[+ Create Receipt/Delivery]` | ✅ | ✅ |
| `[Validate]` on receipts/deliveries | ✅ | ✅ |
| `[+ New Adjustment]` | ✅ | ✅ |
| Adjustment list — all users | ✅ | ❌ (own only) |
| `[Approve]` / `[Reject]` adjustment | ✅ | ❌ Hidden |
| Settings nav item | ✅ | ❌ Hidden |
| Ledger — filter by user | ✅ | ❌ (own only) |
| User tab in Settings | ✅ | ❌ |
| Odoo Integration Settings | ✅ | ❌ |

### 13.2 Role Chips

Used on:
- User profile section in sidebar
- User column in Ledger table
- Adjustment submitted-by field

```
[Manager]  ← purple background
[Staff]    ← blue background
```

### 13.3 Route Guard Behavior

- If Staff navigates directly to `/products/new` or `/settings`:
  → Redirected to `/dashboard`
  → Toast: "You don't have permission to access that page."
- No 403 page shown; silent redirect prevents reconnaissance.

---

## Appendix A — Screen Flow Diagram

```
[Login] ──────────────────────────────────────────────────────────────┐
  │                                                                   │
  ▼                                                                   │
[Dashboard] ←──── (Realtime Updates via WebSocket) ──────────────────┘
  │
  ├──[Products List]
  │      ├── [Product Detail]
  │      └── [Create/Edit Product] (Manager)
  │
  ├──[Receipts List]
  │      ├── [Receipt Detail + Status Actions]
  │      └── [Create Receipt]
  │
  ├──[Deliveries List]
  │      ├── [Delivery Detail + Status Actions]
  │      └── [Create Delivery]
  │
  ├──[Adjustments List]
  │      ├── [Adjustment Detail + Approve/Reject] (Manager)
  │      └── [New Adjustment]
  │
  ├──[Ledger / Move History]
  │
  └──[Settings] (Manager only)
         ├── Warehouses Tab
         ├── Users Tab
         └── Odoo Integration Tab
```

---

## Appendix B — Key Page Summary

| Page | Primary Action | Secondary Actions | Table Columns (key) |
|------|---------------|-------------------|---------------------|
| Dashboard | — | Filter by warehouse | Date, Type, Ref, Status |
| Products | Add Product | Search, Filter | SKU, Name, Stock, Status |
| Receipts | Create Receipt | Validate (Ready) | ID, Supplier, Status |
| Deliveries | Create Delivery | Validate (Ready) | ID, Customer, Status |
| Adjustments | New Adjustment | Approve/Reject | ID, Product, Delta, Status |
| Ledger | — | Filter, Export (Post-MVP) | Timestamp, Type, Delta, By |
| Settings | Add Warehouse | Odoo Sync | Name, Location |

---

*StockSense UI/UX Document v1.0 — Derived from PRD v1.0 + SAD v1.0 — Odoo Hackathon 2026*
