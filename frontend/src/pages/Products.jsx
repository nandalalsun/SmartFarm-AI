import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Toast from '../components/Toast';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    category: 'FEED',
    unit: 'KG',
  });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);

  const toggleDropdown = productId => {
    setOpenDropdownId(openDropdownId === productId ? null : productId);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name) {
      setToast({ message: 'Product name is required', type: 'error' });
      return;
    }
    try {
      await api.post('/products', form);
      setForm({
        name: '',
        costPrice: '',
        sellingPrice: '',
        currentStock: '',
        category: 'FEED',
        unit: 'KG',
      });
      fetchProducts();
      setToast({ message: '✓ Product added successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to add product', err);
      setToast({ message: err.response?.data?.message || 'Failed to add product', type: 'error' });
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setAddProductModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          + Add Product
        </button>
      </div>
      {/* Add Product Modal */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Add Product</h2>
              <button
                onClick={() => setAddProductModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async e => {
                await handleSubmit(e);
                setAddProductModalOpen(false);
              }}
              className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Row 1 */}
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="FEED">FEED</option>
                <option value="MEDICINE">MEDICINE</option>
                <option value="LIVE_CHICK">LIVE CHICK</option>
                <option value="MEAT">MEAT</option>
                <option value="EGGS">EGGS</option>
                <option value="OTHER">OTHER</option>
              </select>

              <input
                type="text"
                placeholder="Product Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="KG">KG</option>
                <option value="BAG">BAG</option>
                <option value="PIECE">PIECE</option>
              </select>

              {/* Row 2 */}
              <input
                type="number"
                placeholder="Purchase Cost"
                value={form.costPrice}
                onChange={e => setForm({ ...form, costPrice: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              <input
                type="number"
                placeholder="Selling Price"
                value={form.sellingPrice}
                onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              <input
                type="number"
                placeholder="Stock"
                value={form.currentStock}
                onChange={e => setForm({ ...form, currentStock: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              {/* Actions */}
              <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAddProductModalOpen(false)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Purchase Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Selling Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                  {p.currentStock} {p.unit && <span className="text-slate-500">({p.unit})</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                  ₹{p.costPrice?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-mono font-semibold">
                  ₹{p.sellingPrice?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-mono font-semibold">
                  ₹{(p.costPrice * p.currentStock).toFixed(2)}
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 whitespace-nowrap relative">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsAdjustmentModalOpen(true);
                      }}
                      className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-violet-500/20"
                    >
                      Adjust Stock
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty state... */}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-12 h-12 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <span>No products found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />

      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => {
          fetchProducts();
          setToast({ message: 'Stock adjusted successfully', type: 'success' });
        }}
      />
    </div>
  );
}
