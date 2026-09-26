# 🏗️ StockSense — System Architecture Document (SAD)

> **Version:** 1.0  
> **Date:** September 26, 2026  
> **Based on:** StockSense PRD v1.0  
> **Status:** MVP Architecture

---

## Table of Contents

1. [Overview](#1-overview)
2. [Recommended Tech Stack](#2-recommended-tech-stack)
3. [System Components](#3-system-components)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Design](#6-database-design)
7. [API Design](#7-api-design)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Data Flow](#9-data-flow)
10. [Odoo Integration](#10-odoo-integration)
11. [Storage](#11-storage)
12. [Security](#12-security)
13. [Deployment](#13-deployment)
14. [Monitoring](#14-monitoring)
15. [Scalability Considerations](#15-scalability-considerations)

---

## 1. Overview

StockSense is a **real-time Inventory Management System** for mid-size businesses (2–5 warehouses, 500–5,000 SKUs) with native Odoo ERP integration. The architecture is designed to:

- Deliver **live dashboard updates** (within 2 seconds of stock changes)
- Enforce **role-based access control** (Manager vs. Staff)
- Maintain a **tamper-proof audit trail** for every stock movement
- Integrate with **Odoo ERP** as a first-class external system
- Stay **practical and un-over-engineered** for a 3-person team building in a hackathon context

### Architecture Philosophy

```
Keep it simple. Prefer managed services. No unnecessary microservices.
One backend. Two databases with clear responsibilities. One integration layer.
```

---

## 2. Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React.js (Vite) | Fast dev server, component ecosystem, team familiarity |
| **UI Library** | shadcn/ui + Tailwind CSS | Pre-built accessible components, rapid UI development |
| **State Management** | Zustand | Lightweight, no boilerplate vs Redux |
| **Real-time** | Supabase Realtime (WebSocket) | Native to Supabase, zero extra setup |
| **Backend** | Node.js (Express.js) | REST API layer, business logic, middleware |
| **Python Service** | FastAPI (optional) | Odoo XML-RPC integration service if needed |
| **Primary DB** | Supabase (PostgreSQL) | Transactional data, ACID guarantees, Row-Level Security |
| **Secondary DB** | MongoDB Atlas | Semi-structured ledger/audit entries |
| **Auth** | Supabase Auth | OTP email support, JWT tokens, built-in |
| **Odoo Integration** | Odoo XML-RPC / REST API | Standard Odoo external API |
| **Hosting** | Vercel (frontend) + Railway / Render (backend) | Zero-config deploys, free tiers |
| **Dev Tooling** | ESLint, Prettier, dotenv | Code quality, env management |

---

## 3. System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                          STOCKSENSE SYSTEM                          │
│                                                                     │
│   ┌─────────────┐      ┌──────────────────┐     ┌───────────────┐  │
│   │   React.js  │ HTTP │   Node.js /      │PSQL │   Supabase    │  │
│   │   Frontend  │◄────►│   Express API    │◄───►│  PostgreSQL   │  │
│   │  (Vercel)   │      │  (Railway)       │     │  (Primary DB) │  │
│   └─────────────┘      └──────┬───────────┘     └───────────────┘  │
│          │  WebSocket         │                                     │
│          │  (Realtime)        │ MongoDB Driver                      │
│          ▼                    ▼                                     │
│   ┌─────────────┐      ┌──────────────────┐                        │
│   │  Supabase   │      │  MongoDB Atlas   │                        │
│   │  Realtime   │      │  (Audit Ledger)  │                        │
│   └─────────────┘      └──────────────────┘                        │
│                                │                                    │
│                         ┌──────▼───────────┐                       │
│                         │  Odoo ERP        │                       │
│                         │  (XML-RPC / REST)│                       │
│                         └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **React Frontend** | UI rendering, routing, state, real-time updates via Supabase Realtime |
| **Node.js API** | Business logic, validation, stock operations, RBAC enforcement |
| **Supabase PostgreSQL** | Products, warehouses, receipts, deliveries, adjustments, users |
| **MongoDB Atlas** | Append-only move history / stock ledger entries |
| **Supabase Auth** | User signup/login/OTP password reset, JWT issuance |
| **Supabase Realtime** | WebSocket push for live dashboard updates |
| **Odoo ERP** | External ERP — product catalog sync, order references |

---

## 4. Frontend Architecture

### Project Structure

```
src/
├── api/              # Axios API client, Supabase client
├── components/       # Reusable UI components (shadcn/ui wrappers)
│   ├── ui/           # Base components (Button, Table, Badge, etc.)
│   ├── layout/       # Navbar, Sidebar, PageWrapper
│   └── alerts/       # LowStockBanner, OutOfStockAlert
├── features/         # Feature-based modules
│   ├── auth/         # Login, Signup, OTP Reset
│   ├── dashboard/    # KPI cards, filters, summary tables
│   ├── products/     # Product list, create/edit form, search
│   ├── receipts/     # Receipt list, create flow, validate action
│   ├── deliveries/   # Delivery list, create flow, validate action
│   ├── adjustments/  # Adjustment form, approval queue
│   ├── ledger/       # Move History table, filters
│   └── settings/     # Warehouse management, user management
├── hooks/            # Custom React hooks (useAuth, useRealtime, useStock)
├── store/            # Zustand global state slices
├── router/           # React Router v6 routes + ProtectedRoute guard
├── utils/            # Helpers, formatters, validators
└── main.jsx          # App entry point
```

### Routing & Guards

```
/login              → Public
/signup             → Public
/reset-password     → Public

/dashboard          → Protected (Manager + Staff)
/products           → Protected (Manager + Staff)
/products/new       → Protected (Manager only)
/receipts           → Protected (Manager + Staff)
/deliveries         → Protected (Manager + Staff)
/adjustments        → Protected (Manager + Staff)
/ledger             → Protected (Manager + Staff)
/settings           → Protected (Manager only)
```

**ProtectedRoute** component reads JWT role claim from Supabase session and redirects unauthorized users to `/dashboard` with a toast notification.

### Real-time Strategy

- Supabase Realtime channels subscribe to **PostgreSQL table changes** (INSERT/UPDATE on `stock_levels`, `receipts`, `deliveries`)
- On change event → Zustand store is updated → Dashboard KPI cards re-render automatically
- No polling required; all updates are push-based

---

## 5. Backend Architecture

### Node.js API Structure

```
server/
├── config/
│   ├── supabase.js       # Supabase admin client
│   ├── mongodb.js        # MongoDB connection
│   └── odoo.js           # Odoo XML-RPC client config
├── middleware/
│   ├── auth.js           # JWT verification via Supabase
│   ├── rbac.js           # Role-based access guard
│   └── errorHandler.js   # Global error handler
├── routes/
│   ├── products.js
│   ├── receipts.js
│   ├── deliveries.js
│   ├── adjustments.js
│   ├── ledger.js
│   ├── warehouses.js
│   └── dashboard.js
├── controllers/          # Route handler logic
├── services/
│   ├── stockService.js   # Core stock level update logic
│   ├── ledgerService.js  # MongoDB ledger writes
│   ├── alertService.js   # Low-stock threshold checks
│   └── odooService.js    # Odoo API calls
├── validators/           # Joi/Zod schema validators
└── app.js                # Express app + route registration
```

### Key Business Logic Rules (Enforced in Services)

| Rule | Location | Detail |
|------|----------|--------|
| Stock update is atomic | `stockService.js` | PostgreSQL transaction — update + ledger entry in one TX |
| Cannot deliver > available | `stockService.js` | Pre-check `stock_levels.quantity >= delivery_qty` |
| Adjustment requires approval | `adjustments controller` | Status = `pending_approval`; stock only changes on Manager approval |
| Duplicate SKU blocked | `products controller` | DB unique constraint + application-level check |
| Receipt validation only when `Ready` | `receipts controller` | Status state machine enforced server-side |

---

## 6. Database Design

### 6.1 PostgreSQL (Supabase) — Transactional Data

#### Schema Overview

```sql
-- Users (managed by Supabase Auth, extended with profile)
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('manager', 'staff')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses
CREATE TABLE warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT,
  created_by  UUID REFERENCES user_profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Products
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

-- Stock Levels (per product per warehouse)
CREATE TABLE stock_levels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id  UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity      INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);

-- Receipts
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

-- Receipt Line Items
CREATE TABLE receipt_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id  UUID REFERENCES receipts(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  quantity    INT NOT NULL CHECK (quantity > 0)
);

-- Delivery Orders
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

-- Delivery Line Items
CREATE TABLE delivery_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id  UUID REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  quantity     INT NOT NULL CHECK (quantity > 0)
);

-- Stock Adjustments
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

#### Indexes

```sql
CREATE INDEX idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_adjustments_status ON adjustments(status);
CREATE INDEX idx_products_sku ON products(sku);
```

#### Row-Level Security (RLS) Policies

```sql
-- Staff can only view their own adjustments submissions
CREATE POLICY "staff_own_adjustments" ON adjustments
  FOR SELECT USING (
    auth.uid() = submitted_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- Only managers can update product details
CREATE POLICY "manager_product_write" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'manager')
  );
```

---

### 6.2 MongoDB Atlas — Audit Ledger

**Collection: `stock_ledger`**

```json
{
  "_id": "ObjectId",
  "transaction_id": "uuid-v4",
  "type": "receipt | delivery | adjustment",
  "product_id": "uuid",
  "product_sku": "string",
  "product_name": "string",
  "warehouse_id": "uuid",
  "warehouse_name": "string",
  "quantity_delta": "+50 | -12 | +3",
  "quantity_before": 100,
  "quantity_after": 150,
  "reference_id": "receipt_id | delivery_id | adjustment_id",
  "performed_by": {
    "user_id": "uuid",
    "full_name": "string",
    "role": "manager | staff"
  },
  "timestamp": "ISODate",
  "notes": "optional string"
}
```

**Indexes:**
```
{ product_id: 1, timestamp: -1 }
{ warehouse_id: 1, timestamp: -1 }
{ type: 1 }
{ timestamp: -1 }
```

**Write Strategy:** All ledger writes are **append-only**. No updates or deletes ever occur on ledger documents. This ensures tamper-proof audit history.

---

### 6.3 Database Responsibility Boundary

| Data Type | Database | Reason |
|-----------|----------|--------|
| Users, roles | Supabase PostgreSQL | Relational, FK dependencies |
| Products, SKUs | Supabase PostgreSQL | Transactional, unique constraints |
| Warehouses | Supabase PostgreSQL | Relational |
| Stock levels | Supabase PostgreSQL | ACID transactions, concurrent update safety |
| Receipts, deliveries | Supabase PostgreSQL | Status state machine, relational |
| Adjustments | Supabase PostgreSQL | Approval workflow |
| Audit/Move History | MongoDB Atlas | Append-only log, flexible schema |

---

## 7. API Design

### REST API Endpoints

All endpoints are prefixed with `/api/v1`. All protected endpoints require `Authorization: Bearer <JWT>` header.

#### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | Public | Register user (handled via Supabase SDK) |
| POST | `/auth/login` | Public | Login (handled via Supabase SDK) |
| POST | `/auth/reset-password` | Public | Trigger OTP email |

#### Warehouses
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/warehouses` | Any | List all warehouses |
| POST | `/warehouses` | Manager | Create warehouse |
| PUT | `/warehouses/:id` | Manager | Update warehouse |

#### Products
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/products` | Any | List products with stock levels |
| GET | `/products/:id` | Any | Single product detail |
| POST | `/products` | Manager | Create product |
| PUT | `/products/:id` | Manager | Update product |
| GET | `/products/search?q=` | Any | SKU/name search |

#### Receipts
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/receipts` | Any | List receipts (filterable) |
| GET | `/receipts/:id` | Any | Receipt detail |
| POST | `/receipts` | Any | Create receipt (Draft) |
| PUT | `/receipts/:id/status` | Any | Advance status |
| POST | `/receipts/:id/validate` | Any | Validate — stock +N, ledger entry |

#### Deliveries
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/deliveries` | Any | List deliveries (filterable) |
| GET | `/deliveries/:id` | Any | Delivery detail |
| POST | `/deliveries` | Any | Create delivery (Draft) |
| PUT | `/deliveries/:id/status` | Any | Advance status |
| POST | `/deliveries/:id/validate` | Any | Validate — stock -N, ledger entry |

#### Adjustments
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/adjustments` | Manager | List all pending adjustments |
| GET | `/adjustments` | Staff | List own submitted adjustments |
| POST | `/adjustments` | Any | Submit adjustment |
| POST | `/adjustments/:id/approve` | Manager | Approve — apply delta |
| POST | `/adjustments/:id/reject` | Manager | Reject — no stock change |

#### Dashboard
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/kpis` | Any | Live KPI counts |
| GET | `/dashboard/alerts` | Any | Low stock + out-of-stock items |

#### Ledger
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/ledger` | Any | Paginated, filterable move history |

#### Standard Response Envelope
```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "total": 120,
    "limit": 20
  },
  "error": null
}
```

---

## 8. Authentication & Authorization

### Auth Flow

```
[Signup]
User → React Form → Supabase Auth SDK → OTP email sent
User enters OTP → Supabase verifies → user_profiles row created → redirect to /dashboard

[Login]
User → React Form → Supabase Auth SDK → JWT returned
JWT stored in localStorage / Supabase session → all API calls include Bearer token

[Password Reset]
User enters email → Supabase sends OTP (valid 10 min) → User enters OTP + new password
Supabase updates auth.users → session re-established
```

### JWT & Role Propagation

- Supabase Auth issues **JWT** containing `sub` (user ID) and `role` (from `user_profiles`)
- Node.js middleware verifies JWT using Supabase JWT secret
- Role is extracted from token — no extra DB call per request
- Custom claims are injected via Supabase **Database Hook** on user creation

```js
// middleware/auth.js
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
req.user = { id: user.id, role: user.user_metadata.role };
next();
```

```js
// middleware/rbac.js
const requireRole = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

---

## 9. Data Flow

### 9.1 Receipt Validation Flow

```
Staff clicks "Validate" on Ready receipt
        │
        ▼
React → POST /api/v1/receipts/:id/validate
        │
        ▼
Node.js API
  ├── Verify JWT + role (any authenticated)
  ├── Fetch receipt (status must = 'ready')
  ├── BEGIN TRANSACTION (PostgreSQL)
  │     ├── UPDATE stock_levels SET quantity = quantity + N
  │     │     WHERE product_id = X AND warehouse_id = W
  │     ├── UPDATE receipts SET status = 'done', validated_at = NOW()
  │     └── COMMIT
  ├── Write to MongoDB ledger (async, non-blocking)
  │     └── { type: 'receipt', delta: +N, before, after, ... }
  └── Return 200 { success: true }
        │
        ▼
Supabase Realtime broadcasts stock_levels change
        │
        ▼
React dashboard KPIs re-render automatically (< 2s)
```

### 9.2 Delivery Validation Flow

```
Staff clicks "Validate" on Ready delivery
        │
        ▼
React → POST /api/v1/deliveries/:id/validate
        │
        ▼
Node.js API
  ├── Fetch stock_levels for each product in delivery
  ├── CHECK: available_qty >= requested_qty (for ALL items)
  │     └── If NO → return 422 "Insufficient stock for [Product Name]"
  ├── BEGIN TRANSACTION
  │     ├── UPDATE stock_levels SET quantity = quantity - N (for each item)
  │     └── UPDATE deliveries SET status = 'done'
  │     COMMIT
  ├── Write ledger entry to MongoDB (async)
  └── Return 200
        │
        ▼
Realtime broadcast → dashboard refreshes
```

### 9.3 Stock Adjustment Approval Flow

```
Staff submits adjustment
  → POST /api/v1/adjustments
  → status = 'pending_approval', stock unchanged

Manager views pending adjustments dashboard
  → GET /api/v1/adjustments?status=pending_approval

Manager approves
  → POST /api/v1/adjustments/:id/approve
  → Node.js: BEGIN TX
       UPDATE stock_levels SET quantity = physical_qty
       UPDATE adjustments SET status = 'approved', reviewed_by, reviewed_at
     COMMIT
  → Ledger entry written to MongoDB (type: 'adjustment')
```

### 9.4 Real-Time Dashboard Update

```
Any stock operation (receipt/delivery/adjustment)
        │
        ▼
PostgreSQL stock_levels row updated
        │
        ▼
Supabase Realtime detects row change (WAL-based)
        │
        ▼
WebSocket event pushed to all subscribed clients
        │
        ▼
React useRealtime() hook receives event
        │
        ▼
Zustand store updated → KPI cards re-render
```

---

## 10. Odoo Integration

### Integration Strategy (MVP: Stub-First)

Per PRD risk mitigation (R1), the Odoo integration is a **config stub** in MVP that can be wired up without blocking the demo.

### Architecture

```
Node.js API
  └── odooService.js
        ├── connect()     → Odoo XML-RPC authenticate
        ├── getProducts() → Fetch product catalog from Odoo
        └── postMove()    → Optional: push validated moves back to Odoo
```

### Odoo XML-RPC Pattern

```js
// services/odooService.js
const xmlrpc = require('xmlrpc');

const client = xmlrpc.createClient({
  host: process.env.ODOO_HOST,
  port: process.env.ODOO_PORT,
  path: '/xmlrpc/2/object'
});

async function getOdooProducts() {
  // Authenticate → get uid
  // Call: execute_kw → stock.quant → search_read
  // Map Odoo fields → StockSense product schema
}
```

### Sync Points

| Trigger | Action | Direction |
|---------|--------|-----------|
| Product creation in StockSense | Optional: create in Odoo too | StockSense → Odoo |
| Receipt validated | Optional: create stock picking in Odoo | StockSense → Odoo |
| On demand (Settings page) | Pull product catalog from Odoo | Odoo → StockSense |

> **MVP Decision:** Odoo sync is manual (triggered via Settings → "Sync with Odoo" button). No automatic webhooks for MVP.

---

## 11. Storage

### Data Volumes (MVP Estimates)

| Entity | Estimated Records | Storage Type |
|--------|-----------------|--------------|
| Users | < 20 | PostgreSQL |
| Products | 500–5,000 | PostgreSQL |
| Warehouses | 2–5 | PostgreSQL |
| Stock levels | ~5,000 rows | PostgreSQL |
| Receipts | ~100–500/month | PostgreSQL |
| Deliveries | ~200–1000/month | PostgreSQL |
| Adjustments | ~50–200/month | PostgreSQL |
| Ledger entries | ~500–5,000/month | MongoDB |

### File / Media Storage

**MVP: No file uploads required.** Products have no images in MVP.

Post-MVP (if needed): Supabase Storage for product images, delivery documents.

---

## 12. Security

### Security Checklist

| Layer | Control | Implementation |
|-------|---------|----------------|
| **Transport** | HTTPS only | Enforced by Vercel + Railway TLS |
| **Auth** | JWT verification | Supabase JWT secret, checked on every API request |
| **RBAC** | Role enforcement | Middleware on every protected route + RLS in PostgreSQL |
| **Input** | Request validation | Zod/Joi schemas on all POST/PUT endpoints |
| **SQL Injection** | Parameterized queries | Supabase client uses prepared statements |
| **NoSQL Injection** | Schema validation | Mongoose/Zod schemas before MongoDB writes |
| **CORS** | Origin whitelist | Express CORS configured to allow only frontend domain |
| **Secrets** | Environment variables | `.env` files, never committed; Vercel/Railway secret stores |
| **OTP Expiry** | Time-limited tokens | Supabase OTP valid for 10 minutes (PRD requirement) |
| **Concurrent Stock** | DB transactions | PostgreSQL BEGIN/COMMIT wraps all stock mutations |
| **Audit Trail** | Append-only ledger | MongoDB collection has no update/delete operations |

### Environment Variables

```env
# Node.js API
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MONGODB_URI=
ODOO_HOST=
ODOO_PORT=
ODOO_DB=
ODOO_USER=
ODOO_PASSWORD=
PORT=3001
ALLOWED_ORIGINS=https://stocksense.vercel.app

# React Frontend
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=https://stocksense-api.railway.app/api/v1
```

---

## 13. Deployment

### MVP Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Vercel         │     │  Railway /       │     │  Supabase Cloud  │
│  (Frontend)     │────►│  Render          │────►│  (PostgreSQL +   │
│  React Vite SPA │     │  (Node.js API)   │     │   Auth + RT)     │
└─────────────────┘     └─────────┬───────┘     └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  MongoDB Atlas   │
                         │  (Free M0 tier)  │
                         └──────────────────┘
```

### Deployment Steps

#### Frontend (Vercel)
```bash
# Connect GitHub repo → Vercel auto-deploys on push to main
# Set environment variables in Vercel dashboard
vercel --prod
```

#### Backend (Railway)
```bash
# Connect GitHub repo → Railway detects Node.js automatically
# Set environment variables in Railway dashboard
# Railway provides HTTPS URL automatically
```

#### Database
- **Supabase:** Free tier (500MB, 2 projects) — sufficient for MVP
- **MongoDB Atlas:** Free M0 cluster (512MB) — sufficient for MVP ledger

### CI/CD (Optional for Hackathon)

For hackathon speed, direct push-to-deploy via Vercel + Railway is sufficient. Post-MVP: add GitHub Actions for lint + test before deploy.

---

## 14. Monitoring

### MVP Monitoring (Zero Setup)

| Tool | What it monitors | Cost |
|------|-----------------|------|
| **Vercel Analytics** | Frontend page loads, errors | Free |
| **Railway Metrics** | API CPU, memory, request logs | Free |
| **Supabase Dashboard** | DB query performance, auth events | Free |
| **MongoDB Atlas Metrics** | Collection sizes, query latency | Free |
| **Browser Console** | Client-side errors during demo | Free |

### Key Metrics to Watch

- Dashboard KPI load time (target: < 500ms)
- Stock validation API response time (target: < 1s)
- Supabase Realtime latency (target: < 2s end-to-end)
- Failed auth attempts (OTP issues)

### Post-MVP Monitoring Upgrades

- **Sentry** — Frontend error tracking and backend exception capturing
- **Uptime Robot** — API endpoint uptime monitoring
- **Logtail / Axiom** — Structured log aggregation for audit

---

## 15. Scalability Considerations

### Current MVP Scale

| Metric | MVP Target | Current Architecture Handles |
|--------|-----------|------------------------------|
| Concurrent users | 5–10 (demo) | Easily |
| Products | 500–5,000 | PostgreSQL + indexes |
| Warehouses | 2–5 | Relational joins |
| Stock ops/day | ~100–500 | Single DB, no queue needed |
| Ledger entries/month | ~5,000 | MongoDB free tier |

### Scaling Path (Post-MVP, If Needed)

| Bottleneck | When It Occurs | Solution |
|------------|---------------|----------|
| API throughput | > 500 concurrent users | Horizontal scale Railway containers |
| DB connections | > 100 req/s to PostgreSQL | Add PgBouncer connection pooling |
| Real-time events | > 1,000 concurrent WS connections | Upgrade Supabase plan |
| Ledger growth | > 1M entries | MongoDB Atlas scale-up + archiving strategy |
| Odoo sync lag | High transaction volume | Add async job queue (BullMQ + Redis) |

### What NOT to Build Yet

- Message queues (BullMQ/RabbitMQ) — unnecessary at MVP scale
- Microservices — single Node.js API is fine for 3-person team
- Caching layer (Redis) — Supabase Realtime removes the need for polling
- CDN for static assets — Vercel handles this automatically
- Kubernetes — Railway auto-scales containers without it

---

## Appendix A: Key Design Decisions

| Decision | Choice | Alternative Considered | Reason |
|----------|--------|----------------------|--------|
| Dual DB | PostgreSQL + MongoDB | PostgreSQL only | PRD specifies MongoDB for ledger; append-only log fits document model |
| State management | Zustand | Redux Toolkit | Zero boilerplate, simpler for small team |
| Real-time | Supabase Realtime | Socket.io | Native to Supabase, zero extra infra |
| Backend | Node.js | Python FastAPI | Faster JSON API development; Python reserved for Odoo XML-RPC only if needed |
| RBAC | Middleware + JWT claims | Database roles only | Faster enforcement; DB RLS as second layer |
| Odoo integration | Stub + manual sync | Auto-webhook | PRD risk: complexity; demo unblocked |

---

## Appendix B: Component Interaction Summary

```
User Action → React Component
                    │
                    ▼
            Axios API Call (with JWT)
                    │
                    ▼
        Node.js Express Route Handler
                    │
              ┌─────┴─────┐
              │           │
         Auth MW       RBAC MW
              │           │
              └─────┬─────┘
                    │
              Service Layer
         (stockService / ledgerService)
                    │
              ┌─────┴─────┐
              │           │
       PostgreSQL TX    MongoDB Write
       (Supabase)       (Atlas)
              │
              ▼
       Supabase Realtime
              │
              ▼
       React Dashboard
       (auto re-renders)
```

---

*StockSense SAD v1.0 — Aligned with StockSense PRD v1.0 — Built for Odoo Hackathon 2026*
