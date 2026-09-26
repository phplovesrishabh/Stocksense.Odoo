import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Loader2, Package } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';

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
      <div className="flex-1 flex items-center justify-center bg-[#0F1117]">
        <Loader2 className="w-8 h-8 text-[#4F6EF7] animate-spin" />
      </div>
    );
  }

  const totalStock = product.stock_levels?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  let status = 'in_stock';
  if (totalStock === 0) status = 'out_of_stock';
  else if (totalStock <= (product.reorder_threshold || 0)) status = 'low_stock';

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0F1117]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#2E3348] flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/products" className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#252836] rounded-lg transition-colors self-start mt-1">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#F1F5F9]">{product.name}</h1>
              <span className="px-2 py-1 bg-[#1E2130] text-[#94A3B8] border border-[#2E3348] rounded font-mono text-sm">
                {product.sku}
              </span>
              <Badge status={status} />
            </div>
            <p className="text-sm text-[#94A3B8]">
              Added on {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isManager && (
          <Link 
            to={`/products/${id}/edit`}
            className="flex items-center gap-2 bg-[#252836] hover:bg-[#2E3348] border border-[#2E3348] text-[#F1F5F9] px-4 py-2 rounded-lg font-medium transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit Product
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1A1D27] border border-[#2E3348] rounded-xl p-5">
            <div className="text-sm text-[#94A3B8] mb-1">Category</div>
            <div className="font-semibold text-[#F1F5F9]">{product.category}</div>
          </div>
          <div className="bg-[#1A1D27] border border-[#2E3348] rounded-xl p-5">
            <div className="text-sm text-[#94A3B8] mb-1">Unit of Measure</div>
            <div className="font-semibold text-[#F1F5F9] uppercase">{product.unit_of_measure}</div>
          </div>
          <div className="bg-[#1A1D27] border border-[#2E3348] rounded-xl p-5">
            <div className="text-sm text-[#94A3B8] mb-1">Reorder Threshold</div>
            <div className="font-semibold text-[#F1F5F9]">{product.reorder_threshold || '—'}</div>
          </div>
          <div className="bg-[#1A1D27] border border-[#2E3348] rounded-xl p-5">
            <div className="text-sm text-[#94A3B8] mb-1">Total Stock</div>
            <div className="font-semibold text-[#F1F5F9] text-xl text-[#4F6EF7]">{totalStock}</div>
          </div>
        </div>

        {/* Stock by Warehouse Table */}
        <div className="bg-[#1A1D27] border border-[#2E3348] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2E3348] bg-[#1A1D27]">
            <h2 className="text-lg font-semibold text-[#F1F5F9] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#94A3B8]" />
              Stock by Warehouse
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#94A3B8] uppercase bg-[#252836]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Warehouse</th>
                  <th className="px-6 py-3 font-semibold">Location</th>
                  <th className="px-6 py-3 font-semibold">Current Qty</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3348]">
                {(!product.stock_levels || product.stock_levels.length === 0) ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-[#94A3B8]">
                      No stock records found for this product.
                    </td>
                  </tr>
                ) : (
                  product.stock_levels.map((sl) => {
                    let st = 'in_stock';
                    if (sl.quantity === 0) st = 'out_of_stock';
                    else if (sl.quantity <= (product.reorder_threshold || 0)) st = 'low_stock';

                    return (
                      <tr key={sl.warehouse_id} className="hover:bg-[#252836]/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#F1F5F9]">
                          {sl.warehouses?.name || sl.warehouse_name || 'Unknown Warehouse'}
                        </td>
                        <td className="px-6 py-4 text-[#94A3B8]">
                          {sl.warehouses?.location || sl.location || '—'}
                        </td>
                        <td className="px-6 py-4 text-[#F1F5F9] font-medium">
                          {sl.quantity}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={st} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Movements (last 5) */}
        <div className="bg-[#1A1D27] border border-[#2E3348] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2E3348] bg-[#1A1D27]">
            <h2 className="text-lg font-semibold text-[#F1F5F9]">Recent Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#94A3B8] uppercase bg-[#252836]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold text-right">Delta</th>
                  <th className="px-6 py-3 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3348]">
                {recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-[#94A3B8]">
                      No recent movements.
                    </td>
                  </tr>
                ) : (
                  recentMovements.map((move) => (
                    <tr key={move._id} className="hover:bg-[#252836]/50 transition-colors">
                      <td className="px-6 py-4 text-[#94A3B8]">
                        {new Date(move.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={move.actionType} />
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${(move.details?.quantityDelta || 0) > 0 ? 'text-emerald-500' : (move.details?.quantityDelta || 0) < 0 ? 'text-red-500' : 'text-[#F1F5F9]'}`}>
                        {(move.details?.quantityDelta || 0) > 0 ? '+' : ''}{move.details?.quantityDelta || 0}
                      </td>
                      <td className="px-6 py-4 font-mono text-[#F1F5F9]">
                        {(move.details?.receiptId || move.details?.deliveryId || move.details?.adjustmentId || '-').split('-')[0]}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
