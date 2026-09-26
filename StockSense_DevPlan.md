# 🗺️ StockSense — Complete Development Plan

> **Version:** 1.0  
> **Date:** September 26, 2026  
> **Based on:** PRD v1.0 · SAD v1.0 · UI/UX v1.0  
> **Team:** 3 Engineers (P1: Backend Lead · P2: Frontend Lead · P3: Fullstack/DB)  
> **Deadline:** 5:00 PM, September 26, 2026

---

## Table of Contents

1. [Reading This Plan](#1-reading-this-plan)
2. [MVP Scope](#2-mvp-scope)
3. [Dependency Map](#3-dependency-map)
4. [Phase 0 — Environment Setup](#phase-0--environment-setup)
5. [Phase 1 — Database & Auth](#phase-1--database--auth)
6. [Phase 2 — Backend API](#phase-2--backend-api-core)
7. [Phase 3 — Frontend Foundation](#phase-3--frontend-foundation)
8. [Phase 4 — Feature Implementation](#phase-4--feature-implementation)
9. [Phase 5 — Integrations](#phase-5--integrations)
10. [Phase 6 — Testing & Bug Fixing](#phase-6--testing--bug-fixing)
11. [Phase 7 — Deployment](#phase-7--deployment)
12. [Phase 8 — Demo Prep](#phase-8--demo-prep)
13. [Execution Timeline](#13-execution-timeline)
14. [Definition of Done](#14-definition-of-done)
15. [Risks & Mitigations](#15-risks--mitigations)

---

## 1. Reading This Plan

### Priority Tiers

| Badge | Meaning |
|-------|---------|
| 🔴 **P0 — Blocker** | MVP cannot function without this. Build first. |
| 🟠 **P1 — Critical** | Core feature. Demo breaks without it. |
| 🟡 **P2 — Important** | Strong feature. Degrades demo quality if missing. |
| 🟢 **P3 — Polish** | Nice-to-have. Only touch if time permits. |

### Dependency Notation

> `[TASK-X] requires [TASK-Y]` means TASK-X cannot start until TASK-Y is complete.

---

## 2. MVP Scope

### In Scope (Build This)

| # | Feature | Priority | Owner |
|---|---------|----------|-------|
| F1 | Auth: Signup / Login / OTP Reset | 🔴 P0 | P1 |
| F2 | Role-Based Access Control (Manager / Staff) | 🔴 P0 | P1 |
| F3 | Database Schema (PostgreSQL + MongoDB) | 🔴 P0 | P3 |
| F4 | Product Management (CRUD + SKU search) | 🟠 P1 | P3 |
| F5 | Warehouse Management | 🟠 P1 | P3 |
| F6 | Receipt Workflow (Create → Status → Validate) | 🟠 P1 | P1 |
| F7 | Delivery Workflow (Create → Status → Validate) | 🟠 P1 | P1 |
| F8 | Dashboard with Live KPIs | 🟠 P1 | P2+P3 |
| F9 | Supabase Realtime (WebSocket push) | 🟠 P1 | P2 |
| F10 | Stock Adjustments + Approval Flow | 🟡 P2 | P1+P3 |
| F11 | Low Stock / Out-of-Stock Alerts | 🟡 P2 | P2+P3 |
| F12 | Move History / Stock Ledger | 🟡 P2 | P2+P3 |
| F13 | Odoo Integration Stub (Settings — Sync) | 🟡 P2 | P3 |
| F14 | UI Polish + Skeleton States + Empty States | 🟢 P3 | P2 |
| F15 | Demo Data Seeding | 🟢 P3 | All |

### Out of Scope (Do Not Build)

Internal Transfers · Barcode/QR scanning · Supplier portal · PO generation · Analytics/forecasting · Mobile app · Email/SMS notifications · Shipping integrations · Custom reports · Bulk CSV import · Multi-currency

---

## 3. Dependency Map

```
[Phase 0: Setup] ─────────────────────────────────────────┐
        │                                                  │
        ▼                                                  ▼
[Phase 1: DB Schema + Auth]                   [Phase 3: FE Foundation]
        │                                                  │
        ▼                                                  │
[Phase 2: Backend API Core]         [Phase 4: Feature UI (wired to APIs)]
        │   ──────────────────────────────►                │
        ▼                                                  ▼
[Phase 5: Odoo Stub]                    [Phase 6: Testing + Bug Fixes]
                                                           │
                                                           ▼
                                                  [Phase 7: Deployment]
                                                           │
                                                           ▼
                                                  [Phase 8: Demo Prep]
```

### Critical Path

```
DB Schema → Auth Setup → Products API → Receipts/Deliveries API
         ↓
    Stock Service (atomic tx) → Ledger Service
                                      ↓
                               Dashboard KPIs API
                                      ↓
                            Realtime subscription (FE)
```

---

## Phase 0 — Environment Setup

**Owner:** All · **Duration:** ~30 min · **Priority:** 🔴 P0

### Tasks

#### P0-1 — Repository & Project Init

- [ ] Create GitHub repo `stocksense-odoo`
- [ ] Initialize `client/` with `npm create vite@latest . -- --template react`
- [ ] Initialize `server/` with `npm init -y`
- [ ] Add `.gitignore` (node_modules, .env, dist)

#### P0-2 — Backend Dependencies

```bash
cd server
npm install express cors dotenv helmet morgan
npm install @supabase/supabase-js mongoose zod jsonwebtoken xmlrpc
npm install -D nodemon
```

#### P0-3 — Frontend Dependencies

```bash
cd client
npm install @supabase/supabase-js axios zustand react-router-dom
npm install react-hot-toast lucide-react clsx
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-dropdown-menu
npm install -D tailwindcss eslint prettier
```

#### P0-4 — Environment Files

`server/.env`:
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MONGODB_URI=
ODOO_HOST=
ODOO_PORT=8069
ODOO_DB=
ODOO_USER=
ODOO_PASSWORD=
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
```

`client/.env.local`:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

#### P0-5 — External Services Setup

- [ ] **Supabase:** Create project → copy URL + anon key + service role key
- [ ] **MongoDB Atlas:** Create free M0 cluster → create `stocksense` DB → copy connection string
- [ ] Verify both connections with a quick test script

### Definition of Done — Phase 0

- [ ] `npm run dev` starts Vite dev server on port 5173 with no errors
- [ ] `nodemon app.js` starts Node API on port 3001 with no errors
- [ ] Both `.env` files populated with real credentials
- [ ] Supabase and MongoDB clients connect without error

---

## Phase 1 — Database & Auth

**Owner:** P1 (Auth) · P3 (Schema) · **Duration:** ~90 min · **Priority:** 🔴 P0

> **Dependency:** Phase 0 complete.

### DB-1 — PostgreSQL Schema (run in Supabase SQL Editor)

```sql
-- 1. User Profiles
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('manager', 'staff')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Warehouses
CREATE TABLE warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT,
  created_by  UUID REFERENCES user_profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  sku               TEXT NOT NULL UNIQUE,
  category          TEXT NOT NULL,
  unit_of_measure   TEXT NOT NULL,
  reorder_threshold INT DEFAULT 0,
  created_by        UUID REFERENCES user_profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Stock Levels (per product per warehouse)
CREATE TABLE stock_levels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id  UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity      INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);

-- 5. Receipts
CREATE TABLE receipts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  warehouse_id  UUID REFERENCES warehouses(id),
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','waiting','ready','done','cancelled')),
  created_by    UUID REFERENCES user_profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  validated_at  TIMESTAMPTZ,
  validated_by  UUID REFERENCES user_profiles(id)
);

-- 6. Receipt Line Items
CREATE TABLE receipt_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id  UUID REFERENCES receipts(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  quantity    INT NOT NULL CHECK (quantity > 0)
);

-- 7. Deliveries
CREATE TABLE deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_ref    TEXT,
  warehouse_id    UUID REFERENCES warehouses(id),
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','waiting','ready','done','cancelled')),
  created_by      UUID REFERENCES user_profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  validated_at    TIMESTAMPTZ,
  validated_by    UUID REFERENCES user_profiles(id)
);

-- 8. Delivery Line Items
CREATE TABLE delivery_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id  UUID REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  quantity     INT NOT NULL CHECK (quantity > 0)
);

-- 9. Stock Adjustments
CREATE TABLE adjustments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id),
  warehouse_id    UUID REFERENCES warehouses(id),
  recorded_qty    INT NOT NULL,
  physical_qty    INT NOT NULL,
  delta           INT GENERATED ALWAYS AS (physical_qty - recorded_qty) STORED,
  reason          TEXT,
  status          TEXT NOT NULL DEFAULT 'pending_approval'
                    CHECK (status IN ('pending_approval','approved','rejected')),
  submitted_by    UUID REFERENCES user_profiles(id),
  reviewed_by     UUID REFERENCES user_profiles(id),
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);
```

### DB-2 — Indexes

```sql
CREATE INDEX idx_stock_levels_product   ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX idx_receipts_status        ON receipts(status);
CREATE INDEX idx_deliveries_status      ON deliveries(status);
CREATE INDEX idx_adjustments_status     ON adjustments(status);
CREATE INDEX idx_products_sku           ON products(sku);
```

### DB-3 — Row-Level Security

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustments ENABLE ROW LEVEL SECURITY;

-- Staff sees own adjustments only; managers see all
CREATE POLICY "adjustment_access" ON adjustments FOR SELECT USING (
  auth.uid() = submitted_by
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'manager')
);

-- Only managers write products
CREATE POLICY "manager_product_write" ON products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'manager'));
CREATE POLICY "manager_product_update" ON products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'manager'));
```

### DB-4 — Supabase Realtime

In Supabase Dashboard → Database → Replication, enable Realtime on:
`stock_levels`, `receipts`, `deliveries`, `adjustments`

### DB-5 — MongoDB Collection + Indexes

```js
db.createCollection("stock_ledger");
db.stock_ledger.createIndex({ product_id: 1, timestamp: -1 });
db.stock_ledger.createIndex({ warehouse_id: 1, timestamp: -1 });
db.stock_ledger.createIndex({ type: 1 });
db.stock_ledger.createIndex({ timestamp: -1 });
```

Ledger document shape:
```json
{
  "transaction_id": "uuid-v4",
  "type": "receipt | delivery | adjustment",
  "product_id": "uuid", "product_sku": "string", "product_name": "string",
  "warehouse_id": "uuid", "warehouse_name": "string",
  "quantity_delta": 50, "quantity_before": 100, "quantity_after": 150,
  "reference_id": "uuid",
  "performed_by": { "user_id": "uuid", "full_name": "string", "role": "manager|staff" },
  "timestamp": "ISODate",
  "notes": "optional string"
}
```

### AUTH-1 — Supabase Auth Config

- [ ] Enable Email provider in Auth settings
- [ ] Enable OTP / Magic Link for password reset
- [ ] Set OTP expiry to **10 minutes**

### AUTH-2 — Auto-Create user_profiles on Signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

### AUTH-3 — JWT Custom Claims (Role Injection)

In Supabase Dashboard → Auth → Hooks → Custom access token hook:

```sql
CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
BEGIN
  claims := event->'claims';
  SELECT role INTO user_role FROM public.user_profiles WHERE id = (event->>'user_id')::UUID;
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql STABLE;
```

### AUTH-4 — Stock Update RPC Functions

```sql
CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_warehouse_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO stock_levels (product_id, warehouse_id, quantity)
  VALUES (p_product_id, p_warehouse_id, p_qty)
  ON CONFLICT (product_id, warehouse_id)
  DO UPDATE SET quantity = stock_levels.quantity + p_qty, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_warehouse_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE stock_levels
  SET quantity = quantity - p_qty, updated_at = NOW()
  WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;
END;
$$ LANGUAGE plpgsql;
```

### Definition of Done — Phase 1

- [ ] All 9 PostgreSQL tables created with FKs and constraints
- [ ] All indexes created; RLS enabled
- [ ] Realtime enabled on `stock_levels`, `receipts`, `deliveries`, `adjustments`
- [ ] MongoDB `stock_ledger` collection exists with indexes
- [ ] User signup creates `user_profiles` row automatically (test it!)
- [ ] JWT contains `user_role` claim after login
- [ ] OTP password reset flow works in Supabase

---

## Phase 2 — Backend API (Core)

**Owner:** P1 + P3 · **Duration:** ~120 min · **Priority:** 🔴 P0 → 🟠 P1

> **Dependency:** Phase 1 complete.

### Server Structure

```
server/
├── config/
│   ├── supabase.js     # Admin client
│   ├── mongodb.js      # Mongoose connection
│   └── odoo.js         # XML-RPC config
├── middleware/
│   ├── auth.js         # JWT verification
│   ├── rbac.js         # requireRole() factory
│   └── errorHandler.js
├── routes/
│   ├── products.js    ├── receipts.js    ├── deliveries.js
│   ├── adjustments.js ├── ledger.js      ├── warehouses.js
│   └── dashboard.js
├── controllers/        # Thin handlers calling services
├── services/
│   ├── stockService.js  # Atomic stock updates
│   ├── ledgerService.js # MongoDB writes
│   ├── alertService.js  # Threshold checks
│   └── odooService.js   # XML-RPC (stubbed)
├── validators/          # Zod schemas per resource
└── app.js
```

### API-1 — Auth Middleware · 🔴 P0

```js
// middleware/auth.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  req.user = { id: user.id, role: user.user_metadata?.role || 'staff' };
  next();
};
```

### API-2 — RBAC Middleware · 🔴 P0

```js
// middleware/rbac.js
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Forbidden' });
  next();
};
module.exports = { requireRole };
```

### API-3 — Warehouses · 🟠 P1

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/warehouses` | Any | List all |
| POST | `/warehouses` | Manager | Create |
| PUT | `/warehouses/:id` | Manager | Update |

### API-4 — Products · 🟠 P1

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/products` | Any | Include stock_levels per warehouse |
| GET | `/products/search?q=` | Any | Filter by SKU or name |
| GET | `/products/:id` | Any | Product + stock per warehouse |
| POST | `/products` | Manager | Validate unique SKU |
| PUT | `/products/:id` | Manager | Re-check SKU uniqueness |

### API-5 — Stock Service (Core) · 🔴 P0

```js
// services/stockService.js
async function incrementStock(productId, warehouseId, qty, supabase) {
  const { error } = await supabase.rpc('increment_stock', {
    p_product_id: productId, p_warehouse_id: warehouseId, p_qty: qty
  });
  if (error) throw error;
}

async function decrementStock(productId, warehouseId, qty, supabase) {
  const { data } = await supabase.from('stock_levels').select('quantity')
    .eq('product_id', productId).eq('warehouse_id', warehouseId).single();
  if (!data || data.quantity < qty) throw new Error(`Insufficient stock`);
  const { error } = await supabase.rpc('decrement_stock', {
    p_product_id: productId, p_warehouse_id: warehouseId, p_qty: qty
  });
  if (error) throw error;
}
```

### API-6 — Receipts API · 🟠 P1

| Method | Path | Auth | Business Rule |
|--------|------|------|---------------|
| GET | `/receipts` | Any | Filterable by status, warehouse, date |
| GET | `/receipts/:id` | Any | Include receipt_items |
| POST | `/receipts` | Any | status=draft; require ≥1 item |
| PUT | `/receipts/:id/status` | Any | Advance: draft→waiting→ready |
| POST | `/receipts/:id/validate` | Any | **Only if status=ready** → atomic stock +N → ledger → status=done |

### API-7 — Deliveries API · 🟠 P1

| Method | Path | Auth | Business Rule |
|--------|------|------|---------------|
| GET | `/deliveries` | Any | Filterable |
| GET | `/deliveries/:id` | Any | Include delivery_items |
| POST | `/deliveries` | Any | status=draft |
| PUT | `/deliveries/:id/status` | Any | Advance status |
| POST | `/deliveries/:id/validate` | Any | **Only if status=ready** → check all stock → atomic -N → ledger → done |

### API-8 — Adjustments API · 🟡 P2

| Method | Path | Auth | Business Rule |
|--------|------|------|---------------|
| GET | `/adjustments` | Manager: all / Staff: own | Filterable by status |
| POST | `/adjustments` | Any | status=pending_approval; stock NOT changed |
| POST | `/adjustments/:id/approve` | Manager | Atomic stock = physical_qty → ledger → approved |
| POST | `/adjustments/:id/reject` | Manager | status=rejected; stock unchanged |

### API-9 — Dashboard KPIs · 🟠 P1

```
GET /dashboard/kpis → {
  total_products, low_stock_items, out_of_stock_items,
  pending_receipts, pending_deliveries
}
GET /dashboard/alerts → { low_stock: [...], out_of_stock: [...] }
```

### API-10 — Ledger · 🟡 P2

```
GET /ledger?type=&warehouse_id=&product_id=&from=&to=&page=&limit=
→ Paginated MongoDB query (50/page default)
```

### API-11 — Standard Response Envelope

```json
{ "success": true, "data": {}, "meta": { "page": 1, "total": 120, "limit": 20 }, "error": null }
```

### Definition of Done — Phase 2

- [ ] All endpoints return correct responses when tested with Postman/curl
- [ ] Auth middleware rejects requests without valid JWT (401)
- [ ] RBAC middleware rejects wrong-role requests (403)
- [ ] Receipt validate: stock increments correctly in DB
- [ ] Delivery validate: over-delivery returns 422; stock unchanged
- [ ] Adjustment approve: stock corrected; ledger entry in MongoDB
- [ ] Dashboard KPI counts are accurate
- [ ] Global error handler returns JSON on any unhandled exception

---

## Phase 3 — Frontend Foundation

**Owner:** P2 · **Duration:** ~60 min · **Priority:** 🔴 P0

> **Dependency:** Phase 0 complete. **Runs in parallel** with Phases 1 & 2.

### Frontend Structure

```
client/src/
├── api/
│   ├── axios.js          # Axios + auth header interceptor
│   └── supabase.js       # Supabase anon client
├── components/
│   ├── ui/               # Button, Input, Select, Badge, Modal, Toast, Skeleton
│   ├── layout/           # Sidebar, PageWrapper, PageHeader
│   └── alerts/           # LowStockBanner, OutOfStockBanner
├── features/
│   ├── auth/ ├── dashboard/ ├── products/ ├── receipts/
│   ├── deliveries/ ├── adjustments/ ├── ledger/ └── settings/
├── hooks/
│   ├── useAuth.js        # Session, user, role
│   ├── useRealtime.js    # Supabase Realtime subscriptions
│   └── useStock.js
├── store/
│   └── useAppStore.js    # Zustand: user, kpis, alerts
├── router/
│   ├── index.jsx
│   └── ProtectedRoute.jsx
├── utils/
│   ├── formatters.js     # Date, qty formatters
│   └── validators.js
└── main.jsx
```

### FE-0 — Design Tokens · 🔴 P0

`src/index.css` — all CSS variables from UI/UX §2:

```css
:root {
  --color-brand-primary: #4F6EF7;
  --color-brand-secondary: #7C3AED;
  --color-brand-gradient: linear-gradient(135deg, #4F6EF7, #7C3AED);
  --color-success: #10B981; --color-warning: #F59E0B;
  --color-danger: #EF4444; --color-info: #3B82F6;
  --color-bg-base: #0F1117; --color-bg-surface: #1A1D27;
  --color-bg-elevated: #252836; --color-bg-input: #1E2130;
  --color-border: #2E3348; --color-border-focus: #4F6EF7;
  --color-text-primary: #F1F5F9; --color-text-secondary: #94A3B8;
  --text-xs: 11px; --text-sm: 13px; --text-base: 15px; --text-md: 16px;
  --text-lg: 18px; --text-xl: 22px; --text-2xl: 28px; --text-3xl: 36px;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:20px; --space-6:24px; --space-8:32px;
  --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-full:9999px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow-primary: 0 0 20px rgba(79,110,247,0.25);
}
body { background: var(--color-bg-base); color: var(--color-text-primary);
       font-family: 'Inter', sans-serif; margin: 0; }
```

Add Inter in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### FE-1 — Axios Client · 🔴 P0

```js
// api/axios.js
import axios from 'axios';
import { supabase } from './supabase';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) config.headers.Authorization = `Bearer ${session.access_token}`;
  return config;
});
export default api;
```

### FE-2 — Auth Hook + Protected Route · 🔴 P0

```js
// hooks/useAuth.js
export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  return { user, role, loading };
}
```

```jsx
// router/ProtectedRoute.jsx
export function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    toast.error("You don't have permission to access that page.");
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
```

### FE-3 — Router Setup · 🔴 P0

All routes as per UI/UX §4.1:
- Public: `/login`, `/signup`, `/reset-password`, `/otp-verify`
- Protected (all): `/dashboard`, `/products`, `/receipts`, `/deliveries`, `/adjustments`, `/ledger`
- Protected (Manager only): `/products/new`, `/products/:id/edit`, `/settings`

### FE-4 — Base UI Components · 🟠 P1

Build these first (used everywhere):

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `Button` | variant, size, loading, disabled | Primary/Secondary/Danger/Ghost |
| `Input` | type, label, error, placeholder | + Search variant with clear |
| `Select` | options, value, onChange, searchable | |
| `Badge` | status | Auto-colors from status map |
| `Modal` | isOpen, onClose, title, footer | Escape key + backdrop close |
| `Skeleton` | lines, width | Shimmer animation |
| `PageHeader` | title, subtitle, action | Right-slot CTA |
| `Stepper` | steps, currentStep | Receipt/delivery detail |
| `KPICard` | title, value, icon, alertType | Count-up animation |

### FE-5 — Sidebar Navigation · 🟠 P1

Per UI/UX §3.8:
- 240px collapsed to 64px icon-only
- Items: Dashboard, Products, Receipts, Deliveries, Adjustments, Ledger, (Settings — manager only)
- Badge counts on Adjustments (pending count), Receipts/Deliveries (ready count)
- User profile at bottom: initials avatar, name, role chip, logout

### FE-6 — Realtime Hook · 🟠 P1

```js
// hooks/useRealtime.js
export function useRealtime() {
  const { refreshKPIs } = useAppStore();
  useEffect(() => {
    const channel = supabase.channel('stock-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_levels' }, () => refreshKPIs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, () => refreshKPIs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => refreshKPIs())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);
}
```

### Definition of Done — Phase 3

- [ ] App renders on localhost:5173 with no console errors
- [ ] CSS variables applied; dark mode theme visible
- [ ] Sidebar renders correct nav items per role
- [ ] Unauthenticated users redirect to /login
- [ ] Staff redirect from manager-only routes to /dashboard + toast
- [ ] Axios attaches JWT to every request (verify in Network tab)
- [ ] Realtime hook subscribes without error

---

## Phase 4 — Feature Implementation

**Owner:** P1+P2+P3 · **Duration:** ~180 min · **Priority:** 🟠 P1 → 🟡 P2

> **Dependency:** Phase 2 APIs + Phase 3 FE foundation.

### Build Order (respect dependencies)

```
Auth Pages → Warehouses (Settings) → Products → Dashboard KPIs
          → Receipts → Deliveries → Adjustments → Ledger → Alerts
```

### F-AUTH — Authentication Screens · 🔴 P0

**Login Page** (`/login`) — split layout: left brand panel + right form:
- Fields: Email, Password
- `[Log In]` → `supabase.auth.signInWithPassword()` → redirect to `/dashboard`
- Inline error for invalid credentials; link to signup and forgot password

**Signup Page** (`/signup`):
- Fields: Full Name, Email, Password, Confirm Password, Role (select)
- `[Create Account]` → `supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })`
- Success → redirect to `/otp-verify`

**OTP Verify Page** (`/otp-verify`):
- 6 individual digit boxes, auto-focus advance
- 10-minute countdown + Resend link after countdown
- `supabase.auth.verifyOtp()` → redirect to `/dashboard`

**Reset Password** (`/reset-password`):
- Step 1: Email → `supabase.auth.resetPasswordForEmail()`
- Step 2: OTP boxes + new password + confirm → `supabase.auth.updateUser()`

### F-WAREHOUSE — Warehouse Management · 🟠 P1

**Settings → Warehouses Tab:**
- Table: Name, Location, Created By, Date
- `[+ Add Warehouse]` → modal (Name required, Location optional)
- Edit button → pre-filled modal
- `POST /api/v1/warehouses` → toast → list refresh

### F-PRODUCT — Product Management · 🟠 P1

**Products List** (`/products`):
- Filter: Search (name/SKU), Category, Stock status, Warehouse
- Table: SKU (monospace), Name, Category, UOM, Stock, Threshold, Status Badge, Actions
- Status auto-calculated: In Stock / Low Stock (qty < threshold) / Out of Stock (qty = 0)

**Create Product** (`/products/new` — Manager only):
- Fields: Name, SKU (real-time uniqueness check 500ms debounce), Category, UOM, Initial Stock, Threshold, Warehouse
- SKU check: GET `/products/search?sku=X` → show ✓ Available / ✕ Already in use
- `POST /api/v1/products` → toast → redirect to `/products/:id`

**Product Detail** (`/products/:id`):
- Stock by warehouse table; recent movements (last 5 from ledger)
- `[Edit Product]` for Manager only

### F-RECEIPT — Receipt Workflow · 🟠 P1

**Receipt List** (`/receipts`):
- Filters: Search, Status, Warehouse, Date range
- Table: ID (RCT-NNNN), Supplier, Warehouse, #Products, Date, Status, Actions

**Create Receipt** (`/receipts/new`):
- Header: Supplier Name, Destination Warehouse, Date, Notes
- Line items table: `[+ Add Product]` → search-select by SKU; Qty per row
- `[Save as Draft]` → `POST /api/v1/receipts`; auto-save localStorage every 30s

**Receipt Detail** (`/receipts/:id`):
- Stepper + detail card + line items
- Context-aware buttons per status (UI/UX §6.4):
  - Draft → `[Mark as Waiting]` `[Cancel]`
  - Waiting → `[Mark as Ready]` `[Back to Draft]` `[Cancel]`
  - Ready → `[Validate Receipt]` (opens confirmation modal)
  - Done/Cancelled → read-only
- Validate confirmation modal: *"This will add 50× Widget A to WH-Main"* → `[Confirm & Validate]`

### F-DELIVERY — Delivery Workflow · 🟠 P1

Mirrors Receipt pattern with:
- "Customer / Reference" instead of Supplier; "Source Warehouse" (stock leaves)
- Validate checks stock availability first
- Insufficient stock error inside confirmation modal; Validate button stays disabled

### F-DASHBOARD — Dashboard KPIs · 🟠 P1

- 5 KPI cards: Total Products, Low Stock, Out of Stock, Pending Receipts, Pending Deliveries
- Cards 2 & 3: warning/danger accent if value > 0
- Clickable KPI cards → navigate to filtered list
- Low Stock Alert Banner: `⚠ N products below threshold [View →]`; dismissible per session
- Summary table: filter chips (All/Receipts/Deliveries/Adjustments); manager sees all, staff sees own
- `useRealtime()` active on this page → KPIs animate count-up on stock change

### F-ADJ — Stock Adjustments · 🟡 P2

**Adjustment List** (`/adjustments`):
- Manager: all; Staff: own only
- Pending count → badge on sidebar nav item

**New Adjustment** (`/adjustments/new`):
- Select product + warehouse → auto-populate Recorded Qty (read-only from DB)
- Enter Physical Qty → auto-calculate Delta (color: green/red)
- Reason/Notes (required)
- `[Submit for Approval]` → `POST /api/v1/adjustments`

**Adjustment Detail** (`/adjustments/:id`):
- All fields read-only
- Manager buttons (Pending only): `[Approve]` / `[Reject]`
- Approve confirmation: *"Stock for Widget A will change from 80 → 72 (−8)"*

### F-LEDGER — Move History · 🟡 P2

**Ledger Page** (`/ledger`):
- Filters: Search, Type, Warehouse, Date range, User (Manager only)
- Table: Timestamp, Type badge, Reference (clickable), Product, Delta (colored), Before→After, Warehouse, Performed By
- 50 rows/page; Export button shown but disabled ("Coming soon" tooltip)

### F-ALERT — Low Stock Alerts · 🟡 P2

- Alert banner on Dashboard (see above)
- Products list filtered by `?filter=low_stock` and `?filter=out_of_stock`

### F-SETTINGS — Odoo Integration UI · 🟡 P2

**Settings → Odoo Integration Tab:**
- Status: ● Not Connected / ● Connected
- Fields: Host, Port, Database, Username, Password
- `[Test Connection]` → inline result
- `[Save & Sync Products]` → pulls catalog from Odoo

### Definition of Done — Phase 4

For each feature:
- [ ] Creates/lists data correctly from real API (not mocked)
- [ ] Form validation shows correct inline errors
- [ ] Status badges display with correct colors per spec
- [ ] Role-based buttons hidden (not just disabled) for Staff
- [ ] Confirmation modals appear before irreversible actions
- [ ] Toast messages appear within 500ms of operation
- [ ] Empty states render on pages with no data
- [ ] Loading skeletons show while data fetches
- [ ] Realtime KPI update visible within 2s after stock operation

---

## Phase 5 — Integrations

**Owner:** P3 · **Duration:** ~45 min · **Priority:** 🟡 P2

> **Dependency:** Phase 2 backend structure. Runs in parallel with Phase 4.

### INT-1 — Odoo XML-RPC Service (Stub-First)

```js
// services/odooService.js
async function testConnection() {
  // Try Odoo XML-RPC authenticate
  // Return { success, uid } or { success: false, error }
}

async function syncProducts(supabase) {
  // 1. Authenticate with Odoo
  // 2. Call stock.quant search_read
  // 3. Map Odoo fields → StockSense schema
  // 4. Upsert into Supabase products by SKU
  // 5. Return { synced_count, errors }
}
```

**Routes (Manager only):**
- `POST /api/v1/odoo/test`
- `POST /api/v1/odoo/sync`

> If Odoo is unavailable, routes return `{ success: false, error: 'Odoo not configured' }` — rest of app is unaffected.

### INT-2 — Supabase Realtime Verification

- Manually edit a `stock_levels` row in Supabase dashboard
- Verify React hook fires and KPI card animates within 2s

### Definition of Done — Phase 5

- [ ] `POST /odoo/test` returns success or clear error message
- [ ] Odoo connection failure does NOT crash the API server
- [ ] Settings → Odoo tab shows connection status correctly

---

## Phase 6 — Testing & Bug Fixing

**Owner:** All · **Duration:** ~60 min · **Priority:** 🟠 P1

> **Dependency:** All Phase 4 features implemented.

### Test Scenarios

#### T-AUTH — Authentication

| # | Test | Expected |
|---|------|----------|
| T-01 | Signup with new email + valid role | OTP sent; redirected to /otp-verify |
| T-02 | Verify OTP | Redirected to /dashboard; user_profiles row exists |
| T-03 | Login with correct credentials | JWT returned; dashboard loads with correct role |
| T-04 | Login with wrong password | Inline error: "Invalid email or password." |
| T-05 | Password reset OTP flow | New password accepted; user logged in |
| T-06 | Expired/invalid JWT to API | 401 returned; frontend redirects to /login |

#### T-RBAC — Role Enforcement

| # | Test | Expected |
|---|------|----------|
| T-07 | Staff navigates directly to `/products/new` | Redirected to /dashboard + toast |
| T-08 | Staff navigates directly to `/settings` | Redirected to /dashboard + toast |
| T-09 | Staff calls `POST /api/v1/products` with Staff JWT | 403 Forbidden |
| T-10 | Staff calls `POST /adjustments/:id/approve` | 403 Forbidden |
| T-11 | Manager can approve an adjustment | 200 OK; stock updated |

#### T-STOCK — Stock Operations

| # | Test | Expected |
|---|------|----------|
| T-12 | Create receipt → validate | Stock increments by exact received qty |
| T-13 | Create delivery (qty ≤ stock) → validate | Stock decrements correctly |
| T-14 | Create delivery (qty > stock) → validate | 422 error; stock unchanged |
| T-15 | Validate receipt twice (already Done) | 400 error; stock not incremented again |
| T-16 | Submit adjustment → approve | Stock = physical_qty |
| T-17 | Submit adjustment → reject | Stock unchanged |

#### T-LEDGER — Audit Trail

| # | Test | Expected |
|---|------|----------|
| T-18 | Validate a receipt | Ledger entry: type=receipt, correct delta |
| T-19 | Validate a delivery | Ledger entry: type=delivery, negative delta |
| T-20 | Approve adjustment | Ledger entry: type=adjustment, reviewed_by set |
| T-21 | Ledger filter by date range | Only in-range entries returned |

#### T-DASHBOARD — Real-Time

| # | Test | Expected |
|---|------|----------|
| T-22 | Dashboard open; validate receipt in another tab | KPI updates within 2s, no refresh |
| T-23 | Stock drops below threshold | Low Stock alert banner appears |
| T-24 | Stock reaches 0 | Out of Stock on KPI card + danger banner |

#### T-UI — Interface

| # | Test | Expected |
|---|------|----------|
| T-25 | Empty products page (Manager) | `[+ Add Product]` CTA visible |
| T-26 | Empty products page (Staff) | "Contact your manager" message |
| T-27 | Over-delivery in validation modal | Validate button disabled; error shown |
| T-28 | Status badge colors | Draft=blue, Ready=green, Done=dark green |

### Bug Triage Priority

| Severity | Criteria | Action |
|----------|----------|--------|
| 🔴 Critical | Stock corruption, auth bypass, app crash | Fix immediately |
| 🟠 High | Feature doesn't work as per PRD | Fix before demo |
| 🟡 Medium | UX issue, wrong copy, visual glitch | Fix if time permits |
| 🟢 Low | Polish, edge case | Post-MVP backlog |

### Definition of Done — Phase 6

- [ ] All T-01 through T-28 tests pass
- [ ] Zero 🔴 Critical bugs open
- [ ] Zero 🟠 High bugs open
- [ ] Stock values in UI match values in Supabase DB (100% accuracy)
- [ ] Role enforcement verified via direct URL AND direct API call

---

## Phase 7 — Deployment

**Owner:** P1+P2 · **Duration:** ~30 min · **Priority:** 🟠 P1

> **Dependency:** Phase 6 — all critical/high bugs fixed.

### DEPLOY-1 — Frontend (Vercel)

```bash
# Connect GitHub repo to Vercel:
# Framework: Vite | Build: npm run build | Output: dist
# Add env variables in Vercel dashboard:
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_BASE_URL
```

### DEPLOY-2 — Backend (Railway)

```bash
# Connect GitHub repo → Railway detects Node.js
# Add all server env variables in Railway dashboard
# Add to package.json: "start": "node app.js"
```

### DEPLOY-3 — Supabase Auth Config for Production

- [ ] Auth → URL Configuration → Add Vercel URL to "Site URL" and "Redirect URLs"
- [ ] Update `ALLOWED_ORIGINS` in Railway env to Vercel URL
- [ ] Test auth OTP flow on production URLs

### DEPLOY-4 — Production Smoke Test

- [ ] Login works on Vercel URL
- [ ] API calls reach Railway (check Network tab)
- [ ] Create product → receipt → validate → stock updates
- [ ] Dashboard KPIs live-update (Realtime)
- [ ] No CORS errors in browser console
- [ ] HTTPS enforced on both services

### Definition of Done — Phase 7

- [ ] Frontend live at `https://stocksense.vercel.app`
- [ ] Backend live at `https://stocksense-api.railway.app`
- [ ] End-to-end demo flow works on production URLs

---

## Phase 8 — Demo Prep

**Owner:** All · **Duration:** ~60 min · **Priority:** 🟠 P1

### DEMO-1 — Seed Demo Data

```
Warehouses: WH-Main (Mumbai), WH-East (Delhi)

Products (10+ items):
  - Widget A (WGT-001) — threshold 20 — stock 150/WH-Main, 80/WH-East
  - Widget B (WGT-002) — threshold 30 — stock 28/WH-Main  ← LOW STOCK
  - Widget C (WGT-003) — threshold 10 — stock 0/WH-Main   ← OUT OF STOCK
  - [7+ more products with varied stock]

Users:
  - manager@demo.com / Demo@1234  → Jane Manager (Manager role)
  - staff@demo.com / Demo@1234   → Bob Staff (Staff role)

Receipts:    2 Done · 1 Ready (validate during demo) · 1 Draft
Deliveries:  2 Done · 1 Ready (validate during demo)
Adjustments: 1 Pending Approval (approve/reject during demo)
```

### DEMO-2 — Demo Flow Script (~5 minutes)

1. **(30s)** Login as Manager → Dashboard shows KPIs + Low Stock + Out of Stock alerts
2. **(30s)** Click Low Stock KPI → Products filtered → show Widget B is low
3. **(60s)** Receipts → open Ready receipt → Validate → watch Dashboard KPI update live
4. **(60s)** Deliveries → open Ready delivery → Validate → attempt over-delivery to show block
5. **(30s)** Adjustments → Approve pending adjustment → stock corrected
6. **(30s)** Ledger → show complete audit trail of all operations
7. **(30s)** Switch to Staff login → show Settings hidden → try `/settings` URL → redirected
8. **(30s)** Show Settings → Odoo Integration tab → Test Connection

### DEMO-3 — Pre-Demo Checklist (30 min before)

- [ ] Production URLs load without errors
- [ ] Manager + Staff demo accounts can log in
- [ ] Low Stock + Out of Stock alerts visible on dashboard
- [ ] At least 1 Receipt and 1 Delivery in "Ready" status
- [ ] At least 1 Adjustment in "Pending Approval"
- [ ] Ledger has entries from seed data
- [ ] Browser console is clean (no errors)
- [ ] Network tab shows API calls going to Railway (not localhost)
- [ ] Hit prod URLs 5 min before demo to warm up cold starts

---

## 13. Execution Timeline

| Time Block | Duration | Task | Owner | Phase |
|------------|----------|------|-------|-------|
| 9:36–9:55 AM | 20 min | Repo init, deps install, env files | All | P0 |
| 9:55–10:15 AM | 20 min | Supabase project + DB schema DDL | P3 | P1 |
| 9:55–10:15 AM | 20 min | Auth config + trigger + JWT hook | P1 | P1 |
| 9:55–10:30 AM | 35 min | FE setup, tokens, router, auth hook | P2 | P3 |
| 10:15–11:00 AM | 45 min | Express base, auth MW, RBAC, warehouses/products API | P1 | P2 |
| 10:15–11:00 AM | 45 min | Stock service, ledger service, MongoDB setup | P3 | P2 |
| 10:30–11:00 AM | 30 min | Base UI components (Button, Badge, Table, Modal, KPICard) | P2 | P3 |
| **11:00 AM** | — | **SYNC: verify APIs + FE compile, fix blockers** | All | — |
| 11:00–12:00 PM | 60 min | Receipts + Deliveries + Dashboard APIs | P1+P3 | P2 |
| 11:00–12:00 PM | 60 min | Auth pages (Login, Signup, OTP) + Sidebar | P2 | P4 |
| 12:00–1:00 PM | 60 min | Products list + Create Product UI | P2 | P4 |
| 12:00–1:00 PM | 60 min | Adjustments + Ledger APIs + Alert service | P1+P3 | P2 |
| **1:00–1:30 PM** | 30 min | **LUNCH BREAK** | All | — |
| 1:30–2:15 PM | 45 min | Dashboard UI (KPIs + realtime) | P2+P3 | P4 |
| 1:30–2:15 PM | 45 min | Receipts UI (list + create + detail + validate) | P1 | P4 |
| 2:15–3:00 PM | 45 min | Deliveries UI | P1 | P4 |
| 2:15–3:00 PM | 45 min | Adjustments UI + Ledger UI | P2+P3 | P4 |
| **3:00 PM** | — | **SYNC: wire remaining gaps, test core flows** | All | — |
| 3:00–3:30 PM | 30 min | Odoo stub + Settings UI | P3 | P5 |
| 3:00–3:30 PM | 30 min | Run T-AUTH, T-RBAC, T-STOCK tests | P1+P2 | P6 |
| 3:30–4:00 PM | 30 min | Run T-LEDGER, T-DASHBOARD, T-UI + bug fixes | All | P6 |
| 4:00–4:15 PM | 15 min | Deploy Frontend → Vercel | P2 | P7 |
| 4:00–4:15 PM | 15 min | Deploy Backend → Railway | P1 | P7 |
| 4:15–4:30 PM | 15 min | Production smoke test + env fixes | All | P7 |
| 4:30–4:45 PM | 15 min | Seed demo data on production | P3 | P8 |
| 4:45–5:00 PM | 15 min | Demo rehearsal + pre-demo checklist | All | P8 |

---

## 14. Definition of Done

### Feature-Level DoD

A feature is **done** when ALL of the following are true:

```
✅ API endpoint returns correct data (tested Postman/curl)
✅ UI fetches and displays that data correctly
✅ Form validation prevents invalid submissions
✅ Role enforcement works (wrong-role = 403 API / redirect UI)
✅ Toast notification appears on success AND error
✅ Loading skeleton shows while data fetches
✅ Empty state shows when no data exists
✅ No console errors (browser + server)
✅ Verified on production (Vercel + Railway), not just localhost
```

### MVP Complete DoD

```
✅ Auth: Signup + OTP verify + Login + Password reset — end-to-end
✅ RBAC: Manager and Staff see different UI elements
✅ RBAC: Staff cannot access manager routes via URL or API
✅ Products: CRUD works; duplicate SKU blocked
✅ Warehouses: ≥2 warehouses creatable
✅ Receipts: Draft → Done + stock increments correctly
✅ Deliveries: Draft → Done + stock decrements + over-delivery blocked
✅ Adjustments: Submit + Manager approve/reject + stock corrects on approve
✅ Dashboard: 5 live KPIs + realtime update < 2s
✅ Low stock alerts appear when qty < threshold
✅ Out of stock alerts appear when qty = 0
✅ Move History: All validate/adjust actions logged in MongoDB ledger
✅ Ledger: Filterable by type, date, product, warehouse
✅ Odoo Integration: Settings UI exists (stub acceptable for MVP)
✅ Demo data seeded for smooth demo
✅ Frontend + backend deployed to production URLs
✅ UI values match DB values (zero data discrepancies)
```

---

## 15. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Odoo instance unavailable | High | High | Stub-first: odooService returns mock/error; Settings UI fully built. Demo shows config UI. |
| Dual-DB sync issues | High | Medium | Clear boundary: PostgreSQL = transactional; MongoDB = append-only log. Ledger writes are async. |
| JWT role claim not propagating | High | Medium | Test AUTH flow immediately after Phase 1. Fallback: query user_profiles if JWT claim missing. |
| Realtime WebSocket not firing | High | Medium | Test FE-6 early. Fallback: 5s polling on dashboard if Realtime fails. |
| Over-delivery race condition | High | Low | PostgreSQL RPC uses row-level locking. Test T-14 explicitly. |
| OTP email not delivered | Medium | Medium | Test OTP first. Fallback: manually confirm user in Supabase Dashboard → Auth → Users. |
| Time overrun on UI polish | Medium | High | P3 polish is last. Demo with skeletons if needed. Use Radix/shadcn for speed. |
| API CORS errors in production | Medium | Medium | Set ALLOWED_ORIGINS correctly. Test on Vercel URL in Phase 7 smoke test. |
| Cold start on demo day | Low | Low | Hit prod URLs 5 min before demo to warm up. |

---

## Appendix A — API Quick Reference

| Method | Endpoint | Auth | Priority |
|--------|----------|------|----------|
| GET | `/warehouses` | Any | 🟠 P1 |
| POST | `/warehouses` | Manager | 🟠 P1 |
| GET | `/products` | Any | 🟠 P1 |
| GET | `/products/search?q=` | Any | 🟠 P1 |
| POST | `/products` | Manager | 🟠 P1 |
| PUT | `/products/:id` | Manager | 🟠 P1 |
| GET | `/receipts` | Any | 🟠 P1 |
| POST | `/receipts` | Any | 🟠 P1 |
| PUT | `/receipts/:id/status` | Any | 🟠 P1 |
| POST | `/receipts/:id/validate` | Any | 🔴 P0 |
| GET | `/deliveries` | Any | 🟠 P1 |
| POST | `/deliveries` | Any | 🟠 P1 |
| PUT | `/deliveries/:id/status` | Any | 🟠 P1 |
| POST | `/deliveries/:id/validate` | Any | 🔴 P0 |
| GET | `/adjustments` | Role-filtered | 🟡 P2 |
| POST | `/adjustments` | Any | 🟡 P2 |
| POST | `/adjustments/:id/approve` | Manager | 🟡 P2 |
| POST | `/adjustments/:id/reject` | Manager | 🟡 P2 |
| GET | `/dashboard/kpis` | Any | 🟠 P1 |
| GET | `/dashboard/alerts` | Any | 🟡 P2 |
| GET | `/ledger` | Any | 🟡 P2 |
| POST | `/odoo/test` | Manager | 🟡 P2 |
| POST | `/odoo/sync` | Manager | 🟡 P2 |

---

## Appendix B — Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| React pages | `PascalCase + Page.jsx` | `DashboardPage.jsx` |
| React components | `PascalCase.jsx` | `KPICard.jsx`, `StatusBadge.jsx` |
| React hooks | `camelCase, use prefix` | `useRealtime.js` |
| API routes | `camelCase.js` | `receipts.js` |
| Services | `camelCase + Service.js` | `stockService.js` |
| CSS variables | `--kebab-case` | `--color-brand-primary` |
| DB tables | `snake_case` | `stock_levels`, `receipt_items` |
| Env vars | `SCREAMING_SNAKE_CASE` | `SUPABASE_URL` |

---

*StockSense Development Plan v1.0 — Synthesized from PRD v1.0 · SAD v1.0 · UI/UX v1.0 — Odoo Hackathon 2026*
