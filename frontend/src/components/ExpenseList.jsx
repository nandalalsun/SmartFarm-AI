import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ExpenseList = ({ refreshTrigger }) => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, [refreshTrigger]);

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

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/expenses');
            setExpenses(response.data);
            setFilteredExpenses(response.data);
        } catch (err) {
            console.error("Failed to fetch expenses", err);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const categories = [...new Set(expenses.map(e => e.categoryName))];

    return (
        <div className="bg-slate-900 rounded-lg shadow-md border border-slate-800 overflow-hidden">
             <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-white">Expense History</h2>
                
                <div className="flex space-x-2">
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-3 py-1 text-sm text-white"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-3 py-1 text-sm text-white"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-950">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Recorded By</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-slate-400">Loading...</td></tr>
                        ) : filteredExpenses.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-slate-400">No expenses found</td></tr>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-800/50 transition-colors">
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
                                        -{expense.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-slate-950 font-bold border-t border-slate-800">
                         <tr>
                            <td colSpan="5" className="px-6 py-4 text-right text-slate-200">Total Expenses</td>
                            <td className="px-6 py-4 text-right text-red-400">-{totalAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default ExpenseList;
