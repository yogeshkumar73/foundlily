import React from 'react';
import { Rocket, Heart, ShieldCheck, Globe } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string, param?: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">Foundlily</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The premier global discovery platform for innovative startups, breakthrough intellectual property, and high-impact founders.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Startups & SEC-compliant IP profiles
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-white transition">
                  Browse All Startups
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trending')} className="hover:text-white transition">
                  Trending Rankings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', 'category=cat-ai')} className="hover:text-white transition">
                  AI & Neural Tech
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', 'category=cat-fintech')} className="hover:text-white transition">
                  FinTech & DeFi
                </button>
              </li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Hubs & Regions</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('explore', 'country=reg-us')} className="hover:text-white transition flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> United States (Silicon Valley & NY)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', 'country=reg-in')} className="hover:text-white transition flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> India (Bengaluru & Mumbai)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', 'country=reg-uk')} className="hover:text-white transition flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> United Kingdom (London)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', 'country=reg-de')} className="hover:text-white transition flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> Germany (Berlin)
                </button>
              </li>
            </ul>
          </div>

          {/* For Founders */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Founders & Investors</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition">
                  Submit Your Startup
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition">
                  IP Patent Protection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition">
                  Investor Analytics Suite
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Foundlily Inc. All rights reserved. Built for high-velocity startup ecosystems.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
