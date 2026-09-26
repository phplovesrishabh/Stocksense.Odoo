import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import api from '../../lib/api';

export default function ReceiptForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    warehouse_id: '',
    supplier_name: '',
  });

  const [items, setItems] = useState([]);

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
      
      if (whRes.data.data?.length > 0) {
        setFormData(prev => ({ ...prev, warehouse_id: whRes.data.data[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load initial data');
      console.error(err);
    }
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([...items, { product_id: products[0].id, quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.warehouse_id || !formData.supplier_name) {
      return toast.error('Please fill in all required fields');
    }
    if (items.length === 0) {
      return toast.error('Please add at least one product');
    }
    
    // validate items
    for (let item of items) {
      if (!item.product_id || item.quantity <= 0) {
        return toast.error('All items must have a product and quantity > 0');
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        items
      };
      const res = await api.post('/receipts', payload);
      toast.success('Receipt draft created');
      navigate(`/receipts/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create receipt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Create Receipt" 
        subtitle="Log incoming stock as draft"
        action={
          <button 
            onClick={() => navigate('/receipts')}
            className="flex items-center gap-2 bg-[#1A1D27] hover:bg-[#252836] text-[#F1F5F9] px-4 py-2 rounded-lg font-medium transition-all border border-[#2E3348]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="bg-[#1A1D27] rounded-xl border border-[#2E3348] p-6 space-y-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Receipt Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#94A3B8]">Supplier Name <span className="text-[#EF4444]">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.supplier_name}
                  onChange={e => setFormData({...formData, supplier_name: e.target.value})}
                  className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2.5 outline-none transition-all placeholder-[#475569]"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#94A3B8]">Destination Warehouse <span className="text-[#EF4444]">*</span></label>
                <select
                  required
                  value={formData.warehouse_id}
                  onChange={e => setFormData({...formData, warehouse_id: e.target.value})}
                  className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-4 py-2.5 outline-none transition-all"
                >
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-6 border-t border-[#2E3348]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#F1F5F9]">Line Items</h2>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 text-sm text-[#4F6EF7] hover:text-[#5b78fa] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-6 text-[#94A3B8] text-sm bg-[#1E2130] rounded-lg border border-dashed border-[#2E3348]">
                    No items added. Click 'Add Product' to begin.
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center bg-[#1E2130] p-3 rounded-lg border border-[#2E3348]">
                      <div className="flex-1">
                        <select
                          value={item.product_id}
                          onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-[#F1F5F9] outline-none"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1A1D27] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-1.5 outline-none transition-all"
                          placeholder="Qty"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F6EF7] to-[#7C3AED] hover:from-[#5b78fa] hover:to-[#8749f7] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-[#4F6EF7]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                Save as Draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
