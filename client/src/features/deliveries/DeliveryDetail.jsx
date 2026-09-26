import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, FileEdit, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const fetchDelivery = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/deliveries/${id}`);
      setDelivery(res.data.data);
    } catch (err) {
      toast.error('Failed to load delivery details');
      navigate('/deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/deliveries/${id}/status`, { status: newStatus });
      toast.success(`Delivery marked as ${newStatus}`);
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const validateDelivery = async () => {
    setActionLoading(true);
    try {
      await api.post(`/deliveries/${id}/validate`);
      toast.success('Delivery validated and stock updated!');
      setShowValidateModal(false);
      fetchDelivery();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation failed. Check stock availability.');
      setShowValidateModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const steps = ['draft', 'waiting', 'ready', 'done'];
  const currentStepIndex = delivery ? steps.indexOf(delivery.status) : -1;

  if (loading || !delivery) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4F6EF7]"></div>
      </div>
    );
  }

  const isCancelled = delivery.status === 'cancelled';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title={`Delivery ${delivery.id.slice(0,8).toUpperCase()}`} 
        subtitle={`Customer Ref: ${delivery.customer_ref}`}
        action={
          <button 
            onClick={() => navigate('/deliveries')}
            className="flex items-center gap-2 bg-[#1A1D27] hover:bg-[#252836] text-[#F1F5F9] px-4 py-2 rounded-lg font-medium transition-all border border-[#2E3348]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stepper */}
        {!isCancelled && (
          <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] p-6 mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#2E3348] z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#4F6EF7] to-[#7C3AED] z-0 transition-all duration-500" 
                style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
              ></div>
              
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-[#1E2130] border-[#4F6EF7] text-[#4F6EF7]' : 'bg-[#1E2130] border-[#2E3348] text-[#475569]'}`}>
                      {idx === 0 && <FileEdit className="w-5 h-5" />}
                      {idx === 1 && <Clock className="w-5 h-5" />}
                      {idx === 2 && <CheckCircle className="w-5 h-5" />}
                      {idx === 3 && <CheckCircle className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-semibold uppercase ${isCompleted ? 'text-[#F1F5F9]' : 'text-[#475569]'}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden">
              <div className="p-4 border-b border-[#2E3348] flex items-center justify-between">
                <h3 className="font-semibold text-[#F1F5F9]">Line Items</h3>
                <Badge status={delivery.status} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#94A3B8] uppercase bg-[#252836]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">SKU</th>
                      <th className="px-4 py-3 font-semibold">Product Name</th>
                      <th className="px-4 py-3 font-semibold text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E3348]">
                    {delivery.delivery_items?.map((item) => (
                      <tr key={item.id} className="hover:bg-[#252836]/50">
                        <td className="px-4 py-3 font-mono text-[#94A3B8]">{item.product.sku}</td>
                        <td className="px-4 py-3 text-[#F1F5F9]">{item.product.name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#F1F5F9]">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar / Actions */}
          <div className="space-y-6">
            <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] p-5 space-y-4">
              <h3 className="font-semibold text-[#F1F5F9] mb-2">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Date:</span>
                  <span className="text-[#F1F5F9]">{new Date(delivery.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Source Warehouse:</span>
                  <span className="text-[#F1F5F9]">{delivery.warehouse?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Created By:</span>
                  <span className="text-[#F1F5F9]">{delivery.created_by_user?.full_name}</span>
                </div>
                {delivery.validated_by && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="text-emerald-500/70">Validated By:</span>
                    <span>System</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            {!isCancelled && delivery.status !== 'done' && (
              <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] p-5 space-y-3">
                <h3 className="font-semibold text-[#F1F5F9] mb-2">Actions</h3>
                
                {delivery.status === 'draft' && (
                  <>
                    <button onClick={() => updateStatus('waiting')} disabled={actionLoading} className="w-full bg-[#1E2130] hover:bg-[#252836] border border-[#2E3348] text-[#F1F5F9] py-2 rounded-lg transition-colors">
                      Mark as Waiting
                    </button>
                    <button onClick={() => updateStatus('cancelled')} disabled={actionLoading} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg transition-colors">
                      Cancel Delivery
                    </button>
                  </>
                )}

                {delivery.status === 'waiting' && (
                  <>
                    <button onClick={() => updateStatus('ready')} disabled={actionLoading} className="w-full bg-[#1E2130] hover:bg-[#252836] border border-[#2E3348] text-[#F1F5F9] py-2 rounded-lg transition-colors">
                      Mark as Ready
                    </button>
                    <button onClick={() => updateStatus('draft')} disabled={actionLoading} className="w-full bg-transparent hover:bg-[#1E2130] text-[#94A3B8] border border-transparent py-2 rounded-lg transition-colors">
                      Back to Draft
                    </button>
                    <button onClick={() => updateStatus('cancelled')} disabled={actionLoading} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg transition-colors">
                      Cancel Delivery
                    </button>
                  </>
                )}

                {delivery.status === 'ready' && (
                  <>
                    <button onClick={() => setShowValidateModal(true)} disabled={actionLoading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 rounded-lg font-medium transition-all shadow-md shadow-emerald-500/20">
                      Validate Delivery
                    </button>
                    <button onClick={() => updateStatus('draft')} disabled={actionLoading} className="w-full bg-transparent hover:bg-[#1E2130] text-[#94A3B8] border border-transparent py-2 rounded-lg transition-colors mt-2">
                      Back to Draft
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validate Confirmation Modal */}
      {showValidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A1D27] border border-[#2E3348] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                <AlertTriangle className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">Validate Delivery?</h2>
              <p className="text-[#94A3B8] mb-6">
                This will deduct stock from <strong>{delivery.warehouse?.name}</strong> for {delivery.delivery_items?.length} items. This action cannot be easily undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidateModal(false)}
                  disabled={actionLoading}
                  className="flex-1 bg-[#1E2130] hover:bg-[#252836] text-[#F1F5F9] py-2.5 rounded-lg transition-colors border border-[#2E3348] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={validateDelivery}
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg transition-colors font-medium flex justify-center items-center"
                >
                  {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm & Validate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
