import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import useAuthStore from './store/authStore';
import ProtectedRoute from './router/ProtectedRoute';

// Auth pages
import LoginPage        from './features/auth/LoginPage';
import SignupPage       from './features/auth/SignupPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

// Placeholder dashboard — will be replaced in Phase 2
function DashboardPlaceholder() {
  const { user, signOut } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0F1117] text-white">
      <div className="bg-[#1A1D27] border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-1">Auth working! 🎉</h2>
        <p className="text-slate-400 text-sm mb-1">
          Signed in as <span className="text-white font-medium">{user?.email}</span>
        </p>
        <p className="text-slate-400 text-sm mb-6">
          Role: <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${user?.role === 'manager' ? 'bg-violet-500/20 text-violet-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
            {user?.role}
          </span>
        </p>
        <button
          onClick={signOut}
          className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition"
        >
          Sign out
        </button>
      </div>
      <p className="text-slate-600 text-xs">Dashboard UI coming in Phase 2</p>
    </div>
  );
}

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
          <Route path="/dashboard"   element={<DashboardPlaceholder />} />
          {/* Phase 2+ routes will be added here */}
          {/* <Route path="/products"    element={<ProductsPage />} /> */}
          {/* <Route path="/receipts"    element={<ReceiptsPage />} /> */}
          {/* <Route path="/deliveries"  element={<DeliveriesPage />} /> */}
          {/* <Route path="/adjustments" element={<AdjustmentsPage />} /> */}
          {/* <Route path="/ledger"      element={<LedgerPage />} /> */}
        </Route>

        {/* Manager-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
          {/* <Route path="/products/new" element={<CreateProductPage />} /> */}
        </Route>

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
