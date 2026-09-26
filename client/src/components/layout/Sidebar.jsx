import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Inbox, 
  Truck, 
  Scale, 
  BookOpen, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import clsx from 'clsx';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuthStore();
  const isManager = user?.role === 'manager';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Receipts', path: '/receipts', icon: Inbox },
    { name: 'Deliveries', path: '/deliveries', icon: Truck },
    { name: 'Adjustments', path: '/adjustments', icon: Scale },
    { name: 'Ledger', path: '/ledger', icon: BookOpen },
  ];

  return (
    <div 
      className={clsx(
        "flex flex-col bg-[#1A1D27] border-r border-[#2E3348] transition-all duration-300 relative shrink-0",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#2E3348]">
        <Package2 className="w-8 h-8 text-[#4F6EF7] shrink-0" />
        {!collapsed && (
          <span className="ml-3 font-bold text-[#F1F5F9] text-lg truncate">
            StockSense
          </span>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center px-4 py-3 mx-2 rounded-lg transition-colors duration-150 relative",
              isActive 
                ? "bg-[#252836] text-[#F1F5F9]" 
                : "text-[#94A3B8] hover:bg-[#252836] hover:text-[#F1F5F9]"
            )}
            title={collapsed ? item.name : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4F6EF7] rounded-r-full -ml-2" />
                )}
                <item.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-[#4F6EF7]" : "")} />
                {!collapsed && (
                  <span className="ml-3 font-medium text-[15px] truncate">{item.name}</span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {isManager && (
          <>
            <div className="my-4 border-t border-[#2E3348] mx-4" />
            <NavLink
              to="/settings"
              className={({ isActive }) => clsx(
                "flex items-center px-4 py-3 mx-2 rounded-lg transition-colors duration-150 relative",
                isActive 
                  ? "bg-[#252836] text-[#F1F5F9]" 
                  : "text-[#94A3B8] hover:bg-[#252836] hover:text-[#F1F5F9]"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4F6EF7] rounded-r-full -ml-2" />
                  )}
                  <Settings className={clsx("w-5 h-5 shrink-0", isActive ? "text-[#4F6EF7]" : "")} />
                  {!collapsed && (
                    <span className="ml-3 font-medium text-[15px] truncate">Settings</span>
                  )}
                </>
              )}
            </NavLink>
          </>
        )}
      </div>

      {/* User Profile & Collapse Toggle */}
      <div className="border-t border-[#2E3348] p-4 flex flex-col gap-3">
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex justify-center items-center py-2 text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg hover:bg-[#252836] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Profile */}
        <div className={clsx("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] flex items-center justify-center text-white font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F1F5F9] truncate">
                {user?.email}
              </p>
              <span className={clsx(
                "inline-block px-2 py-0.5 mt-0.5 rounded-full text-[11px] font-medium",
                isManager ? "bg-violet-500/20 text-violet-300" : "bg-indigo-500/20 text-indigo-300"
              )}>
                {isManager ? 'Manager' : 'Staff'}
              </span>
            </div>
          )}
        </div>

        {/* Logout */}
        {!collapsed ? (
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#94A3B8] hover:text-[#EF4444] rounded-lg transition-colors hover:bg-red-500/10 mt-1"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="font-medium">Log Out</span>
          </button>
        ) : (
          <button
            onClick={signOut}
            className="flex justify-center items-center w-full py-2 text-[#94A3B8] hover:text-[#EF4444] rounded-lg transition-colors hover:bg-red-500/10 mt-1"
            title="Log Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
