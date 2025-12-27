import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Customers from './pages/Customers';
import Products from './pages/Products';
import NewSale from './pages/NewSale';
import Dashboard from './pages/Dashboard';
import BillScanner from './pages/BillScanner';
import Transactions from './pages/Transactions';
import FarmAssistant from './components/FarmAssistant';
import Login from './pages/Login';
import Verify2FA from './pages/Verify2FA';
import AcceptInvite from './pages/AcceptInvite';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

            {/* Protected Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/sales/new" element={<NewSale />} />
                  <Route path="/scan" element={<BillScanner />} />
                  <Route path="/transactions" element={<Transactions />} />
                </Routes>
                <FarmAssistant />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
