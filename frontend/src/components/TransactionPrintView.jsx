import React from 'react';

const TransactionPrintView = React.forwardRef(({ data, filters, summary }, ref) => (
  <div ref={ref} className="p-8 bg-white text-black">
    {/* HEADER */}
    <div className="border-b-2 border-gray-800 pb-4 mb-6">
      <h1 className="text-3xl font-bold text-gray-900">FarmSmart AI</h1>
      <p className="text-lg font-semibold mt-1">Unified Ledger Report</p>
      <p className="text-sm text-gray-600 mt-2">
        Period: {filters.from} to {filters.to}
      </p>
      {filters.customer && <p className="text-sm text-gray-600">Customer: {filters.customer}</p>}
      {filters.status && <p className="text-sm text-gray-600">Type/Status: {filters.status}</p>}
      <p className="text-xs text-gray-500 mt-1">Generated on {new Date().toLocaleString()}</p>
    </div>

    {/* SUMMARY CARDS */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="border border-gray-300 p-3 rounded">
        <p className="text-xs text-gray-600 font-semibold">Total Sales</p>
        <p className="text-xl font-bold">₹{summary?.totalSales?.toLocaleString('en-IN') || 0}</p>
      </div>
      <div className="border border-gray-300 p-3 rounded">
        <p className="text-xs text-gray-600 font-semibold">Total Purchases</p>
        <p className="text-xl font-bold text-amber-700">
          ₹{summary?.totalPurchases?.toLocaleString('en-IN') || 0}
        </p>
      </div>
      <div className="border border-gray-300 p-3 rounded">
        <p className="text-xs text-gray-600 font-semibold">Net Outstanding</p>
        <p className={`text-xl font-bold ${summary?.netOutstanding >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {summary?.netOutstanding >= 0 ? '' : ''}₹{Math.abs(summary?.netOutstanding || 0).toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-gray-500">
            {summary?.netOutstanding >= 0 ? 'Receivable' : 'Payable'}
        </p>
      </div>
    </div>

    {/* TABLE */}
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b-2 border-gray-800">
          <th className="text-left py-2 px-2 font-semibold">Date</th>
          <th className="text-left py-2 px-2 font-semibold">Type</th>
          <th className="text-left py-2 px-2 font-semibold">Customer / Supplier</th>
          <th className="text-right py-2 px-2 font-semibold">Amount</th>
          <th className="text-right py-2 px-2 font-semibold">Paid</th>
          <th className="text-right py-2 px-2 font-semibold">Balance</th>
          <th className="text-center py-2 px-2 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={row.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
            <td className="py-2 px-2 border-b border-gray-200">
              {new Date(row.date).toLocaleDateString()}
            </td>
             <td className="py-2 px-2 border-b border-gray-200 text-xs font-bold uppercase text-gray-500">
              {row.type}
            </td>
            <td className="py-2 px-2 border-b border-gray-200">
              <div className="font-medium">{row.customerName}</div>
              {row.customerPhone && row.customerPhone !== 'N/A' && <div className="text-xs text-gray-500">{row.customerPhone}</div>}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-right font-mono">
              ₹{row.amount?.toLocaleString('en-IN')}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-right font-mono text-green-700">
              ₹{row.paidAmount?.toLocaleString('en-IN')}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-right font-mono text-red-700">
              ₹{row.balance?.toLocaleString('en-IN')}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-center text-xs">
              {row.status?.replace('_', ' ')}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-gray-800 font-bold">
          <td colSpan="3" className="py-3 px-2 text-right">TOTALS:</td>
          <td className="py-3 px-2 text-right font-mono">₹{summary?.totalAmountCol?.toLocaleString('en-IN')}</td>
          <td className="py-3 px-2 text-right font-mono text-green-700">₹{summary?.totalPaidCol?.toLocaleString('en-IN')}</td>
          <td className="py-3 px-2 text-right font-mono text-red-700">₹{summary?.totalBalanceCol?.toLocaleString('en-IN')}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    {/* FOOTER */}
    <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
      <p>FarmSmart AI - Farm Management System</p>
      <p>This is a computer-generated report</p>
    </div>
  </div>
));

TransactionPrintView.displayName = 'TransactionPrintView';

export default TransactionPrintView;
