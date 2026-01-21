import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ExpenseForm = ({ onExpenseAdded }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        categoryId: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        console.log('🔍 Fetching categories from: /finance/expense-categories');
        try {
            const response = await api.get('/finance/expense-categories');
            console.log('✅ Categories loaded:', response.data);
            setCategories(response.data);
            if(response.data.length > 0) {
                setFormData(prev => ({ ...prev, categoryId: response.data[0].id }));
            }
        } catch (err) {
            console.error("❌ Failed to fetch categories", err);
            setError("Failed to load categories");
        }
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.post('/finance/expenses', formData);
            console.log('✅ Expense created:', response.data);
            onExpenseAdded && onExpenseAdded();
            // Reset form (keep date and user)
            setFormData(prev => ({
                ...prev,
                amount: '',
                description: '',
                paymentMethod: 'CASH'
            }));
        } catch (err) {
            setError("Failed to save expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-lg shadow-md border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-violet-400">Add New Expense</h2>
            {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:ring-violet-500 focus:border-violet-500"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                        <input
                            type="date"
                            name="expenseDate"
                            value={formData.expenseDate}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:ring-violet-500 focus:border-violet-500"
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:ring-violet-500 focus:border-violet-500"
                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHECK">Check</option>
                            <option value="ESEWA">eSewa</option>
                            <option value="KHALTI">Khalti</option>
                            <option value="CARD">Card</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:ring-violet-500 focus:border-violet-500"
                        rows="3"
                        placeholder="Expense details..."
                    ></textarea>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Record Expense'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
