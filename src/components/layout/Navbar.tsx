import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" id="nav-brand-logo" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Grow<span className="text-indigo-600">More</span>
              </span>
              <span className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mt-0.5">
                Google Review Growth
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links - Clean, Simple, Essential Only */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="/#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="/#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="/#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button id="nav-dashboard-btn" variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                  </Button>
                </Link>
                <button
                  id="nav-logout-btn"
                  onClick={logout}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button id="nav-login-btn" variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button id="nav-signup-btn" variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2 pt-2 text-sm font-medium text-slate-700">
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Features
            </a>
            <a
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Pricing
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
