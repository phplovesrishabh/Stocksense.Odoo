import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle, Inbox, Truck, RefreshCw, BookOpen } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KPICard from '../../components/ui/KPICard';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
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
      // Ensure backend endpoints /dashboard/kpis and /ledger exist, 
      // or at least handle the failure gracefully
      const [kpisRes, ledgerRes] = await Promise.all([
        api.get('/dashboard/kpis').catch(() => ({ data: { data: {
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F6EF7]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of your inventory and warehouse activities"
        action={
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
              Live <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
            <button 
              onClick={fetchData}
              className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#252836] rounded-lg transition-colors"
              title="Refresh"
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Low Stock Alert Banner */}
        {showLowStockBanner && kpis?.low_stock_items > 0 && (
          <div className="bg-[#FEF3C7] border-l-4 border-amber-500 rounded-r-lg p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-medium text-amber-900">
                {kpis.low_stock_items} products are below their reorder threshold.
                <button 
                  onClick={() => navigate('/products?filter=low_stock')}
                  className="ml-2 text-amber-700 hover:text-amber-800 underline underline-offset-2"
                >
                  View Low Stock Items &rarr;
                </button>
              </p>
            </div>
            <button 
              onClick={() => setShowLowStockBanner(false)}
              className="text-amber-700 hover:text-amber-900"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Products"
            value={kpis?.total_products || 0}
            icon={Package}
            onClick={() => navigate('/products')}
          />
          <KPICard
            title="Low Stock"
            value={kpis?.low_stock_items || 0}
            icon={AlertTriangle}
            alertType={kpis?.low_stock_items > 0 ? "warning" : undefined}
            onClick={() => navigate('/products?filter=low_stock')}
          />
          <KPICard
            title="Out of Stock"
            value={kpis?.out_of_stock_items || 0}
            icon={XCircle}
            alertType={kpis?.out_of_stock_items > 0 ? "danger" : undefined}
            onClick={() => navigate('/products?filter=out_of_stock')}
          />
          <KPICard
            title="Pending Receipts"
            value={kpis?.pending_receipts || 0}
            icon={Inbox}
            onClick={() => navigate('/receipts?filter=pending')}
          />
          <KPICard
            title="Pending Deliveries"
            value={kpis?.pending_deliveries || 0}
            icon={Truck}
            onClick={() => navigate('/deliveries?filter=pending')}
          />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 py-4 border-b border-[#2E3348] flex justify-between items-center bg-[#1A1D27]">
            <h2 className="text-lg font-semibold text-[#F1F5F9]">Recent Activity</h2>
            {/* Future filters can go here */}
          </div>
          
          <div className="overflow-x-auto flex-1">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#252836] flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-[#4F6EF7]" />
                </div>
                <h3 className="text-[#F1F5F9] font-medium mb-1">No recent activity</h3>
                <p className="text-[#94A3B8] text-sm max-w-sm">
                  Movements, receipts, and deliveries will appear here once recorded.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#94A3B8] uppercase bg-[#252836] sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Reference</th>
                    <th className="px-6 py-3 font-semibold">Product</th>
                    <th className="px-6 py-3 font-semibold">Warehouse</th>
                    <th className="px-6 py-3 font-semibold">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E3348]">
                  {recentActivity.map((act) => (
                    <tr key={act.transaction_id} className="hover:bg-[#252836]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-[#94A3B8]">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={act.type} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[#F1F5F9]">
                        {act.reference_id?.split('-')[0] || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F1F5F9]">{act.product_name}</div>
                        <div className="text-xs text-[#94A3B8] font-mono mt-0.5">{act.product_sku}</div>
                      </td>
                      <td className="px-6 py-4 text-[#F1F5F9]">
                        {act.warehouse_name}
                      </td>
                      <td className="px-6 py-4 text-[#94A3B8]">
                        {act.performed_by?.full_name || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
