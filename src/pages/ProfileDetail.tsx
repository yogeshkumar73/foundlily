import React, { useEffect, useState } from 'react';
import { Profile, User } from '../types';
import { api } from '../services/api';
import { 
  ShieldCheck, Globe, Users, Bookmark, Share2, ExternalLink, 
  Sparkles, DollarSign, Cpu, Building2, Calendar, Award, CheckCircle, Loader2, ArrowLeft 
} from 'lucide-react';

interface ProfileDetailProps {
  slug: string;
  user: User | null;
  onNavigate: (view: string, param?: string) => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ slug, user, onNavigate }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await api.getPublicProfile(slug);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [slug]);

  const handleFollow = async () => {
    if (!user) {
      alert('Please sign in to follow startups.');
      return;
    }
    try {
      if (following) {
        await api.unfollowProfile(profile!._id);
        setFollowing(false);
        setProfile(prev => prev ? { ...prev, followerCount: Math.max(0, prev.followerCount - 1) } : null);
      } else {
        await api.followProfile(profile!._id);
        setFollowing(true);
        setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount + 1 } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save profiles.');
      return;
    }
    try {
      if (saved) {
        await api.unsaveProfile(profile!._id);
        setSaved(false);
      } else {
        await api.saveProfile(profile!._id);
        setSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetAiReview = async () => {
    if (!profile) return;
    try {
      setLoadingAi(true);
      const res = await api.getAiPitchReview(profile);
      setAiFeedback(res.feedback);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Profile Not Found</h2>
        <p className="text-sm text-slate-400">The startup you are looking for may not exist or is pending review.</p>
        <button
          onClick={() => onNavigate('explore')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <button
        onClick={() => onNavigate('explore')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </button>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <img
              src={profile.logo}
              alt={profile.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow-lg flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-black text-white">{profile.name}</h1>
                <span title="Verified Startup">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </span>
              </div>
              <p className="text-sm text-indigo-300 font-medium">
                {profile.stage} • Founded in {profile.foundedYear} • {profile.cityId}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-400" /> {profile.followerCount} Followers</span>
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-purple-400" /> Team size: {profile.teamSize}</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-emerald-400" /> {profile.website}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleFollow}
              className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-semibold text-sm transition ${following ? 'bg-slate-800 text-indigo-400 border border-indigo-500/50' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700'}`}
            >
              {following ? 'Following' : 'Follow Startup'}
            </button>
            <button
              onClick={handleSave}
              className={`p-2.5 rounded-xl border transition ${saved ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
              title="Save Profile"
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-white' : ''}`} />
            </button>
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
              title="Visit Website"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" /> About {profile.name}
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.description}
            </p>
          </div>

          {/* Product & Service */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Product & Service Offering
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {profile.productService}
            </p>
          </div>

          {/* IP Patent Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Intellectual Property & Patents
            </h3>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-sm text-indigo-300 font-mono">
              🔒 {profile.ipInfo}
            </div>
          </div>

          {/* AI Pitch Reviewer */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> AI VC Pitch Evaluation
                </h3>
                <p className="text-xs text-slate-400">Instant venture capital analysis powered by Gemini AI.</p>
              </div>
              <button
                onClick={handleGetAiReview}
                disabled={loadingAi}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 hover:scale-105 transition flex items-center gap-2"
              >
                {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Run AI Review
              </button>
            </div>

            {aiFeedback && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {aiFeedback}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Metrics */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800">
              Startup Metrics
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Funding Stage</span>
                <span className="text-sm font-bold text-white">{profile.stage} ({profile.funding})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-400" /> Business Model</span>
                <span className="text-sm font-bold text-white">{profile.businessModel}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-400" /> Founded Year</span>
                <span className="text-sm font-bold text-white">{profile.foundedYear}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" /> Founder</span>
                <span className="text-sm font-bold text-white">{profile.founder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
