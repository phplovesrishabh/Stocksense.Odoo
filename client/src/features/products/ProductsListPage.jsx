import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../lib/api';
import useRealtimeSync from '../../hooks/useRealtimeSync';
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

  useRealtimeSync(['products', 'stock_levels'], () => {
    fetchProducts();
  });

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
        title={<span className="text-gradient">Products</span>}
        subtitle="Manage your inventory catalog and stock levels"
        action={
          isManager && (
            <Link 
              to="/products/new" 
              className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Filters Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full glass-input pl-12 pr-4 py-3 outline-none"
            />
          </div>
          
          <div className="relative w-full sm:w-56 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
            <select
              value={filterStock}
              onChange={handleFilter}
              className="w-full glass-input pl-12 pr-10 py-3 outline-none appearance-none cursor-pointer"
            >
              <option value="all" className="bg-background-dark text-white">All Stock</option>
              <option value="in_stock" className="bg-background-dark text-white">In Stock</option>
              <option value="low_stock" className="bg-background-dark text-white">Low Stock</option>
              <option value="out_of_stock" className="bg-background-dark text-white">Out of Stock</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card flex-1 flex flex-col min-h-[400px]"
        >
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-primary" />
              Product Catalog
            </h2>
            <div className="text-sm text-text-secondary font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </div>
          </div>

          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
              <thead className="text-xs text-text-secondary uppercase tracking-wider sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold rounded-l-xl">Product & SKU</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Total Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-text-muted">
                      <div className="relative mx-auto w-12 h-12">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-brand-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 font-medium">Loading products...</p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-0">
                      <EmptyState 
                        title="No products found"
                        description="Try adjusting your search filters or add a new product to get started."
                        icon={Package}
                      />
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {products.map((product, idx) => (
                      <motion.tr 
                        key={product.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (idx * 0.03) }}
                        className="bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <td className="px-6 py-4 rounded-l-xl">
                          <div className="font-medium text-white group-hover:text-brand-primary transition-colors">{product.name}</div>
                          <div className="text-xs text-text-secondary font-mono mt-1">{product.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-white">
                          <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-medium border border-white/5 group-hover:border-white/20 transition-colors">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-white text-base">{getTotalStock(product)}</span>
                            <span className="text-xs text-text-muted uppercase font-medium tracking-wider">{product.unit_of_measure}</span>
                          </div>
                          {product.reorder_threshold > 0 && (
                            <div className="text-[11px] text-text-muted mt-1 font-medium bg-black/20 inline-block px-1.5 py-0.5 rounded">
                              Threshold: <span className="text-white/80">{product.reorder_threshold}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge status={getStockStatus(product)} />
                        </td>
                        <td className="px-6 py-4 text-right rounded-r-xl">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/products/${product.id}`}
                              className="p-2 text-text-muted hover:text-white glass-button"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {isManager && (
                              <Link
                                to={`/products/${product.id}/edit`}
                                className="p-2 text-amber-500/70 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-all border border-transparent hover:border-amber-500/30"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

