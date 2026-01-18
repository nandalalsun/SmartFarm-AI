import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, CreditCard, Banknote, Landmark, Check, AlertCircle, Info } from 'lucide-react';

const SettleBalanceModal = ({ customer, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unpaid Sales logic removed for Running Balance approach

  const calculatePreview = () => {
    // Only calculate balance impact
    const payAmount = parseFloat(amount) || 0;
    
    // Logic: Payment reduces balance. 
    // If balance is negative (Payable), this might be a Payout?
    // User interface logic: "Settle Balance" usually means updating specific debt.
    // For Running Balance:
    // New Balance = Current Balance - Payment Amount.
    // (Assuming User ALWAYS enters amount as positive 'payment')
    
    // Example 1: Owe 1000. Pay 600. New = 400.
    // Example 2: Owe -500 (Farmer Owes Us? OR We Owe Farmer?).
    // In this app: Positive = Customer Debt (Receivable). Negative = We Owe (Payable).
    // If We Owe -500. We Pay 300 (Payout). 
    // Logic: -500 + 300 = -200? Or -500 is "Credit". 
    // If we Pay, we are giving money. That means we owe less.
    // So -500 -> -200 (Closer to zero).
    // So if balance < 0, we ADD amount.
    // If balance > 0, we SUBTRACT amount.
    
    let newBalance = 0;
    if (customer.currentTotalBalance < 0) {
        newBalance = customer.currentTotalBalance + payAmount;
    } else {
        newBalance = customer.currentTotalBalance - payAmount;
    }

    return { newBalance };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        customerId: customer.id,
        amount: parseFloat(amount),
        paymentMethod,
        notes: remarks || 'Balance Settlement'
      };

      await api.post('/finance/settlements', payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Settlement failed', err);
      setError(err.response?.data?.message || 'Payment settlement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'CHECK', label: 'Check', icon: Check },
    { id: 'ESEWA', label: 'eSewa', icon: CreditCard }, // Using CreditCard icon for digital wallet
    { id: 'CARD', label: 'Card', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-violet-500" />
              Settle Balance
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Record payment for <span className="text-white font-medium">{customer.name}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Balance Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Outstanding</p>
              <div className="text-3xl font-mono font-bold text-white flex items-baseline gap-1">
                <span className="text-lg text-slate-500">$</span>
                {customer.currentTotalBalance?.toLocaleString()}
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="text-right animate-in slide-in-from-right-4 duration-300">
                <p className="text-emerald-400 text-sm font-medium mb-1">After Payment</p>
                <div className="text-2xl font-mono font-bold text-emerald-400 flex items-baseline justify-end gap-1">
                  <span className="text-sm opacity-60">$</span>
                  {calculatePreview().newBalance?.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form id="settle-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  // Max validation removed as we might want to overpay (Credit)
                  step="0.01"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-lg placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono"
                />
              </div>
              
              {/* Preview Balance Impact */}
              {amount && parseFloat(amount) > 0 && (
                 <div className="mt-3 bg-slate-800/50 p-3 rounded-lg flex justify-between items-center text-sm border border-slate-700/50">
                    <span className="text-slate-400">New Balance Estimate:</span>
                    <span className={`font-mono font-bold ${calculatePreview().newBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ${Math.abs(calculatePreview().newBalance).toLocaleString()}
                        <span className="text-xs opacity-60 ml-1">
                            {calculatePreview().newBalance < 0 ? '(Payable)' : '(Receivable)'}
                        </span>
                    </span>
                 </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`
                        relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                        ${isSelected 
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-xs font-medium">{method.label}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Remarks / Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Check number, transaction details, etc."
                rows="2"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          </form>

          {/* Unpaid Sales Info */}


          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="settle-form"
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-lg shadow-violet-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettleBalanceModal;
