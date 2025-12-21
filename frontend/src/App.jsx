import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Customers from './pages/Customers';
import Products from './pages/Products';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-6">
          FarmSmart AI
        </h1>
        <p className="text-slate-400 text-lg mb-8">Intelligent Poultry Management</p>
        <div className="flex justify-center gap-4">
          <Link to="/customers" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Manage Customers
          </Link>
          <Link to="/products" className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Manage Products
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
