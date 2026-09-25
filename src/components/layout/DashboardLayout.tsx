import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X, ExternalLink, Copy, Check, Star, ShieldCheck, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BusinessOnboardingView } from '../onboarding/BusinessOnboardingView';

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, currentBusiness, needsOnboarding, businessLoading, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If business profile is loading from Firestore
  if (businessLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading your business workspace...</p>
        </div>
      </div>
    );
  }

  // If user does not have a business profile yet, show Onboarding
  if (needsOnboarding) {
    return <BusinessOnboardingView />;
  }

  const publicReviewUrl = currentBusiness
    ? `${window.location.origin}/r/${currentBusiness.slug}`
    : `${window.location.origin}/r/solita-solutions`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicReviewUrl);
    setCopied(true);
    addToast('success', 'Public review link copied to clipboard!', 'Link Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast('info', 'You have been logged out.', 'Signed Out');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div id="dashboard-layout" className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
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
                id="close-mobile-sidebar"
                aria-label="Close navigation menu"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header id="dashboard-topbar" className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              id="open-mobile-sidebar"
              aria-label="Open navigation menu"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="truncate max-w-[140px] sm:max-w-[240px] md:max-w-[200px] lg:max-w-[400px]">
                  {currentBusiness?.businessName || currentBusiness?.name || 'My Business'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </h1>
            </div>
          </div>

          {/* User & Link Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-400">Review URL:</span>
              <span className="font-mono text-indigo-600 truncate max-w-[180px]">/r/{currentBusiness?.slug || 'solita-solutions'}</span>
              <button
                id="copy-review-url-btn"
                onClick={handleCopyLink}
                className="ml-1 p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                title="Copy public link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <Link
              to={`/r/${currentBusiness?.slug || 'solita-solutions'}`}
              target="_blank"
              rel="noopener noreferrer"
              id="preview-review-page-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-colors"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Preview Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Authenticated User Badge */}
            {user && (
              <div id="topbar-user-badge" className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  id="topbar-logout-btn"
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
