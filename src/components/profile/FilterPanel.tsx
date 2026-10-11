import React from 'react';
import { Category, Region } from '../../types';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  categories: Category[];
  regions: Region[];
  selectedCategory: string;
  selectedCountry: string;
  selectedStage: string;
  selectedSort: string;
  onFilterChange: (filters: { category?: string; country?: string; stage?: string; sort?: string }) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  regions,
  selectedCategory,
  selectedCountry,
  selectedStage,
  selectedSort,
  onFilterChange,
  onReset,
}) => {
  const stages = ['Seed', 'Series A', 'Series B', 'Series C+', 'Bootstrapped'];
  const sorts = [
    { label: 'Most Viewed', value: 'views' },
    { label: 'Trending Score', value: 'trending' },
    { label: 'Most Followers', value: 'followers' },
    { label: 'Recently Added', value: 'recent' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          Filter Startups
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Sort By
        </label>
        <select
          value={selectedSort}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {sorts.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Category
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <button
            onClick={() => onFilterChange({ category: '' })}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${!selectedCategory ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => onFilterChange({ category: cat._id })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition truncate ${selectedCategory === cat._id ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Funding Stage */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Funding Stage
        </label>
        <div className="space-y-1.5">
          <button
            onClick={() => onFilterChange({ stage: '' })}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${!selectedStage ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            All Stages
          </button>
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => onFilterChange({ stage })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${selectedStage.toLowerCase() === stage.toLowerCase() ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Regions / Countries */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Country / Region
        </label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
          <button
            onClick={() => onFilterChange({ country: '' })}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${!selectedCountry ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            All Regions
          </button>
          {regions.map(reg => (
            <button
              key={reg._id}
              onClick={() => onFilterChange({ country: reg._id })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${selectedCountry === reg._id ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {reg.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
