import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Toast from '../components/Toast';
import SearchableDropdown from '../components/SearchableDropdown';

const NewSale = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const [formData, setFormData] = useState({
    customerId: '',
    saleChannel: 'POS',
    paymentMethod: 'CASH',
    initialPaidAmount: '',
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState('');
  const [calcMethod, setCalcMethod] = useState('quantity');
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setCustomPrice(product.sellingPrice);
    }
  };

  const fetchData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        axios.get('/customers'),
        axios.get('/products'),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);

    // Check Stock locally (Pieces)
    if (product.currentStock < quantity) {
      setToast({
        message: `Insufficient stock! Only ${product.currentStock} pieces available for inventory.`,
        type: 'error',
      });
      return;
    }

    const price = parseFloat(customPrice) || 0;
    const qty = parseInt(quantity) || 0;
    const wt = parseFloat(weight) || 0;
    
    const lineTotal = calcMethod === 'weight' ? price * wt : price * qty;

    const newItem = {
      productId: product.id,
      name: product.name,
      unitPrice: price,
      quantity: qty,
      weight: calcMethod === 'weight' ? wt : null,
      calcMethod,
      lineTotal,
    };

    setCart([...cart, newItem]);
    setToast({ message: '', type: '' });
    setSelectedProduct('');
    setQuantity(1);
    setWeight('');
    setCustomPrice('');
  };

  const removeFromCart = index => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.lineTotal, 0);
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    const paid = parseFloat(formData.initialPaidAmount) || 0;
    return Math.max(0, total - paid);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: '', type: '' });

    try {
      if (cart.length === 0) throw new Error('Cart is empty');
      if (!formData.customerId) throw new Error('Select a customer');

      const payload = {
        customerId: formData.customerId,
        initialPaidAmount: parseFloat(formData.initialPaidAmount) || 0,
        paymentMethod: formData.paymentMethod,
        saleChannel: formData.saleChannel,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          weight: item.weight,
          unitPrice: item.unitPrice,
        })),
      };

      await axios.post('/sales', payload);
      setToast({ message: '✓ Sale recorded successfully!', type: 'success' });
      setCart([]);
      setFormData({ ...formData, initialPaidAmount: '' });
      // Refresh Data (Stock might have changed)
      fetchData();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || err.message || 'Failed to save sale',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Cart & Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Product Card */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Add Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Product</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                  value={selectedProduct}
                  onChange={e => handleProductChange(e.target.value)}
                >
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currentStock} {p.unit} avail) - ${p.sellingPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Calculation Method</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                  value={calcMethod}
                  onChange={e => setCalcMethod(e.target.value)}
                >
                  <option value="quantity">Price × Quantity (Pieces)</option>
                  <option value="weight">Price × Weight (kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Stock Quantity (Pieces)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Decrement from stock"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
              </div>

              {calcMethod === 'weight' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter weight"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                  Unit Price (per {calcMethod === 'weight' ? 'kg' : 'pc'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="text-sm text-slate-400">
                  Item Total Preview: <span className="text-white font-mono font-bold ml-2">
                    ${(calcMethod === 'weight' 
                      ? (parseFloat(weight) || 0) * (parseFloat(customPrice) || 0)
                      : (parseFloat(quantity) || 0) * (parseFloat(customPrice) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!selectedProduct}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-violet-900/20 disabled:opacity-50"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {cart.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-xs text-slate-500">Stock: {item.quantity} pcs</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.calcMethod === 'weight' ? (
                        <span className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-xs font-medium">Weight</span>
                          {item.weight} kg
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">Qty</span>
                          {item.quantity} pcs
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">${item.unitPrice}</td>
                    <td className="px-6 py-4 text-violet-400 font-bold font-mono">${item.lineTotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove Item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                      No items added to cart yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Customer & Payment */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Customer Details</h2>
            <div className="mb-4">
              <SearchableDropdown
                options={customers}
                value={formData.customerId}
                onChange={id => setFormData({ ...formData, customerId: id })}
                placeholder="Select or search for a customer..."
              />
            </div>

            {selectedCustomer && (
              <div className="bg-slate-900 p-4 rounded-lg space-y-3 text-sm border border-slate-700/50">
                <div className="flex justify-between">
                  <span className="text-slate-400">Credit Limit:</span>
                  <span className="text-emerald-400 font-mono">${selectedCustomer.creditLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Debt:</span>
                  <span className="text-rose-400 font-mono">${selectedCustomer.currentTotalBalance}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Available Credit:</span>
                  <span className="text-white font-bold font-mono">
                    ${(selectedCustomer.creditLimit - selectedCustomer.currentTotalBalance).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Payment Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between text-lg font-bold text-white p-4 bg-slate-900 rounded-xl border border-slate-700/50">
                <span>Grand Total</span>
                <span className="text-violet-400 font-mono">${calculateTotal().toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Payment Method</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI / Digital</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHECK">CHECK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Paid Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
                  value={formData.initialPaidAmount}
                  onChange={e => setFormData({ ...formData, initialPaidAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="bg-slate-900/30 p-4 rounded-xl space-y-2 border border-slate-700/30">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Remaining Balance:</span>
                  <span
                    className={`font-bold font-mono ${calculateRemaining() > 0 ? 'text-amber-400' : 'text-emerald-400'}`}
                  >
                    ${calculateRemaining().toFixed(2)}
                  </span>
                </div>
                {calculateRemaining() > 0 && (
                  <p className="text-[10px] text-slate-500 text-center">Remaining amount will be added to customer's ledger</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl mt-4 disabled:opacity-50 transition-all shadow-lg shadow-violet-900/20 active:scale-[0.98]"
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing Transaction...' : 'Complete & Record Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    </div>
  );
};

export default NewSale;
