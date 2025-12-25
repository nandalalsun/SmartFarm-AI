import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Toast from '../components/Toast';

export default function Products() {
  const [products, setProducts] = useState([]);
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

  const toggleDropdown = productId => {
    setOpenDropdownId(openDropdownId === productId ? null : productId);
  };

  const handleDelete = async productId => {
    try {
      await api.delete(`/products/${productId}`);
      fetchProducts();
      setToast({ message: '✓ Product deleted successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to delete product', err);
      setToast({
        message: err.response?.data?.message || 'Failed to delete product',
        type: 'error',
      });
    }
  };

  const handleUpdate = async productId => {
    try {
      await api.put(`/products/${productId}`, form);
      fetchProducts();
      setToast({ message: '✓ Product updated successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to update product', err);
      setToast({
        message: err.response?.data?.message || 'Failed to update product',
        type: 'error',
      });
    }
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
      <h1 className="text-3xl font-bold text-white mb-8">Products</h1>

      {/* Add Form */}
      <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="FEED">FEED</option>
            <option value="MEDICINE">MEDICINE</option>
            <option value="LIVE_CHICK">LIVE CHICK</option>
            <option value="MEAT">MEAT</option>
            <option value="EGGS">EGGS</option>
          </select>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="number"
            placeholder="Purchase Cost"
            value={form.costPrice}
            onChange={e => setForm({ ...form, costPrice: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="number"
            placeholder="Selling Price"
            value={form.sellingPrice}
            onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {/* Row 2 */}
          <select
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="KG">KG</option>
            <option value="BAG">BAG</option>
            <option value="PIECE">PIECE</option>
          </select>
          <input
            type="number"
            placeholder="Stock"
            value={form.currentStock}
            onChange={e => setForm({ ...form, currentStock: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2 rounded-lg transition-colors md:col-span-4"
          >
            Add
          </button>
        </form>
      </div>

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
                  ${p.costPrice?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-mono font-semibold">
                  ${p.sellingPrice?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-mono font-semibold">
                  ${(p.costPrice * p.currentStock).toFixed(2)}
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 whitespace-nowrap relative">
                  <button
                    onClick={() => toggleDropdown(p.id)}
                    className="p-2 rounded-lg hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>

                  {/* Dropdown - only show for this product */}
                  {openDropdownId === p.id && (
                    <>
                      <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-slate-800 border border-slate-700 z-20">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleUpdate(p.id);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit Product
                          </button>
                        </div>
                        <div className="py-1 border-t border-slate-700">
                          <button
                            onClick={() => {
                              handleDelete(p.id);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-3"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2.171 2.171 0 0116.138 21H7.862a2.171 2.171 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Product
                          </button>
                        </div>
                      </div>

                      {/* Click outside to close */}
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                    </>
                  )}
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
    </div>
  );
}
