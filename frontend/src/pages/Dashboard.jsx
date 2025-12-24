import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Users, AlertCircle, ShoppingCart, 
  ArrowUpRight, ArrowDownRight, Activity, Sparkles, CreditCard, Wallet
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueExpense, setRevenueExpense] = useState([]);
  const [stockMovement, setStockMovement] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [agingCredits, setAgingCredits] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        statsRes, 
        revExpRes, 
        stockMovRes, 
        lowStockRes, 
        agingCredRes, 
        insightsRes
      ] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue-expense'),
        api.get('/dashboard/stock-movement'),
        api.get('/dashboard/alerts/low-stock'),
        api.get('/dashboard/alerts/aging-credit'),
        api.get('/dashboard/ai-insights')
      ]);

      setStats(statsRes.data);
      setRevenueExpense(revExpRes.data);
      setStockMovement(stockMovRes.data);
      setLowStockAlerts(lowStockRes.data);
      setAgingCredits(agingCredRes.data);
      setInsights(insightsRes.data);
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-forest-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 animate-pulse">Analyzing Farm Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6 pt-20">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-forest-green-light to-honey-gold-light bg-clip-text text-transparent">
              Farm Pulse
            </h1>
            <p className="text-slate-400 mt-1">Real-time business intelligence</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 transition">
              <TrendingUp className="w-5 h-5 text-honey-gold" />
            </button>
            <button 
              onClick={fetchAllData}
              className="bg-forest-green hover:bg-forest-green-light px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              <Activity className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Total Revenue" 
            value={stats?.revenue?.value} 
            change={stats?.revenue?.change}
            icon={DollarSign}
            color="emerald"
            prefix="$"
          />
          <KPICard 
            title="Net Profit" 
            value={stats?.profit?.value} 
            change={stats?.profit?.change}
            icon={Wallet}
            color="honey-gold"
            prefix="$"
          />
          <KPICard 
            title="Inventory Value" 
            value={stats?.stockValue?.value} 
            change={stats?.stockValue?.change}
            icon={Package}
            color="blue"
            prefix="$"
          />
          <KPICard 
            title="Outstanding Credit" 
            value={stats?.credits?.value} 
            change={stats?.credits?.change}
            icon={CreditCard}
            color="rose"
            prefix="$"
          />
        </div>

        {/* Row 2: Main Movement & AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-200">Revenue vs Expenses</h3>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Last 7 Days</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueExpense}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E8B57" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2E8B57" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}}
                    itemStyle={{color: '#e2e8f0'}}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2E8B57" 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorExp)" 
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Smart Insights */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <Sparkles className="w-24 h-24 text-honey-gold" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-honey-gold/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-honey-gold" />
              </div>
              <h3 className="font-semibold text-honey-gold">Smart Insights</h3>
            </div>

            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                  <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-forest-green-light"></div>
                  <p>{insight}</p>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-slate-500 text-sm">AI is analyzing your data...</p>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Mixed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Stock Movement */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Stock Movement</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stockMovement}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{fontSize: 10}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                  <Bar dataKey="sales_count" name="Sold" fill="#2E8B57" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="purchases_count" name="Purchased" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={20} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Low Stock Alerts */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <h3 className="font-semibold text-slate-200">Low Stock Alerts</h3>
              </div>
              <div className="space-y-3">
                {lowStockAlerts.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    <span className="text-sm text-slate-300">{item.name}</span>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
                      {item.current_stock} {item.unit}
                    </span>
                  </div>
                ))}
                {lowStockAlerts.length === 0 && (
                  <p className="text-sm text-slate-500 italic">All stock levels healthy.</p>
                )}
              </div>
            </div>

            {/* Aging Credits */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-200">Overdue Payments</h3>
              </div>
              <div className="space-y-3">
                {agingCredits.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    <div>
                      <div className="text-sm text-slate-300">{item.name}</div>
                      <div className="text-xs text-rose-400">Due: {item.due_date}</div>
                    </div>
                    <span className="text-sm font-mono text-slate-200">
                       ${item.current_balance}
                    </span>
                  </div>
                ))}
                {agingCredits.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No overdue payments.</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// Mini Component for KPI
const KPICard = ({ title, value, change, icon: Icon, color, prefix = "" }) => {
  const isPositive = change >= 0;
  
  // Color mappings for dynamic classes
  const colors = {
    emerald: "text-forest-green-light",
    "honey-gold": "text-honey-gold",
    blue: "text-blue-400",
    rose: "text-rose-400"
  };

  const bgColors = {
    emerald: "bg-forest-green-light/10",
    "honey-gold": "bg-honey-gold/10",
    blue: "bg-blue-400/10",
    rose: "bg-rose-400/10"
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm hover:border-slate-700 transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">
            {prefix}{value !== undefined ? value.toLocaleString() : '0'}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${bgColors[color]}`}>
          <Icon className={`w-5 h-5 ${colors[color]}`} />
        </div>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-1 text-xs font-medium">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-rose-500" />
          )}
          <span className={isPositive ? "text-emerald-500" : "text-rose-500"}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-slate-500 ml-1">vs last 7 days</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
