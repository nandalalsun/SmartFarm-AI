import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function KPICard({ title, value, trend, change }) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-slate-800 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-slate-100 mb-2">{title}</h3>
      
      <div className="flex items-end justify-between mb-3">
        <p className="text-3xl font-bold text-slate-100">
          ${value ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
        </p>
        
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      
      {/* Sparkline */}
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend || []}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-slate-100 mt-2">Last 7 days</p>
    </div>
  );
}
