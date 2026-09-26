import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    fetchReceipts();
  }, [statusFilter]);

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
        title="Receipts" 
        subtitle="Manage incoming stock from suppliers"
        action={
          <Link 
            to="/receipts/new" 
            className="flex items-center gap-2 bg-gradient-to-r from-[#4F6EF7] to-[#7C3AED] hover:from-[#5b78fa] hover:to-[#8749f7] text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-[#4F6EF7]/20"
          >
            <Plus className="w-4 h-4" />
            Create Receipt
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input 
              type="text"
              placeholder="Search receipts..."
              className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg pl-10 pr-4 py-2 outline-none transition-all placeholder-[#475569]"
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <select
              value={statusFilter}
              onChange={handleFilter}
              className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg pl-9 pr-4 py-2 outline-none appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#94A3B8] uppercase bg-[#252836] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID & Date</th>
                  <th className="px-6 py-4 font-semibold">Supplier</th>
                  <th className="px-6 py-4 font-semibold">Warehouse</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3348]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8]">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4F6EF7] mx-auto"></div>
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8]">
                      No receipts found.
                    </td>
                  </tr>
                ) : (
                  receipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-[#252836]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F1F5F9]">{receipt.id.slice(0,8).toUpperCase()}</div>
                        <div className="text-xs text-[#94A3B8] mt-0.5">{new Date(receipt.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-[#F1F5F9]">{receipt.supplier_name}</td>
                      <td className="px-6 py-4 text-[#F1F5F9]">{receipt.warehouse?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={receipt.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/receipts/${receipt.id}`}
                            className="p-2 text-[#94A3B8] hover:text-[#4F6EF7] hover:bg-[#4F6EF7]/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
