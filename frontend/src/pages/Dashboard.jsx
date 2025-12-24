import { useState, useEffect } from 'react';
import api from '../api/axios';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Bar
} from 'recharts';

import {
  DollarSign,
  Package,
  Users,
  AlertCircle,
  Activity,
  Sparkles,
  CreditCard,
  Wallet
} from 'lucide-react';
import KPICard from '../components/KPICard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueExpense, setRevenueExpense] = useState([]);
  const [stockMovement, setStockMovement] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [agingCredits, setAgingCredits] = useState([]);
  const [insights, setInsights] = useState([]);

  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAIInsights();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        revExpRes,
        stockMovRes,
        lowStockRes,
        agingCredRes,
      ] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue-expense'),
        api.get('/dashboard/stock-movement'),
        api.get('/dashboard/alerts/low-stock'),
        api.get('/dashboard/alerts/aging-credit'),
      ]);

      setStats(statsRes.data);
      setRevenueExpense(revExpRes.data);
      setStockMovement(stockMovRes.data);
      setLowStockAlerts(lowStockRes.data);
      setAgingCredits(agingCredRes.data);
    } catch (error) {
      console.error('Dashboard data fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
     AI INSIGHTS (NON-BLOCKING)
  -------------------------------- */
  const fetchAIInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await api.get('/dashboard/ai-insights');
      setInsights(res.data);
    } catch (error) {
      console.error('AI insights fetch failed:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-forest-green border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 animate-pulse">
            Analyzing Farm Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6 pt-20">

        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-forest-green-light to-honey-gold-light bg-clip-text text-transparent">
              Farm Pulse
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time business intelligence
            </p>
          </div>

          <button
            onClick={() => {
              fetchDashboardData();
              fetchAIInsights();
            }}
            className="bg-forest-green hover:bg-forest-green-light px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Revenue" value={stats?.revenue?.value} change={stats?.revenue?.change} icon={DollarSign} prefix="$" />
          <KPICard title="Net Profit" value={stats?.profit?.value} change={stats?.profit?.change} icon={Wallet} prefix="$" />
          <KPICard title="Inventory Value" value={stats?.stockValue?.value} change={stats?.stockValue?.change} icon={Package} prefix="$" />
          <KPICard title="Outstanding Credit" value={stats?.credits?.value} change={stats?.credits?.change} icon={CreditCard} prefix="$" />
        </div>

        {/* ROW 2: REVENUE + AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* REVENUE CHART */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Revenue vs Expenses
            </h3>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueExpense}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#2E8B57" fillOpacity={0.3} fill="#2E8B57" />
                  <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={0.3} fill="#EF4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-honey-gold" />
              <h3 className="font-semibold text-honey-gold">
                Smart Insights
              </h3>
            </div>

            <div className="space-y-3">
              {insightsLoading && (
                <p className="text-slate-500 text-sm animate-pulse">
                  Generating insights…
                </p>
              )}

              {!insightsLoading && insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="text-sm bg-slate-900/50 p-3 rounded border border-slate-800"
                >
                  {insight}
                </div>
              ))}

              {!insightsLoading && insights.length === 0 && (
                <p className="text-slate-500 text-sm">
                  No insights available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: STOCK + ALERTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* STOCK MOVEMENT */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Stock Movement
            </h3>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stockMovement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales_count" name="Sold" fill="#2E8B57" />
                  <Bar dataKey="purchases_count" name="Purchased" fill="#D4AF37" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LOW STOCK + AGING CREDIT */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LOW STOCK */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <h3 className="font-semibold">
                  Low Stock Alerts
                </h3>
              </div>

              <div className="space-y-3">
                {lowStockAlerts.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-slate-800/50 p-3 rounded">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-xs text-rose-400 font-mono">
                      {item.current_stock} {item.unit}
                    </span>
                  </div>
                ))}

                {lowStockAlerts.length === 0 && (
                  <p className="text-sm text-slate-500 italic">
                    All stock levels healthy.
                  </p>
                )}
              </div>
            </div>

            {/* AGING CREDITS */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">
                  Overdue Payments
                </h3>
              </div>

              <div className="space-y-3">
                {agingCredits.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-slate-800/50 p-3 rounded">
                    <div>
                      <div className="text-sm">{item.name}</div>
                      <div className="text-xs text-rose-400">
                        Due: {item.due_date}
                      </div>
                    </div>
                    <span className="font-mono">
                      ${item.current_balance}
                    </span>
                  </div>
                ))}

                {agingCredits.length === 0 && (
                  <p className="text-sm text-slate-500 italic">
                    No overdue payments.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
