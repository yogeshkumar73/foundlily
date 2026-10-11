import React, { useEffect, useState } from 'react';
import { SearchBar } from '../components/profile/SearchBar';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Profile, Category, Region } from '../types';
import { api } from '../services/api';
import { Sparkles, TrendingUp, ShieldCheck, Globe, ArrowRight, Zap } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [featuredProfiles, setFeaturedProfiles] = useState<Profile[]>([]);
  const [trendingProfiles, setTrendingProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featRes, trendRes, catRes, regRes] = await Promise.all([
          api.getProfiles({ featured: 'true', limit: '3' }),
          api.getTrending(),
          api.getCategories(),
          api.getRegions(),
        ]);
        setFeaturedProfiles(featRes.profiles || []);
        setTrendingProfiles(trendRes || []);
        setCategories(catRes || []);
        setRegions(regRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (q: string) => {
    onNavigate('explore', `q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/35 text-indigo-300 text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Zap className="w-4 h-4 text-amber-400" /> Discover High-Velocity Startups & IP Patents
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            The Intelligence Hub for <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Tomorrow’s Tech Giants</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore verified company profiles, pioneering IP patents, funding rounds, and visionary founders across AI, FinTech, Biotech, and Quantum computing.
          </p>

          <div className="pt-4 max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> SEC-Compliant IP Data</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> AI-Powered Pitch Scoring</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-amber-400" /> Real-time Analytics</span>
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      {featuredProfiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" /> Featured Startups
              </h2>
              <p className="text-sm text-slate-400">Handpicked market leaders with exceptional IP and traction.</p>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProfiles.map(p => (
              <ProfileCard key={p._id} profile={p} onSelect={(slug) => onNavigate('profile', slug)} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-400" /> Trending Rankings
            </h2>
            <p className="text-sm text-slate-400">Calculated from views, followers, saves, and recent momentum.</p>
          </div>
          <button
            onClick={() => onNavigate('trending')}
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            Explore Leaderboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {trendingProfiles.slice(0, 4).map((p, idx) => (
            <div key={p._id} className="relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-lg z-20">
                #{idx + 1}
              </span>
              <ProfileCard profile={p} onSelect={(slug) => onNavigate('profile', slug)} />
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Explore by Tech Domain</h2>
          <p className="text-sm text-slate-400">Dive deep into specialized verticals driving the next technological revolution.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div
              key={cat._id}
              onClick={() => onNavigate('explore', `category=${cat._id}`)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-slate-850 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition">{cat.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Regions Hubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-400" /> Global Innovation Hubs
            </h2>
            <p className="text-sm text-slate-400">Discover startup ecosystems across major international tech capitals.</p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Browse All Regions
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {regions.map(reg => (
            <div
              key={reg._id}
              onClick={() => onNavigate('explore', `country=${reg._id}`)}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-500 transition"
            >
              <h4 className="font-bold text-white text-sm mb-1">{reg.name}</h4>
              <p className="text-xs text-indigo-400">{reg.states.length} Active States</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
