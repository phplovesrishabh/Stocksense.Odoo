import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import Logo from '../ui/illustrations/Logo';
import useAuthStore from '../../store/authStore';
import clsx from 'clsx';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuthStore();
  const isManager = user?.role === 'manager';
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Receipts', path: '/receipts', icon: Inbox },
    { name: 'Deliveries', path: '/deliveries', icon: Truck },
    { name: 'Adjustments', path: '/adjustments', icon: Scale },
    { name: 'Ledger', path: '/ledger', icon: BookOpen },
  ];

  return (
    <motion.div 
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="flex flex-col bg-bg-surface/50 backdrop-blur-xl border-r border-white/10 relative shrink-0 z-50 h-full"
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-lg shadow-brand-primary/20 shrink-0">
          <Logo className="w-6 h-6 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-xl whitespace-nowrap"
            >
              StockSense
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-6 space-y-2 px-3 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center px-3 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden",
                isActive 
                  ? "text-white shadow-lg" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
              title={collapsed ? item.name : undefined}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavTab"
                  className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-white/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {isActive && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-primary rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={clsx("w-5 h-5 shrink-0 relative z-10 transition-colors", isActive ? "text-brand-primary" : "group-hover:text-white")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0, w: 0 }}
                    animate={{ opacity: 1, w: "auto" }}
                    exit={{ opacity: 0, w: 0 }}
                    className="ml-4 font-medium text-[15px] whitespace-nowrap relative z-10"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        {isManager && (
          <>
            <div className="my-6 border-t border-white/10 mx-4" />
            <NavLink
              to="/settings"
              className={({ isActive }) => clsx(
                "flex items-center px-3 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden",
                isActive 
                  ? "text-white" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-white/10 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-primary rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Settings className={clsx("w-5 h-5 shrink-0 relative z-10", isActive ? "text-brand-primary" : "group-hover:text-white")} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="ml-4 font-medium text-[15px] whitespace-nowrap relative z-10"
                      >
                        Settings
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          </>
        )}
      </div>

      {/* User Profile & Collapse Toggle */}
      <div className="border-t border-white/10 p-4 flex flex-col gap-3 bg-black/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-brand-primary rounded-full flex justify-center items-center text-white shadow-lg shadow-brand-primary/30 hover:scale-110 transition-transform cursor-pointer z-50 border border-white/20"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Profile */}
        <NavLink 
          to="/profile"
          className={({ isActive }) => clsx(
            "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300",
            collapsed ? "justify-center" : "",
            isActive ? "bg-white/10 border border-white/10 shadow-lg" : "hover:bg-white/5 border border-transparent"
          )}
          title="My Profile"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shrink-0 overflow-hidden shadow-inner">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.email?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">
                  {user?.fullName || user?.email}
                </p>
                <span className={clsx(
                  "inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  isManager ? "bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30" : "bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                )}>
                  {isManager ? 'Manager' : 'Staff'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Logout */}
        <button
          onClick={signOut}
          className={clsx(
            "flex items-center px-3 py-2.5 text-sm text-text-secondary hover:text-red-400 rounded-xl transition-all hover:bg-red-500/10 group",
            collapsed ? "justify-center" : "gap-3"
          )}
          title="Log Out"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="font-medium">Log Out</span>}
        </button>
      </div>
    </motion.div>
  );
}
