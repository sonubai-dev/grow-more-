import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X, ShieldAlert, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div id="admin-layout" className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar isAdmin={true} />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3">
              <button
                id="close-mobile-admin-sidebar"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar isAdmin={true} onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header id="admin-topbar" className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              id="open-mobile-admin-sidebar"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                System Administration Control
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              id="switch-to-client-portal-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business Client View</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Admin Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
