-- ============================================================
--  StockSense — Initial Schema Migration
--  Migration: 001_initial_schema
--  Created:   2026-09-26
-- ============================================================
-- Run this in Supabase → SQL Editor (run as superuser / service role)
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- ============================================================
-- 1. USER PROFILES
--    Extends Supabase auth.users with role + display name.
--    Populated automatically via trigger on auth.users INSERT.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT 'staff'
                          CHECK (role IN ('manager', 'staff')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.user_profiles          IS 'Extended user data linked to Supabase Auth.';
COMMENT ON COLUMN public.user_profiles.role     IS 'manager = full access; staff = operational access only';


-- ============================================================
-- 2. WAREHOUSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.warehouses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  location    TEXT,
  created_by  UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.warehouses IS 'Physical warehouse / storage locations.';


-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  sku               TEXT        NOT NULL UNIQUE,
  category          TEXT        NOT NULL,
  unit_of_measure   TEXT        NOT NULL DEFAULT 'units',
  reorder_threshold INT         NOT NULL DEFAULT 0 CHECK (reorder_threshold >= 0),
  created_by        UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.products                   IS 'Master product / SKU catalog.';
COMMENT ON COLUMN public.products.reorder_threshold IS 'Low-stock alert fires when stock_levels.quantity falls below this value.';


-- ============================================================
-- 4. STOCK LEVELS  (one row per product × warehouse)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_levels (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID        NOT NULL REFERENCES public.products(id)   ON DELETE CASCADE,
  warehouse_id  UUID        NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  quantity      INT         NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);

COMMENT ON TABLE public.stock_levels IS 'Live stock quantity per product per warehouse. Never deleted; updated atomically.';


-- ============================================================
-- 5. RECEIPTS  (incoming stock headers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.receipts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT        NOT NULL,
  warehouse_id  UUID        NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'cancelled')),
  notes         TEXT,
  created_by    UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at  TIMESTAMPTZ,
  validated_by  UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE  public.receipts        IS 'Incoming stock receipt headers.';
COMMENT ON COLUMN public.receipts.status IS 'State machine: draft → waiting → ready → done | cancelled';


-- ============================================================
-- 6. RECEIPT ITEMS  (line items for each receipt)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.receipt_items (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id  UUID  NOT NULL REFERENCES public.receipts(id)  ON DELETE CASCADE,
  product_id  UUID  NOT NULL REFERENCES public.products(id)  ON DELETE RESTRICT,
  quantity    INT   NOT NULL CHECK (quantity > 0)
);

COMMENT ON TABLE public.receipt_items IS 'Individual product lines within a receipt.';


-- ============================================================
-- 7. DELIVERIES  (outgoing stock headers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deliveries (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_ref   TEXT,
  warehouse_id   UUID        NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  status         TEXT        NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'cancelled')),
  notes          TEXT,
  created_by     UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at   TIMESTAMPTZ,
  validated_by   UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE  public.deliveries        IS 'Outgoing delivery order headers.';
COMMENT ON COLUMN public.deliveries.status IS 'State machine: draft → waiting → ready → done | cancelled';


-- ============================================================
-- 8. DELIVERY ITEMS  (line items for each delivery)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id  UUID  NOT NULL REFERENCES public.deliveries(id)  ON DELETE CASCADE,
  product_id   UUID  NOT NULL REFERENCES public.products(id)    ON DELETE RESTRICT,
  quantity     INT   NOT NULL CHECK (quantity > 0)
);

COMMENT ON TABLE public.delivery_items IS 'Individual product lines within a delivery order.';


-- ============================================================
-- 9. STOCK ADJUSTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.adjustments (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID        NOT NULL REFERENCES public.products(id)   ON DELETE RESTRICT,
  warehouse_id  UUID        NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  recorded_qty  INT         NOT NULL CHECK (recorded_qty >= 0),
  physical_qty  INT         NOT NULL CHECK (physical_qty >= 0),
  -- delta is computed: physical_qty - recorded_qty (can be negative)
  delta         INT         GENERATED ALWAYS AS (physical_qty - recorded_qty) STORED,
  reason        TEXT,
  status        TEXT        NOT NULL DEFAULT 'pending_approval'
                            CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  submitted_by  UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_by   UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ
);

COMMENT ON TABLE  public.adjustments              IS 'Physical count vs. system count discrepancy correction requests.';
COMMENT ON COLUMN public.adjustments.delta        IS 'Auto-computed: physical_qty - recorded_qty. Positive = gain, negative = loss.';
COMMENT ON COLUMN public.adjustments.status       IS 'Pending approval by manager before stock is corrected.';


-- ============================================================
-- INDEXES
-- ============================================================

-- stock_levels — most-queried table, needs fast lookups
CREATE INDEX IF NOT EXISTS idx_stock_levels_product_id   ON public.stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse_id ON public.stock_levels(warehouse_id);

