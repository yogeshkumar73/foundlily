import React, { useEffect, useState } from 'react';
import { Profile } from '../types';
import { api } from '../services/api';
import { Shield, Check, X, Star, Trash2, Loader2, Users, Briefcase, Eye, Clock } from 'lucide-react';

export const Admin: React.FC<{ onNavigate: (view: string, param?: string) => void }> = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      try {
        setLoading(true);
        const [dashRes, pendRes] = await Promise.all([
          api.getAdminDashboard(),
          api.getPendingProfiles(),
        ]);
        setStats(dashRes);
        setPendingProfiles(pendRes || []);
      } catch (err: any) {
        alert(err.message || 'Admin access denied');
      } finally {
        setLoading(false);
      }
    }
    loadAdmin();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.approveProfile(id);
      setPendingProfiles(pendingProfiles.filter(p => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectProfile(id);
      setPendingProfiles(pendingProfiles.filter(p => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Admin Governance Dashboard</h1>
          <p className="text-sm text-slate-400">Review and approve incoming startup profiles and IP patent submissions.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Profiles</span>
            <p className="text-3xl font-black text-white mt-2">{stats.totalProfiles}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Review</span>
            <p className="text-3xl font-black text-amber-400 mt-2">{stats.pendingProfiles}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved Active</span>
            <p className="text-3xl font-black text-emerald-400 mt-2">{stats.approvedProfiles}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Total Views</span>
            <p className="text-3xl font-black text-indigo-400 mt-2">{stats.totalViews}</p>
          </div>
        </div>
      )}

      {/* Pending Profiles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" /> Pending Profile Approvals ({pendingProfiles.length})
        </h3>

        {pendingProfiles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No pending startup profiles awaiting review. All caught up!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                  <th className="py-3 px-4 font-semibold">Startup</th>
                  <th className="py-3 px-4 font-semibold">Founder</th>
                  <th className="py-3 px-4 font-semibold">Stage</th>
                  <th className="py-3 px-4 font-semibold">IP Info</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {pendingProfiles.map(p => (
                  <tr key={p._id} className="hover:bg-slate-850 transition">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img src={p.logo} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-800" />
                      <div>
                        <span className="font-bold text-white block">{p.name}</span>
                        <span className="text-xs text-slate-400 truncate max-w-xs block">{p.shortDescription}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-medium">{p.founder}</td>
                    <td className="py-4 px-4 text-indigo-400 font-semibold">{p.stage}</td>
                    <td className="py-4 px-4 text-slate-300 font-mono text-xs">{p.ipInfo}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
