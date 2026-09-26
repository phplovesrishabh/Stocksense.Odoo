import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit2 } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const searchQuery = searchParams.get('q') || '';
  const filterStock = searchParams.get('filter') || 'all';

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, filterStock]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd pass filters to backend
      let endpoint = '/products';
      if (searchQuery) {
        endpoint = `/products/search?q=${encodeURIComponent(searchQuery)}`;
      }
      
      const res = await api.get(endpoint).catch(() => ({ data: { data: [] } }));
      let fetched = res.data.data || [];

      // Client-side stock filtering (if backend doesn't support it directly)
      if (filterStock !== 'all') {
        fetched = fetched.filter(p => {
          const totalStock = p.stock_levels?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
          if (filterStock === 'low_stock') return totalStock > 0 && totalStock <= (p.reorder_threshold || 0);
          if (filterStock === 'out_of_stock') return totalStock === 0;
          if (filterStock === 'in_stock') return totalStock > (p.reorder_threshold || 0);
          return true;
        });
      }

      setProducts(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    if (val) {
      searchParams.set('q', val);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleFilter = (e) => {
    const val = e.target.value;
    if (val && val !== 'all') {
      searchParams.set('filter', val);
    } else {
      searchParams.delete('filter');
    }
    setSearchParams(searchParams);
  };

  const getStockStatus = (product) => {
    const totalStock = product.stock_levels?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
    if (totalStock === 0) return 'out_of_stock';
    if (totalStock <= (product.reorder_threshold || 0)) return 'low_stock';
    return 'in_stock';
  };

  const getTotalStock = (product) => {
    return product.stock_levels?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Products" 
        subtitle="Manage your inventory catalog and stock levels"
        action={
          isManager && (
            <Link 
              to="/products/new" 
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F6EF7] to-[#7C3AED] hover:from-[#5b78fa] hover:to-[#8749f7] text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-[#4F6EF7]/20"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input 
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg pl-10 pr-4 py-2 outline-none transition-all placeholder-[#475569]"
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <select
              value={filterStock}
              onChange={handleFilter}
              className="w-full bg-[#1E2130] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg pl-9 pr-4 py-2 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#94A3B8] uppercase bg-[#252836] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product & SKU</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Total Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3348]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8]">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4F6EF7] mx-auto"></div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8]">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#252836]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F1F5F9]">{product.name}</div>
                        <div className="text-xs text-[#94A3B8] font-mono mt-0.5">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-[#F1F5F9]">{product.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-[#F1F5F9] text-base">{getTotalStock(product)}</span>
                          <span className="text-xs text-[#94A3B8] uppercase">{product.unit_of_measure}</span>
                        </div>
                        {product.reorder_threshold > 0 && (
                          <div className="text-[11px] text-[#94A3B8] mt-0.5">Threshold: {product.reorder_threshold}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={getStockStatus(product)} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/products/${product.id}`}
                            className="p-2 text-[#94A3B8] hover:text-[#4F6EF7] hover:bg-[#4F6EF7]/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {isManager && (
                            <Link
                              to={`/products/${product.id}/edit`}
                              className="p-2 text-[#94A3B8] hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
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
