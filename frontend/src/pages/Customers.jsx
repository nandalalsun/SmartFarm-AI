import { useState, useEffect } from 'react';
import api from '../api/axios';
import Toast from '../components/Toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    customerType: 'FARMER', 
    creditLimit: '' 
  });
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setToast({ message: 'Customer name is required', type: 'error' });
      return;
    }
    try {
      await api.post('/customers', form);
      setForm({ name: '', phone: '', email: '', address: '', customerType: 'FARMER', creditLimit: '' });
      fetchCustomers();
      setToast({ message: '✓ Customer added successfully!', type: 'success' });
    } catch (err) {
      console.error("Failed to add customer", err);
      setToast({ message: err.response?.data?.message || 'Failed to add customer', type: 'error' });
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Customers</h1>
      
      {/* Add Form */}
      <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Add Customer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={e => setForm({...form, address: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <select
            value={form.customerType}
            onChange={e => setForm({...form, customerType: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="FARMER">FARMER</option>
            <option value="BUTCHER">BUTCHER</option>
            <option value="RETAIL">RETAIL</option>
          </select>
          <input
            type="number"
            placeholder="Credit Limit"
            value={form.creditLimit}
            onChange={e => setForm({...form, creditLimit: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2 rounded-lg transition-colors md:col-span-2">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {customers.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-white">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{c.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-mono">${c.currentTotalBalance}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-slate-500">No customers found.</td>
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
    </div>
  );
}
