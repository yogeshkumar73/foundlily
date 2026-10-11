import React, { useEffect, useState } from 'react';
import { Profile, Category, Region } from '../types';
import { api } from '../services/api';
import { FilterPanel } from '../components/profile/FilterPanel';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Search, Loader2 } from 'lucide-react';

interface ExploreProps {
  initialQuery?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Explore: React.FC<ExploreProps> = ({ initialQuery = '', onNavigate }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [stage, setStage] = useState('');
  const [sort, setSort] = useState('views');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, regRes] = await Promise.all([
          api.getCategories(),
          api.getRegions(),
        ]);
        setCategories(catRes || []);
        setRegions(regRes || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        const params: Record<string, string> = {
          sort,
          page: String(page),
          limit: '9',
        };
        if (category) params.category = category;
        if (country) params.country = country;
        if (stage) params.stage = stage;
        if (searchQuery) params.q = searchQuery;

        const res = await api.getProfiles(params);
        setProfiles(res.profiles || []);
        setTotalPages(res.pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, [category, country, stage, sort, searchQuery, page]);

  const handleFilterChange = (filters: { category?: string; country?: string; stage?: string; sort?: string }) => {
    if (filters.category !== undefined) setCategory(filters.category);
    if (filters.country !== undefined) setCountry(filters.country);
    if (filters.stage !== undefined) setStage(filters.stage);
    if (filters.sort !== undefined) setSort(filters.sort);
    setPage(1);
  };

  const handleReset = () => {
    setCategory('');
    setCountry('');
    setStage('');
    setSort('views');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Startup & IP Explore Directory</h1>
          <p className="text-sm text-slate-400">Discover verified companies, funding stages, and breakthrough patents.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, founder..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            categories={categories}
            regions={regions}
            selectedCategory={category}
            selectedCountry={country}
            selectedStage={stage}
            selectedSort={sort}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Profile Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <h3 className="text-lg font-bold text-white">No startups found</h3>
              <p className="text-sm text-slate-400">Try adjusting your filter parameters or search query.</p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profiles.map(p => (
                <ProfileCard key={p._id} profile={p} onSelect={(slug) => onNavigate('profile', slug)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
