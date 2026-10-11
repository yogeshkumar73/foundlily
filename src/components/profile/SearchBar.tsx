import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search innovative startups, founders, AI, IP patents...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center shadow-2xl shadow-indigo-500/10 rounded-2xl bg-slate-900 border border-slate-700/80 p-2 focus-within:ring-2 focus-within:ring-indigo-500 transition">
        <Search className="w-5 h-5 text-indigo-400 ml-3 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none text-base"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:scale-105 transition flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Explore
        </button>
      </div>
    </form>
  );
};
