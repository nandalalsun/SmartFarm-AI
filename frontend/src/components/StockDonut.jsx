import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d'];

export default function StockDonut({ data }) {
  const total = data ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  
  return (
    <div className="bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-800 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-[#39e09bff] mb-4">Stock Distribution</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data || []}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {(data || []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `$${value.toLocaleString()}`}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="text-center mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-slate-100">Total Stock Value</p>
        <p className="text-2xl font-bold text-[#ffb703]">
          ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}
