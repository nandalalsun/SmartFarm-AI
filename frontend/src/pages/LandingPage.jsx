import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  ShoppingBag, 
  Users, 
  ScanLine, 
  Bot, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  BarChart3
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30">
      
      {/* --- Navbar (Simple Version for Landing) --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                FarmSmart AI
              </span>
            </div>
            <div>
              <Link 
                to="/login" 
                className="group relative inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white transition-all duration-200 bg-white/10 border border-white/10 rounded-full hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 focus:ring-white"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                
                {/* Glow Effect */}
                <div className="absolute inset-0 -z-10 rounded-full blur-md transition duration-200 bg-violet-600/0 group-hover:bg-violet-600/30"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 transform -translate-x-1/2 left-1/2 w-full h-[800px] bg-violet-600/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 text-violet-300 text-xs font-medium mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
            Now with AI-Powered Bill Scanning
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 animate-fade-in-up delay-100">
            Smart Management for <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400">
              Modern Poultry Farms
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 animate-fade-in-up delay-200 leading-relaxed">
            Automate expenses, track sales, and boost profitability with intelligent insights. 
            The all-in-one platform designed solely for poultry business owners.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-violet-600 rounded-xl hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 focus:ring-violet-600"
            >
              Get Started for Free
            </Link>
            <a 
              href="#features" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-300 transition-all duration-200 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white hover:-translate-y-1 backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>

          {/* Hero Mockup/Visual */}
          <div className="mt-20 relative animate-fade-in-up delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="p-2 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90">
                 {/* Mock Card 1 */}
                 <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">+12%</span>
                    </div>
                    <p className="text-slate-400 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold text-white mt-1">$24,500</p>
                 </div>
                 {/* Mock Card 2 */}
                 <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-violet-500/10 rounded-lg">
                        <Users className="w-6 h-6 text-violet-400" />
                      </div>
                      <span className="text-xs text-violet-400 font-mono">+5 New</span>
                    </div>
                    <p className="text-slate-400 text-sm">Active Customers</p>
                    <p className="text-2xl font-bold text-white mt-1">142</p>
                 </div>
                 {/* Mock Card 3 */}
                 <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-pink-500/10 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-pink-400" />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Today</span>
                    </div>
                    <p className="text-slate-400 text-sm">Daily Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">$1,250</p>
                 </div>
                 {/* Mock Chart Area */}
                 <div className="col-span-1 md:col-span-3 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex p-4 rounded-full bg-slate-900 mb-4">
                        <LineChart className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm">Interactive Analytics Dashboard</p>
                    </div>
                 </div>
              </div>
            </div>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to run your farm</h2>
            <p className="text-slate-400 text-lg">
              Replace messy notebooks and spreadsheets with a unified, professional system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ScanLine />}
              color="text-pink-400"
              bg="bg-pink-400/10"
              title="Instant Bill Scanning"
              description="Simply snap a photo of your paper bills. Our AI instantly extracts details and records expenses."
            />
            <FeatureCard 
              icon={<Bot />}
              color="text-violet-400"
              bg="bg-violet-400/10"
              title="AI Farm Assistant"
              description="Ask questions about your data, generate reports, or get farming advice from your 24/7 innovative assistant."
            />
            <FeatureCard 
              icon={<LineChart />}
              color="text-emerald-400"
              bg="bg-emerald-400/10"
              title="Profit Analytics"
              description="Visualize your financial health with real-time charts. Know exactly where your money is coming from and going."
            />
            <FeatureCard 
              icon={<Users />}
              color="text-blue-400"
              bg="bg-blue-400/10"
              title="Customer Management"
              description="Keep track of all your customers, their purchase history, and outstanding balances in one place."
            />
            <FeatureCard 
              icon={<ShoppingBag />}
              color="text-amber-400"
              bg="bg-amber-400/10"
              title="Inventory & Sales"
              description="Manage stock levels automatically. Record sales quickly with a POS-like interface designed for speed."
            />
            <FeatureCard 
              icon={<ShieldCheck />}
              color="text-cyan-400"
              bg="bg-cyan-400/10"
              title="Bank-Grade Security"
              description="Your data is encrypted and secure. Role-based access ensures only authorized staff see sensitive info."
            />
          </div>
        </div>
      </section>

      {/* --- AI Spotlight Section --- */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual Side */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center">
                      <Bot className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Farm AI Assistant</h3>
                      <p className="text-slate-400 text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                      </p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[80%]">
                        How much profit did we make last week?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] shadow-sm">
                        <p className="mb-2">Based on your sales and expenses, here is your profit summary for last week:</p>
                        <ul className="space-y-1 mb-2">
                           <li className="flex justify-between">
                             <span>Total Sales:</span> <span className="text-emerald-400 font-mono">$4,250</span>
                           </li>
                           <li className="flex justify-between">
                             <span>Expenses:</span> <span className="text-red-400 font-mono">$1,800</span>
                           </li>
                           <li className="flex justify-between border-t border-slate-600 pt-1 font-bold">
                             <span>Net Profit:</span> <span className="text-white font-mono">$2,450</span>
                           </li>
                        </ul>
                        <p>That's a <span className="text-emerald-400 font-bold">12% increase</span> from the previous week! 🚀</p>
                      </div>
                    </div>
                 </div>

                 <div className="mt-6 flex gap-2">
                   <div className="h-10 flex-1 bg-slate-900 border border-slate-700 rounded-lg"></div>
                   <div className="h-10 w-10 bg-violet-600 rounded-lg"></div>
                 </div>
              </div>
            </div>

            {/* Text Side */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/30 border border-violet-500/30 text-violet-300 text-xs font-bold mb-6 uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                Powered by Advanced AI
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Your personal farm analyst, available 24/7.
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                SmartFarm AI isn't just a database. It actively helps you make better decisions. 
                Upload messy bills, and it reads them. Ask complex questions about your finances, 
                and it answers instantly with data-backed insights.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Optical Character Recognition (OCR) for Bills",
                  "Natural Language Querying for Data",
                  "Automated Profit & Loss Calculation",
                  "Smart Inventory Alerts"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-white">F</div>
             <span className="text-slate-500 font-semibold">FarmSmart AI © 2026</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500">
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/legal/about" className="hover:text-white transition-colors">About Us</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

// Helper Component for Features
const FeatureCard = ({ icon, title, description, color, bg }) => (
  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300 group">
    <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {React.cloneElement(icon, { className: `w-7 h-7 ${color}` })}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">
      {description}
    </p>
  </div>
);

export default LandingPage;
