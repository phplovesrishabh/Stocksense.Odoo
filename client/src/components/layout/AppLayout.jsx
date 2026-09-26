import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-bg-base text-text-primary font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative overflow-hidden flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
