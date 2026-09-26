import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import useRealtimeSync from '../../hooks/useRealtimeSync';

export default function AdjustmentsList() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    fetchAdjustments();
  }, [statusFilter]);

  useRealtimeSync(['adjustments'], () => {
    fetchAdjustments();
  });

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      let endpoint = '/adjustments';
      if (statusFilter) {
        endpoint += `?status=${statusFilter}`;
      }
      
      const res = await api.get(endpoint).catch(() => ({ data: { data: [] } }));
      setAdjustments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    const val = e.target.value;
    if (val) {
      searchParams.set('status', val);
    } else {
      searchParams.delete('status');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title={<span className="text-gradient">Stock Adjustments</span>}
        subtitle={isManager ? "Review and approve stock adjustments" : "Submit stock adjustments for approval"}
        action={
          <Link
            to="/adjustments/new"
            className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full glass-input pl-12 pr-4 py-3 outline-none"
            />
          </div>
          <div className="relative w-full sm:w-56 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            <select
              value={statusFilter}
              onChange={handleFilter}
              className="w-full glass-input pl-12 pr-10 py-3 outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-background-dark text-white">All Statuses</option>
              <option value="pending_approval" className="bg-background-dark text-white">Pending Approval</option>
              <option value="approved" className="bg-background-dark text-white">Approved</option>
              <option value="rejected" className="bg-background-dark text-white">Rejected</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card flex-1 flex flex-col min-h-[400px]"
        >
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-primary" />
              Adjustments Log
            </h2>
            <div className="text-sm text-text-secondary font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {adjustments.length} {adjustments.length === 1 ? 'Adjustment' : 'Adjustments'}
            </div>
          </div>
          <div className="flex-1 overflow-x-auto p-2">
            <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-y-2">
              <thead className="text-xs text-text-secondary uppercase tracking-wider sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold rounded-l-xl">Date</th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Warehouse</th>
                  <th className="px-6 py-4 font-semibold">Delta</th>
                  <th className="px-6 py-4 font-semibold">Submitted By</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-text-muted">
                      <div className="relative mx-auto w-12 h-12">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-brand-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 font-medium">Loading adjustments...</p>
                    </td>
                  </tr>
                ) : adjustments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-0">
                      <EmptyState 
                        title="No adjustments found"
                        description={statusFilter ? "No adjustments match your filters." : "Create a new adjustment to request a stock update."}
                        icon={Plus}
                      />
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {adjustments.map((adj, idx) => (
                      <motion.tr 
                        key={adj.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (idx * 0.03) }}
                        className="bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <td className="px-6 py-4 text-text-secondary rounded-l-xl">
                          {new Date(adj.submitted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-brand-primary transition-colors">{adj.product?.name || 'Unknown Product'}</div>
                          <div className="text-xs text-text-secondary font-mono mt-1">{adj.product?.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-white">
                          <span className="px-2.5 py-1 bg-white/10 rounded-lg text-sm font-medium border border-white/5 group-hover:border-white/20 transition-colors">
                            {adj.warehouse?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-sm font-mono font-medium ${adj.delta > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : adj.delta < 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/10 text-text-secondary border border-white/20'}`}>
                            {adj.delta > 0 ? '+' : ''}{adj.delta}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">
                          {adj.submitted_by_user?.full_name || 'System'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={adj.status} />
                        </td>
                        <td className="px-6 py-4 text-right rounded-r-xl">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/adjustments/${adj.id}`}
                              className="p-2 text-text-muted hover:text-white glass-button"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
