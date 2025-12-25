import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, History, PackagePlus, AlertTriangle, CheckCircle2, Factory } from 'lucide-react';

const ADJUSTMENT_TYPES = [
  { value: 'DAMAGE', label: 'Damage', color: 'text-red-400' },
  { value: 'THEFT', label: 'Theft', color: 'text-red-400' },
  { value: 'COUNT_ERROR', label: 'Count Error', color: 'text-orange-400' },
  { value: 'EXPIRY', label: 'Expiry', color: 'text-red-400' },
  { value: 'GIFT', label: 'Gift', color: 'text-blue-400' },
  { value: 'OTHER', label: 'Other', color: 'text-slate-400' }
];

export default function StockAdjustmentModal({ isOpen, onClose, product, onSuccess }) {
  const [activeTab, setActiveTab] = useState('adjust'); // 'adjust' | 'history'
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    adjustmentType: 'DAMAGE',
    quantity: 0,
    reason: '',
    operation: 'remove' // 'add' | 'remove' helper
  });

  useEffect(() => {
    if (isOpen && product) {
      setForm({ ...form, quantity: 0, reason: '', operation: 'remove' });
      setActiveTab('adjust');
      fetchHistory();
    }
  }, [isOpen, product]);

  const fetchHistory = async () => {
    if (!product) return;
    try {
      const res = await api.get(`/inventory/adjustments/${product.id}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting adjustment:', {
       productId: product?.id,
       quantity: form.quantity,
       type: form.adjustmentType,
       operation: form.operation
    });

    setLoading(true);
    try {
      const quantityValue = parseInt(form.quantity);
      if (!product || isNaN(quantityValue) || quantityValue === 0) {
          alert("Invalid quantity or product");
          setLoading(false);
          return;
      }

      const quantity = form.operation === 'add' ? Math.abs(quantityValue) : -Math.abs(quantityValue);
      
      const payload = {
        productId: product.id,
        adjustmentQuantity: quantity,
        adjustmentType: form.adjustmentType,
        reason: form.reason
      };
      
      console.log('Sending payload:', payload);

      await api.post('/inventory/adjust', payload);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Adjustment Error:', err);
      const msg = err.response?.data?.message || err.message || 'Adjustment failed';
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const currentStock = product?.currentStock || 0;
  const newStock = product ? currentStock + (form.operation === 'add' ? Math.abs(form.quantity) : -Math.abs(form.quantity)) : 0;

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-violet-400" />
              Adjust Stock
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {product.name} • Current Stock: <span className="text-white font-mono">{product.currentStock} {product.unit}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'adjust' ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-900/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Adjustment
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history' ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-900/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
             History ({history.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'adjust' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ADJUSTMENT_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, adjustmentType: type.value })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      form.adjustmentType === type.value
                        ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/50'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Quantity Input */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <label className="block text-sm font-medium text-slate-400 mb-4">Quantity Change</label>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, operation: 'remove' })}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        form.operation === 'remove' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Remove (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, operation: 'add' })}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        form.operation === 'add' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Add (+)
                    </button>
                  </div>
                  
                  <div className="flex-1 w-full">
                     <input
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-2xl font-mono text-white text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center text-sm">
                   <span className="text-slate-400">Resulting Stock:</span>
                   <div className={`flex items-center gap-2 font-mono font-bold text-lg ${newStock < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {product.currentStock} 
                      <span className="text-slate-500">→</span> 
                      {newStock}
                   </div>
                </div>
                {newStock < 0 && (
                   <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-900/10 p-2 rounded border border-red-900/20">
                      <AlertTriangle className="w-4 h-4" />
                      Cannot reduce stock below zero.
                   </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Reason (Optional)</label>
                <textarea
                  rows="3"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="E.g. Found broken bag during weekly count..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || newStock < 0 || form.quantity === 0}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          ) : (
            // History Tab
            <div className="space-y-4">
               {history.length === 0 ? (
                 <div className="text-center py-12 text-slate-500">No adjustment history found.</div>
               ) : (
                 <div className="relative border-l border-slate-800 ml-4 space-y-8 py-4">
                    {history.map((record) => (
                      <div key={record.id} className="relative pl-8">
                        {/* Timeline dot */}
                        <div className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                           record.adjustmentQuantity > 0 ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                               record.adjustmentQuantity > 0 
                               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                               : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                               {record.adjustmentType}
                            </span>
                            <div className="text-slate-300 text-sm mt-1">{record.reason || 'No reason provided'}</div>
                          </div>
                          <div className="text-right">
                             <div className={`font-mono font-bold ${record.adjustmentQuantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {record.adjustmentQuantity > 0 ? '+' : ''}{record.adjustmentQuantity}
                             </div>
                             <div className="text-xs text-slate-500">
                                {new Date(record.adjustedAt).toLocaleDateString()}
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
