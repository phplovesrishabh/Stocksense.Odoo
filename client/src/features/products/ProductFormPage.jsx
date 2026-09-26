import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const UOM_OPTIONS = ['pcs', 'kg', 'L', 'm', 'box', 'pallets', 'dozens'];

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  // Real-time SKU validation state
  const [skuChecking, setSkuChecking] = useState(false);
  const [skuAvailable, setSkuAvailable] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_of_measure: 'pcs',
    reorder_threshold: 0,
    // Only used for create
    initial_stock: 0,
    warehouse_id: '',
  });

  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    // Fetch warehouses for dropdown
    api.get('/warehouses')
      .then(res => setWarehouses(res.data.data || []))
      .catch(err => console.error('Failed to load warehouses', err));

    if (isEdit) {
      api.get(`/products/${id}`)
        .then(res => {
          const product = res.data.data;
          setFormData({
            name: product.name || '',
            sku: product.sku || '',
            category: product.category || '',
            unit_of_measure: product.unit_of_measure || 'pcs',
            reorder_threshold: product.reorder_threshold || 0,
          });
          setSkuAvailable(true);
        })
        .catch(err => {
          toast.error('Failed to load product details');
          navigate('/products');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  // Debounced SKU uniqueness check
  useEffect(() => {
    if (!formData.sku) {
      setSkuAvailable(null);
      return;
    }
    
    // In edit mode, if SKU hasn't changed from original, don't validate as error
    // Simple workaround: just assume API validates it. But let's do real-time anyway.
    
    const timeoutId = setTimeout(async () => {
      setSkuChecking(true);
      try {
        const res = await api.get(`/products/search?q=${formData.sku}`);
        const matches = res.data.data || [];
        const exactMatch = matches.find(p => p.sku === formData.sku);
        
        if (exactMatch && exactMatch.id !== id) {
          setSkuAvailable(false);
        } else {
          setSkuAvailable(true);
        }
      } catch (err) {
        setSkuAvailable(null);
      } finally {
        setSkuChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.sku, id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skuAvailable === false) {
      toast.error('Please fix SKU errors before saving.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, formData);
        toast.success('Product updated successfully.');
        navigate(`/products/${id}`);
      } else {
        const res = await api.post('/products', formData);
        toast.success('Product created successfully.');
        navigate(`/products/${res.data.data.id || ''}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-4 border-b border-white/5 bg-background-dark/50 backdrop-blur-xl flex items-center gap-4 sticky top-0 z-10">
        <Link to="/products" className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-tight">
            {isEdit ? 'Edit Product' : 'Create Product'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto glass-card rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Widget A"
                  className="w-full glass-input px-4 py-3 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                  SKU <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. WGT-001"
                    className={`w-full glass-input px-4 py-3 outline-none ${
                      skuAvailable === false ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 
                      skuAvailable === true ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {skuChecking && <Loader2 className="w-4 h-4 text-text-muted animate-spin" />}
                    {!skuChecking && skuAvailable === true && <CheckCircle2 className="w-4 h-4 text-emerald-500 drop-shadow-sm" />}
                    {!skuChecking && skuAvailable === false && <XCircle className="w-4 h-4 text-rose-500 drop-shadow-sm" />}
                  </div>
                </div>
                {!skuChecking && skuAvailable === false && (
                  <p className="text-xs font-medium text-rose-400 mt-1 ml-1">✕ SKU already in use</p>
                )}
                {!skuChecking && skuAvailable === true && formData.sku && (
                  <p className="text-xs font-medium text-emerald-400 mt-1 ml-1">✓ Available</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  className="w-full glass-input px-4 py-3 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                  Unit of Measure <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleChange}
                  className="w-full glass-input px-4 py-3 outline-none appearance-none cursor-pointer text-white"
                >
                  {UOM_OPTIONS.map(uom => (
                    <option key={uom} value={uom} className="bg-background-dark text-white">
                      {uom.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                  Reorder Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  name="reorder_threshold"
                  value={formData.reorder_threshold}
                  onChange={handleChange}
                  className="w-full glass-input px-4 py-3 outline-none"
                />
                <p className="text-xs text-text-muted ml-1">Alert triggers below this quantity</p>
              </div>

              {!isEdit && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="initial_stock"
                      value={formData.initial_stock}
                      onChange={handleChange}
                      className="w-full glass-input px-4 py-3 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">
                      Warehouse (for initial stock)
                    </label>
                    <select
                      name="warehouse_id"
                      value={formData.warehouse_id}
                      onChange={handleChange}
                      required={formData.initial_stock > 0}
                      className="w-full glass-input px-4 py-3 outline-none appearance-none cursor-pointer text-white"
                    >
                      <option value="" className="bg-background-dark text-text-muted">Select a warehouse...</option>
                      {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id} className="bg-background-dark text-white">{wh.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="pt-8 mt-6 border-t border-white/5 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-6 py-2.5 rounded-xl font-medium text-text-secondary border border-white/10 hover:bg-white/5 hover:text-white transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || skuAvailable === false}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isEdit ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
