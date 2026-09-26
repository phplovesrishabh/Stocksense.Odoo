# 📦 StockSense — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** September 26, 2026  
> **Team Size:** 3  
> **Hackathon Deadline:** 5:00 PM, September 26, 2026  
> **Status:** MVP / Active Development

---

## 1. 🧭 Project Description

**StockSense** is a modular, real-time Inventory Management System (IMS) built for mid-size businesses operating 2–5 warehouses with 500–5,000 SKUs. It integrates with existing Odoo ERP instances to replace fragmented Excel sheets and manual registers with a centralized, role-aware, audit-ready platform.

StockSense automates the core stock workflows — receipts, deliveries, and adjustments — while giving managers live visibility into stock health across all locations, and providing warehouse staff with a streamlined interface for day-to-day operations.

**Tech Stack:**
- **Frontend:** React.js
- **Backend:** Node.js + Python (service layer)
- **Database:** Supabase (PostgreSQL) + MongoDB
- **Auth:** Supabase Auth (OTP support)
- **Integration:** Odoo ERP

---

## 2. 🔴 Problem Statement

Mid-size warehouses today rely on a patchwork of Excel spreadsheets, paper registers, and disconnected tools to track inventory. This leads to:

- **Stockouts** due to no proactive alerting system
- **Data errors** from manual double-entry across systems
- **Zero real-time visibility** — managers don't know actual stock levels until end-of-day
- **No audit trail** — damaged, transferred, or adjusted items go untracked
- **Slow operations** — staff waste time cross-referencing multiple spreadsheets to validate receipts or deliveries

> **StockSense solves this** by automating receipt, delivery, and adjustment workflows for small-to-mid warehouses — with real-time stock visibility and a complete, tamper-proof audit trail.

---

## 3. 👥 Target Users

| Role | Description | Primary Pain Points |
|------|-------------|---------------------|
| **Inventory Manager** | Oversees all stock operations, approves workflows, monitors KPIs | No live dashboard, no alerting, no cross-warehouse view |
| **Warehouse Staff** | Executes receipts, deliveries, picks, and transfers | Manual paper processes, no guided workflow, no audit log |

**Target Company Profile:**
- Mid-size business
- 2–5 warehouses
- 500–5,000 unique SKUs
- Already using Odoo ERP (or planning to)

---

## 4. 🎯 Goals & Success Outcomes

| # | Goal | Metric |
|---|------|--------|
| G1 | Eliminate manual Excel-based tracking errors | 0 stock discrepancies from data entry errors in demo |
| G2 | Give real-time stock visibility across all warehouses | Dashboard refreshes live; any receipt/delivery reflects instantly |
| G3 | Reduce stockouts via proactive alerting | Low-stock + out-of-stock alerts trigger correctly in demo |
| G4 | Provide a complete audit trail of all stock movements | Every transaction (receipt, delivery, adjustment) logged with timestamp, user, and quantity |

---

## 5. ✅ MVP Scope

The MVP focuses on core workflows that demonstrate end-to-end value within a single demo session.

### In Scope (MVP)

| # | Feature | Priority |
|---|---------|----------|
| 1 | Authentication (Login / Signup / OTP Password Reset) | 🔴 Critical |
| 2 | Role-Based Access (Manager vs. Staff) | 🔴 Critical |
| 3 | Dashboard with live KPIs & dynamic filters | 🔴 Critical |
| 4 | Product Management (Create / Edit / View / SKU search) | 🔴 Critical |
| 5 | Receipts — Incoming Stock workflow | 🔴 Critical |
| 6 | Delivery Orders — Outgoing Stock workflow | 🔴 Critical |
| 7 | Stock Adjustments (recorded vs. physical count fix) | 🟡 High |
| 8 | Low Stock Alerts (threshold + out-of-stock) | 🟡 High |
| 9 | Multi-warehouse Support (2–5 warehouses) | 🟡 High |
| 10 | Move History / Stock Ledger (audit trail) | 🟡 High |

