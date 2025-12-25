export default function AIInsights({ insights }) {
  return (
    <div className="bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
        </div>
        <h3 className="text-lg font-bold text-[#39e09bff]">AI Intelligence</h3>
        <span className="text-xs text-slate-100 ml-auto">Live</span>
      </div>

      <div className="space-y-4">
        {insights && insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="flex gap-3 items-start">
              <span className="text-[#39e09bff] text-lg mt-0.5 flex-shrink-0">•</span>
              <p className="text-sm text-slate-100 leading-relaxed">{insight}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-100 text-center py-4">Loading insights...</p>
        )}
      </div>
    </div>
  );
}