-- products — SKU search
CREATE INDEX IF NOT EXISTS idx_products_sku      ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- receipts / deliveries — status filtering for dashboard KPIs
CREATE INDEX IF NOT EXISTS idx_receipts_status       ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_warehouse_id ON public.receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at   ON public.receipts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deliveries_status       ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_warehouse_id ON public.deliveries(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at   ON public.deliveries(created_at DESC);

-- adjustments — approval queue
CREATE INDEX IF NOT EXISTS idx_adjustments_status       ON public.adjustments(status);
CREATE INDEX IF NOT EXISTS idx_adjustments_submitted_by ON public.adjustments(submitted_by);


-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create user_profiles row whenever a new user signs up
-- Role and full_name are read from raw_user_meta_data set during signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update stock_levels.updated_at on quantity change
CREATE OR REPLACE FUNCTION public.touch_stock_level()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_stock_level ON public.stock_levels;
CREATE TRIGGER trg_touch_stock_level
  BEFORE UPDATE ON public.stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_stock_level();

-- Auto-update products.updated_at on any change
CREATE OR REPLACE FUNCTION public.touch_product()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_product ON public.products;
CREATE TRIGGER trg_touch_product
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_product();


-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all user-facing tables
ALTER TABLE public.user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjustments     ENABLE ROW LEVEL SECURITY;


-- ─── user_profiles ───────────────────────────────────────────
-- Any authenticated user can read all profiles (needed for ledger "performed_by")
CREATE POLICY "auth_users_read_profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);


-- ─── warehouses ──────────────────────────────────────────────
-- All authenticated users can read warehouses
CREATE POLICY "auth_read_warehouses"
  ON public.warehouses FOR SELECT
  TO authenticated
  USING (true);

-- Only managers can create / update warehouses
CREATE POLICY "manager_write_warehouses"
  ON public.warehouses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "manager_update_warehouses"
  ON public.warehouses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );


-- ─── products ────────────────────────────────────────────────
CREATE POLICY "auth_read_products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "manager_insert_products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "manager_update_products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );


-- ─── stock_levels ────────────────────────────────────────────
CREATE POLICY "auth_read_stock_levels"
  ON public.stock_levels FOR SELECT
  TO authenticated
  USING (true);

-- Only service role (backend) updates stock — enforced via API, not direct client writes
CREATE POLICY "service_role_write_stock"
  ON public.stock_levels FOR ALL
  TO service_role
  USING (true);


-- ─── receipts ────────────────────────────────────────────────
CREATE POLICY "auth_read_receipts"
  ON public.receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_insert_receipts"
  ON public.receipts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "auth_update_receipts"
  ON public.receipts FOR UPDATE
  TO authenticated
  USING (true);  -- backend enforces status machine; any auth user can trigger status change


-- ─── receipt_items ───────────────────────────────────────────
CREATE POLICY "auth_read_receipt_items"
  ON public.receipt_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_write_receipt_items"
  ON public.receipt_items FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ─── deliveries ──────────────────────────────────────────────
CREATE POLICY "auth_read_deliveries"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_insert_deliveries"
  ON public.deliveries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "auth_update_deliveries"
  ON public.deliveries FOR UPDATE
  TO authenticated
  USING (true);


-- ─── delivery_items ──────────────────────────────────────────
CREATE POLICY "auth_read_delivery_items"
  ON public.delivery_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_write_delivery_items"
  ON public.delivery_items FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ─── adjustments ─────────────────────────────────────────────
-- Managers see all; staff see only their own submissions
CREATE POLICY "manager_read_all_adjustments"
  ON public.adjustments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "staff_read_own_adjustments"
  ON public.adjustments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = submitted_by
    AND NOT EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "auth_insert_adjustments"
  ON public.adjustments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

-- Only managers can approve/reject (update status + reviewed_by fields)
CREATE POLICY "manager_update_adjustments"
  ON public.adjustments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'manager'
    )
  );


-- ============================================================
-- REALTIME PUBLICATIONS
-- Enable Supabase Realtime on tables that drive live UI updates
-- ============================================================
-- Run these only if not already added in Supabase dashboard
DO $$
BEGIN
  -- stock_levels: drives dashboard KPIs
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'stock_levels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_levels;
  END IF;

  -- receipts: pending receipts count on dashboard
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'receipts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.receipts;
  END IF;

  -- deliveries: pending deliveries count on dashboard
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'deliveries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
  END IF;

  -- adjustments: pending approval count
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'adjustments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.adjustments;
  END IF;
END $$;


-- ============================================================
-- SEED: DEFAULT WAREHOUSE (ensures A5 assumption is met)
-- One warehouse must exist before any product can be created.
-- Upsert so re-running this migration is idempotent.
-- ============================================================
-- (Commented out — run separately with actual manager user id after first signup)
-- INSERT INTO public.warehouses (name, location)
-- VALUES ('Warehouse A', 'Main Site')
-- ON CONFLICT DO NOTHING;


-- ============================================================
-- Done. Schema created successfully.
-- ============================================================
