import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, change, icon: Icon, prefix = '' }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      <div className="flex justify-between mb-3">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">
            {prefix}{value?.toLocaleString() ?? 0}
          </h3>
        </div>

        {Icon && (
          <Icon className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {typeof change === 'number' && (
        <div
          className={`text-xs flex items-center gap-1 ${
            isPositive ? 'text-emerald-500' : 'text-rose-500'
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default KPICard;