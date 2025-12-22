import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const NewSale = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    saleChannel: 'POS',
    paymentMethod: 'CASH',
    initialPaidAmount: ''
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        axios.get('/customers'),
        axios.get('/products')
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    
    // Check Stock locally
    if (product.currentStock < quantity) {
      setError(`Insufficient stock! Only ${product.currentStock} ${product.unit} available.`);
      return;
    }

    const newItem = {
      productId: product.id,
      name: product.name,
      unitPrice: product.sellingPrice,
      quantity: parseInt(quantity),
      lineTotal: product.sellingPrice * parseInt(quantity)
    };

    setCart([...cart, newItem]);
    setError('');
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Handle Extracted Bill Data from Scanner
  useEffect(() => {
    if (location.state?.extractedBill) {
      const { items: extractedItems, totalAmount } = location.state.extractedBill;
      
      // Map extracted items to form structure (might need more robust matching strategy later)
      // For now, we just add them as line items. User has to select the actual Product ID manually 
      // or we try to match by name if possible.
      
      // Let's try to match by name
      const matchedItems = extractedItems.map(extItem => {
        const matchedProduct = products.find(p => p.name.toLowerCase().includes(extItem.productName.toLowerCase()));
        return {
          productId: matchedProduct ? matchedProduct.id : '', // Pre-select if found
          productName: extItem.productName, // Keep original name for reference if not found
          quantity: extItem.quantity || 1,
          unitPrice: extItem.unitPrice || 0,
          lineTotal: extItem.lineTotal || 0
        };
      });

      setCart(matchedItems);
      // We could also try to find the customer similarly or just leave it blank
    }
  }, [location.state, products]);

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.lineTotal, 0);
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    const paid = parseFloat(formData.initialPaidAmount) || 0;
    return Math.max(0, total - paid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (cart.length === 0) throw new Error("Cart is empty");
      if (!formData.customerId) throw new Error("Select a customer");

      const payload = {
        customerId: formData.customerId,
        initialPaidAmount: parseFloat(formData.initialPaidAmount) || 0,
        paymentMethod: formData.paymentMethod,
        saleChannel: formData.saleChannel,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        }))
      };

      await axios.post('/sales', payload);
      setSuccess('Sale recorded successfully!');
      setCart([]);
      setFormData({ ...formData, initialPaidAmount: '' });
      // Refresh Data (Stock might have changed)
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save sale");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">New Sale</h1>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Cart & Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Product Card */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Add Items</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
              >
                <option value="">Select Product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currentStock} {p.unit} avail) - ₹{p.sellingPrice}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                min="1"
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
              <button 
                type="button"
                onClick={addToCart}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Total</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-white">{item.name}</td>
                    <td className="px-6 py-4 text-slate-300">{item.quantity}</td>
                    <td className="px-6 py-4 text-slate-300">₹{item.unitPrice}</td>
                    <td className="px-6 py-4 text-violet-400 font-medium">₹{item.lineTotal}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-300">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Cart is empty</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Customer & Payment */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Customer Details</h2>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white mb-4"
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
            >
              <option value="">Select Customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="bg-slate-900 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Credit Limit:</span>
                  <span className="text-green-400">₹{selectedCustomer.creditLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Debt:</span>
                  <span className="text-red-400">₹{selectedCustomer.currentTotalBalance}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Available Credit:</span>
                  <span className="text-white font-medium">
                    ₹{selectedCustomer.creditLimit - selectedCustomer.currentTotalBalance}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Payment</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-lg font-medium text-white p-4 bg-slate-900 rounded-lg">
                <span>Grand Total</span>
                <span>₹{calculateTotal()}</span>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Payment Method</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option value="CASH">CASH</option>
                  <option value="CHECK">CHECK</option>
                  <option value="TRANSFER">TRANSFER</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Paid Amount (₹)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  value={formData.initialPaidAmount}
                  onChange={e => setFormData({...formData, initialPaidAmount: e.target.value})}
                  placeholder="Enter amount paid now"
                />
              </div>

              <div className="flex justify-between text-sm pt-2">
                <span className="text-slate-400">Remaining Due:</span>
                <span className={`font-medium ${calculateRemaining() > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ₹{calculateRemaining()}
                </span>
              </div>

              <button 
                onClick={handleSubmit} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg mt-4 disabled:opacity-50"
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
