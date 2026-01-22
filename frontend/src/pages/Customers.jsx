import { useState } from 'react';
import { 
  useGetCustomersQuery, 
  useAddCustomerMutation, 
  useLazyGetCustomerProfitQuery 
} from '../api/baseApi';
import Toast from '../components/Toast';

import SettleBalanceModal from '../components/SettleBalanceModal';

export default function Customers() {
  const { data: customers = [], isLoading } = useGetCustomersQuery();
  const [addCustomer, { isLoading: isAdding }] = useAddCustomerMutation();
  const [getCustomerProfit] = useLazyGetCustomerProfitQuery();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    customerType: 'FARMER',
    creditLimit: '',
  });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [profitModalOpen, setProfitModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [profitData, setProfitData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Manual fetching removed in favor of hook subscription

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();

    const matchesSearch =
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || c.customerType === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleViewProfit = async customer => {
    setSelectedCustomer(customer);
    try {
      setProfitModalOpen(true);
      const result = await getCustomerProfit(customer.id).unwrap();
      setProfitData(result);
    } catch (err) {
      console.error('Failed to fetch profit', err);
      setToast({ message: 'Failed to fetch profit report', type: 'error' });
    }
  };

  const handleSettle = (customer) => {
    setSelectedCustomer(customer);
    setSettleModalOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name) {
      setToast({ message: 'Customer name is required', type: 'error' });
      return;
    }
    try {
      await addCustomer(form).unwrap();
      setForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        customerType: 'FARMER',
        creditLimit: '',
      });
      setToast({ message: '✓ Customer added successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to add customer', err);
      // Backend throws RuntimeException which might come as 500
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        'Failed to add customer (check if phone exists)';
      setToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          + Add Customer
        </button>
      </div>

      {/* Add Customer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold text-white">Add Customer</h2>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async e => {
                await handleSubmit(e);
                setAddModalOpen(false);
              }}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <select
                  value={form.customerType}
                  onChange={e => setForm({ ...form, customerType: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="FARMER">FARMER</option>
                  <option value="BUTCHER">BUTCHER</option>
                  <option value="RETAIL">RETAIL</option>
                </select>

                <input
                  type="number"
                  placeholder="Credit Limit"
                  value={form.creditLimit}
                  onChange={e => setForm({ ...form, creditLimit: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="mt-6 flex gap-3 sticky bottom-0 bg-slate-900 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-900 border-b border-slate-700">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>

            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="ALL">All Types</option>
            <option value="FARMER">FARMER</option>
            <option value="BUTCHER">BUTCHER</option>
            <option value="RETAIL">RETAIL</option>
          </select>
        </div>

        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Customer Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {filteredCustomers.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-white">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{c.customerType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{c.phone}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-mono font-medium ${
                  c.currentTotalBalance > 0 
                    ? 'text-emerald-400' 
                    : c.currentTotalBalance < 0 
                      ? 'text-rose-400' 
                      : 'text-slate-500'
                }`}>
                  {c.currentTotalBalance > 0 ? '+' : c.currentTotalBalance < 0 ? '-' : ''}${Math.abs(c.currentTotalBalance || 0).toLocaleString()}
                  <span className="text-[10px] ml-1 opacity-70 uppercase">
                    {c.currentTotalBalance > 0 ? 'Recv' : c.currentTotalBalance < 0 ? 'Pay' : ''}
                  </span>
                </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-3">
                  {Math.abs(c.currentTotalBalance) > 0.01 && (
                    <button
                      onClick={() => handleSettle(c)}
                      className={`${
                        c.currentTotalBalance > 0 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' 
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20'
                      } font-medium text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all`}
                    >
                      <span className="text-xs">Settle</span>
                    </button>
                  )}
                  {c.customerType === 'FARMER' && (
                    <button
                      onClick={() => handleViewProfit(c)}
                      className="text-white hover:text-violet-300 font-medium text-sm"
                    >
                      Profit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-slate-500">
                  No customers found.
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

      {/* Profit Modal */}
      {profitModalOpen && profitData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Profit Report</h2>
              <button
                onClick={() => setProfitModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-slate-400 text-sm">Customer</p>
              <p className="text-white font-medium text-lg">{selectedCustomer.name}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <span className="text-slate-300">Total Inputs (Bought)</span>
                <span className="text-red-400 font-mono font-medium">
                  -${profitData.inputsCost}
                </span>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <span className="text-slate-300">Deliveries (Sold to us)</span>
                <span className="text-emerald-400 font-mono font-medium">
                  +${profitData.deliveriesValue}
                </span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center text-sm">
                <span className="text-slate-400">Gross Earnings</span>
                <span className="text-white font-mono">
                  ${profitData.grossProfit}
                </span>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <span className="text-slate-300">Settled Amount</span>
                <span className="text-orange-400 font-mono font-medium">
                  -${profitData.settledAmount || 0}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
                <span className="text-white font-bold">Net Payable</span>
                <span
                  className={`font-mono font-bold text-xl ${profitData.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  ${profitData.profit}
                </span>
              </div>
            </div>

            <button
              onClick={() => setProfitModalOpen(false)}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settle Balance Modal */}
      {settleModalOpen && selectedCustomer && (
        <SettleBalanceModal
          customer={selectedCustomer}
          onClose={() => setSettleModalOpen(false)}
          onSuccess={() => {
            // fetchCustomers(); - Handled by invalidation
            setToast({ message: '✓ Balance settled successfully!', type: 'success' });
          }}
        />
      )}
    </div>
  );
}
