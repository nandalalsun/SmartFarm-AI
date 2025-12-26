import React from 'react';

const TransactionPrintView = React.forwardRef(({ data, filters, summary }, ref) => (
  <div ref={ref} className="p-8 bg-white text-black">
    {/* HEADER */}
    <div className="border-b-2 border-gray-800 pb-4 mb-6">
      <h1 className="text-3xl font-bold text-gray-900">FarmSmart AI</h1>
      <p className="text-lg font-semibold mt-1">Transaction Report</p>
      <p className="text-sm text-gray-600 mt-2">
        Period: {filters.from} to {filters.to}
      </p>
      {filters.customer && (
        <p className="text-sm text-gray-600">Customer: {filters.customer}</p>
      )}
      {filters.status && (
        <p className="text-sm text-gray-600">Status: {filters.status}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Generated on {new Date().toLocaleString()}
      </p>
    </div>

    {/* SUMMARY CARDS */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="border border-gray-300 p-3 rounded">
        <p className="text-xs text-gray-600 font-semibold">Total Sales</p>
        <p className="text-xl font-bold">₹{summary?.totalSales?.toLocaleString('en-IN') || 0}</p>
      </div>
      <div className="border border-gray-300 p-3 rounded">
        <p className="text-xs text-gray-600 font-semibold">Total Received</p>
        <p className="text-xl font-bold text-green-700">₹{summary?.totalPaid?.toLocaleString('en-IN') || 0}</p>
      </div>
      <div className="border border-gray-300 p-3 rounded">
        <p className="text-xs text-gray-600 font-semibold">Outstanding</p>
        <p className="text-xl font-bold text-red-700">₹{summary?.totalOutstanding?.toLocaleString('en-IN') || 0}</p>
      </div>
    </div>

    {/* TABLE */}
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b-2 border-gray-800">
          <th className="text-left py-2 px-2 font-semibold">Date</th>
          <th className="text-left py-2 px-2 font-semibold">Customer</th>
          <th className="text-right py-2 px-2 font-semibold">Total</th>
          <th className="text-right py-2 px-2 font-semibold">Paid</th>
          <th className="text-right py-2 px-2 font-semibold">Balance</th>
          <th className="text-center py-2 px-2 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={row.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
            <td className="py-2 px-2 border-b border-gray-200">
              {new Date(row.date || row.createdAt).toLocaleDateString()}
            </td>
            <td className="py-2 px-2 border-b border-gray-200">
              {row.customerName || row.customer?.name}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-right font-mono">
              ₹{row.totalBillAmount?.toFixed(2)}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-right font-mono text-green-700">
              ₹{row.initialPaidAmount?.toFixed(2)}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-right font-mono text-red-700">
              ₹{row.remainingBalance?.toFixed(2)}
            </td>
            <td className="py-2 px-2 border-b border-gray-200 text-center text-xs">
              {row.paymentStatus}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-gray-800 font-bold">
          <td colSpan="2" className="py-3 px-2 text-right">TOTALS:</td>
          <td className="py-3 px-2 text-right font-mono">₹{summary?.totalSales?.toFixed(2)}</td>
          <td className="py-3 px-2 text-right font-mono text-green-700">₹{summary?.totalPaid?.toFixed(2)}</td>
          <td className="py-3 px-2 text-right font-mono text-red-700">₹{summary?.totalOutstanding?.toFixed(2)}</td>
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
