import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import SearchableDropdown from '../components/SearchableDropdown';
import { useReactToPrint } from 'react-to-print';
import TransactionPrintView from '../components/TransactionPrintView';

export default function Transactions() {
  // Filters State
  const [filters, setFilters] = useState({
    customerId: '',
    dateRange: 'LAST_30_DAYS',
    fromDate: '',
    toDate: '',
    type: 'ALL', // ALL, SALE, PURCHASE
    paymentStatus: '',
  });

  const [ledgerData, setLedgerData] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalPurchases: 0, remainingBalance: 0 });
  const [loading, setLoading] = useState(false);

  // Existing State (Farmers/Modals)
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);

  // Purchase Form
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    totalCost: '',
    customerId: '',
    supplierName: '',
  });

  const printRef = useRef();

  useEffect(() => {
    fetchFarmers();
    handleDateRangeChange('LAST_30_DAYS');
  }, []);

  useEffect(() => {
    // Reload products when modal opens
    if (purchaseModalOpen) {
      const loadProducts = async () => {
        try {
          const res = await api.get('/products');
          setProducts(res.data);
        } catch (e) {
          console.error(e);
        }
      };
      loadProducts();
    }
  }, [purchaseModalOpen]);

  // Fetch Farmers for Dropdown
  const fetchFarmers = async () => {
    try {
      const res = await api.get('/customers');
      setFarmers(res.data);
    } catch (err) {
      console.error('Failed to fetch farmers', err);
    }
  };

  const calculateDateRange = rangeType => {
    const today = new Date();
    let start = new Date();

    switch (rangeType) {
      case 'LAST_7_DAYS':
        start.setDate(today.getDate() - 7);
        break;
      case 'LAST_15_DAYS':
        start.setDate(today.getDate() - 15);
        break;
      case 'LAST_30_DAYS':
        start.setDate(today.getDate() - 30);
        break;
      case 'THIS_MONTH':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'CUSTOM':
        return null; // Don't change dates for custom
      default:
        start.setDate(today.getDate() - 30);
    }
    return { start, end: today };
  };

  const handleDateRangeChange = rangeType => {
    const dates = calculateDateRange(rangeType);
    const newFilters = { ...filters, dateRange: rangeType };

    if (dates) {
      newFilters.fromDate = dates.start.toISOString().split('T')[0];
      newFilters.toDate = dates.end.toISOString().split('T')[0];
      setFilters(newFilters); // State update is async, so pass newFilters to fetch
      fetchLedger(newFilters);
    } else {
      setFilters(newFilters);
    }
  };

  const fetchLedger = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilters.customerId) params.customerId = currentFilters.customerId;

      // Add time components to ensure full day coverage
      if (currentFilters.fromDate)
        params.fromDate = new Date(currentFilters.fromDate + 'T00:00:00').toISOString();
      if (currentFilters.toDate)
        params.toDate = new Date(currentFilters.toDate + 'T23:59:59').toISOString();

      if (currentFilters.paymentStatus) params.paymentStatus = currentFilters.paymentStatus;

      const res = await api.get('/finance/ledger', { params });
      let data = res.data;

      // Filter by Type locally
      if (currentFilters.type !== 'ALL') {
        data = data.filter(item => item.type === currentFilters.type);
      }

      setLedgerData(data);
      calculateSummary(data);
    } catch (err) {
      console.error('Failed to fetch ledger', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = data => {
    // Top Cards Logic (Total Sales Revenue, Total Purchase Expense)
    const totalSales = data
      .filter(d => d.type === 'SALE')
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalPurchases = data
      .filter(d => d.type === 'PURCHASE')
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Net Outstanding Logic: (Who owes money?)
    const totalReceivables = data
      .filter(d => d.type === 'SALE')
      .reduce((sum, item) => sum + (item.balance || 0), 0);
    
    const totalPayables = data
      .filter(d => d.type === 'PURCHASE')
      .reduce((sum, item) => sum + (item.balance || 0), 0);

    const netOutstanding = totalReceivables - totalPayables;

    // Footer Column Totals
    const totalAmountCol = data.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalPaidCol = data.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
    const totalBalanceCol = data.reduce((sum, item) => sum + (item.balance || 0), 0);

    setSummary({ 
        totalSales, 
        totalPurchases, 
        netOutstanding, 
        totalAmountCol,
        totalPaidCol,
        totalBalanceCol
    });
  };

  const handleApplyFilter = () => {
    fetchLedger();
  };

  const handleClearFilters = () => {
    const defaultRange = 'LAST_30_DAYS';
    const dates = calculateDateRange(defaultRange);
    const resetFilters = {
      customerId: '',
      dateRange: defaultRange,
      fromDate: dates.start.toISOString().split('T')[0],
      toDate: dates.end.toISOString().split('T')[0],
      type: 'ALL',
      paymentStatus: '',
    };
    setFilters(resetFilters);
    fetchLedger(resetFilters);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleCreatePurchase = async e => {
    e.preventDefault();
    try {
      const payload = {
        productId: purchaseForm.productId,
        quantity: parseInt(purchaseForm.quantity),
        unitPrice: parseFloat(purchaseForm.unitPrice),
        totalCost:
          (parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0),
        supplierName: purchaseForm.supplierName || null,
        customerId:
          purchaseForm.customerId && purchaseForm.customerId !== 'select'
            ? purchaseForm.customerId
            : null,
      };

      await api.post('/finance/purchase', payload);
      setPurchaseModalOpen(false);
      // Reset form
      setPurchaseForm({
        productId: '',
        quantity: '',
        unitPrice: '',
        totalCost: '',
        customerId: '',
        supplierName: '',
      });
      fetchLedger();
    } catch (err) {
      console.error(err);
      alert('Failed to create purchase: ' + (err.response?.data?.message || err.message));
    }
  };

  // -- Drawer Logic --
  const openDrawer = record => {
    // Only open drawer for Sales (Purchases allow less detail for now)
    if (record.type === 'SALE') {
      fetchSaleDetails(record.id);
    }
  };

  const fetchSaleDetails = async id => {
    try {
      setSelectedRecord({ ...ledgerData.find(d => d.id === id) });
      setDrawerOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="pt-12 flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transactions Ledger</h1>
          <p className="text-slate-400">Unified view of Sales and Purchases</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPurchaseModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Record Purchase
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              ></path>
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6 backdrop-blur-sm">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Customer Search with Phone */}
          <div className="w-64">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
              Customer / Supplier
            </label>
            <SearchableDropdown
              options={farmers}
              value={filters.customerId}
              onChange={val => setFilters({ ...filters, customerId: val })}
              placeholder="Search Name or Phone..."
              allOptionLabel="All Profiles"
              renderOption={opt => (
                <span>
                  <span className="font-medium text-white block">{opt.name}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    {opt.phone && <span>📞 {opt.phone}</span>}
                    {opt.address && <span>📍 {opt.address}</span>}
                  </span>
                </span>
              )}
            />
          </div>

          {/* Transaction Type */}
          <div className="w-40">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Type</label>
            <div className="relative">
              <select
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 appearance-none"
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="ALL">All Transactions</option>
                <option value="SALE">Sales Only</option>
                <option value="PURCHASE">Purchases Only</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
              Date Period
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 appearance-none"
              value={filters.dateRange}
              onChange={e => handleDateRangeChange(e.target.value)}
            >
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_15_DAYS">Last 15 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {filters.dateRange === 'CUSTOM' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">From</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">To</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-900/20"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Clear Filters"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Sales</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white">
              ₹{summary.totalSales.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              Revenue
            </span>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Purchases</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white">
              ₹{summary.totalPurchases.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
              Expense
            </span>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-sm font-medium mb-1">Net Outstanding</p>
          <div className="flex items-baseline gap-2">
            <h3
              className={`text-3xl font-bold ${summary.netOutstanding >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {summary.netOutstanding >= 0 ? '' : ''}₹{Math.abs(summary.netOutstanding || 0).toLocaleString('en-IN')}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${summary.netOutstanding >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {summary.netOutstanding >= 0 ? 'Receivable (Owed to You)' : 'Payable (You Owe)'}
            </span>
          </div>
        </div>
      </div>

      {/* UNIFIED TABLE */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Customer / Supplier
                </th>
                <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Paid
                </th>
                <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="p-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Loading ledger data...
                  </td>
                </tr>
              ) : ledgerData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No transactions found for this period.
                  </td>
                </tr>
              ) : (
                ledgerData.map(row => (
                  <tr
                    key={row.id}
                    onClick={() => openDrawer(row)}
                    className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-sm text-slate-300">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.type === 'SALE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-white">{row.customerName}</div>
                      {row.customerPhone && row.customerPhone !== 'N/A' && (
                        <div className="text-xs text-slate-500">{row.customerPhone}</div>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm font-mono text-white">
                      ₹{row.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right text-sm font-mono text-emerald-400">
                      ₹{row.paidAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right text-sm font-mono text-rose-400">
                      ₹{row.balance?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          row.status === 'FULLY_PAID' || row.status === 'COMPLETED'
                            ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                            : row.status === 'PARTIAL'
                              ? 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                              : 'border-rose-500/20 text-rose-400 bg-rose-500/5'
                        }`}
                      >
                        {row.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Component (Hidden) */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <TransactionPrintView
          ref={printRef}
          data={ledgerData}
          filters={{
            from: filters.fromDate,
            to: filters.toDate,
            customer: filters.customerId
              ? farmers.find(f => f.id === filters.customerId)?.name
              : null,
            status: filters.type,
          }}
          summary={{
            totalSales: summary.totalSales,
            totalPurchases: summary.totalPurchases,
            netOutstanding: summary.netOutstanding,
            // Pass column totals
            totalAmountCol: summary.totalAmountCol,
            totalPaidCol: summary.totalPaidCol,
            totalBalanceCol: summary.totalBalanceCol
          }}
        />
      </div>

      {/* PURCHASE MODAL - Cleaned up */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">New Purchase Entry</h2>
              <button
                onClick={() => setPurchaseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePurchase} className="p-6 space-y-5">
              {/* Supplier Section */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sourceType"
                      className="accent-violet-500"
                      checked={!purchaseForm.customerId}
                      onChange={() =>
                        setPurchaseForm({ ...purchaseForm, customerId: '', supplierName: '' })
                      }
                    />
                    <span className="text-sm text-slate-300">External Supplier</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sourceType"
                      className="accent-violet-500"
                      checked={!!purchaseForm.customerId && purchaseForm.customerId !== ''}
                      onChange={() =>
                        setPurchaseForm({ ...purchaseForm, customerId: 'select', supplierName: '' })
                      }
                    />
                    <span className="text-sm text-slate-300">Farmer</span>
                  </label>
                </div>

                {!purchaseForm.customerId ? (
                  <input
                    type="text"
                    placeholder="Supplier Name"
                    required
                    value={purchaseForm.supplierName}
                    onChange={e =>
                      setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500"
                  />
                ) : (
                  <select
                    required
                    value={purchaseForm.customerId === 'select' ? '' : purchaseForm.customerId}
                    onChange={e => setPurchaseForm({ ...purchaseForm, customerId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500"
                  >
                    <option value="">Select Farmer...</option>
                    {farmers
                      .filter(f => f.customerType === 'FARMER')
                      .map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Product Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                    Product
                  </label>
                  <select
                    required
                    value={purchaseForm.productId}
                    onChange={e => setPurchaseForm({ ...purchaseForm, productId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.currentStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={purchaseForm.quantity}
                      onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={purchaseForm.unitPrice}
                      onChange={e =>
                        setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Total Cost</span>
                  <span className="text-xl font-bold text-white font-mono">
                    ₹
                    {(
                      (parseFloat(purchaseForm.quantity) || 0) *
                      (parseFloat(purchaseForm.unitPrice) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPurchaseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-violet-900/20"
                >
                  Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER MOCKUP (Since we don't have full details in ledger DTO, we show what we have) */}
      {drawerOpen && selectedRecord && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
          ></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-2">
              {selectedRecord.type === 'SALE' ? 'Sale Details' : 'Purchase Details'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">ID: {selectedRecord.id}</p>

            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Customer</h3>
                <p className="text-lg font-medium text-white">{selectedRecord.customerName}</p>
                <p className="text-sm text-slate-400">{selectedRecord.customerPhone}</p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Financials</h3>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-300">Total Amount</span>
                  <span className="font-mono text-white">
                    ₹{selectedRecord.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-300">Paid Amount</span>
                  <span className="font-mono text-emerald-400">
                    ₹{selectedRecord.paidAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 pt-2">
                  <span className="text-slate-300">Balance</span>
                  <span className="font-mono text-rose-400 font-bold">
                    ₹{selectedRecord.balance?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-500 italic">
                Detailed item list not loaded in summary view.
              </p>
            </div>

            <button
              onClick={closeDrawer}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
