import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAuthErrorMessage } from '../../services/authService';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Sign In — ZellonAI';
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

  const redirectPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      addToast('success', 'Welcome back to your ZellonAI dashboard!', 'Signed In');
      const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || '';
      const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase());
      const isAdminLogin = adminEmails.includes(email.toLowerCase().trim());
      navigate(isAdminLogin ? '/admin' : redirectPath, { replace: true });
    } catch (err: unknown) {
      const friendlyMsg = getAuthErrorMessage(err);
      setErrorMessage(friendlyMsg);
      addToast('error', friendlyMsg, 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Zellon<span className="text-indigo-600">AI</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            create a new account
          </Link>
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-lg">
          {/* Error Message Banner */}
          {errorMessage && (
            <div
              id="login-error-banner"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-rose-900">Authentication Error</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              id="login-email"
              label="Gmail / Email Address"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <Input
                id="login-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              className="w-full mt-4"
              size="md"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

        </Card>

        {/* Back Link */}
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="text-slate-600 hover:text-indigo-600 font-semibold">
            ← Return to Home Page
          </Link>
        </p>
      </div>
    </div>
  );
};
