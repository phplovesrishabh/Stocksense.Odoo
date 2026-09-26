import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Loader2, Package, Activity, Layers, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';

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

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const [product, setProduct] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const [productRes, ledgerRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/ledger?product_id=${id}&limit=5`).catch(() => ({ data: { data: [] } }))
      ]);

      setProduct(productRes.data.data);
      setRecentMovements(ledgerRes.data.data || []);
    } catch (err) {
      console.error(err);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  const totalStock = product.stock_levels?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  let status = 'in_stock';
  if (totalStock === 0) status = 'out_of_stock';
  else if (totalStock <= (product.reorder_threshold || 0)) status = 'low_stock';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-background-dark/50 backdrop-blur-xl flex items-start justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/products" className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-colors self-start mt-1">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">{product.name}</h1>
              <span className="px-2.5 py-1 bg-white/5 text-text-secondary border border-white/10 rounded-md font-mono text-xs font-medium uppercase tracking-wider shadow-sm">
                {product.sku}
              </span>
              <Badge status={status} />
            </div>
            <p className="text-sm font-medium text-text-muted flex items-center gap-2">
              <span>Added on {new Date(product.created_at).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {isManager && (
          <Link 
            to={`/products/${id}/edit`}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Product
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div 
          className="max-w-6xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-colors" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Category</div>
              </div>
              <div className="text-xl font-heading font-bold text-white">{product.category}</div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-secondary/10 rounded-full blur-2xl group-hover:bg-brand-secondary/20 transition-colors" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-secondary/10 text-brand-secondary rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Unit of Measure</div>
              </div>
              <div className="text-xl font-heading font-bold text-white uppercase">{product.unit_of_measure}</div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Reorder Threshold</div>
              </div>
              <div className="text-xl font-heading font-bold text-white">{product.reorder_threshold || '—'}</div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 relative overflow-hidden group border-brand-primary/20">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl group-hover:bg-brand-primary/30 transition-colors" />
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-primary/20 text-brand-primary rounded-lg shadow-lg shadow-brand-primary/20">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Stock</div>
              </div>
              <div className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-primary/80">
                {totalStock}
              </div>
            </motion.div>
          </div>

          {/* Stock by Warehouse Table */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <Package className="w-5 h-5 text-brand-primary" />
                Stock by Warehouse
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Warehouse</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Current Qty</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(!product.stock_levels || product.stock_levels.length === 0) ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-text-secondary font-medium">
                        No stock records found for this product.
                      </td>
                    </tr>
                  ) : (
                    product.stock_levels.map((sl) => {
                      let st = 'in_stock';
                      if (sl.quantity === 0) st = 'out_of_stock';
                      else if (sl.quantity <= (product.reorder_threshold || 0)) st = 'low_stock';

                      return (
                        <tr key={sl.warehouse_id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-medium text-white">
                            {sl.warehouses?.name || sl.warehouse_name || 'Unknown Warehouse'}
                          </td>
                          <td className="px-6 py-4 text-text-secondary">
                            {sl.warehouses?.location || sl.location || '—'}
                          </td>
                          <td className="px-6 py-4 text-white font-mono text-right text-lg">
                            {sl.quantity}
                          </td>
                          <td className="px-6 py-4 flex justify-center">
                            <Badge status={st} />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Movements (last 5) */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-3">
                <Activity className="w-5 h-5 text-brand-secondary" />
                Recent Movements
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Delta</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-text-secondary font-medium">
                        No recent movements found.
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((move) => (
                      <tr key={move._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-medium text-text-secondary">
                          {new Date(move.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={move.actionType} />
                        </td>
                        <td className={`px-6 py-4 text-right font-mono text-base ${
                          (move.details?.quantityDelta || 0) > 0 ? 'text-emerald-400 font-medium' : 
                          (move.details?.quantityDelta || 0) < 0 ? 'text-rose-400 font-medium' : 
                          'text-white'
                        }`}>
                          {(move.details?.quantityDelta || 0) > 0 ? '+' : ''}{move.details?.quantityDelta || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-white/5 border border-white/5 rounded font-mono text-xs text-text-muted group-hover:text-text-secondary transition-colors">
                            {(move.details?.receiptId || move.details?.deliveryId || move.details?.adjustmentId || '-').split('-')[0]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
