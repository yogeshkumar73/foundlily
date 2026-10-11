import React, { useEffect, useState, useRef } from 'react';
import { Profile, Category, Region } from '../types';
import { api } from '../services/api';
import { 
  PlusCircle, Bookmark, BarChart2, Briefcase, Trash2, Edit, Sparkles, 
  CheckCircle, Clock, XCircle, ExternalLink, Loader2, Save, Upload,
  Image as ImageIcon, Globe, MapPin, Building, Shield, Users, DollarSign,
  Layers, ChevronRight, X
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, param?: string) => void;
  initialParam?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, initialParam }) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'create' | 'saved' | 'analytics'>('profiles');
  const [myProfiles, setMyProfiles] = useState<Profile[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSubCategory, setFormSubCategory] = useState('general');
  const [formCountry, setFormCountry] = useState('reg-us');
  const [formState, setFormState] = useState('st-ca');
  const [formCity, setFormCity] = useState('San Francisco');
  const [formStage, setFormStage] = useState('Seed');
  const [formFunding, setFormFunding] = useState('$1M Seed');
  const [formFounder, setFormFounder] = useState('');
  const [formFoundedYear, setFormFoundedYear] = useState<number>(new Date().getFullYear());
  const [formTeamSize, setFormTeamSize] = useState('10');
  const [formBusinessModel, setFormBusinessModel] = useState('B2B SaaS');
  const [formProductService, setFormProductService] = useState('');
  const [formIpInfo, setFormIpInfo] = useState('');
  const [formTwitter, setFormTwitter] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formDiscord, setFormDiscord] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const userProfs: Profile[] = profRes || [];
        setMyProfiles(userProfs);
        setSavedProfiles(savedRes || []);
        setCategories(catRes || []);
        setRegions(regRes || []);

        if (catRes && catRes.length > 0) {
          setFormCategory(catRes[0]._id);
        }

        // If initialParam corresponds to a profile, enter edit mode immediately
        if (initialParam && userProfs.length > 0) {
          const target = userProfs.find(p => p._id === initialParam || p.slug === initialParam);
          if (target) {
            handleStartEdit(target);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialParam]);

  // Dynamic state/city filtering based on selected country
  const currentRegion = regions.find(r => r._id === formCountry);
  const availableStates = currentRegion?.states || [];
  const currentState = availableStates.find(s => s._id === formState);
  const availableCities = currentState?.cities || [];

  const handleCountryChange = (countryId: string) => {
    setFormCountry(countryId);
    const selectedReg = regions.find(r => r._id === countryId);
    const firstState = selectedReg?.states[0];
    if (firstState) {
      setFormState(firstState._id);
      setFormCity(firstState.cities[0] || 'Main City');
    } else {
      setFormState('');
      setFormCity('');
    }
  };

  const handleStateChange = (stateId: string) => {
    setFormState(stateId);
    const selectedSt = availableStates.find(s => s._id === stateId);
    if (selectedSt && selectedSt.cities.length > 0) {
      setFormCity(selectedSt.cities[0]);
    }
  };

  // Dynamic Image / Logo Upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 3MB limit. Please choose a smaller image.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEditingProfileId(null);
    setFormName('');
    setFormShortDesc('');
    setFormDesc('');
    setFormWebsite('');
    setFormLogo('');
    setFormFounder('');
    setFormFoundedYear(new Date().getFullYear());
    setFormProductService('');
    setFormIpInfo('');
    setFormTwitter('');
    setFormLinkedin('');
    setFormGithub('');
    setFormDiscord('');
    if (categories.length > 0) setFormCategory(categories[0]._id);
    setFormSubCategory('general');
    setFormCountry('reg-us');
    setFormState('st-ca');
    setFormCity('San Francisco');
    setFormStage('Seed');
    setFormFunding('$1M Seed');
    setFormTeamSize('10');
    setFormBusinessModel('B2B SaaS');
    setErrorMsg('');
  };

  const handleStartEdit = (profile: Profile) => {
    setEditingProfileId(profile._id);
    setFormName(profile.name || '');
    setFormShortDesc(profile.shortDescription || '');
    setFormDesc(profile.description || '');
    setFormWebsite(profile.website || '');
    setFormLogo(profile.logo || '');
    setFormCategory(profile.categoryId || categories[0]?._id || '');
    setFormSubCategory(profile.subCategoryId || 'general');
    setFormCountry(profile.countryId || 'reg-us');
    setFormState(profile.stateId || 'st-ca');
    setFormCity(profile.cityId || 'San Francisco');
    setFormStage(profile.stage || 'Seed');
    setFormFunding(profile.funding || '$1M Seed');
    setFormFounder(profile.founder || '');
    setFormFoundedYear(profile.foundedYear || new Date().getFullYear());
    setFormTeamSize(profile.teamSize || '10');
    setFormBusinessModel(profile.businessModel || 'B2B SaaS');
    setFormProductService(profile.productService || '');
    setFormIpInfo(profile.ipInfo || '');
    setFormTwitter(profile.socialLinks?.twitter || '');
    setFormLinkedin(profile.socialLinks?.linkedin || '');
    setFormGithub(profile.socialLinks?.github || '');
    setFormDiscord(profile.socialLinks?.discord || '');
    setErrorMsg('');
    setSuccessMsg('');
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab('profiles');
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        name: formName.trim(),
        shortDescription: formShortDesc.trim(),
        description: formDesc.trim() || formShortDesc.trim(),
        website: formWebsite.trim() || 'https://example.com',
        logo: formLogo.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        categoryId: formCategory,
        subCategoryId: formSubCategory,
        countryId: formCountry,
        stateId: formState,
        cityId: formCity,
        stage: formStage,
        funding: formFunding.trim() || '$1M Seed',
        founder: formFounder.trim() || 'Founder',
        foundedYear: Number(formFoundedYear) || new Date().getFullYear(),
        teamSize: formTeamSize,
        businessModel: formBusinessModel,
        productService: formProductService.trim() || formShortDesc.trim(),
        ipInfo: formIpInfo.trim() || 'Proprietary core technology and algorithms',
        socialLinks: {
          twitter: formTwitter.trim(),
          linkedin: formLinkedin.trim(),
          github: formGithub.trim(),
          discord: formDiscord.trim(),
        },
      };

      if (editingProfileId) {
        // Securely update existing profile
        const updated = await api.updateProfile(editingProfileId, payload);
        setMyProfiles(myProfiles.map(p => p._id === editingProfileId ? updated : p));
        setSuccessMsg(`Company profile "${updated.name}" updated successfully! Changes queued for review.`);
      } else {
        // Create new startup profile
        const created = await api.createProfile(payload);
        setMyProfiles([created, ...myProfiles]);
        setSuccessMsg(`Startup "${created.name}" created and submitted for admin governance review!`);
      }

      resetForm();
      setActiveTab('profiles');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save startup profile. Please check the required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this startup profile?')) return;
    try {
      await api.deleteProfile(id);
      setMyProfiles(myProfiles.filter(p => p._id !== id));
      if (editingProfileId === id) resetForm();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Founder & Company Management</h1>
          <p className="text-sm text-slate-400">
            Publish dynamic startup profiles, manage IP patents, update company sections, and track engagement.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setActiveTab('create');
          }}
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
          onClick={() => {
            if (!editingProfileId) resetForm();
            setActiveTab('create');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
        >
          {editingProfileId ? <Edit className="w-4 h-4 text-amber-400" /> : <PlusCircle className="w-4 h-4" />}
          {editingProfileId ? 'Edit Company Profile' : 'Create Startup & Company Profile'}
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

      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TAB: My Startups */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          {myProfiles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <h3 className="text-lg font-bold text-white">No startups registered yet</h3>
              <p className="text-sm text-slate-400">
                Submit your company profile and patent details to get discovered by global investors and founders.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('create');
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Submit Startup Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProfiles.map(p => (
                <div key={p._id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-lg transition">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <img 
                        src={p.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'} 
                        alt={p.name} 
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 bg-slate-800 shadow-md" 
                      />
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

                    <h3 className="text-lg font-bold text-white hover:text-indigo-400 transition cursor-pointer" onClick={() => onNavigate('profile', p.slug)}>
                      {p.name}
                    </h3>
                    <p className="text-xs text-indigo-300 font-medium mt-0.5">
                      {p.stage} • Founded {p.foundedYear || '2024'} • {p.founder || 'Founder'}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {p.shortDescription}
                    </p>

                    {p.ipInfo && (
                      <div className="mt-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-[11px] text-indigo-300 font-mono truncate">
                        🔒 IP: {p.ipInfo}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenAnalytics(p)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <BarChart2 className="w-3.5 h-3.5" /> Analytics ({p.viewCount})
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                        title="Edit Company Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onNavigate('profile', p.slug)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="View Public Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p._id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition"
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

      {/* TAB: Dynamic Create & Edit Startup Form */}
      {activeTab === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                {editingProfileId ? <Edit className="w-6 h-6 text-amber-400" /> : <PlusCircle className="w-6 h-6 text-indigo-400" />}
                {editingProfileId ? `Edit Company Profile: ${formName || 'Startup'}` : 'Submit Startup & Company Profile'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {editingProfileId 
                  ? 'Update company profile information safely. Modified profiles are verified by administration.' 
                  : 'Add your company profile section, IP defensibility, leadership team, and traction.'}
              </p>
            </div>
            {editingProfileId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-8">
            {/* SECTION 1: Identity & Dynamic Logo Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
                <Building className="w-4 h-4" /> Section 1: Startup Identity & Dynamic Logo
              </div>

              {/* Dynamic Logo Uploader */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <label className="block text-xs font-semibold text-slate-300 uppercase">
                  Company Logo / Brand Asset
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl border-2 border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg relative group">
                    {formLogo ? (
                      <img src={formLogo} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload File (PNG/JPG/SVG)
                      </button>
                      {formLogo && (
                        <button
                          type="button"
                          onClick={() => setFormLogo('')}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs font-semibold transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Or paste external image URL (e.g. https://...)"
                        value={formLogo.startsWith('data:') ? 'Custom uploaded image asset' : formLogo}
                        onChange={(e) => setFormLogo(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Startup Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NeuroCortex Technologies"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Primary Category *</label>
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
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Elevator Tagline * (Min 10 characters)</label>
                <input
                  type="text"
                  required
                  placeholder="Autonomous real-time agentic reasoning for enterprise logistics."
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* SECTION 2: Company Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
                <Users className="w-4 h-4" /> Section 2: Company Profile & Leadership
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Founder / Leadership Team</label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Rostova (CEO), Dr. Marcus Vance (CTO)"
                    value={formFounder}
                    onChange={(e) => setFormFounder(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Founded Year</label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formFoundedYear}
                    onChange={(e) => setFormFoundedYear(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Company Profile & Mission Overview</label>
                <textarea
                  rows={4}
                  placeholder="Provide an in-depth summary of your company mission, technology architecture, market pain points, and current traction."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Core Product & Service Offerings</label>
                <input
                  type="text"
                  placeholder="e.g. SDK, Edge Micro-nodes, Enterprise Cloud Dashboard"
                  value={formProductService}
                  onChange={(e) => setFormProductService(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* SECTION 3: Geographic Headquarters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
                <MapPin className="w-4 h-4" /> Section 3: Geographic Headquarters
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Country / Region</label>
                  <select
                    value={formCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {regions.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">State / Province</label>
                  <select
                    value={formState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableStates.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">City</label>
                  {availableCities.length > 0 ? (
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {availableCities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. San Francisco"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: Business, Stage & Capital */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
                <DollarSign className="w-4 h-4" /> Section 4: Business & Funding Metrics
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Stage</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                  >
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C+">Series C+</option>
                    <option value="Bootstrapped">Bootstrapped</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Funding Raised</label>
                  <input
                    type="text"
                    placeholder="e.g. $2.5M Seed"
                    value={formFunding}
                    onChange={(e) => setFormFunding(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Team Size</label>
                  <select
                    value={formTeamSize}
                    onChange={(e) => setFormTeamSize(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                  >
                    <option value="1-5">1-5 Employees</option>
                    <option value="6-20">6-20 Employees</option>
                    <option value="21-50">21-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="200+">200+ Employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Business Model</label>
                  <select
                    value={formBusinessModel}
                    onChange={(e) => setFormBusinessModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                  >
                    <option value="B2B SaaS">B2B SaaS</option>
                    <option value="Enterprise License">Enterprise License</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="Usage-based API">Usage-based API</option>
                    <option value="B2C Subscription">B2C Subscription</option>
                    <option value="Open Core">Open Core</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 5: Intellectual Property & Patents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
                <Shield className="w-4 h-4" /> Section 5: Intellectual Property & Defensive Moat
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  IP Patent / Proprietary Algorithm Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. US Patent #11,842,912 (Zero-latency transformer KV-cache compression)"
                  value={formIpInfo}
                  onChange={(e) => setFormIpInfo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* SECTION 6: Web Presence & Social Profiles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
                <Globe className="w-4 h-4" /> Section 6: Web Presence & Community
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Official Website URL</label>
                  <input
                    type="url"
                    placeholder="https://mycompany.com"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">LinkedIn Profile</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/company/mycompany"
                    value={formLinkedin}
                    onChange={(e) => setFormLinkedin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Twitter / X Profile</label>
                  <input
                    type="text"
                    placeholder="https://x.com/mycompany"
                    value={formTwitter}
                    onChange={(e) => setFormTwitter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">GitHub Organization</label>
                  <input
                    type="text"
                    placeholder="https://github.com/mycompany"
                    value={formGithub}
                    onChange={(e) => setFormGithub(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : editingProfileId ? (
                  <Save className="w-5 h-5" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
                {editingProfileId ? 'Save & Securely Update Company Profile' : 'Submit Startup Profile for Admin Governance'}
              </button>

              {editingProfileId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB: Saved Profiles */}
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
                <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-lg">{p.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{p.shortDescription}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('profile', p.slug)}
                    className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View Profile <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Analytics */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-2xl font-black text-white">
              Engagement Metrics: {selectedAnalyticsProfile?.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Profile Views</span>
                <p className="text-3xl font-black text-white mt-2">{analyticsData.viewCount ?? analyticsData.totalViews ?? 0}</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Followers</span>
                <p className="text-3xl font-black text-indigo-400 mt-2">{analyticsData.followerCount ?? analyticsData.totalFollowers ?? 0}</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Bookmarks</span>
                <p className="text-3xl font-black text-purple-400 mt-2">{analyticsData.saveCount ?? analyticsData.totalSaves ?? 0}</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Momentum Score</span>
                <p className="text-3xl font-black text-amber-400 mt-2">{analyticsData.trendingScore ?? 10}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
