import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Globe,
  Building2,
  Settings,
  Sparkles,
  ExternalLink,
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  isAdmin?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false, onCloseMobile }) => {
  const { user, currentBusiness, logout } = useAuth();
  const location = useLocation();

  const businessNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Feedback & Reviews', path: '/dashboard/feedback', icon: MessageSquare },
    { label: 'Analytics & Trends', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Public Review Page', path: '/dashboard/review-page', icon: Globe },
    { label: 'Business Profile', path: '/dashboard/profile', icon: Building2 },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Businesses', path: '/admin/businesses', icon: Building2 },
    { label: 'All Feedback Stream', path: '/admin/feedback', icon: MessageSquare },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : businessNavItems;

  const publicReviewUrl = currentBusiness ? `/r/${currentBusiness.slug}` : '/r/apex-dental';

  return (
    <aside id="app-sidebar" className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight leading-none">
              Zellon<span className="text-indigo-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              {isAdmin ? 'System Admin' : 'Business Portal'}
            </span>
          </div>
        </Link>
      </div>

      {/* Active Business / Admin Banner */}
      {!isAdmin && currentBusiness && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Active Business</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium capitalize">
              {currentBusiness.plan}
            </span>
          </div>
          <p className="text-xs font-bold text-white truncate">{currentBusiness.name}</p>
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
            <Link
              to={publicReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>View Review URL</span>
              <ExternalLink className="w-3 h-3 text-indigo-400" />
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {isAdmin ? 'Administration' : 'Menu'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              id={`sidebar-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-indigo-200 opacity-60" />}
            </NavLink>
          );
        })}
      </div>

      {/* Portal Switcher & User Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {/* Quick link to switch between Business and Admin */}
        <div className="px-1 py-1">
          {isAdmin && (
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Go to Business Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* User profile footer */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">{user?.name || 'Demo User'}</span>
              <span className="text-[10px] text-slate-400 truncate">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