### Out of Scope (Post-MVP)

- Internal Transfers (warehouse-to-warehouse moves)
- Barcode / QR scanning
- Supplier management portal
- Purchase Order generation
- Analytics & forecasting / demand prediction
- Mobile native app (iOS / Android)
- Email/SMS notifications
- Third-party shipping integrations
- Custom report builder
- Batch operations / bulk import via CSV

---

## 6. 🔐 Authentication & Access Control

### Auth Flows
1. **Signup** → email + password → OTP email verification
2. **Login** → email + password
3. **Password Reset** → OTP sent to registered email → new password set

### Role-Based Access

| Capability | Inventory Manager | Warehouse Staff |
|------------|:-----------------:|:---------------:|
| View Dashboard KPIs | ✅ | ✅ (limited) |
| Create / Edit Products | ✅ | ❌ |
| Validate Receipts | ✅ | ✅ |
| Validate Deliveries | ✅ | ✅ |
| Create Stock Adjustments | ✅ | ✅ (submit only) |
| Approve Stock Adjustments | ✅ | ❌ |
| Manage Warehouses | ✅ | ❌ |
| View Move History | ✅ | ✅ (own actions) |
| Manage Users | ✅ | ❌ |

---

## 7. 📊 Dashboard Specification

### KPIs (Live, Real-Time)
- **Total Products in Stock**
- **Low Stock Items** (below threshold)
- **Out of Stock Items** (quantity = 0)
- **Pending Receipts** (Draft / Waiting / Ready)
- **Pending Deliveries** (Draft / Waiting / Ready)

### Dynamic Filters
- By **Document Type:** Receipts / Deliveries / Adjustments
- By **Status:** Draft → Waiting → Ready → Done → Canceled
- By **Warehouse / Location**
- By **Product Category**

---

## 8. 📋 Core Feature Specifications

### 8.1 Product Management
**Fields per product:**
- Name *(required)*
- SKU / Code *(required, unique)*
- Category *(required)*
- Unit of Measure *(required)*
- Initial Stock *(optional, default: 0)*
- Reorder Threshold *(for low-stock alerts)*
- Warehouse / Location

**Actions:**
- Create product
- Edit product details
- View product stock per location
- SKU / name search with smart filters

---

### 8.2 Receipts (Incoming Stock)

**Trigger:** Items arrive from a vendor.

**Process Flow:**
```
Create Receipt → Add Supplier + Products → Input Quantities → Validate
                                                                   ↓
                                                        Stock Level +N (auto)
                                                        Ledger entry logged
```

**Fields:** Receipt ID (auto), Supplier name, Product(s), Quantity received, Warehouse, Date, Status

**Status flow:** `Draft → Waiting → Ready → Done`

**Business Rule:** Validation is only allowed when status = `Ready`. Stock updates atomically on validation.

---

### 8.3 Delivery Orders (Outgoing Stock)

**Trigger:** Stock leaves warehouse for customer shipment.

**Process Flow:**
```
Create Delivery → Pick Items → Pack Items → Validate
                                                ↓
                                    Stock Level −N (auto)
                                    Ledger entry logged
```

**Fields:** Delivery ID (auto), Customer/Reference, Product(s), Quantity, Source Warehouse, Date, Status

**Business Rule:** Cannot deliver more than available stock. System blocks over-delivery with error.

---

### 8.4 Stock Adjustments

**Trigger:** Physical count differs from system-recorded quantity.

**Process Flow:**
```
Select Product + Location → Enter Physical Count → System calculates delta → Submit
                                                                               ↓
                                                           (Manager Approves)
                                                                               ↓
                                                             Stock auto-corrected
                                                             Ledger logs adjustment + reason
```

**Fields:** Product, Location, Recorded Qty, Physical Qty, Delta, Reason/Notes, Adjusted by, Timestamp

---

### 8.5 Low Stock Alerts

**Triggers:**
1. Stock drops **below user-defined threshold** → ⚠️ Low Stock warning
2. Stock reaches **zero** → 🔴 Out of Stock critical alert

