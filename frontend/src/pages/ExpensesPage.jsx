import React, { useState, useEffect } from 'react';
import { 
    useGetExpensesQuery, 
    useGetExpenseCategoriesQuery, 
    useAddExpenseMutation 
} from '../api/baseApi';
import api from '../api/axios'; // Keeping for auth/me only
import Toast from '../components/Toast';

const ExpensesPage = () => {
    const { data: expenses = [], isLoading: expensesLoading } = useGetExpensesQuery();
    const { data: categories = [] } = useGetExpenseCategoriesQuery();
    const [addExpense] = useAddExpenseMutation();

    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterDate, setFilterDate] = useState('');
    // const [loading, setLoading] = useState(true); // Handled by hook
    const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        categoryId: '',
        recordedByUserId: ''
    });

    useEffect(() => {
        // fetchExpenses(); - managed by RTK Query
        // fetchCategories(); - managed by RTK Query
        fetchCurrentUser();
        
        // Auto-select first category if available and not selected
        if (categories.length > 0 && !formData.categoryId) {
             setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
        }
    }, [categories]);

    useEffect(() => {
        let result = expenses;
        if (filterCategory) {
            result = result.filter(e => e.categoryName === filterCategory);
        }
        if (filterDate) {
            result = result.filter(e => e.expenseDate.startsWith(filterDate));
        }
        setFilteredExpenses(result);
    }, [expenses, filterCategory, filterDate]);

    /* Manual fetchers removed */
    
    const fetchCurrentUser = async () => {
        try {
             const response = await api.get('/auth/me');
             setFormData(prev => ({ ...prev, recordedByUserId: response.data.id }));
        } catch (err) {
            console.error("Failed to fetch user", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await addExpense(formData).unwrap();
            setToast({ message: '✓ Expense recorded successfully!', type: 'success' });
            setAddExpenseModalOpen(false);
            // Reset form (keep date and user)
            setFormData(prev => ({
                ...prev,
                amount: '',
                description: '',
                paymentMethod: 'CASH'
            }));
        } catch (err) {
            console.error("Failed to save expense", err);
            setToast({ message: err?.data?.message || 'Failed to save expense', type: 'error' });
        }
    };

    const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const uniqueCategories = [...new Set(expenses.map(e => e.categoryName))];

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header with Add Button */}
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        Expense Management
                    </h1>
                    <p className="text-slate-400 mt-1">Track and manage non-inventory operational expenses.</p>
                </div>
                <button
                    onClick={() => setAddExpenseModalOpen(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                    + Add Expense
                </button>
            </div>

            {/* Add Expense Modal */}
            {addExpenseModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700">
                            <h2 className="text-xl font-semibold text-white">Add New Expense</h2>
                            <button
                                onClick={() => setAddExpenseModalOpen(false)}
                                className="text-slate-400 hover:text-white text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    rows="3"
                                    placeholder="Expense details..."
                                ></textarea>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setAddExpenseModalOpen(false)}
                                    className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium"
                                >
                                    Record Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense List */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Expense History</h2>
                    
                    <div className="flex space-x-2">
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">All Categories</option>
                            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Recorded By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {expensesLoading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-slate-400">Loading...</td></tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-slate-400">No expenses found</td></tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {new Date(expense.expenseDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                            <span className="bg-violet-900/40 text-violet-300 px-2 py-1 rounded-full text-xs">
                                                {expense.categoryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-slate-300 max-w-xs truncate">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {expense.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {expense.recordedByUserName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-400 text-right">
                                            ${expense.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-slate-900 font-bold border-t border-slate-700">
                             <tr>
                                <td colSpan="5" className="px-6 py-4 text-right text-slate-200">Total Expenses</td>
                                <td className="px-6 py-4 text-right text-red-400">${totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: '' })}
            />
        </div>
    );
};

export default ExpensesPage;
