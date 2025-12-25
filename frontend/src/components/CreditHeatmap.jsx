export default function CreditHeatmap({ customers }) {
  const getProgressColor = percentage => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = percentage => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!customers || customers.length === 0) {
    return (
      <div className="bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-800 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-bold text-[#39e09bff] mb-4">Top 5 Credit Accounts</h3>
        <p className="text-center text-slate-100 py-8">No credit accounts found</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-800 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-[#39e09bff] mb-6">Top 5 Credit Accounts</h3>

      <div className="space-y-5">
        {customers.map(customer => {
          const percentage = (customer.currentBalance / customer.creditLimit) * 100;

          return (
            <div key={customer.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-100">{customer.name}</span>
                <span className={`text-sm font-semibold ${getTextColor(percentage)}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-100">
                <span>${customer.currentBalance.toLocaleString()}</span>
                <span>Limit: ${customer.creditLimit.toLocaleString()}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
