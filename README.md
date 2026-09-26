<div align="center">

# StockSense

### Real-time Inventory Management System — Built for Odoo Hackathon 2026

[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=flat-square)](/)
[![Version](https://img.shields.io/badge/Version-1.0%20MVP-blue?style=flat-square)](/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ECF8E?style=flat-square&logo=supabase)](/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](/)

> **Eliminate stock guesswork.** StockSense gives mid-size warehouses live inventory visibility, automated receipt and delivery workflows, and a tamper-proof audit trail — all integrated with Odoo ERP.

</div>

---

## Overview

**StockSense** is a modular, real-time Inventory Management System (IMS) built for mid-size businesses operating **2–5 warehouses** with **500–5,000 SKUs**. It integrates with existing **Odoo ERP** instances to replace fragmented Excel sheets and manual registers with a centralized, role-aware, audit-ready platform.

StockSense automates the core stock workflows — receipts, deliveries, and adjustments — while giving managers **live visibility into stock health** across all locations, and providing warehouse staff with a **streamlined guided interface** for day-to-day operations.

### The Problem It Solves

Mid-size warehouses today rely on a patchwork of spreadsheets, paper registers, and disconnected tools:

| Problem | Impact |
|---------|--------|
| No real-time stock visibility | Managers don't know actual levels until end-of-day |
| Manual double-entry errors | Stock counts are wrong before the day even starts |
| No proactive alerting | Stockouts discovered after customers complain |
| Zero audit trail | Damaged, adjusted, or transferred items go untracked |
| Slow operations | Staff waste time cross-referencing spreadsheets |

**StockSense fixes all of this** — in a single, demo-ready platform.

---

## Features

### Authentication & Access Control
- Email + password signup with **OTP email verification**
- **Role-based access control** — Manager vs. Warehouse Staff
- JWT-secured sessions; OTP password reset (10-minute expiry)
- Manager-only routes hidden from Staff (not just disabled)

### Live Dashboard
- **5 real-time KPIs**: Total Products · Low Stock · Out of Stock · Pending Receipts · Pending Deliveries
- Dashboard updates **within 2 seconds** of any stock operation (WebSocket push via Supabase Realtime)
- Low Stock & Out of Stock alert banners with direct navigation
- Filter by warehouse, document type, and status

### Product Management
- Create, edit, and view products with SKU, category, UOM, and reorder threshold
- **Real-time SKU uniqueness check** (500ms debounce)
- Stock levels shown **per warehouse** on the product detail page
- Smart search by name or SKU across all products

### Receipts — Incoming Stock
- Full status workflow: `Draft → Waiting → Ready → Done`
- Line-item receipt creation with product search
- **Atomic stock increment** on validation (PostgreSQL transaction)
- Auto-save draft to localStorage every 30 seconds

### Delivery Orders — Outgoing Stock
- Full status workflow: `Draft → Waiting → Ready → Done`
- **Over-delivery blocked** at validation — shows exact shortfall per product
- Atomic stock decrement with ledger entry on validation

### Stock Adjustments
- Staff submit physical count discrepancies with reason/notes
- **Manager approval workflow** — stock only corrects on Manager approve
- Delta auto-calculated and color-coded (green = surplus, red = deficit)

### Low Stock Alerts
- Per-product reorder thresholds configured by Manager
- Alert banner on dashboard when any product drops below threshold
- Critical "Out of Stock" alert when quantity reaches zero

### Multi-Warehouse Support
- Stock tracked **per product per warehouse**
- All receipts, deliveries, and adjustments tied to a specific warehouse
- Dashboard KPIs filterable by warehouse

### Move History / Stock Ledger
- **Every stock movement logged** in an append-only audit ledger (MongoDB)
- Tamper-proof: no updates or deletes ever on ledger entries
- Filterable by date range, product, warehouse, type, and user
- Clickable references link back to source receipt/delivery/adjustment

### Odoo ERP Integration
- Settings panel for Odoo connection (host, port, DB, credentials)
- **Test Connection** and **Sync Products** from Odoo catalog
- Graceful stub — app works fully even if Odoo is unavailable

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React.js (Vite) | Fast dev server, component ecosystem |
| **UI Components** | shadcn/ui + Radix + Tailwind | Accessible components, rapid development |
| **State Management** | Zustand | Lightweight, zero boilerplate |
| **Real-time** | Supabase Realtime (WebSocket) | Native to Supabase, zero extra infra |
| **Backend** | Node.js + Express.js | REST API, business logic, RBAC middleware |
| **Primary Database** | Supabase (PostgreSQL) | ACID transactions, Row-Level Security |
| **Audit Ledger** | MongoDB Atlas | Append-only log, flexible document model |
| **Auth** | Supabase Auth | OTP email, JWT tokens, built-in |
| **Odoo Integration** | Odoo XML-RPC | Standard Odoo external API |
| **Frontend Hosting** | Vercel | Zero-config, instant deploys |
| **Backend Hosting** | Railway | Auto-detected Node.js, HTTPS included |

---

## Architecture

```
+---------------------------------------------------------------------+
|                          STOCKSENSE SYSTEM                          |
|                                                                     |
|   +-------------+      +------------------+     +---------------+  |
|   |   React.js  | HTTP |   Node.js /      |PSQL |   Supabase    |  |
|   |   Frontend  |<---->|   Express API    |<--->|  PostgreSQL   |  |
|   |  (Vercel)   |      |  (Railway)       |     |  (Primary DB) |  |
|   +-------------+      +------+-----------+     +---------------+  |
|          |  WebSocket         |                                     |
|          |  (Realtime)        | MongoDB Driver                      |
|          v                    v                                     |
|   +-------------+      +------------------+                        |
|   |  Supabase   |      |  MongoDB Atlas   |                        |
|   |  Realtime   |      |  (Audit Ledger)  |                        |
|   +-------------+      +------------------+                        |
|                                |                                    |
|                         +------v-----------+                       |
|                         |  Odoo ERP        |                       |
|                         |  (XML-RPC / REST)|                       |
|                         +------------------+                       |
+---------------------------------------------------------------------+
```

### Database Responsibility Boundary

| Data | Database | Reason |
|------|----------|--------|
| Users, roles, warehouses | Supabase PostgreSQL | Relational, FK dependencies |
| Products, SKUs, stock levels | Supabase PostgreSQL | ACID, concurrent update safety |
| Receipts, deliveries, adjustments | Supabase PostgreSQL | Status state machines |
| Audit / Move History | MongoDB Atlas | Append-only log, flexible schema |

---

## Project Structure

```
stocksense/
├── client/                         # React frontend (Vite)
│   └── src/
│       ├── api/                    # Axios client + Supabase client
│       ├── components/
│       │   ├── ui/                 # Button, Input, Badge, Modal, Table, KPICard
│       │   ├── layout/             # Sidebar, PageWrapper, PageHeader
│       │   └── alerts/             # LowStockBanner, OutOfStockBanner
│       ├── features/
│       │   ├── auth/               # Login, Signup, OTP, Reset Password
│       │   ├── dashboard/          # KPI cards, filters, summary table
│       │   ├── products/           # List, create/edit, detail
│       │   ├── receipts/           # List, create, detail + validate
│       │   ├── deliveries/         # List, create, detail + validate
│       │   ├── adjustments/        # List, create, approve/reject
│       │   ├── ledger/             # Move history table + filters
│       │   └── settings/           # Warehouses, users, Odoo integration
│       ├── hooks/                  # useAuth, useRealtime, useStock
│       ├── store/                  # Zustand global state
│       └── router/                 # React Router v6 + ProtectedRoute
│
└── server/                         # Node.js backend (Express)
    ├── config/                     # Supabase, MongoDB, Odoo clients
    ├── middleware/                  # auth.js (JWT), rbac.js (role guard)
    ├── routes/                     # One file per resource
    ├── controllers/                 # Route handler logic
    ├── services/
    │   ├── stockService.js         # Atomic stock level updates
    │   ├── ledgerService.js        # MongoDB append-only writes
    │   ├── alertService.js         # Low-stock threshold checks
    │   └── odooService.js          # Odoo XML-RPC integration
    └── validators/                 # Zod schemas per resource
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A [Supabase](https://supabase.com) account (free tier works)
- A [MongoDB Atlas](https://cloud.mongodb.com) account (free M0 cluster works)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/phplovesrishabh/Stocksense.Odoo.git
cd Stocksense.Odoo
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stocksense
ODOO_HOST=your_odoo_host          # Optional — app works without Odoo
ODOO_PORT=8069
ODOO_DB=your_odoo_db
ODOO_USER=your_odoo_user
ODOO_PASSWORD=your_odoo_password
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Set Up the Frontend

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### 4. Set Up the Database

In your Supabase project, go to **SQL Editor** and run the schema from [`StockSense_SAD.md`](./StockSense_SAD.md) § 6.1. This creates all 9 tables, indexes, and Row-Level Security policies.

Then in **Supabase Dashboard → Database → Replication**, enable Realtime on:
`stock_levels` · `receipts` · `deliveries` · `adjustments`

### 5. Run Locally

```bash
# Terminal 1 — Backend
cd server
npm run dev        # nodemon on port 3001

# Terminal 2 — Frontend
cd client
npm run dev        # Vite on port 5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Reference

All endpoints are prefixed with `/api/v1`. Protected endpoints require `Authorization: Bearer <JWT>`.

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/signup` | Public | Register (via Supabase SDK) |
| POST | `/auth/login` | Public | Login (via Supabase SDK) |
| POST | `/auth/reset-password` | Public | Trigger OTP email |

### Warehouses
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/warehouses` | Any | List all warehouses |
| POST | `/warehouses` | Manager | Create warehouse |
| PUT | `/warehouses/:id` | Manager | Update warehouse |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/products` | Any | List with stock levels |
| GET | `/products/search?q=` | Any | SKU / name search |
| GET | `/products/:id` | Any | Product + stock per warehouse |
| POST | `/products` | Manager | Create product |
| PUT | `/products/:id` | Manager | Update product |

### Receipts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/receipts` | Any | List (filterable) |
| GET | `/receipts/:id` | Any | Detail with line items |
| POST | `/receipts` | Any | Create (status: draft) |
| PUT | `/receipts/:id/status` | Any | Advance status |
| POST | `/receipts/:id/validate` | Any | Validate — stock +N |

### Deliveries
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/deliveries` | Any | List (filterable) |
| GET | `/deliveries/:id` | Any | Detail with line items |
| POST | `/deliveries` | Any | Create (status: draft) |
| PUT | `/deliveries/:id/status` | Any | Advance status |
| POST | `/deliveries/:id/validate` | Any | Validate — stock -N |

### Adjustments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/adjustments` | Manager: all / Staff: own | List adjustments |
| POST | `/adjustments` | Any | Submit adjustment |
| POST | `/adjustments/:id/approve` | Manager | Approve — apply delta |
| POST | `/adjustments/:id/reject` | Manager | Reject — no change |

### Dashboard & Ledger
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/dashboard/kpis` | Any | Live KPI counts |
| GET | `/dashboard/alerts` | Any | Low/out-of-stock items |
| GET | `/ledger` | Any | Paginated move history |

### Standard Response Envelope

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "total": 120, "limit": 20 },
  "error": null
}
```

---

## Role-Based Access

| Capability | Manager | Staff |
|------------|:-------:|:-----:|
| View Dashboard KPIs | Yes | Yes |
| Create / Edit Products | Yes | No |
| Create Receipts & Deliveries | Yes | Yes |
| Validate Receipts & Deliveries | Yes | Yes |
| Submit Stock Adjustments | Yes | Yes |
| Approve Stock Adjustments | Yes | No |
| View All Move History | Yes | Own only |
| Manage Warehouses | Yes | No |
| Configure Odoo Integration | Yes | No |
| View User List | Yes | No |

---

## Database Schema

### PostgreSQL (Supabase)

```
user_profiles     → extends Supabase Auth (id, full_name, role)
warehouses        → id, name, location, created_by
products          → id, name, sku (UNIQUE), category, uom, reorder_threshold
stock_levels      → product_id x warehouse_id → quantity  (UNIQUE pair)
receipts          → id, supplier_name, warehouse_id, status, created_by
receipt_items     → receipt_id, product_id, quantity
deliveries        → id, customer_ref, warehouse_id, status, created_by
delivery_items    → delivery_id, product_id, quantity
adjustments       → product_id, warehouse_id, recorded_qty, physical_qty,
                    delta (computed), reason, status, submitted_by, reviewed_by
```

### MongoDB — `stock_ledger` Collection (Append-Only)

```json
{
  "transaction_id": "uuid",
  "type": "receipt | delivery | adjustment",
  "product_id": "uuid",
  "product_sku": "string",
  "warehouse_id": "uuid",
  "warehouse_name": "string",
  "quantity_delta": 50,
  "quantity_before": 100,
  "quantity_after": 150,
  "reference_id": "receipt/delivery/adjustment uuid",
  "performed_by": {
    "user_id": "uuid",
    "full_name": "string",
    "role": "string"
  },
  "timestamp": "ISODate"
}
```

---

## Design System

StockSense uses a dark-mode-first design system built with CSS custom properties.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-primary` | `#4F6EF7` | Buttons, active nav, links |
| `--color-brand-secondary` | `#7C3AED` | Accents, badges |
| `--color-bg-base` | `#0F1117` | Page background |
| `--color-bg-surface` | `#1A1D27` | Cards, sidebar |
| `--color-success` | `#10B981` | Done status, success toasts |
| `--color-warning` | `#F59E0B` | Low stock, Waiting status |
| `--color-danger` | `#EF4444` | Out-of-stock, errors |

**Typography:** Inter (Google Fonts) — **Base grid:** 8px spacing scale

---

## Status Workflow

Both Receipts and Deliveries follow this state machine:

```
Draft --> Waiting --> Ready --> Done
  |           |          |
  +-----------+----------+--> Cancelled
```

Stock levels update **only** on transition to `Done` via the Validate action.

Stock Adjustments:

```
Pending Approval --> Approved  (stock delta applied)
                 --> Rejected  (stock unchanged)
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| End-to-end receipt workflow | Completable in under 2 minutes |
| End-to-end delivery workflow | Completable in under 2 minutes |
| Dashboard data freshness | Live updates within 2 seconds |
| Stock accuracy after validation | 100% match between UI and DB |
| Low stock alert trigger | Fires within 1 operation of threshold breach |
| Role enforcement | Staff cannot access Manager routes via URL or API |
| Audit trail completeness | 100% of Create/Validate/Adjust actions in Move History |

---

## MVP Scope

### In Scope

- Auth (Signup / Login / OTP Reset)
- Role-Based Access (Manager / Staff)
- Dashboard with Live KPIs
- Product Management (CRUD + SKU search)
- Receipt Workflow (incoming stock)
- Delivery Orders (outgoing stock)
- Stock Adjustments with Approval Flow
- Low Stock and Out-of-Stock Alerts
- Multi-Warehouse Support (2–5 warehouses)
- Move History / Audit Ledger
- Odoo ERP Integration (connection + product sync)

### Post-MVP — Not in This Release

Internal Transfers, Barcode/QR scanning, Supplier portal, Purchase Orders, Demand forecasting, Mobile app, Email/SMS notifications, Shipping integrations, Custom reports, Bulk CSV import.

---

## Documentation

All project documents are in the repository root:

| Document | Description |
|----------|-------------|
| [`StockSense_PRD.md`](./StockSense_PRD.md) | Product Requirements Document — features, user stories, acceptance criteria |
| [`StockSense_SAD.md`](./StockSense_SAD.md) | System Architecture Document — tech stack, DB schema, API design, data flows |
| [`StockSense_UIUX.md`](./StockSense_UIUX.md) | UI/UX Design Document — design tokens, components, screen specs, interactions |
| [`StockSense_DevPlan.md`](./StockSense_DevPlan.md) | Development Plan — phases, tasks, timeline, test scenarios, Definition of Done |

---

## Deployment

### Frontend — Vercel

```bash
# Push to main branch — Vercel auto-deploys
# Set these environment variables in the Vercel dashboard:
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=https://your-api.railway.app/api/v1
```

### Backend — Railway

```bash
# Connect GitHub repo — Railway detects Node.js automatically
# Add all server environment variables in the Railway dashboard
# Railway provides an HTTPS URL automatically
```

### Databases

- **Supabase** Free Tier — 500 MB PostgreSQL, 50 MB file storage
- **MongoDB Atlas** Free M0 Cluster — 512 MB, sufficient for MVP ledger

---

## Environment Variables

### Server (`server/.env`)

```env
SUPABASE_URL=                     # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=        # Service role key — never expose to frontend
MONGODB_URI=                      # MongoDB Atlas connection string
ODOO_HOST=                        # Optional: Odoo server hostname
ODOO_PORT=8069
ODOO_DB=
ODOO_USER=
ODOO_PASSWORD=
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
```

### Client (`client/.env.local`)

```env
VITE_SUPABASE_URL=                # Same Supabase URL
VITE_SUPABASE_ANON_KEY=           # Anon/public key — safe to expose to browser
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## Testing

Run test scenarios manually as described in [`StockSense_DevPlan.md`](./StockSense_DevPlan.md) — Phase 6.

Key test areas:

| Area | Description |
|------|-------------|
| **T-AUTH** | Signup, OTP verification, Login, Password Reset |
| **T-RBAC** | Role enforcement via URL and direct API call |
| **T-STOCK** | Receipt/Delivery validation, over-delivery block, concurrent updates |
| **T-LEDGER** | Audit trail completeness and filter accuracy |
| **T-DASHBOARD** | Real-time KPI update within 2 seconds of a stock operation |

---

## Team

| Person | Role | Responsibility |
|--------|------|---------------|
| P1 | Backend Lead | Auth, RBAC middleware, Receipts/Deliveries API, Stock Service |
| P2 | Frontend Lead | React scaffold, UI components, Auth pages, Dashboard Realtime |
| P3 | Fullstack / DB | DB schema, Products API, Ledger service, Odoo integration |

---

## License

This project is licensed under the MIT License.

---

<div align="center">

Built for the Odoo Hackathon 2026

**StockSense — Real-time inventory. Zero guesswork.**

</div>
