import React, { useState } from 'react';
import { api, setToken } from '../services/api';
import { User } from '../types';
import {
  Rocket, Mail, Lock, User as UserIcon, Loader2, X,
  ArrowLeft, CheckCircle, Eye, EyeOff,
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-step1' | 'forgot-step2';

interface AuthProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export const Auth: React.FC<AuthProps> = ({ initialMode = 'login', onSuccess, onClose }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Login / Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password fields
  const [fpEmail, setFpEmail] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpConfirmPass, setFpConfirmPass] = useState('');
  const [showFpPass, setShowFpPass] = useState(false);
  const [fpSuccess, setFpSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────
  const clearError = () => setError('');

  const goToMode = (m: AuthMode) => {
    clearError();
    setFpSuccess(false);
    setMode(m);
  };

  // ── Submit handlers ───────────────────────────────────────────────────────
  const handleLoginRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      setLoading(true);
      let res;
      if (mode === 'register') {
        if (!name.trim()) { setError('Name is required'); return; }
        res = await api.register(name.trim(), email, password);
      } else {
        res = await api.login(email, password);
      }
      setToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!fpEmail.trim()) { setError('Email is required'); return; }
    try {
      setLoading(true);
      await api.forgotPasswordVerify(fpEmail.trim());
      goToMode('forgot-step2');
    } catch (err: any) {
      setError(err.message || 'No account found with this email.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (fpNewPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (fpNewPass !== fpConfirmPass) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      await api.forgotPasswordReset(fpEmail, fpNewPass, fpConfirmPass);
      setFpSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Demo fills ────────────────────────────────────────────────────────────
  const fillDemoUser = () => { setEmail('founder@startup.com'); setPassword(''); };
  const fillDemoAdmin = () => { setEmail('admin@startup.com'); setPassword(''); };

  // ── Shared UI ─────────────────────────────────────────────────────────────
  const inputClass =
    'w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  const isForgot = mode === 'forgot-step1' || mode === 'forgot-step2';

  const headings: Record<AuthMode, { title: string; sub: string }> = {
    'login': {
      title: 'Welcome Back to Foundlily',
      sub: 'Sign in to access your startup dashboard & bookmarks',
    },
    'register': {
      title: 'Join Foundlily Ecosystem',
      sub: 'Register to submit your startup & protect your IP',
    },
    'forgot-step1': {
      title: 'Reset Your Password',
      sub: "Enter your registered email and we'll verify your account",
    },
    'forgot-step2': {
      title: 'Set a New Password',
      sub: `Choose a strong new password for ${fpEmail}`,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">{headings[mode].title}</h2>
          <p className="text-xs text-slate-400">{headings[mode].sub}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* ── Forgot Step 2 — Success state ── */}
        {mode === 'forgot-step2' && fpSuccess ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
              <p className="text-sm text-emerald-300 font-semibold text-center">
                Password updated successfully!
              </p>
              <p className="text-xs text-slate-400 text-center">
                You can now sign in with your new password.
              </p>
            </div>
            <button
              onClick={() => goToMode('login')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg hover:scale-[1.02] transition"
            >
              Go to Sign In
            </button>
          </div>

        ) : mode === 'forgot-step1' ? (
          /* ── Forgot Step 1 — Verify email ── */
          <form onSubmit={handleForgotStep1} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@startup.com"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Email'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => goToMode('login')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </button>
            </div>
          </form>

        ) : mode === 'forgot-step2' ? (
          /* ── Forgot Step 2 — Set new password ── */
          <form onSubmit={handleForgotStep2} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showFpPass ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
                  value={fpNewPass}
                  onChange={(e) => setFpNewPass(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowFpPass(!showFpPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showFpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showFpPass ? 'text' : 'password'}
                  required
                  placeholder="Repeat password"
                  value={fpConfirmPass}
                  onChange={(e) => setFpConfirmPass(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
              </div>
              {fpNewPass && fpConfirmPass && fpNewPass !== fpConfirmPass && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!fpConfirmPass && fpNewPass !== fpConfirmPass)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => goToMode('forgot-step1')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" /> Change Email
              </button>
            </div>
          </form>

        ) : (
          /* ── Login / Register form ── */
          <>
            <form onSubmit={handleLoginRegister} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Sarah Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@startup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => goToMode('forgot-step1')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Demo Quick Logins */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 text-center font-semibold">Quick Demo Login</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fillDemoUser}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300 transition"
                >
                  Fill User Email
                </button>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="flex-1 py-2 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl text-xs font-medium text-purple-300 transition"
                >
                  Fill Admin Email
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                Admin password is authenticated via the <code className="text-slate-400">ADMIN_PASSWORD</code> environment variable.
              </p>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => goToMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
