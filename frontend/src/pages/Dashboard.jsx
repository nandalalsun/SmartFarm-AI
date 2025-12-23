import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import KPICard from '../components/KPICard';
import RevenueChart from '../components/RevenueChart';
import StockDonut from '../components/StockDonut';
import CreditHeatmap from '../components/CreditHeatmap';
import AIInsights from '../components/AIInsights';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueExpenseData, setRevenueExpenseData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [topCredits, setTopCredits] = useState([]);
  const [aiInsights, setAIInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsRes, revenueRes, stockRes, creditsRes, insightsRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/revenue-expense'),
        axios.get('/dashboard/stock-distribution'),
        axios.get('/dashboard/top-credits'),
        axios.get('/dashboard/ai-insights')
      ]);
      
      setStats(statsRes.data);
      setRevenueExpenseData(revenueRes.data);
      setStockData(stockRes.data);
      setTopCredits(creditsRes.data);
      setAIInsights(insightsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1b4332] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1b4332]">Dashboard</h1>
          <p className="text-slate-100 mt-2">Your business at a glance</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Revenue" 
            value={stats?.revenue?.value || 0}
            trend={stats?.revenue?.trend || []}
            change={stats?.revenue?.change || 0}
          />
          <KPICard 
            title="Profit" 
            value={stats?.profit?.value || 0}
            trend={stats?.profit?.trend || []}
            change={stats?.profit?.change || 0}
          />
          <KPICard 
            title="Stock Value" 
            value={stats?.stockValue?.value || 0}
            trend={stats?.stockValue?.trend || []}
            change={stats?.stockValue?.change || 0}
          />
          <KPICard 
            title="Credits" 
            value={stats?.credits?.value || 0}
            trend={stats?.credits?.trend || []}
            change={stats?.credits?.change || 0}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - Spans 2 columns */}
          <div className="lg:col-span-2">
            <RevenueChart data={revenueExpenseData} />
          </div>
          
          {/* Stock Donut - 1 column */}
          <div>
            <StockDonut data={stockData} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credit Heatmap - Spans 2 columns */}
          <div className="lg:col-span-2">
            <CreditHeatmap customers={topCredits} />
          </div>
          
          {/* AI Insights - 1 column */}
          <div>
            <AIInsights insights={aiInsights} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
