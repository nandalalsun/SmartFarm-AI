import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesData, setSalesData] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchSalesHistory();
    fetchPurchaseHistory();
    fetchFarmers();
  }, []);

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    totalCost: '',
    customerId: '', // Optional for Farmer
    supplierName: '', // Optional for non-Farmer
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products for the dropdown
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadProducts();
  }, []);

  const fetchFarmers = async () => {
    try {
      const res = await api.get('/customers');
      // Filter only farmers
      setFarmers(res.data.filter(c => c.customerType === 'FARMER'));
    } catch (err) {
      console.error('Failed to fetch farmers', err);
    }
  };

  const handleCreatePurchase = async e => {
    e.preventDefault();
    try {
      const payload = {
        productId: purchaseForm.productId,
        quantity: parseInt(purchaseForm.quantity),
        totalCost: (parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0),
        supplierName: purchaseForm.supplierName || null,
        customerId: purchaseForm.customerId || null,
      };
      await api.post('/purchases', payload);
      setPurchaseModalOpen(false);
      setPurchaseForm({
        productId: '',
        quantity: '',
        totalCost: '',
        customerId: '',
        supplierName: '',
      });
      fetchPurchaseHistory(); // Refresh list
      // Also refresh sales history if it affects credits?
    } catch (err) {
      console.error('Failed to create purchase', err);
      alert('Failed to create purchase: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const res = await api.get('/sales/history');
      setSalesData(res.data);
    } catch (err) {
      console.error('Failed to fetch sales history', err);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const res = await api.get('/purchases/history');
      setPurchasesData(res.data);
    } catch (err) {
      console.error('Failed to fetch purchase history', err);
    }
  };

  const openDrawer = record => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRecord(null);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'FULLY_PAID':
        return 'text-green-400 bg-green-400/10';
      case 'PARTIAL':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'UNPAID':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Transaction History</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'sales'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Sales History
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'purchases'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Purchase History
        </button>
        <div className="flex-grow flex justify-end pr-2">
          <button
          onClick={() => setPurchaseModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Purchase
        </button>
        </div>
      </div>

      {/* Sales Table */}
      {activeTab === 'sales' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {salesData
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(sale => (
                  <tr
                    key={sale.id}
                    onClick={() => openDrawer(sale)}
                    className="hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{sale.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-mono">
                      ${sale.totalBillAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono">
                      ${sale.initialPaidAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono">
                      ${sale.remainingBalance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.paymentStatus)}`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              {salesData.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-slate-500">
                    No sales found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Purchases Table */}
      {activeTab === 'purchases' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {purchasesData.map(purchase => (
                <tr key={purchase.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {new Date(purchase.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {purchase.supplierName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {purchase.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {purchase.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-400 font-mono">
                    ${purchase.totalCost}
                  </td>
                </tr>
              ))}
              {purchasesData.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                    No purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Drawer */}
      {drawerOpen && selectedRecord && (
        <>
          {/* Overlay */}
          <div onClick={closeDrawer} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-900 shadow-2xl z-50 overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Sale Details</h2>
                  <p className="text-slate-400">{new Date(selectedRecord.date).toLocaleString()}</p>
                </div>
                <button onClick={closeDrawer} className="text-slate-400 hover:text-white text-2xl">
                  ×
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Customer</h3>
                <p className="text-white font-medium">{selectedRecord.customerName}</p>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
                <div className="space-y-3">
                  {selectedRecord.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/50 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white font-medium">{item.productName}</p>
                        <p className="text-sm text-slate-400">
                          {item.quantity} × ${item.unitPrice}
                        </p>
                      </div>
                      <p className="text-emerald-400 font-mono font-medium">${item.lineTotal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Bill</span>
                    <span className="font-mono">${selectedRecord.totalBillAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Paid</span>
                    <span className="font-mono">${selectedRecord.initialPaidAmount}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-2">
                    <span>Balance</span>
                    <span className="font-mono">${selectedRecord.remainingBalance}</span>
                  </div>
                </div>
              </div>

              {/* Payment Timeline */}
              {selectedRecord.paymentHistory && selectedRecord.paymentHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
                  <div className="space-y-3">
                    {selectedRecord.paymentHistory.map((txn, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-4 bg-slate-800/50 rounded-lg p-4"
                      >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            ${txn.amountPaid}{' '}
                            <span className="text-slate-400 text-sm">({txn.paymentMethod})</span>
                          </p>
                          <p className="text-sm text-slate-400">
                            {new Date(txn.paymentDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex justify-center">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedRecord.paymentStatus)}`}
                >
                  {selectedRecord.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Purchase Modal */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">New Purchase</h2>
            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Product</label>
                <select
                  required
                  value={purchaseForm.productId}
                  onChange={e => setPurchaseForm({ ...purchaseForm, productId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Source Type</label>
                <div className="flex space-x-4 mb-2">
                  <label className="flex items-center space-x-2 text-white cursor-pointer">
                    <input
                      type="radio"
                      name="sourceType"
                      checked={!purchaseForm.customerId}
                      onChange={() =>
                        setPurchaseForm({ ...purchaseForm, customerId: '', supplierName: '' })
                      }
                    />
                    <span>External Supplier</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white cursor-pointer">
                    <input
                      type="radio"
                      name="sourceType"
                      checked={!!purchaseForm.customerId}
                      onChange={() =>
                        setPurchaseForm({ ...purchaseForm, customerId: 'select', supplierName: '' })
                      }
                    />
                    <span>Farmer</span>
                  </label>
                </div>
              </div>

              {!purchaseForm.customerId && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.supplierName}
                    onChange={e =>
                      setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}

              {purchaseForm.customerId !== '' && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Select Farmer</label>
                  <select
                    required
                    value={purchaseForm.customerId === 'select' ? '' : purchaseForm.customerId}
                    onChange={e => setPurchaseForm({ ...purchaseForm, customerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Choose Farmer...</option>
                    {farmers.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={purchaseForm.quantity}
                    onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Unit Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={purchaseForm.unitPrice}
                    onChange={e => setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Total Cost</label>
                  <div className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                    ${((parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0)).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPurchaseModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-medium"
                >
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
