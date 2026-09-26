import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle, Inbox, Truck, RefreshCw, BookOpen, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import KPICard from '../../components/ui/KPICard';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useRealtimeSync from '../../hooks/useRealtimeSync';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showLowStockBanner, setShowLowStockBanner] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [kpisRes, ledgerRes] = await Promise.all([
        api.get('/dashboard').catch(() => ({ data: { data: {
          total_products: 0,
          low_stock_items: 0,
          out_of_stock_items: 0,
          pending_receipts: 0,
          pending_deliveries: 0
        }}})),
        api.get('/ledger?limit=10').catch(() => ({ data: { data: [] } }))
      ]);

      setKpis(kpisRes.data.data);
      setRecentActivity(ledgerRes.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useRealtimeSync(['products', 'stock_levels', 'receipts', 'deliveries', 'adjustments'], () => {
    fetchData();
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 border-t-brand-primary rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-brand-secondary rounded-full animate-spin absolute inset-0 mix-blend-screen" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title={<span className="text-gradient">Dashboard</span>}
        subtitle="Overview of your inventory and warehouse activities"
        action={
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-secondary flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Sync
            </span>
            <button 
              onClick={fetchData}
              className="p-2 text-text-secondary hover:text-white glass-button"
              title="Refresh"
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-brand-primary' : ''}`} />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {showLowStockBanner && kpis?.low_stock_items > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 24 }}
              exit={{ opacity: 0, height: 0, mb: 0, overflow: 'hidden' }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-sm font-medium text-amber-200">
                  <strong className="text-amber-400 text-lg mr-2">{kpis.low_stock_items}</strong> 
                  products are below their reorder threshold.
                  <button 
                    onClick={() => navigate('/products?filter=low_stock')}
                    className="ml-3 text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-400 transition-colors"
                  >
                    View Low Stock Items &rarr;
                  </button>
                </p>
              </div>
              <button 
                onClick={() => setShowLowStockBanner(false)}
                className="p-2 text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Total Products"
            value={kpis?.total_products || 0}
            icon={Package}
            delay={0.1}
            onClick={() => navigate('/products')}
          />
          <KPICard
            title="Low Stock"
            value={kpis?.low_stock_items || 0}
            icon={AlertTriangle}
            alertType={kpis?.low_stock_items > 0 ? "warning" : undefined}
            delay={0.2}
            onClick={() => navigate('/products?filter=low_stock')}
          />
          <KPICard
            title="Out of Stock"
            value={kpis?.out_of_stock_items || 0}
            icon={XCircle}
            alertType={kpis?.out_of_stock_items > 0 ? "danger" : undefined}
            delay={0.3}
            onClick={() => navigate('/products?filter=out_of_stock')}
          />
          <KPICard
            title="Pending Receipts"
            value={kpis?.pending_receipts || 0}
            icon={Inbox}
            delay={0.4}
            onClick={() => navigate('/receipts?filter=pending')}
          />
          <KPICard
            title="Pending Deliveries"
            value={kpis?.pending_deliveries || 0}
            icon={Truck}
            delay={0.5}
            onClick={() => navigate('/deliveries?filter=pending')}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card flex flex-col min-h-[400px]"
        >
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-primary" />
              Recent Activity
            </h2>
          </div>
          
          <div className="overflow-x-auto flex-1 p-2">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                  <BookOpen className="w-10 h-10 text-brand-primary/50" />
                </div>
                <h3 className="text-white font-medium text-lg mb-2">No recent activity</h3>
                <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
                  Movements, receipts, and deliveries will appear here once recorded.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                <thead className="text-xs text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Reference</th>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Warehouse</th>
                    <th className="px-6 py-4 font-semibold">User</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((act, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + (idx * 0.05) }}
                      key={act._id} 
                      className="bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary rounded-l-xl group-hover:text-white transition-colors">
                        {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={act.actionType} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-white/80 group-hover:text-white">
                        {(act.details?.receiptId || act.details?.deliveryId || act.details?.adjustmentId || '-').split('-')[0]}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white group-hover:text-brand-primary transition-colors">{act.details?.productName || 'Unknown Product'}</div>
                        <div className="text-xs text-text-secondary font-mono mt-1">{act.details?.productSku || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-white">
                        <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-medium border border-white/5">
                          {act.details?.warehouseName || (act.details?.warehouseId || '-').split('-')[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary rounded-r-xl">
                        {act.performedBy?.email || 'System'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
