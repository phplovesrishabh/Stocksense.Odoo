import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Loader2, BookOpen } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';

export default function LedgerPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

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
        title="Stock Ledger & Audit" 
        subtitle="Immutable history of all inventory movements and system changes"
        action={
          <button 
            disabled
            className="flex items-center gap-2 bg-[#252836] text-[#94A3B8] px-4 py-2 rounded-lg font-medium opacity-70 cursor-not-allowed group relative"
          >
            <Download className="w-4 h-4" />
            Export CSV
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#0F1117] text-[#94A3B8] text-xs px-2 py-1 rounded border border-[#2E3348] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Coming soon
            </span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] flex flex-col h-full min-h-[500px]">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-[#2E3348] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search action or user email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F1117] border border-[#2E3348] text-[#F1F5F9] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#4F6EF7] transition-colors"
              />
            </div>
            {/* Future filters could go here */}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#4F6EF7] animate-spin" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#94A3B8]">
                <div className="w-16 h-16 rounded-full bg-[#252836] flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-[#4F6EF7]" />
                </div>
                <h3 className="text-[#F1F5F9] font-medium mb-1">No ledger entries</h3>
                <p className="text-sm text-center max-w-sm">
                  {searchTerm ? "No entries match your search." : "Stock movements and system actions will appear here."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#252836] text-[#94A3B8] sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Timestamp</th>
                    <th className="px-6 py-3 font-semibold">Action</th>
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E3348]">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-[#252836]/50 transition-colors">
                      <td className="px-6 py-4 text-[#94A3B8] font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={log.actionType} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F1F5F9]">{log.performedBy?.email || 'System'}</div>
                        <div className="text-xs text-[#94A3B8] mt-0.5">{log.performedBy?.role || 'user'}</div>
                      </td>
                      <td className="px-6 py-4 text-[#94A3B8] font-mono text-xs whitespace-pre-wrap truncate max-w-xs">
                        {JSON.stringify(log.details)}
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
