import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('sales');
  
  // Report State
  const [filters, setFilters] = useState({
    customerId: '',
    dateRange: 'LAST_30_DAYS', // Default
    fromDate: '',
    toDate: '',
    paymentStatus: ''
  });
  
  const [reportData, setReportData] = useState({
    transactions: [],
    totalSales: 0,
    totalPaid: 0,
    totalOutstanding: 0
  });
  const [loadingReport, setLoadingReport] = useState(false);

  // Existing State
  const [purchasesData, setPurchasesData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    totalCost: '',
    customerId: '', 
    supplierName: '',
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchFarmers();
    fetchPurchaseHistory();
    // Set default dates and fetch
    handleDateRangeChange('LAST_30_DAYS');
  }, []);

  useEffect(() => {
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
      setFarmers(res.data); 
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const calculateDateRange = (rangeType) => {
      const end = new Date();
      const start = new Date();
      
      switch(rangeType) {
          case 'LAST_7_DAYS':
              start.setDate(end.getDate() - 7);
              break;
          case 'LAST_15_DAYS':
              start.setDate(end.getDate() - 15);
              break;
          case 'LAST_30_DAYS':
              start.setDate(end.getDate() - 30);
              break;
          case 'THIS_MONTH':
              start.setDate(1);
              break;
          case 'CUSTOM':
              return null;
          default:
              return null;
      }
      return { start, end };
  };

  const handleDateRangeChange = (value) => {
      const newFilters = { ...filters, dateRange: value };
      
      if (value !== 'CUSTOM') {
          const dates = calculateDateRange(value);
          if (dates) {
              // Set to YYYY-MM-DD for input fields (and ISO for backend later)
              newFilters.fromDate = dates.start.toISOString().split('T')[0];
              newFilters.toDate = dates.end.toISOString().split('T')[0];
              // Trigger fetch immediately for UX
              fetchReport(newFilters);
          }
      }
      setFilters(newFilters);
  };

  const fetchReport = async (currentFilters = filters) => {
    setLoadingReport(true);
    try {
      const params = {};
      if (currentFilters.customerId) params.customerId = currentFilters.customerId;
      
      // Ensure we send ISO timestamps with start/end of day logic if needed, 
      // but simple YYYY-MM-DD usually works if backend parses leniently.
      // Smart: add T00:00:00 and T23:59:59 to capture full days
      if (currentFilters.fromDate) params.fromDate = new Date(currentFilters.fromDate + 'T00:00:00').toISOString();
      if (currentFilters.toDate) params.toDate = new Date(currentFilters.toDate + 'T23:59:59').toISOString();
      
      if (currentFilters.paymentStatus) params.paymentStatus = currentFilters.paymentStatus;

      const res = await api.get('/finance/transactions', { params });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch transaction report', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleManualFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const defaultRange = 'LAST_30_DAYS';
    const dates = calculateDateRange(defaultRange);
    const resetFilters = {
      customerId: '',
      dateRange: defaultRange,
      fromDate: dates.start.toISOString().split('T')[0],
      toDate: dates.end.toISOString().split('T')[0],
      paymentStatus: ''
    };
    setFilters(resetFilters);
    fetchReport(resetFilters);
  };

  const handlePrint = () => {
      window.print();
  };

  const downloadCSV = () => {
      if (!reportData.transactions || reportData.transactions.length === 0) {
          alert("No data to export");
          return;
      }
      
      // Headers
      let csvContent = "Date,Customer,Total Bill,Paid,Balance,Status\n";
      
      // Rows
      reportData.transactions.forEach(row => {
          const date = new Date(row.date || row.createdAt).toLocaleDateString();
          const customer = row.customerName || row.customer?.name || '';
          const total = row.totalBillAmount || 0;
          const paid = row.initialPaidAmount || 0;
          const balance = row.remainingBalance || 0;
          const status = row.paymentStatus || '';
          csvContent += `${date},"${customer}",${total},${paid},${balance},${status}\n`;
      });
      
      // Total Row
      csvContent += `\nTOTALS,,${reportData.totalSales},${reportData.totalPaid},${reportData.totalOutstanding},\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `transactions_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const fetchPurchaseHistory = async () => {
    try {
      const res = await api.get('/purchases/history');
      setPurchasesData(res.data);
    } catch (err) {
      console.error('Failed to fetch purchase history', err);
    }
  };

  const handleCreatePurchase = async e => {
    e.preventDefault();
    try {
      const payload = {
        productId: purchaseForm.productId,
        quantity: parseInt(purchaseForm.quantity),
        totalCost:
          (parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0),
        supplierName: purchaseForm.supplierName || null,
        customerId: purchaseForm.customerId || null,
      };
      await api.post('/purchases', payload);
      setPurchaseModalOpen(false);
      setPurchaseForm({ productId: '', quantity: '', totalCost: '', customerId: '', supplierName: '' });
      fetchPurchaseHistory(); 
    } catch (err) {
      console.error('Failed to create purchase', err);
      alert('Failed to create purchase: ' + (err.response?.data?.message || err.message));
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
      case 'FULLY_PAID': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'PARTIAL': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'UNPAID': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 print:pt-0 print:max-w-none print:px-0">
      
      {/* Header & Tabs (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
         <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          {['sales', 'purchases'].map((tab) => (
             <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} History
            </button>
          ))}
        </div>
        
        <button
            onClick={() => setPurchaseModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Purchase
        </button>
      </div>

       {/* Print Header */}
       <div className="hidden print:block mb-8">
            <h1 className="text-2xl font-bold text-black">Transactions Report</h1>
            <p className="text-gray-600 text-sm">Generated on {new Date().toLocaleString()}</p>
       </div>

      {/* SALES REPORT SECTION */}
      {activeTab === 'sales' && (
         <div className="space-y-6">
            
            {/* Filter Bar (Hidden on Print) */}
            <div className="bg-slate-800/50 backdrop-blur p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-6 gap-4 print:hidden">
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Date Range</label>
                  <select 
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 outline-none"
                     value={filters.dateRange}
                     onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                     <option value="LAST_7_DAYS">Last 7 Days</option>
                     <option value="LAST_15_DAYS">Last 15 Days</option>
                     <option value="LAST_30_DAYS">Last 30 Days</option>
                     <option value="THIS_MONTH">This Month</option>
                     <option value="CUSTOM">Custom Range</option>
                  </select>
               </div>
               
               {/* Show Date Inputs only if Custom */}
               {filters.dateRange === 'CUSTOM' ? (
                   <>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">From</label>
                        <input 
                            type="date" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 outline-none"
                            value={filters.fromDate}
                            onChange={(e) => handleManualFilterChange('fromDate', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">To</label>
                        <input 
                            type="date" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 outline-none"
                            value={filters.toDate}
                            onChange={(e) => handleManualFilterChange('toDate', e.target.value)}
                        />
                    </div>
                   </>
               ) : (
                   <div className="col-span-2 flex items-end pb-2">
                       <span className="text-slate-500 text-sm">
                           {filters.fromDate} — {filters.toDate}
                       </span>
                   </div>
               )}

               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Customer</label>
                  <select 
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 outline-none"
                     value={filters.customerId}
                     onChange={(e) => handleManualFilterChange('customerId', e.target.value)}
                  >
                     <option value="">All Customers</option>
                     {farmers.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                  </select>
               </div>
               
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Status</label>
                  <select 
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 outline-none"
                     value={filters.paymentStatus}
                     onChange={(e) => handleManualFilterChange('paymentStatus', e.target.value)}
                  >
                     <option value="">All Statuses</option>
                     <option value="FULLY_PAID">Fully Paid</option>
                     <option value="PARTIAL">Partial</option>
                     <option value="UNPAID">Unpaid</option>
                  </select>
               </div>

               <div className="flex items-end gap-2">
                  <button 
                     onClick={() => fetchReport()}
                     className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                     Apply
                  </button>
                  <button 
                     onClick={clearFilters}
                     className="px-3 py-2 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
                     title="Reset Filters"
                  >
                     x
                  </button>
               </div>
            </div>

            {/* Actions Bar (Export/Print) */}
            <div className="flex justify-end gap-3 print:hidden">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Report
                </button>
                <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
               <div className="bg-slate-800/80 print:bg-white print:border-gray-300 p-5 rounded-xl border border-slate-700 relative overflow-hidden group">
                  <p className="text-slate-400 print:text-gray-600 text-sm font-medium">Total Sales</p>
                  <h3 className="text-2xl font-bold text-white print:text-black mt-1">₹{reportData.totalSales?.toLocaleString('en-IN') || 0}</h3>
               </div>
               <div className="bg-slate-800/80 print:bg-white print:border-gray-300 p-5 rounded-xl border border-slate-700 relative overflow-hidden group">
                  <p className="text-slate-400 print:text-gray-600 text-sm font-medium">Total Received</p>
                  <h3 className="text-2xl font-bold text-emerald-400 print:text-black mt-1">₹{reportData.totalPaid?.toLocaleString('en-IN') || 0}</h3>
               </div>
               <div className="bg-slate-800/80 print:bg-white print:border-gray-300 p-5 rounded-xl border border-slate-700 relative overflow-hidden group">
                  <p className="text-slate-400 print:text-gray-600 text-sm font-medium">Outstanding Balance</p>
                  <h3 className="text-2xl font-bold text-red-400 print:text-black mt-1">₹{reportData.totalOutstanding?.toLocaleString('en-IN') || 0}</h3>
               </div>
            </div>

            {/* Sales Table */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden shadow-xl print:bg-white print:border-gray-300 print:shadow-none">
               <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-700 print:divide-gray-300">
                  <thead className="bg-slate-900/80 print:bg-gray-100">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 print:text-gray-600 uppercase tracking-wider">Date</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 print:text-gray-600 uppercase tracking-wider">Customer</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 print:text-gray-600 uppercase tracking-wider">Total</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 print:text-gray-600 uppercase tracking-wider">Paid</th>
                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 print:text-gray-600 uppercase tracking-wider">Balance</th>
                     <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 print:text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 print:divide-gray-300 bg-transparent">
                  {loadingReport ? (
                     <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading transaction data...</td></tr>
                  ) : reportData.transactions?.length === 0 ? (
                     <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No transactions found matching criteria.</td></tr>
                  ) : (
                     reportData.transactions.map(sale => (
                        <tr
                        key={sale.id}
                        onClick={() => openDrawer(sale)}
                        className="hover:bg-slate-700/40 cursor-pointer transition-colors group print:hover:bg-transparent"
                        >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 print:text-black group-hover:text-white print:group-hover:text-black">
                           {new Date(sale.date || sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white print:text-black">
                           {sale.customerName || sale.customer?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-300 print:text-black">
                           ₹{sale.totalBillAmount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-emerald-400/80 print:text-black">
                           ₹{sale.initialPaidAmount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                           <span className={sale.remainingBalance > 0 ? 'text-red-400' : 'text-slate-500 print:text-black'}>
                              ₹{sale.remainingBalance?.toFixed(2)}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(sale.paymentStatus)} print:border-gray-300 print:text-black print:bg-transparent`}>
                              {sale.paymentStatus}
                           </span>
                        </td>
                        </tr>
                     ))
                  )}
                  </tbody>
               </table>
               </div>
            </div>
         </div>
      )}

      {/* Purchases Table (Hidden on Print if filtered to Sales) */}
      {activeTab === 'purchases' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden print:hidden">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {purchasesData.map(purchase => (
                <tr key={purchase.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{new Date(purchase.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{purchase.supplierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{purchase.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{purchase.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-400 font-mono">₹{purchase.totalCost}</td>
                </tr>
              ))}
              {purchasesData.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-slate-500">No purchases found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Drawer (Included in DOM, hidden via logic if not open, but z-50 handles overlay) */}
      {drawerOpen && selectedRecord && (
        <>
          <div onClick={closeDrawer} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity print:hidden" />
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-900 shadow-2xl z-50 overflow-y-auto border-l border-slate-700 print:hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Sale Details</h2>
                  <p className="text-slate-400 text-sm">
                     ID: <span className="font-mono text-slate-500">{selectedRecord.id?.split('-')[0]}</span> • {new Date(selectedRecord.date || selectedRecord.createdAt).toLocaleString()}
                  </p>
                </div>
                <button onClick={closeDrawer} className="p-2 -mr-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</h3>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">
                      {selectedRecord.customerName?.[0] || selectedRecord.customer?.name?.[0] || 'C'}
                   </div>
                   <p className="text-lg text-white font-medium">{selectedRecord.customerName || selectedRecord.customer?.name}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Items Purchased</h3>
                <div className="space-y-3">
                  {selectedRecord.items?.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/30 rounded-lg p-4 flex justify-between items-center border border-slate-800 hover:border-slate-700 transition-colors">
                      <div>
                        <p className="text-white font-medium">{item.productName}</p>
                        <p className="text-sm text-slate-400 mt-0.5">{item.quantity} × ₹{item.unitPrice}</p>
                      </div>
                      <p className="text-white font-mono font-medium">₹{item.lineTotal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Bill Amount</span>
                    <span className="font-mono text-white">₹{selectedRecord.totalBillAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Amount Paid</span>
                    <span className="font-mono text-emerald-400">₹{selectedRecord.initialPaidAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <span className="font-medium text-white">Balance Due</span>
                    <span className="font-mono text-xl font-bold text-red-400">₹{selectedRecord.remainingBalance?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedRecord.paymentHistory?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Timeline</h3>
                  <div className="space-y-0 relative border-l border-slate-800 ml-3">
                    {selectedRecord.paymentHistory.map((txn, idx) => (
                      <div key={idx} className="mb-6 ml-6 relative">
                         <div className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                         <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                           <div className="flex justify-between items-center">
                              <p className="font-medium text-emerald-400 font-mono">₹{txn.amountPaid}</p>
                              <span className="text-xs text-slate-500 uppercase font-bold">{txn.paymentMethod}</span>
                           </div>
                           <p className="text-xs text-slate-400 mt-1">{new Date(txn.paymentDate).toLocaleString()}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Purchase Modal (Hidden on Print) */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">New Purchase Entry</h2>
            <form onSubmit={handleCreatePurchase} className="space-y-5">
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
                 <label className="block text-xs font-bold text-slate-400 uppercase">Supplier Details</label>
                 
                 <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!purchaseForm.customerId ? 'border-violet-500' : 'border-slate-600'}`}>
                      {!purchaseForm.customerId && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                    </div>
                    <input type="radio" name="sourceType" className="hidden" checked={!purchaseForm.customerId} onChange={() => setPurchaseForm({ ...purchaseForm, customerId: '', supplierName: '' })} />
                    <span className={!purchaseForm.customerId ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}>External</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!!purchaseForm.customerId ? 'border-violet-500' : 'border-slate-600'}`}>
                       {!!purchaseForm.customerId && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                     </div>
                     <input type="radio" name="sourceType" className="hidden" checked={!!purchaseForm.customerId} onChange={() => setPurchaseForm({ ...purchaseForm, customerId: 'select', supplierName: '' })} />
                     <span className={!!purchaseForm.customerId ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}>Farmer</span>
                  </label>
                 </div>

                 {!purchaseForm.customerId ? (
                   <input type="text" placeholder="Supplier Name" required value={purchaseForm.supplierName} onChange={e => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500" />
                 ) : (
                    <select required value={purchaseForm.customerId === 'select' ? '' : purchaseForm.customerId} onChange={e => setPurchaseForm({ ...purchaseForm, customerId: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500">
                      <option value="">Select Farmer...</option>
                      {farmers.filter(f => f.customerType === 'FARMER').map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                    </select>
                 )}
              </div>

              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Product</label>
                  <select required value={purchaseForm.productId} onChange={e => setPurchaseForm({ ...purchaseForm, productId: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500">
                    <option value="">Select Product...</option>
                    {products.map(p => (<option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Quantity</label>
                    <input type="number" required min="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Unit Price</label>
                    <input type="number" required min="0" step="0.01" value={purchaseForm.unitPrice} onChange={e => setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500" />
                  </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
                   <span className="text-slate-400 text-sm">Total Cost</span>
                   <span className="text-xl font-bold text-white font-mono">₹{((parseFloat(purchaseForm.quantity) || 0) * (parseFloat(purchaseForm.unitPrice) || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPurchaseModalOpen(false)} className="flex-1 py-2.5 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-violet-900/20">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