**Display:** Alert banner on Dashboard + badge on Products list

**Configuration:** Manager sets reorder threshold per product during product creation/edit.

---

### 8.6 Multi-Warehouse Support

- Each product tracks stock **per warehouse + location**
- Receipts and Deliveries are tied to a specific warehouse
- Dashboard KPIs can be filtered by warehouse
- Manager can add/manage warehouses in Settings

---

### 8.7 Move History / Stock Ledger

Every stock movement is logged with:

| Field | Description |
|-------|-------------|
| Transaction ID | Auto-generated |
| Type | Receipt / Delivery / Adjustment |
| Product | SKU + Name |
| Quantity Delta | +N or −N |
| From → To | Location/warehouse context |
| Performed By | User (name + role) |
| Timestamp | ISO 8601 |
| Reference | Receipt/Delivery/Adjustment ID |

**Searchable & filterable** by date range, product, warehouse, type, user.

---

## 9. 📖 User Stories

### Authentication
- `US-01` As a **new user**, I want to sign up with my email and password so that I can access StockSense.
- `US-02` As a **returning user**, I want to log in securely so that I reach my role-appropriate dashboard.
- `US-03` As a **user who forgot my password**, I want to receive an OTP and reset my password so that I don't lose access.

### Dashboard
- `US-04` As an **Inventory Manager**, I want to see live KPIs (stock levels, pending operations) on my dashboard so that I can assess warehouse health at a glance.
- `US-05` As a **Manager**, I want to filter the dashboard by warehouse and document type so that I can focus on specific operations.

### Product Management
- `US-06` As a **Manager**, I want to create products with SKU, category, and UOM so that they can be tracked across all workflows.
- `US-07` As a **Manager**, I want to set a reorder threshold per product so that I'm alerted before stockouts happen.
- `US-08` As **any user**, I want to search for a product by SKU or name so that I can quickly find it.

### Receipts
- `US-09` As **Warehouse Staff**, I want to create a receipt when vendor goods arrive so that stock is updated automatically.
- `US-10` As **Staff**, I want to validate a receipt so that the system adds the received quantity to the correct warehouse location.

### Delivery Orders
- `US-11` As **Warehouse Staff**, I want to create a delivery order for outgoing goods so that stock is decremented correctly.
- `US-12` As **Staff**, I want the system to prevent me from delivering more than available stock so that inventory accuracy is maintained.

### Stock Adjustments
- `US-13` As **Warehouse Staff**, I want to submit a stock adjustment when physical count differs from the system so that records stay accurate.
- `US-14` As a **Manager**, I want to approve or reject stock adjustment requests so that unauthorized changes don't happen.

### Alerts
- `US-15` As a **Manager**, I want to see a low-stock alert on my dashboard when any product drops below its threshold so that I can reorder in time.
- `US-16` As a **Manager**, I want an out-of-stock alert so that I'm immediately notified of critical gaps.

### Audit Trail
- `US-17` As a **Manager**, I want to view a full move history with filters so that I can audit any stock movement at any time.

---

## 10. 📐 Acceptance Criteria

| User Story | Acceptance Criteria |
|------------|---------------------|
| US-01 | User can register, receives OTP, and is redirected to dashboard after verification |
| US-02 | Valid credentials → login success. Invalid credentials → clear error message |
| US-03 | OTP delivered, valid for 10 min, new password accepted, user logged in |
| US-04 | Dashboard shows 5 live KPIs; values update within 2s of any stock operation |
| US-06 | Product creation form validates required fields; duplicate SKU blocked |
| US-09 | Receipt created with status = Draft; products and supplier are linked |
| US-10 | On Validate: stock increments by received qty; ledger entry created; status = Done |
| US-11 | Delivery order created; picking and packing steps logged |
| US-12 | System throws validation error if delivery qty > available stock |
| US-13 | Adjustment submitted with delta; status = Pending Approval |
| US-14 | Manager approves → stock corrected; rejected → stock unchanged; both logged |
| US-15 | Alert appears on dashboard when stock < threshold; cleared when restocked |
| US-17 | Ledger shows all entries; filterable by date, product, type, and user |

