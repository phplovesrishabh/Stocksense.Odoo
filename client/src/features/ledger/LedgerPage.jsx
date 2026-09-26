import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Loader2, BookOpen, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useRealtimeSync from '../../hooks/useRealtimeSync';

export default function LedgerPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  useRealtimeSync(['receipts', 'deliveries', 'adjustments'], () => {
    fetchLogs();
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ledger');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performedBy?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title={<span className="text-gradient">Stock Ledger & Audit</span>}
        subtitle="Immutable history of all inventory movements and system changes"
        action={
          <button 
            disabled
            className="flex items-center gap-2 glass-button px-5 py-2.5 rounded-xl font-medium opacity-70 cursor-not-allowed group relative"
          >
            <Download className="w-4 h-4" />
            Export CSV
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-background-dark text-text-muted text-xs px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
              Coming soon
            </span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
        >
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              placeholder="Search action or user email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-12 pr-4 py-3 outline-none"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card flex-1 flex flex-col min-h-[500px]"
        >
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-primary" />
              Audit Log
            </h2>
            <div className="text-sm text-text-secondary font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'Entry' : 'Entries'}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-y-2">
              <thead className="text-xs text-text-secondary uppercase tracking-wider sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold rounded-l-xl">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold rounded-r-xl">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-text-muted">
                      <div className="relative mx-auto w-12 h-12">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-brand-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 font-medium">Loading ledger...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-text-muted">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <BookOpen className="w-10 h-10 text-brand-primary/50" />
                      </div>
                      <h3 className="text-white font-medium text-lg mb-2">No ledger entries</h3>
                      <p className="text-sm text-center max-w-sm mx-auto text-text-secondary">
                        {searchTerm ? "No entries match your search." : "Stock movements and system actions will appear here."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredLogs.map((log, idx) => (
                      <motion.tr 
                        key={log._id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (idx * 0.02) }}
                        className="bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <td className="px-6 py-4 text-text-secondary font-mono text-xs rounded-l-xl">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={log.actionType} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-brand-primary transition-colors">{log.performedBy?.email || 'System'}</div>
                          <div className="text-xs text-text-secondary mt-1">{log.performedBy?.role || 'user'}</div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-mono text-xs whitespace-pre-wrap truncate max-w-sm rounded-r-xl">
                          <div className="bg-black/20 p-2 rounded border border-white/5 overflow-hidden text-ellipsis group-hover:border-white/10 transition-colors">
                            {JSON.stringify(log.details)}
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
