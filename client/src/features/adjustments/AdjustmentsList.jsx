import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';

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
        title="Stock Adjustments" 
        subtitle={isManager ? "Review and approve stock adjustments" : "Submit stock adjustments for approval"}
        action={
          <Link
            to="/adjustments/new"
            className="flex items-center gap-2 bg-[#4F6EF7] hover:bg-[#5b78fa] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] flex flex-col h-full">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-[#2E3348] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-[#0F1117] border border-[#2E3348] text-[#F1F5F9] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#4F6EF7] transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <select
                  value={statusFilter}
                  onChange={handleFilter}
                  className="w-full bg-[#0F1117] border border-[#2E3348] text-[#F1F5F9] rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-[#4F6EF7] appearance-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4F6EF7]"></div>
              </div>
            ) : adjustments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#94A3B8]">
                <div className="w-16 h-16 rounded-full bg-[#252836] flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-[#4F6EF7]" />
                </div>
                <h3 className="text-[#F1F5F9] font-medium mb-1">No adjustments found</h3>
                <p className="text-sm text-center max-w-sm">
                  {statusFilter ? "No adjustments match your filters." : "Create a new adjustment to request a stock update."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#252836] text-[#94A3B8] sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Product</th>
                    <th className="px-6 py-3 font-semibold">Warehouse</th>
                    <th className="px-6 py-3 font-semibold">Delta</th>
                    <th className="px-6 py-3 font-semibold">Submitted By</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E3348]">
                  {adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-[#252836]/50 transition-colors group">
                      <td className="px-6 py-4 text-[#94A3B8]">
                        {new Date(adj.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F1F5F9]">{adj.product?.name || 'Unknown Product'}</div>
                        <div className="text-xs text-[#94A3B8] font-mono mt-0.5">{adj.product?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-[#F1F5F9]">
                        {adj.warehouse?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-medium ${adj.delta > 0 ? 'text-emerald-400' : adj.delta < 0 ? 'text-red-400' : 'text-[#94A3B8]'}`}>
                          {adj.delta > 0 ? '+' : ''}{adj.delta}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#F1F5F9]">
                        {adj.submitted_by_user?.full_name || 'System'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={adj.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/adjustments/${adj.id}`}
                          className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors p-1.5 rounded-lg hover:bg-[#2E3348]"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">View</span>
                        </Link>
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
