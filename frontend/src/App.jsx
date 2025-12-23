import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Customers from './pages/Customers';
import Products from './pages/Products';
import NewSale from './pages/NewSale';
import Dashboard from './pages/Dashboard';
import BillScanner from './pages/BillScanner';
import Transactions from './pages/Transactions';
import FarmAssistant from './components/FarmAssistant';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales/new" element={<NewSale />} />
          <Route path="/scan" element={<BillScanner />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </div>
      <FarmAssistant />
    </BrowserRouter>
  );
}

export default App;
