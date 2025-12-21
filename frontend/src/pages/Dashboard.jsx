import React, { useState, useEffect } from 'react';
// We'll create a simple finance endpoint or just aggregate local data for now if needed, 
// but plan says /api/finance/report. Let's create a placeholder or simple aggregation.

// Since the Backend Controller for /api/finance/report wasn't explicitly created in previous steps 
// (I missed it in the plan Execution, only did Sale/Purchase controllers), 
// I will create a simple FinanceController now or just use this page to show a placeholder 
// and then add the controller. 
// Actually, I should add the controller first. 
// But let's write this component to expect the API.

import axios from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });

  useEffect(() => {
    // For now, we might not have the endpoint ready, so let's try to fetch sales and sum them up client side
    // OR best practice: Implement the missing Controller first.
    // I will implement the controller in the next step.
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
       const res = await axios.get('/finance/report');
       setStats(res.data);
    } catch (err) {
      console.error("Error fetching finance stats", err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Finance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-400">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-400">₹{stats.totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 font-medium mb-2">Net Profit</h3>
          <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-violet-400' : 'text-orange-400'}`}>
            ₹{stats.netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
        <p className="text-slate-500">Charts and detailed analysis coming in Phase 3.</p>
      </div>
    </div>
  );
};

export default Dashboard;
