import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAuthErrorMessage } from '../../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { resetPassword } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    document.title = 'Reset Password — ZellonAI';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSubmitted(true);
      addToast('success', `Reset link sent to ${email}`, 'Email Dispatched');
    } catch (err: unknown) {
      const friendlyMsg = getAuthErrorMessage(err);
      setErrorMessage(friendlyMsg);
      addToast('error', friendlyMsg, 'Reset Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgot-password-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Grow<span className="text-indigo-600">More</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-lg">
          {errorMessage && (
            <div
              id="reset-error-banner"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-rose-900">Unable to send reset email</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check your inbox</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We sent a password reset link to <strong className="text-slate-900">{email}</strong>. Please check your spam folder if it doesn't arrive within a couple minutes.
              </p>
              <div className="pt-4 space-y-2">
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full text-xs text-slate-500 hover:text-indigo-600 font-medium py-2"
                >
                  Resend or try another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="reset-email"
                label="Registered Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Button
                id="reset-submit-btn"
                type="submit"
                variant="primary"
                className="w-full mt-2"
                size="md"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
