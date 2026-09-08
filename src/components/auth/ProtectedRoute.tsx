import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Loader2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false, children }) => {
  const { user, loading, verifyAdminStatus } = useAuth();
  const location = useLocation();
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);

  // Enforce noindex, nofollow on all protected dashboard and admin routes
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
      created = true;
    }
    meta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (created && meta && meta.parentNode) {
        meta.parentNode.removeChild(meta);
      } else if (meta) {
        meta.setAttribute('content', 'index, follow');
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (adminOnly && user) {
      if (user.role !== 'admin') {
        setAdminVerified(false);
      } else {
        setVerifyingAdmin(true);
        verifyAdminStatus()
          .then((isAuth) => {
            if (isMounted) {
              setAdminVerified(isAuth);
              setVerifyingAdmin(false);
            }
          })
          .catch(() => {
            if (isMounted) {
              setAdminVerified(false);
              setVerifyingAdmin(false);
            }
          });
      }
    } else {
      setAdminVerified(null);
    }
    return () => {
      isMounted = false;
    };
  }, [adminOnly, user]);

  // 1. Loading state while Firebase auth initializes
  if (loading || (adminOnly && verifyingAdmin)) {
    return (
      <div
        id="auth-loading-screen"
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4"
      >
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-4 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">ZellonAI</h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            {adminOnly ? 'Authorizing administrative credentials...' : 'Verifying your session...'}
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to Login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-based check if admin-only route
  if (adminOnly && (user.role !== 'admin' || adminVerified === false)) {
    return (
      <div id="admin-access-denied" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Admin Authorization Required</h2>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            Account <strong>{user.email}</strong> is not authorized to access platform administration commands.
          </p>
          <div className="space-y-2">
            <Button
              id="admin-denied-return-dashboard"
              variant="primary"
              className="w-full"
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Business Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

