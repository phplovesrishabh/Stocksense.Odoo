import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Save, Loader2, ArrowLeft, Info, Package, Building2, ListOrdered, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../../lib/api';

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

export default function AdjustmentForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    warehouse_id: '',
    product_id: '',
    physical_qty: '',
    reason: ''
  });

  const [recordedQty, setRecordedQty] = useState(0);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/products')
      ]);
      setWarehouses(whRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load initial data');
      console.error(err);
    }
  };

  useEffect(() => {
    if (formData.warehouse_id && formData.product_id) {
      const product = products.find(p => p.id === formData.product_id);
      if (product && product.stock_levels) {
        const stock = product.stock_levels.find(s => s.warehouse_id === formData.warehouse_id);
        setRecordedQty(stock ? stock.quantity : 0);
      } else {
        setRecordedQty(0);
      }
    } else {
      setRecordedQty(0);
    }
  }, [formData.warehouse_id, formData.product_id, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.warehouse_id || !formData.product_id || formData.physical_qty === '' || !formData.reason) {
      return toast.error('Please fill in all fields');
    }

    setLoading(true);
    try {
      await api.post('/adjustments', {
        ...formData,
        physical_qty: parseInt(formData.physical_qty)
      });
      toast.success('Adjustment submitted for approval');
      navigate('/adjustments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create adjustment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const delta = (formData.physical_qty !== '' ? parseInt(formData.physical_qty) : 0) - recordedQty;

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-background-dark/50 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/adjustments" className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">New Adjustment</h1>
            <p className="text-sm font-medium text-text-muted mt-1">Submit a manual stock modification</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="mb-6 glass-card rounded-xl p-4 flex items-start gap-4 border-brand-primary/20 bg-brand-primary/5">
            <div className="p-2 bg-brand-primary/20 rounded-lg text-brand-primary shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-primary mb-1">Approval Required</h3>
              <p className="text-sm text-text-secondary">
                Adjustments require manager approval before they take effect. The stock level will remain unchanged until approved.
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="glass-card rounded-2xl border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
            
            <div className="p-8 space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Warehouse
                  </label>
                  <select
                    value={formData.warehouse_id}
                    onChange={e => setFormData({...formData, warehouse_id: e.target.value})}
                    className="glass-input w-full"
                  >
                    <option value="" className="bg-background-dark">Select Warehouse...</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id} className="bg-background-dark">{w.name}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4" /> Product
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={e => setFormData({...formData, product_id: e.target.value})}
                    className="glass-input w-full"
                    disabled={!formData.warehouse_id}
                  >
                    <option value="" className="bg-background-dark">Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="bg-background-dark">{p.sku} - {p.name}</option>
                    ))}
                  </select>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Recorded Qty</label>
                  <input
                    type="number"
                    value={recordedQty}
                    disabled
                    className="glass-input w-full opacity-50 cursor-not-allowed font-mono text-xl"
                  />
                </div>

                <div className="space-y-2 relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-xl blur-lg transition-opacity opacity-50 group-hover:opacity-100" />
                  <label className="text-xs font-bold text-white uppercase tracking-wider relative">Physical Qty (New)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.physical_qty}
                    onChange={e => setFormData({...formData, physical_qty: e.target.value})}
                    className="glass-input w-full font-mono text-xl text-white placeholder:text-white/20 relative"
                    placeholder="Count"
                    disabled={!formData.product_id}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Delta</label>
                  <div className={`glass-input w-full font-mono text-xl flex items-center bg-transparent
                    ${formData.physical_qty === '' ? 'text-text-muted' : delta > 0 ? 'text-emerald-400 font-bold' : delta < 0 ? 'text-rose-400 font-bold' : 'text-text-muted'}`}
                  >
                    {formData.physical_qty === '' ? '-' : (delta > 0 ? '+' : '') + delta}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4" /> Reason for Adjustment
                </label>
                <textarea
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  rows="3"
                  className="glass-input w-full resize-none text-white"
                  placeholder="e.g., Inventory recount, damaged goods..."
                />
              </motion.div>

            </div>

            <motion.div variants={itemVariants} className="px-8 py-5 border-t border-white/5 bg-black/20 flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.warehouse_id || !formData.product_id || formData.physical_qty === '' || !formData.reason}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Submit for Approval
              </button>
            </motion.div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
