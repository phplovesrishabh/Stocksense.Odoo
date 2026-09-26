import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, ArrowLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import api from '../../lib/api';

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
      // Find the stock level for this product in this warehouse
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
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="New Stock Adjustment" 
        subtitle="Submit a request to manually adjust stock levels"
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
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden">
            
            <div className="p-6 border-b border-[#2E3348] bg-[#1A1D27]/50 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#4F6EF7] mt-0.5" />
              <div className="text-sm text-[#94A3B8]">
                Adjustments require manager approval before they take effect. The stock level will remain unchanged until approved.
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Warehouse</label>
                  <select
                    value={formData.warehouse_id}
                    onChange={e => setFormData({...formData, warehouse_id: e.target.value})}
                    className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none transition-all"
                  >
                    <option value="">Select Warehouse...</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Product</label>
                  <select
                    value={formData.product_id}
                    onChange={e => setFormData({...formData, product_id: e.target.value})}
                    className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none transition-all"
                    disabled={!formData.warehouse_id}
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Recorded Quantity</label>
                  <input
                    type="number"
                    value={recordedQty}
                    disabled
                    className="w-full bg-[#252836] border border-[#2E3348] text-[#94A3B8] cursor-not-allowed rounded-lg px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#F1F5F9]">Physical Quantity (New)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.physical_qty}
                    onChange={e => setFormData({...formData, physical_qty: e.target.value})}
                    className="w-full bg-[#0F1117] border border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none transition-all font-mono"
                    placeholder="Enter actual count"
                    disabled={!formData.product_id}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#94A3B8]">Difference (Delta)</label>
                  <div className={`w-full bg-[#0F1117] border border-[#2E3348] rounded-lg px-3 py-2 font-mono font-medium flex items-center
                    ${formData.physical_qty === '' ? 'text-[#94A3B8]' : delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-[#94A3B8]'}`}
                  >
                    {formData.physical_qty === '' ? '-' : (delta > 0 ? '+' : '') + delta}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-[#94A3B8]">Reason for Adjustment</label>
                <textarea
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  rows="3"
                  className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none transition-all resize-none"
                  placeholder="e.g., Inventory recount, damaged goods, etc."
                />
              </div>

            </div>

            <div className="px-6 py-4 border-t border-[#2E3348] flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.warehouse_id || !formData.product_id || formData.physical_qty === '' || !formData.reason}
                className="flex items-center gap-2 bg-[#4F6EF7] hover:bg-[#5b78fa] text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md shadow-[#4F6EF7]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Submit for Approval
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
