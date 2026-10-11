import React, { useEffect, useState } from 'react';
import { User, Profile } from './types';
import { api, setToken } from './services/api';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { ProfileDetail } from './pages/ProfileDetail';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { ProfileCard } from './components/profile/ProfileCard';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentParam, setCurrentParam] = useState<string>('');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Trending View state
  const [trendingList, setTrendingList] = useState<Profile[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.getSession();
        setUser(res.user);
      } catch (err) {
        setToken(null);
        setUser(null);
      } finally {
        setLoadingSession(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentView === 'trending') {
      async function loadTrending() {
        try {
          setLoadingTrending(true);
          const data = await api.getTrending();
          setTrendingList(data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingTrending(false);
        }
      }
      loadTrending();
    }
  }, [currentView]);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setCurrentParam(param || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    handleNavigate('home');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        user={user}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onLogout={handleLogout}
        currentView={currentView}
      />

      <main className="flex-1">
        {currentView === 'home' && <Home onNavigate={handleNavigate} />}
        {currentView === 'explore' && <Explore initialQuery={currentParam.startsWith('q=') ? decodeURIComponent(currentParam.substring(2)) : ''} onNavigate={handleNavigate} />}
        {currentView === 'profile' && <ProfileDetail slug={currentParam} user={user} onNavigate={handleNavigate} />}
        {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentView === 'admin' && <Admin onNavigate={handleNavigate} />}

        {currentView === 'trending' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Trending Startup Leaderboard</h1>
                <p className="text-sm text-slate-400">Ranked by views, followers, saves, engagement score, and recent momentum.</p>
              </div>
            </div>

            {loadingTrending ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingList.map((p, idx) => (
                  <div key={p._id} className="relative">
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-lg z-20">
                      #{idx + 1}
                    </span>
                    <ProfileCard profile={p} onSelect={(slug) => handleNavigate('profile', slug)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      {authModalMode && (
        <Auth
          initialMode={authModalMode}
          onSuccess={(u) => {
            setUser(u);
            setAuthModalMode(null);
          }}
          onClose={() => setAuthModalMode(null)}
        />
      )}
    </div>
  );
}