---

## 11. 📊 Success Metrics

| Metric | Target |
|--------|--------|
| End-to-end receipt workflow | Completable in < 2 minutes |
| End-to-end delivery workflow | Completable in < 2 minutes |
| Dashboard data freshness | Live updates within 2 seconds |
| Stock accuracy after validation | 100% match between UI and DB |
| Low stock alert trigger accuracy | Alert fires within 1 operation of threshold breach |
| Role enforcement | Staff cannot access Manager-only routes (verified via direct URL) |
| Audit trail completeness | 100% of Create/Validate/Adjust actions appear in Move History |

---

## 12. ⚙️ Assumptions

- A1: Each user belongs to exactly one role (Manager or Staff) at account creation.
- A2: An Odoo instance exists and provides data through API/webhooks for integration.
- A3: Supabase handles Auth and PostgreSQL for relational data (products, receipts, deliveries).
- A4: MongoDB stores semi-structured data (move history / ledger entries).
- A5: A warehouse must exist before products or operations can be created.
- A6: All quantities are non-negative integers for the MVP.
- A7: One supplier per receipt in the MVP (multiple products allowed).
- A8: Internet connectivity is required (no offline mode in MVP).

---

## 13. ⚠️ Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Odoo integration complexity takes too long | High | High | Mock the integration in MVP; show integration as a config stub |
| Supabase + MongoDB dual-DB sync issues | High | Medium | Keep clear boundary: PostgreSQL = transactional, MongoDB = logs only |
| Role-based route protection gaps | High | Low | Test all Manager routes with a Staff token before demo |
| Time overrun on UI polish | Medium | High | Use a component library (e.g., shadcn/ui or MUI) to accelerate UI |
| Stock race conditions (concurrent updates) | High | Low | Use Supabase row-level locking / transactions for stock writes |
| OTP email delivery in demo environment | Medium | Medium | Test OTP flow early; have a manual override for demo if needed |

---

## 14. 🚫 Out-of-Scope Features (Post-MVP Backlog)

- Internal Transfers (move stock between warehouses)
- Barcode / QR code scanning
- Supplier management portal
- Purchase Order (PO) generation
- Demand forecasting & analytics
- Mobile app (iOS / Android)
- Email / SMS push notifications
- Shipping carrier integrations (FedEx, DHL, etc.)
- Custom reporting / export to PDF or CSV
- Bulk product import via CSV/Excel
- Multi-currency / multi-language support

---

## 15. 🗓️ MVP Build Timeline (Today — 9:36 AM to 5:00 PM)

| Time Block | Focus | Owner Suggestion |
|------------|-------|-----------------|
| 9:36–11:00 AM | Auth + Supabase setup + Role system + DB schema | Person 1 (Backend) |
| 9:36–11:00 AM | UI scaffold: Layout, Nav, Dashboard skeleton | Person 2 (Frontend) |
| 9:36–11:00 AM | Product model + CRUD APIs | Person 3 (Backend) |
| 11:00–1:00 PM | Receipts + Delivery Orders (API + UI) | Person 1 + 2 |
| 11:00–1:00 PM | Dashboard KPIs wired to real data | Person 3 |
| 1:00–1:30 PM | **Lunch break** | All |
| 1:30–3:00 PM | Stock Adjustments + Low Stock Alerts + Multi-warehouse | Person 1 + 3 |
| 1:30–3:00 PM | Filters + Move History / Ledger UI | Person 2 |
| 3:00–4:00 PM | Integration testing + bug fixes + role enforcement check | All |
| 4:00–4:30 PM | UI polish + demo data seeding | All |
| 4:30–5:00 PM | Demo rehearsal + PRD/presentation prep | All |

---

*StockSense PRD v1.0 — Built for Odoo Hackathon 2026*
