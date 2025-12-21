import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    costPrice: '', 
    sellingPrice: '', 
    currentStock: '',
    category: 'FEED',
    unit: 'KG'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await api.post('/products', form);
      setForm({ name: '', costPrice: '', sellingPrice: '', currentStock: '' });
      fetchProducts();
    } catch (err) {
      console.error("Failed to add product", err);
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
             onChange={e => setForm({...form, category: e.target.value})}
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
            onChange={e => setForm({...form, name: e.target.value})}
            className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="number"
            placeholder="Purchase Cost"
            value={form.costPrice}
            onChange={e => setForm({...form, costPrice: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="number"
            placeholder="Selling Price"
            value={form.sellingPrice}
            onChange={e => setForm({...form, sellingPrice: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {/* Row 2 */}
          <select
            value={form.unit}
            onChange={e => setForm({...form, unit: e.target.value})}
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
            onChange={e => setForm({...form, currentStock: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2 rounded-lg transition-colors md:col-span-4">
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Purchase Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Selling Price</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {products.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-white">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{p.currentStock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">${p.costPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-mono">${p.sellingPrice}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-slate-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
