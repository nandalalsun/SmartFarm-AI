import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function RevenueChart({ data }) {
  return (
    <div className="bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-800 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-[#39e09bff] mb-4">Revenue vs Expenses</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data || []}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#39e09bff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#39e09bff" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" stroke="#718096" style={{ fontSize: '12px' }} />
          <YAxis stroke="#718096" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#06e488ff"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Sales"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorExpense)"
            name="Purchases"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
