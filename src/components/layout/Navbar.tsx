import React, { useState } from 'react';
import { Rocket, Search, User, Shield, Bookmark, PlusCircle, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { User as UserType } from '../../types';

interface NavbarProps {
  user: UserType | null;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onOpenAuth, onLogout, currentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('explore', `q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Foundlily
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
              Startup & IP Directory
            </span>
          </div>
        </div>

        {/* Global Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search startups, founders, AI, IP patents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </form>

        {/* Navigation Actions */}
        <nav className="hidden lg:flex items-center gap-5">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm font-medium transition hover:text-indigo-400 ${currentView === 'home' ? 'text-indigo-400' : 'text-slate-300'}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className={`text-sm font-medium transition hover:text-indigo-400 ${currentView === 'explore' ? 'text-indigo-400' : 'text-slate-300'}`}
          >
            Explore
          </button>
          <button
            onClick={() => onNavigate('trending')}
            className={`text-sm font-medium flex items-center gap-1.5 transition hover:text-indigo-400 ${currentView === 'trending' ? 'text-indigo-400' : 'text-slate-300'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Trending
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                Dashboard
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}

              <div className="flex items-center gap-2 pl-2">
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-indigo-500/50 bg-slate-800"
                />
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-sm font-medium px-4 py-2 text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search startups, founders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-400"
            />
          </form>
          <div className="flex flex-col space-y-2 pt-2">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-sm font-medium text-slate-300"
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('explore'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-sm font-medium text-slate-300"
            >
              Explore
            </button>
            <button
              onClick={() => { onNavigate('trending'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-sm font-medium text-slate-300"
            >
              Trending Startups
            </button>

            {user ? (
              <>
                <button
                  onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-sm font-medium text-indigo-300 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Dashboard & Startups
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                    className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-sm font-medium text-purple-300 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" /> Admin Review
                  </button>
                )}
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-sm font-medium text-red-400 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-center text-sm font-semibold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-center text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
