import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useRealtimeSync from '../../hooks/useRealtimeSync';

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    fetchReceipts();
  }, [statusFilter]);

  useRealtimeSync(['receipts'], () => {
    fetchReceipts();
  });

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      let endpoint = '/receipts';
      if (statusFilter) {
        endpoint += `?status=${statusFilter}`;
      }
      
      const res = await api.get(endpoint).catch(() => ({ data: { data: [] } }));
      setReceipts(res.data.data || []);
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
        title={<span className="text-gradient">Receipts</span>}
        subtitle="Manage incoming stock from suppliers"
        action={
          <Link 
            to="/receipts/new" 
            className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40"
          >
            <Plus className="w-4 h-4" />
            Create Receipt
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
              placeholder="Search receipts..."
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
              <option value="draft" className="bg-background-dark text-white">Draft</option>
              <option value="waiting" className="bg-background-dark text-white">Waiting</option>
              <option value="ready" className="bg-background-dark text-white">Ready</option>
              <option value="done" className="bg-background-dark text-white">Done</option>
              <option value="cancelled" className="bg-background-dark text-white">Cancelled</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card flex-1 flex flex-col min-h-[400px]"
        >
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-brand-primary" />
              Incoming Receipts
            </h2>
            <div className="text-sm text-text-secondary font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {receipts.length} {receipts.length === 1 ? 'Receipt' : 'Receipts'}
            </div>
          </div>

          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
              <thead className="text-xs text-text-secondary uppercase tracking-wider sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold rounded-l-xl">ID & Date</th>
                  <th className="px-6 py-4 font-semibold">Supplier</th>
                  <th className="px-6 py-4 font-semibold">Warehouse</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-text-muted">
                      <div className="relative mx-auto w-12 h-12">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-brand-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 font-medium">Loading receipts...</p>
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-text-muted">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Inbox className="w-10 h-10 text-brand-primary/50" />
                      </div>
                      <h3 className="text-white font-medium text-lg mb-2">No receipts found</h3>
                      <p className="max-w-sm mx-auto text-text-secondary">Try adjusting your filters or create a new receipt.</p>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {receipts.map((receipt, idx) => (
                      <motion.tr 
                        key={receipt.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (idx * 0.03) }}
                        className="bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <td className="px-6 py-4 rounded-l-xl">
                          <div className="font-medium font-mono text-white group-hover:text-brand-primary transition-colors">{receipt.id.slice(0,8).toUpperCase()}</div>
                          <div className="text-xs text-text-secondary mt-1">{new Date(receipt.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        </td>
                        <td className="px-6 py-4 text-white">
                          <span className="px-2.5 py-1 bg-white/10 rounded-lg text-sm font-medium border border-white/5 group-hover:border-white/20 transition-colors">
                            {receipt.supplier_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <span className="w-2 h-2 rounded-full bg-brand-tertiary shadow-[0_0_8px_rgba(236,72,153,0.5)]"></span>
                            {receipt.warehouse?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge status={receipt.status} />
                        </td>
                        <td className="px-6 py-4 text-right rounded-r-xl">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/receipts/${receipt.id}`}
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
