import React, { useEffect, useState } from 'react';
import { Profile, Category, Region } from '../types';
import { api } from '../services/api';
import { 
  PlusCircle, Bookmark, BarChart2, Briefcase, Trash2, Edit, Sparkles, 
  CheckCircle, Clock, XCircle, ExternalLink, Loader2, Save 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'create' | 'saved' | 'analytics'>('profiles');
  const [myProfiles, setMyProfiles] = useState<Profile[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Form State
  const [formName, setFormName] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStage, setFormStage] = useState('Seed');
  const [formFunding, setFormFunding] = useState('$1M Seed');
  const [formIpInfo, setFormIpInfo] = useState('');
  const [formTeamSize, setFormTeamSize] = useState('10');
  const [formBusinessModel, setFormBusinessModel] = useState('B2B SaaS');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Analytics State
  const [selectedAnalyticsProfile, setSelectedAnalyticsProfile] = useState<Profile | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profRes, savedRes, catRes, regRes] = await Promise.all([
          api.getUserProfiles(),
          api.getSavedProfiles(),
          api.getCategories(),
          api.getRegions(),
        ]);
        setMyProfiles(profRes || []);
        setSavedProfiles(savedRes || []);
        setCategories(catRes || []);
        setRegions(regRes || []);
        if (catRes && catRes.length > 0) setFormCategory(catRes[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccessMsg('');
      const newProf = await api.createProfile({
        name: formName,
        shortDescription: formShortDesc,
        description: formDesc || formShortDesc,
        website: formWebsite || 'https://example.com',
        categoryId: formCategory,
        stage: formStage,
        funding: formFunding,
        ipInfo: formIpInfo || 'Proprietary core technology',
        teamSize: formTeamSize,
        businessModel: formBusinessModel,
      });
      setMyProfiles([newProf, ...myProfiles]);
      setSuccessMsg('Startup profile successfully submitted for admin review!');
      setActiveTab('profiles');
      // Reset form
      setFormName('');
      setFormShortDesc('');
      setFormDesc('');
      setFormWebsite('');
      setFormIpInfo('');
    } catch (err: any) {
      alert(err.message || 'Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    try {
      await api.deleteProfile(id);
      setMyProfiles(myProfiles.filter(p => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleOpenAnalytics = async (profile: Profile) => {
    try {
      setSelectedAnalyticsProfile(profile);
      const data = await api.getOwnerAnalytics(profile._id);
      setAnalyticsData(data);
      setActiveTab('analytics');
    } catch (err: any) {
      alert(err.message || 'Failed to load analytics');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Founder & Investor Dashboard</h1>
          <p className="text-sm text-slate-400">Manage your startup profiles, IP assets, bookmarks, and engagement analytics.</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Submit New Startup
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'profiles' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          <Briefcase className="w-4 h-4" /> My Startups ({myProfiles.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          <PlusCircle className="w-4 h-4" /> Create Startup & IP
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          <Bookmark className="w-4 h-4" /> Saved Bookmarks ({savedProfiles.length})
        </button>
        {selectedAnalyticsProfile && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
          >
            <BarChart2 className="w-4 h-4" /> Analytics: {selectedAnalyticsProfile.name}
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Tab Content: My Startups */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          {myProfiles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <h3 className="text-lg font-bold text-white">No startups registered yet</h3>
              <p className="text-sm text-slate-400">Submit your company and IP patent details to get discovered by global investors.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Submit Startup Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProfiles.map(p => (
                <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <img src={p.logo} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800" />
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        p.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {p.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                        {p.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {p.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.shortDescription}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenAnalytics(p)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <BarChart2 className="w-4 h-4" /> Analytics ({p.viewCount} views)
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('profile', p.slug)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="View Public Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p._id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Create Profile Form */}
      {activeTab === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Submit Company & IP Patent Profile</h3>
          <form onSubmit={handleCreateProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Startup Name *</label>
                <input
                  type="text"
                  required
                  placeholder="NeuralCognition AI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Short Tagline *</label>
              <input
                type="text"
                required
                placeholder="Autonomous multi-modal reasoning engine for enterprise workflows."
                value={formShortDesc}
                onChange={(e) => setFormShortDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Full Description</label>
              <textarea
                rows={4}
                placeholder="Detailed breakdown of your technology, market opportunity, and traction..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Funding Stage</label>
                <select
                  value={formStage}
                  onChange={(e) => setFormStage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                >
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C+">Series C+</option>
                  <option value="Bootstrapped">Bootstrapped</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Funding Raised</label>
                <input
                  type="text"
                  placeholder="$4.2M Seed"
                  value={formFunding}
                  onChange={(e) => setFormFunding(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Team Size</label>
                <input
                  type="text"
                  placeholder="15"
                  value={formTeamSize}
                  onChange={(e) => setFormTeamSize(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">IP Patent / Core Technology Info</label>
              <input
                type="text"
                placeholder="US Patent #982143 (Mixture-of-agents routing)"
                value={formIpInfo}
                onChange={(e) => setFormIpInfo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Website URL</label>
              <input
                type="url"
                placeholder="https://mystartup.com"
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Submit Profile for Admin Review
            </button>
          </form>
        </div>
      )}

      {/* Tab Content: Saved Profiles */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedProfiles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <h3 className="text-lg font-bold text-white">No saved bookmarks</h3>
              <p className="text-sm text-slate-400">Click the bookmark icon on any startup profile to save it for quick access.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {savedProfiles.map(p => (
                <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h4 className="font-bold text-white text-lg">{p.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{p.shortDescription}</p>
                  <button
                    onClick={() => onNavigate('profile', p.slug)}
                    className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    View Profile →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Analytics */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-2xl font-black text-white">Analytics for {analyticsData.profile.name}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Profile Views</span>
                <p className="text-3xl font-black text-white mt-2">{analyticsData.totalViews}</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Followers Count</span>
                <p className="text-3xl font-black text-indigo-400 mt-2">{analyticsData.totalFollowers}</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saves & Bookmarks</span>
                <p className="text-3xl font-black text-purple-400 mt-2">{analyticsData.totalSaves}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
