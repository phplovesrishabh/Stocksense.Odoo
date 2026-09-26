import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
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
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-medium transition-all border border-white/10 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto space-y-6"
        >
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/10 rounded-full blur-[80px] -z-10" />

            <h2 className="font-heading text-xl font-bold text-white mb-6">Receipt Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Supplier Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.supplier_name}
                  onChange={e => setFormData({...formData, supplier_name: e.target.value})}
                  className="glass-input w-full"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Destination Warehouse <span className="text-rose-400">*</span></label>
                <select
                  required
                  value={formData.warehouse_id}
                  onChange={e => setFormData({...formData, warehouse_id: e.target.value})}
                  className="glass-input w-full appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1em]"
                >
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id} className="bg-background-dark text-white">{wh.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-bold text-white">Line Items</h2>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 text-sm text-brand-primary hover:text-white bg-brand-primary/10 hover:bg-brand-primary/20 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-text-muted text-sm bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                    No items added. Click <strong className="text-white font-medium">Add Product</strong> to begin.
                  </div>
                ) : (
                  items.map((item, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 items-center bg-white/[0.03] p-4 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex-1 relative">
                        <select
                          value={item.product_id}
                          onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                          className="glass-input w-full appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1em]"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id} className="bg-background-dark text-white">{p.sku} - {p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="glass-input w-full"
                          placeholder="Qty"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-3 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                Save as Draft
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
