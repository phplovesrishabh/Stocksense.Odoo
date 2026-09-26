import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4F6EF7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0F1117]">
      <div className="px-8 py-4 border-b border-[#2E3348] flex items-center gap-4">
        <Link to="/products" className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#252836] rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">
            {isEdit ? 'Edit Product' : 'Create Product'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto bg-[#1A1D27] border border-[#2E3348] rounded-xl p-8 shadow-lg shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">Product Name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Widget A"
                  className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2 outline-none transition-all placeholder-[#475569]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">SKU <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. WGT-001"
                    className={`w-full bg-[#1E2130] border ${
                      skuAvailable === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                      skuAvailable === true ? 'border-emerald-500/50 focus:border-[#4F6EF7]' : 'border-[#2E3348] focus:border-[#4F6EF7]'
                    } focus:ring-1 text-[#F1F5F9] rounded-lg px-4 py-2 outline-none transition-all placeholder-[#475569]`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {skuChecking && <Loader2 className="w-4 h-4 text-[#94A3B8] animate-spin" />}
                    {!skuChecking && skuAvailable === true && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {!skuChecking && skuAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                {!skuChecking && skuAvailable === false && (
                  <p className="text-xs text-red-500 mt-1">✕ SKU already in use</p>
                )}
                {!skuChecking && skuAvailable === true && formData.sku && (
                  <p className="text-xs text-emerald-500 mt-1">✓ Available</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">Category <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2 outline-none transition-all placeholder-[#475569]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">Unit of Measure <span className="text-red-500">*</span></label>
                <select
                  required
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleChange}
                  className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2 outline-none appearance-none cursor-pointer"
                >
                  {UOM_OPTIONS.map(uom => (
                    <option key={uom} value={uom}>{uom.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">Reorder Threshold</label>
                <input
                  type="number"
                  min="0"
                  name="reorder_threshold"
                  value={formData.reorder_threshold}
                  onChange={handleChange}
                  className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2 outline-none transition-all"
                />
                <p className="text-xs text-[#94A3B8]">Alert triggers below this quantity</p>
              </div>

              {!isEdit && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Initial Stock</label>
                    <input
                      type="number"
                      min="0"
                      name="initial_stock"
                      value={formData.initial_stock}
                      onChange={handleChange}
                      className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Warehouse (for initial stock)</label>
                    <select
                      name="warehouse_id"
                      value={formData.warehouse_id}
                      onChange={handleChange}
                      required={formData.initial_stock > 0}
                      className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select a warehouse...</option>
                      {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-[#2E3348] flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-6 py-2 rounded-lg font-medium text-[#F1F5F9] border border-[#2E3348] hover:bg-[#252836] transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || skuAvailable === false}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-[#4F6EF7] to-[#7C3AED] hover:from-[#5b78fa] hover:to-[#8749f7] transition-all shadow-md shadow-[#4F6EF7]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEdit ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
