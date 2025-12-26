import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors'
      : 'text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors';

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mr-8"
            >
              FarmSmart AI
            </Link>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/customers" className={navLinkClass}>
                  Customers
                </NavLink>
                <NavLink to="/products" className={navLinkClass}>
                  Products
                </NavLink>
                <NavLink to="/sales/new" className={navLinkClass}>
                  New Sale
                </NavLink>
                <NavLink to="/transactions" className={navLinkClass}>
                  Transactions
                </NavLink>
                <NavLink to="/scan" className={navLinkClass}>
                  Scan Bill
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
