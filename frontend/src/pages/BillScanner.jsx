import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios'; // Use the configured axios instance
import Toast from '../components/Toast';

export default function BillScanner() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'review'
  
  // --- Scan Tab State ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const batchInputRef = useRef(null);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });

  // --- Review Tab State ---
  const [queue, setQueue] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (activeTab === 'review') {
      fetchPendingBills();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCustomersAndProducts();
  }, []);

  // --- Fetch Customers & Products ---
  const fetchCustomersAndProducts = async () => {
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

  // --- Scan Tab Logic ---
  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('/vision/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Open modal with extracted data
      setExtractedData(response.data);
      setShowModal(true);
    } catch (err) {
      console.error('Extraction failed:', err);
      setError('Failed to extract bill data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
        await Promise.all(files.map(async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            await axios.post('http://localhost:8080/api/staging/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }));
        // Switch to review tab after upload
        setActiveTab('review');
    } catch (error) {
        console.error("Error uploading batch:", error);
        alert("Failed to upload some files.");
    } finally {
        setLoading(false);
    }
  };

  // --- Review Tab Logic ---
  const fetchPendingBills = async () => {
    setLoadingQueue(true);
    try {
        const response = await axios.get('http://localhost:8080/api/staging/pending');
        setQueue(response.data);
        if (response.data.length > 0 && !selectedBill) {
            handleSelectBill(response.data[0]);
        }
    } catch (error) {
        console.error("Error fetching pending bills:", error);
    } finally {
        setLoadingQueue(false);
    }
  };

  const handleSelectBill = (bill) => {
    let parsedData = bill.extractedJson;
    if (typeof parsedData === 'string') {
        try {
            parsedData = JSON.parse(parsedData);
        } catch (e) {
            console.error("Failed to parse bill JSON", e);
        }
    }
    setSelectedBill({ ...bill, parsedData });
  };

  // --- Modal Logic ---
  const [modalFormData, setModalFormData] = useState({
    customerId: '',
    paymentMethod: 'CASH',
    initialPaidAmount: '',
    items: []
  });

  useEffect(() => {
    if (extractedData && showModal) {
      // Pre-populate form with extracted data
      // API returns: { date, items, customer_name, total_amount }
      const items = extractedData.items?.map(item => {
        // Try to match product by name
        const matchedProduct = products.find(p => 
          p.name.toLowerCase().includes(item.product_name?.toLowerCase() || '')
        );
        
        return {
          productId: matchedProduct?.id || '',
          productName: item.product_name,
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          lineTotal: item.line_total || 0
        };
      }) || [];

      setModalFormData({
        customerId: '',
        paymentMethod: 'CASH',
        initialPaidAmount: extractedData.total_amount || '',
        items: items
      });
    }
  }, [extractedData, showModal, products]);

  const handleSaveSale = async () => {
    setLoading(true);
    try {
      if (modalFormData.items.length === 0) throw new Error('No items to save');
      if (!modalFormData.customerId) throw new Error('Please select a customer');

      const payload = {
        customerId: modalFormData.customerId,
        initialPaidAmount: parseFloat(modalFormData.initialPaidAmount) || 0,
        paymentMethod: modalFormData.paymentMethod,
        saleChannel: 'POS',
        items: modalFormData.items
          .filter(item => item.productId) // Only include items with matched products
          .map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
      };

      await axios.post('/sales', payload);
      setToast({ message: '✓ Sale recorded successfully!', type: 'success' });
      setShowModal(false);
      setSelectedImage(null);
      setPreviewUrl(null);
      setExtractedData(null);
      
      // Refresh products (stock might have changed)
      fetchCustomersAndProducts();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || err.message || 'Failed to save sale',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePurchase = async () => {
    // TODO: Implement purchase logic when backend endpoint is ready
    setToast({ message: 'Purchase saving not yet implemented', type: 'error' });
  };

  const calculateModalTotal = () => {
    return modalFormData.items.reduce((acc, item) => acc + (item.lineTotal || 0), 0);
  };

  const updateModalItem = (index, field, value) => {
    const newItems = [...modalFormData.items];
    newItems[index][field] = value;
    
    // Recalculate line total if quantity or price changes
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].lineTotal = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setModalFormData({ ...modalFormData, items: newItems });
  };

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Page Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">
          Bill Scanner
        </h1>
        
        <div className="bg-slate-800 p-1 rounded-lg flex space-x-1">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'scan'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            New Scan
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'review'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Review Queue
            {queue.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {queue.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- TAB 1: SINGLE SCAN --- */}
      {activeTab === 'scan' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-semibold text-center text-slate-200 mb-6">
              Upload a Bill
            </h2>

            <div className="space-y-8">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  selectedImage
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-700 hover:border-violet-500 hover:bg-slate-800'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />

                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-violet-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">Tap to Scan Single Bill</p>
                      <p className="text-sm text-slate-400">or upload a photo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={handleExtract}
                    disabled={!selectedImage || loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      !selectedImage || loading
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-600/25'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Extract & Review'}
                  </button>
                  
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm">Or for high volume</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                  </div>

                  <button
                     onClick={() => batchInputRef.current?.click()}
                     className="w-full py-3 rounded-xl font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                     </svg>
                     Upload Batch (Multi-File)
                  </button>
                  <input
                      type="file"
                      ref={batchInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleBatchUpload}
                    />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: REVIEW QUEUE --- */}
      {activeTab === 'review' && (
        <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden h-[calc(100vh-14rem)]">
            
            {/* Sidebar Queue */}
            <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="font-semibold text-emerald-400">Pending Bills</h2>
                    <button 
                        onClick={fetchPendingBills}
                        className="text-slate-400 hover:text-white" 
                        title="Refresh"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {queue.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            <p>Queue is empty.</p>
                            <p className="mt-2 text-xs">Upload bills from the "New Scan" tab.</p>
                        </div>
                    ) : (
                        <ul>
                            {queue.map(bill => (
                                <li 
                                    key={bill.id} 
                                    onClick={() => handleSelectBill(bill)}
                                    className={`p-3 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition ${selectedBill?.id === bill.id ? 'bg-slate-700 border-l-4 border-l-emerald-500' : ''}`}
                                >
                                    <div className="text-sm font-medium text-slate-200">
                                        Bill #{bill.id.substring(0, 8)}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 flex justify-between">
                                        <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
                                        <span className="text-yellow-400">Pending</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Main Split Screen */}
            <div className="flex-1 flex">
                {/* Left: Image */}
                <div className="w-1/2 bg-black flex flex-col items-center justify-center p-4 border-r border-slate-700 relative">
                     {selectedBill ? (
                         <div className="text-center">
                            {/* Placeholder for S3 Image */}
                            <div className="mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-slate-600 mx-auto">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 text-sm">Image Preview Unavailable (Local)</p>
                            <p className="text-xs text-slate-700 font-mono mt-2 break-all max-w-xs">{selectedBill.imageUrl}</p>
                        </div>
                     ) : (
                        <p className="text-slate-500">Select a bill to review</p>
                     )}
                </div>

                {/* Right: Form */}
                <div className="w-1/2 bg-slate-900 flex flex-col">
                     {selectedBill ? (
                        <>
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                             <h3 className="font-semibold text-white">Review Data</h3>
                             {selectedBill.parsedData?.confidence_score && (
                                 <span className={`text-xs px-2 py-1 rounded-full ${selectedBill.parsedData.confidence_score > 0.8 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                     {(selectedBill.parsedData.confidence_score * 100).toFixed(0)}% Confidence
                                 </span>
                             )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Meta Data */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Transaction Type</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                        defaultValue={selectedBill.parsedData?.suggested_type || 'SALE'}
                                    >
                                        <option value="SALE">SALE</option>
                                        <option value="PURCHASE">PURCHASE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                                    <input 
                                        type="text"
                                        defaultValue={selectedBill.parsedData?.data?.date || ''}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-semibold text-blue-400 mb-3">Customer / Supplier</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Name</label>
                                        <input 
                                            type="text"
                                            defaultValue={selectedBill.parsedData?.data?.customer_name || ''}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Line Items</h4>
                                <div className="border border-slate-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                                            <tr>
                                                <th className="p-3">Product</th>
                                                <th className="p-3 w-20">Qty</th>
                                                <th className="p-3 w-24">Price</th>
                                                <th className="p-3 w-24 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700 bg-slate-900">
                                            {selectedBill.parsedData?.data?.items?.map((item, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-800/50">
                                                    <td className="p-2">
                                                        <input 
                                                            type="text" 
                                                            defaultValue={item.product_name}
                                                            className="w-full bg-transparent outline-none text-white focus:text-violet-400"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input 
                                                            type="number" 
                                                            defaultValue={item.quantity}
                                                            className="w-full bg-transparent outline-none text-white focus:text-violet-400"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input 
                                                            type="number" 
                                                            defaultValue={item.unit_price}
                                                            className="w-full bg-transparent outline-none text-white focus:text-violet-400"
                                                        />
                                                    </td>
                                                     <td className="p-2 text-right font-mono text-emerald-400">
                                                        {item.line_total}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end pt-4 border-t border-slate-700">
                                <div className="text-right">
                                    <p className="text-sm text-slate-400">Total Amount</p>
                                    <p className="text-3xl font-bold text-emerald-400">{selectedBill.parsedData?.data?.total_amount}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
                                    Confirm & Save
                                </button>
                                <button className="px-6 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors">
                                    Discard
                                </button>
                            </div>

                        </div>
                        </>
                     ) : (
                         <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                             <p>Select a bill from the queue to review.</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL: Single Scan Review --- */}
      {showModal && extractedData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <div>
                <h2 className="text-2xl font-bold text-white">Review Extracted Data</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Verify and edit the information before saving
                </p>
              </div>
              {extractedData.confidence_score && (
                <span className={`text-sm px-3 py-1.5 rounded-full ${extractedData.confidence_score > 0.8 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {(extractedData.confidence_score * 100).toFixed(0)}% Confidence
                </span>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Extracted Info Display */}
              {extractedData.customer_name && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    <span className="font-medium">Extracted Customer:</span> {extractedData.customer_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Select the matching customer below or leave blank for cash sale</p>
                </div>
              )}

              {/* Date and Customer Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    value={extractedData.date || ''}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Customer</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    value={modalFormData.customerId}
                    onChange={(e) => setModalFormData({ ...modalFormData, customerId: e.target.value })}
                  >
                    <option value="">Select Customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Payment Method</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    value={modalFormData.paymentMethod}
                    onChange={(e) => setModalFormData({ ...modalFormData, paymentMethod: e.target.value })}
                  >
                    <option value="CASH">CASH</option>
                    <option value="CHECK">CHECK</option>
                    <option value="TRANSFER">TRANSFER</option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Line Items</h3>
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-left w-24">Qty</th>
                        <th className="p-3 text-left w-32">Unit Price</th>
                        <th className="p-3 text-right w-32">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {modalFormData.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50">
                          <td className="p-3">
                            <select
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm outline-none focus:border-violet-500"
                              value={item.productId}
                              onChange={(e) => updateModalItem(idx, 'productId', e.target.value)}
                            >
                              <option value="">Select Product...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (₹{p.sellingPrice})
                                </option>
                              ))}
                            </select>
                            {!item.productId && (
                              <p className="text-xs text-yellow-400 mt-1">Original: {item.productName}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm outline-none focus:border-violet-500"
                              value={item.quantity}
                              onChange={(e) => updateModalItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm outline-none focus:border-violet-500"
                              value={item.unitPrice}
                              onChange={(e) => updateModalItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-400">
                            ₹{item.lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Paid Amount (₹)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-violet-500 outline-none"
                      value={modalFormData.initialPaidAmount}
                      onChange={(e) => setModalFormData({ ...modalFormData, initialPaidAmount: e.target.value })}
                      placeholder="Enter amount paid"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-emerald-400">₹{calculateModalTotal().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/30 flex gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setExtractedData(null);
                }}
                className="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePurchase}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
                disabled={loading}
              >
                Save as Purchase
              </button>
              <button
                onClick={handleSaveSale}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save as Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    </div>
  );
}
