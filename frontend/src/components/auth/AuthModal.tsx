import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { user, logout, isAuthModalOpen, setIsAuthModalOpen, login, register, loginDemo, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isSwitching, setIsSwitching] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          return;
        }
        await register(email, password, fullName);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please check your credentials.');
      }
    }
  };

  const handleDemoClick = async () => {
    setErrorMessage(null);
    try {
      await loginDemo();
    } catch {
      setErrorMessage('Could not initialize demo session.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* If user is logged in, show Profile details & switch account */}
        {user && !isSwitching ? (
          <div className="py-2">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-roseGold-500 text-white font-serif text-2xl font-bold shadow-md mb-3">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                {user.fullName || 'Fashion Enthusiast'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-stone-200/80 rounded-full text-[11px] font-medium text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user.email === 'demo@smartwardrobe.com' ? 'Demo Wardrobe Mode' : 'Personal Wardrobe'}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSwitching(true);
                  setTab('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-900 hover:bg-stone-100 text-stone-900 font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span>Switch / Sign In with Another Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-all shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 text-stone-100 shadow-md mb-3">
                <Sparkles className="w-6 h-6 text-roseGold-400" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                {tab === 'login' ? 'Welcome Back' : 'Create Your Studio'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {tab === 'login'
                  ? 'Access your private digital capsule wardrobe & lookbook'
                  : 'Begin curating your personal intelligent wardrobe'}
              </p>
            </div>

        {/* Quick Demo Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 shadow-sm border border-stone-700/50">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-roseGold-500/20 text-roseGold-300 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-stone-200 tracking-wide uppercase">Demo Wardrobe</p>
              <p className="text-xs text-stone-300 mt-0.5">
                Explore immediately with 22 pre-curated pieces and generated outfits.
              </p>
              <button
                type="button"
                onClick={handleDemoClick}
                disabled={isLoading}
                className="mt-2.5 w-full py-2 px-3 rounded-xl bg-roseGold-500 hover:bg-roseGold-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-[0.98]"
              >
                <span>⚡ Explore Demo Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-stone-200/60 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maria Popescu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs rounded-xl shadow transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : tab === 'login' ? 'Sign In to Wardrobe' : 'Create My Account'}
          </button>
        </form>
        </>
        )}
      </div>
    </div>
  );
};
