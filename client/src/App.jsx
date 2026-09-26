import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import useAuthStore from './store/authStore';
import ProtectedRoute from './router/ProtectedRoute';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth pages
import LoginPage        from './features/auth/LoginPage';
import SignupPage       from './features/auth/SignupPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

// Features
import DashboardPage    from './features/dashboard/DashboardPage';
import ProductsListPage from './features/products/ProductsListPage';
import ProductFormPage  from './features/products/ProductFormPage';
import ProductDetailPage from './features/products/ProductDetailPage';

import ReceiptsList     from './features/receipts/ReceiptsList';
import ReceiptForm      from './features/receipts/ReceiptForm';
import ReceiptDetail    from './features/receipts/ReceiptDetail';

import DeliveriesList   from './features/deliveries/DeliveriesList';
import DeliveryForm     from './features/deliveries/DeliveryForm';
import DeliveryDetail   from './features/deliveries/DeliveryDetail';

import AdjustmentsList  from './features/adjustments/AdjustmentsList';
import AdjustmentForm   from './features/adjustments/AdjustmentForm';
import AdjustmentDetail from './features/adjustments/AdjustmentDetail';

import LedgerPage       from './features/ledger/LedgerPage';

import SettingsPage     from './features/settings/SettingsPage';
import ProfilePage      from './features/profile/ProfilePage';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  // Initialize Supabase session once on mount
  useEffect(() => {
    let unsub;
    initialize().then((fn) => { unsub = fn; });
    return () => unsub?.();
  }, [initialize]);

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1D27',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#1A1D27' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#1A1D27' } },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes — all roles */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'staff']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/products"    element={<ProductsListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            {/* Phase 2+ routes will be added here */}
            <Route path="/receipts"    element={<ReceiptsList />} />
            <Route path="/receipts/new" element={<ReceiptForm />} />
            <Route path="/receipts/:id" element={<ReceiptDetail />} />
            
            <Route path="/deliveries"  element={<DeliveriesList />} />
            <Route path="/deliveries/new" element={<DeliveryForm />} />
            <Route path="/deliveries/:id" element={<DeliveryDetail />} />
            
            <Route path="/adjustments" element={<AdjustmentsList />} />
            <Route path="/adjustments/new" element={<AdjustmentForm />} />
            <Route path="/adjustments/:id" element={<AdjustmentDetail />} />
            
            <Route path="/ledger"      element={<LedgerPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Manager-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route element={<AppLayout />}>
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
