import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Building2, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAuthErrorMessage } from '../../services/authService';
import { sendWelcomeEmail } from '../../services/emailService';

export const SignupPage: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('Healthcare & Dental');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signup, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account — ZellonAI';
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, ownerName, businessName, category);
      
      // Send welcome email via Resend in the background
      sendWelcomeEmail({
        to: email,
        ownerName,
        businessName,
        slug: previewSlug,
      }).catch(console.warn);

      addToast('success', `Welcome to ZellonAI, ${ownerName || 'Partner'}!`, 'Account Created');
      navigate('/dashboard');
    } catch (err: unknown) {
      const friendlyMsg = getAuthErrorMessage(err);
      setErrorMessage(friendlyMsg);
      addToast('error', friendlyMsg, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  const previewSlug = businessName
    ? businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : 'your-business';

  return (
    <div id="signup-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Create account with Gmail ID & Password
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-lg">
          {/* Error Message Banner */}
          {errorMessage && (
            <div
              id="signup-error-banner"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-rose-900">Registration Error</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              id="signup-business-name"
              label="Business Name"
              placeholder="e.g. Apex Dental Care"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              leftIcon={<Building2 className="w-4 h-4" />}
              helperText={`Your review link will be: /r/${previewSlug}`}
            />

            <div>
              <label htmlFor="business-category" className="text-sm font-medium text-slate-700 block mb-1.5">
                Business Category
              </label>
              <select
                id="business-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                <option value="Healthcare & Dental">Healthcare & Dental</option>
                <option value="Restaurant & Dining">Restaurant & Dining</option>
                <option value="Automotive & Detailing">Automotive & Detailing</option>
                <option value="Beauty & Wellness">Beauty & Wellness</option>
                <option value="Home & Trade Services">Home & Trade Services</option>
                <option value="Legal & Professional">Legal & Professional</option>
                <option value="Other">Other Local Business</option>
              </select>
            </div>

            <Input
              id="signup-owner-name"
              label="Your Full Name"
              placeholder="Dr. Sarah Jenkins"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              id="signup-email"
              label="Gmail ID / Email Address"
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Use your Gmail or work email ID"
            />

            <Input
              id="signup-password"
              label="Create Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                id="signup-submit-btn"
                type="submit"
                variant="primary"
                className="w-full"
                size="md"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign Up with Gmail ID & Password
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-slate-500">Or sign up with</span>
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <button
            id="signup-google-btn"
            type="button"
            disabled={googleLoading}
            onClick={async () => {
              setGoogleLoading(true);
              setErrorMessage(null);
              try {
                await loginWithGoogle();
                addToast('success', 'Account created with Google!', 'Welcome');
                navigate('/dashboard');
              } catch (err: unknown) {
                const friendlyMsg = getAuthErrorMessage(err);
                setErrorMessage(friendlyMsg);
                addToast('error', friendlyMsg, 'Google Sign-Up Failed');
              } finally {
                setGoogleLoading(false);
              }
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Signing up…' : 'Sign up with Google'}
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            By creating an account, you agree to our{' '}
            <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            &{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
              Privacy Policy
            </Link>
            . No credit card required.
          </p>
        </Card>
      </div>
    </div>
  );
};
