import React, { useState } from 'react';
import { Profile } from '../../types';
import { Eye, Bookmark, Users, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface ProfileCardProps {
  profile: Profile;
  onSelect: (slug: string) => void;
  isSaved?: boolean;
  onToggleSave?: (profileId: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect, isSaved: initialSaved = false, onToggleSave }) => {
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(profile.saveCount);
  const [loading, setLoading] = useState(false);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      if (saved) {
        await api.unsaveProfile(profile._id);
        setSaved(false);
        setSaveCount(prev => Math.max(0, prev - 1));
      } else {
        await api.saveProfile(profile._id);
        setSaved(true);
        setSaveCount(prev => prev + 1);
      }
      if (onToggleSave) onToggleSave(profile._id);
    } catch (err) {
      alert('Please sign in to save profiles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={() => onSelect(profile.slug)}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* Featured Ribbon / Badge */}
      {profile.isFeatured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Featured
        </div>
      )}

      <div>
        {/* Header: Logo & Title */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={profile.logo}
            alt={profile.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-700 bg-slate-800 shadow-sm flex-shrink-0 group-hover:scale-105 transition"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold text-white truncate group-hover:text-indigo-300 transition">
                {profile.name}
              </h3>
              <span title="Verified Startup & IP">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </span>
            </div>
            <p className="text-xs text-indigo-400 font-medium">
              {profile.stage} • Founded {profile.foundedYear}
            </p>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {profile.shortDescription}
        </p>

        {/* IP Patent / Tech Tag */}
        {profile.ipInfo && (
          <div className="mb-4 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono truncate">
            🔒 IP: {profile.ipInfo}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1" title="Profile Views">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            {profile.viewCount}
          </span>
          <span className="flex items-center gap-1" title="Followers">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            {profile.followerCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveClick}
            disabled={loading}
            className={`p-2 rounded-xl transition ${saved ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            title={saved ? 'Unsave profile' : 'Save profile'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
          <span className="text-xs font-semibold text-slate-300">{saveCount}</span>
        </div>
      </div>
    </div>
  );
};
