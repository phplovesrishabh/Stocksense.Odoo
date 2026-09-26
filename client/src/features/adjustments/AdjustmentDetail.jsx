import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Loader2, Calendar, User, Package, Building2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

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
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!adjustment) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-6 border-b border-white/5 bg-background-dark/50 backdrop-blur-xl flex items-start justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/adjustments" className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-colors self-start mt-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Adjustment</h1>
              <span className="px-2.5 py-1 bg-white/5 text-text-secondary border border-white/10 rounded-md font-mono text-xs font-medium uppercase tracking-wider shadow-sm">
                {adjustment.id.split('-')[0]}
              </span>
              <Badge status={adjustment.status} />
            </div>
            <p className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Submitted on {new Date(adjustment.submitted_at).toLocaleString()}</span>
              <span className="text-white/20">|</span>
              <User className="w-4 h-4" />
              <span>By {adjustment.submitted_by_user?.full_name || 'System'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div 
          className="max-w-4xl mx-auto space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-colors" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Warehouse</div>
              </div>
              <div className="text-xl font-heading font-bold text-white">{adjustment.warehouse?.name}</div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-secondary/10 rounded-full blur-2xl group-hover:bg-brand-secondary/20 transition-colors" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-secondary/10 text-brand-secondary rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Product</div>
              </div>
              <div className="text-xl font-heading font-bold text-white">{adjustment.product?.name}</div>
              <div className="text-xs text-text-muted font-mono mt-1">{adjustment.product?.sku}</div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 border-brand-primary/20 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl transition-colors" />
            <h3 className="text-sm font-medium text-white mb-6 uppercase tracking-wider">Stock Modification</h3>
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-xs text-text-muted mb-2 uppercase tracking-wider">Recorded (Before)</div>
                <div className="text-4xl font-mono text-white/80">{adjustment.recorded_qty}</div>
              </div>
              
              <div className="flex flex-col items-center flex-1 px-8">
                <div className="h-px bg-white/20 w-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background-dark/80 px-4 text-lg font-mono font-bold rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                    <span className={adjustment.delta > 0 ? 'text-emerald-400' : adjustment.delta < 0 ? 'text-rose-400' : 'text-text-muted'}>
                      {adjustment.delta > 0 ? '+' : ''}{adjustment.delta}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-text-muted mb-2 uppercase tracking-wider">Physical (After)</div>
                <div className="text-4xl font-mono text-white">{adjustment.physical_qty}</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 text-text-secondary text-sm mb-3 uppercase tracking-wider font-medium">
              <HelpCircle className="w-4 h-4 text-brand-secondary" />
              Reason
            </div>
            <p className="text-white text-base leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">{adjustment.reason}</p>
          </motion.div>

          {/* Actions Footer */}
          {adjustment.status === 'pending_approval' && isManager && (
            <motion.div variants={itemVariants} className="flex justify-end gap-4 pt-4 mt-6 border-t border-white/10">
              <button
                onClick={() => handleAction('reject')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve Adjustment
              </button>
            </motion.div>
          )}

          {adjustment.status !== 'pending_approval' && (
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-4 flex items-center justify-center border-white/10 bg-white/[0.02]">
              <p className="text-sm text-text-secondary flex items-center gap-2">
                <span className={`font-medium ${adjustment.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {adjustment.status === 'approved' ? 'Approved' : 'Rejected'}
                </span> 
                by {adjustment.reviewed_by_user?.full_name || 'Unknown'} 
                on {new Date(adjustment.reviewed_at).toLocaleString()}
              </p>
            </motion.div>
          )}
          
        </motion.div>
      </div>
    </div>
  );
}
