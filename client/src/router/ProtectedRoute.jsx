import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Props:
 *   allowedRoles  {string[]}  Optional. If provided, only users with
 *                             one of these roles can access the route.
 *                             Defaults to any authenticated user.
 *   redirectTo    {string}    Where to send unauthenticated users.
 *                             Defaults to '/login'.
 */
export default function ProtectedRoute({
  allowedRoles = ['manager', 'staff'],
  redirectTo   = '/login',
}) {
  const { session, user, loading } = useAuthStore();

  // While session is being resolved, show nothing (avoids flash-of-redirect)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!session || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Logged in but wrong role → redirect to dashboard (not a 403 page for simplicity)
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
