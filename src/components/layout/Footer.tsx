import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Lock, Star, Building2, Mail, MessageCircle, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="sm:col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Zellon<span className="text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The modern customer feedback and Google Review engine built for growth-minded local businesses, dental practices, restaurants, and clinics.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-500 pt-2">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Google API Compliant
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> 256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Core Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="https://g.page/r/CaN_yK2UD5qJEBI/review" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-amber-400 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" /> Sample Review Page</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Business Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Free Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              <Link to="/legal" className="hover:text-indigo-400 transition-colors">
                Security & Legal
              </Link>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/google-guidelines" className="hover:text-white transition-colors">
                  Google Policy Guidelines
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white transition-colors">
                  Security & GDPR
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Developer Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company &amp; Support
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Solita Solutions</strong>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> Gaya, Bihar 824232, India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <a href="mailto:help.solita@gmail.com" className="hover:text-white text-slate-300 transition-colors truncate">
                  help.solita@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/919341718066"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 text-slate-300 font-medium transition-colors"
                >
                  WhatsApp: +91 9341718066
                </a>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
                <span>Verified Developer &amp; Author: </span>
                <strong className="text-slate-300">Solita Solutions</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ZellonAI — Powered by Solita Solutions. All rights reserved.</p>
          <p className="flex items-center gap-2 text-center sm:text-right">
            <span>Developed &amp; Maintained by <strong className="text-slate-300">Solita Solutions</strong> • Gaya, Bihar 824232, India</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
