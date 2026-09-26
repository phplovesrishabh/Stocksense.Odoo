import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, FileEdit, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/receipts/${id}`);
      setReceipt(res.data.data);
    } catch (err) {
      toast.error('Failed to load receipt details');
      navigate('/receipts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/receipts/${id}/status`, { status: newStatus });
      toast.success(`Receipt marked as ${newStatus}`);
      fetchReceipt();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const validateReceipt = async () => {
    setActionLoading(true);
    try {
      await api.post(`/receipts/${id}/validate`);
      toast.success('Receipt validated and stock updated!');
      setShowValidateModal(false);
      fetchReceipt();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const steps = ['draft', 'waiting', 'ready', 'done'];
  const currentStepIndex = receipt ? steps.indexOf(receipt.status) : -1;

  if (loading || !receipt) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const isCancelled = receipt.status === 'cancelled';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title={`Receipt ${receipt.id.slice(0,8).toUpperCase()}`} 
        subtitle={`Supplier: ${receipt.supplier_name}`}
        action={
          <button 
            onClick={() => navigate('/receipts')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-medium transition-all border border-white/10 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Stepper */}
          {!isCancelled && (
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 z-0 rounded-full"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary z-0 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(79,110,247,0.5)]" 
                  style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
                ></div>
                
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${isCompleted ? 'bg-background-dark border-brand-primary text-brand-primary shadow-brand-primary/20 scale-110' : 'bg-background-dark border-white/10 text-text-muted'}`}>
                        {idx === 0 && <FileEdit className="w-5 h-5" />}
                        {idx === 1 && <Clock className="w-5 h-5" />}
                        {idx === 2 && <CheckCircle className="w-5 h-5" />}
                        {idx === 3 && <CheckCircle className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs font-bold tracking-wider uppercase transition-colors duration-500 ${isCompleted ? 'text-white' : 'text-text-muted'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-brand-primary" />
                    Line Items
                  </h3>
                  <Badge status={receipt.status} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-muted uppercase bg-white/[0.02]">
                      <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">SKU</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Product Name</th>
                        <th className="px-6 py-4 font-semibold tracking-wider text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {receipt.receipt_items?.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-mono text-text-secondary group-hover:text-brand-primary transition-colors">{item.product.sku}</td>
                          <td className="px-6 py-4 font-medium text-white">{item.product.name}</td>
                          <td className="px-6 py-4 text-right font-mono text-lg text-white">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Sidebar / Actions */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-5 relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
                <h3 className="font-heading font-semibold text-white">Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-text-muted">Date:</span>
                    <span className="text-white font-medium">{new Date(receipt.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-text-muted">Warehouse:</span>
                    <span className="text-white font-medium">{receipt.warehouse?.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-text-muted">Created By:</span>
                    <span className="text-white font-medium">{receipt.created_by_user?.full_name}</span>
                  </div>
                  {receipt.validated_by && (
                    <div className="flex justify-between items-center pt-2 text-emerald-400">
                      <span className="text-emerald-500/70">Validated By:</span>
                      <span className="font-medium bg-emerald-500/10 px-2 py-1 rounded">System</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Actions Card */}
              {!isCancelled && receipt.status !== 'done' && (
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-brand-secondary/5 rounded-full blur-3xl" />
                  <h3 className="font-heading font-semibold text-white relative z-10">Actions</h3>
                  
                  <div className="relative z-10 space-y-3">
                    {receipt.status === 'draft' && (
                      <>
                        <button onClick={() => updateStatus('waiting')} disabled={actionLoading} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl transition-all font-medium">
                          Mark as Waiting
                        </button>
                        <button onClick={() => updateStatus('cancelled')} disabled={actionLoading} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2.5 rounded-xl transition-all font-medium">
                          Cancel Receipt
                        </button>
                      </>
                    )}

                    {receipt.status === 'waiting' && (
                      <>
                        <button onClick={() => updateStatus('ready')} disabled={actionLoading} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl transition-all font-medium">
                          Mark as Ready
                        </button>
                        <button onClick={() => updateStatus('draft')} disabled={actionLoading} className="w-full bg-transparent hover:bg-white/5 text-text-secondary border border-transparent py-2.5 rounded-xl transition-all font-medium">
                          Back to Draft
                        </button>
                        <button onClick={() => updateStatus('cancelled')} disabled={actionLoading} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2.5 rounded-xl transition-all font-medium mt-2">
                          Cancel Receipt
                        </button>
                      </>
                    )}

                    {receipt.status === 'ready' && (
                      <>
                        <button onClick={() => setShowValidateModal(true)} disabled={actionLoading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
                          Validate Receipt
                        </button>
                        <button onClick={() => updateStatus('draft')} disabled={actionLoading} className="w-full bg-transparent hover:bg-white/5 text-text-secondary border border-transparent py-2.5 rounded-xl transition-all font-medium mt-2">
                          Back to Draft
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Validate Confirmation Modal */}
      <AnimatePresence>
        {showValidateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card border border-emerald-500/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner">
                  <AlertTriangle className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-white mb-3">Validate Receipt?</h2>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  This will add stock to <strong className="text-white">{receipt.warehouse?.name}</strong> for <strong className="text-emerald-400">{receipt.receipt_items?.length} items</strong>. This action cannot be easily undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowValidateModal(false)}
                    disabled={actionLoading}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-all border border-white/10 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={validateReceipt}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3 rounded-xl transition-all font-medium flex justify-center items-center shadow-lg shadow-emerald-500/25"
                  >
                    {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
