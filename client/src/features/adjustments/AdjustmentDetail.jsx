import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Loader2, Calendar, User, Package, Building2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';

export default function AdjustmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adjustment, setAdjustment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  useEffect(() => {
    fetchAdjustment();
  }, [id]);

  const fetchAdjustment = async () => {
    try {
      const res = await api.get(`/adjustments/${id}`);
      setAdjustment(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load adjustment details');
      navigate('/adjustments');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this adjustment?`)) return;
    
    setActionLoading(true);
    try {
      await api.post(`/adjustments/${id}/${action}`);
      toast.success(`Adjustment ${action}d successfully`);
      fetchAdjustment();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || `Failed to ${action} adjustment`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F6EF7]"></div>
      </div>
    );
  }

  if (!adjustment) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Adjustment Details" 
        subtitle="Review stock adjustment request"
        action={
          <button 
            onClick={() => navigate('/adjustments')}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] px-4 py-2 rounded-lg hover:bg-[#252836] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Main Card */}
          <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden">
            <div className="p-6 border-b border-[#2E3348] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#F1F5F9] flex items-center gap-3">
                  Adjustment ID: <span className="font-mono text-[#94A3B8] text-base">{adjustment.id.split('-')[0]}</span>
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(adjustment.submitted_at).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {adjustment.submitted_by_user?.full_name || 'System'}
                  </div>
                </div>
              </div>
              <Badge status={adjustment.status} />
            </div>

            <div className="p-6 space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#0F1117] border border-[#2E3348] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-1">
                    <Building2 className="w-4 h-4" />
                    Warehouse
                  </div>
                  <div className="text-[#F1F5F9] font-medium">{adjustment.warehouse?.name}</div>
                </div>

                <div className="bg-[#0F1117] border border-[#2E3348] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-1">
                    <Package className="w-4 h-4" />
                    Product
                  </div>
                  <div className="text-[#F1F5F9] font-medium">{adjustment.product?.name}</div>
                  <div className="text-xs text-[#94A3B8] font-mono">{adjustment.product?.sku}</div>
                </div>
              </div>

              <div className="bg-[#0F1117] border border-[#2E3348] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[#F1F5F9] mb-4">Stock Modification</h3>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-xs text-[#94A3B8] mb-1">Recorded (Before)</div>
                    <div className="text-2xl font-mono text-[#F1F5F9]">{adjustment.recorded_qty}</div>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 px-8">
                    <div className="h-px bg-[#2E3348] w-full relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0F1117] px-2 text-sm font-mono font-medium">
                        <span className={adjustment.delta > 0 ? 'text-emerald-400' : adjustment.delta < 0 ? 'text-red-400' : 'text-[#94A3B8]'}>
                          {adjustment.delta > 0 ? '+' : ''}{adjustment.delta}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-[#94A3B8] mb-1">Physical (After)</div>
                    <div className="text-2xl font-mono text-[#F1F5F9]">{adjustment.physical_qty}</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0F1117] border border-[#2E3348] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-2">
                  <HelpCircle className="w-4 h-4" />
                  Reason
                </div>
                <p className="text-[#F1F5F9] text-sm whitespace-pre-wrap">{adjustment.reason}</p>
              </div>

            </div>

            {/* Actions Footer */}
            {adjustment.status === 'pending_approval' && isManager && (
              <div className="px-6 py-4 border-t border-[#2E3348] bg-[#1A1D27]/50 flex justify-end gap-3">
                <button
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-[#2E3348] text-[#94A3B8] hover:bg-[#EF4444]/10 hover:text-[#EF4444] hover:border-[#EF4444]/50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-[#4F6EF7] hover:bg-[#5b78fa] text-white shadow-md shadow-[#4F6EF7]/20 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve Adjustment
                </button>
              </div>
            )}

            {adjustment.status !== 'pending_approval' && (
              <div className="px-6 py-4 border-t border-[#2E3348] bg-[#0F1117]">
                <p className="text-sm text-[#94A3B8] flex items-center gap-2">
                  <span className="font-medium text-[#F1F5F9]">
                    {adjustment.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span> 
                  by {adjustment.reviewed_by_user?.full_name || 'Unknown'} 
                  on {new Date(adjustment.reviewed_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
