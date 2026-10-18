import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  ExternalLink, 
  Loader2, 
  Trophy,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { LeagueSummary } from '../types';
import { fetchPopularLeagues, searchLeagues } from '../services/api';

interface LeagueSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLeague: (url: string) => void;
  currentUrl: string;
}

export const LeagueSelectorModal: React.FC<LeagueSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectLeague,
  currentUrl
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [popularLeagues, setPopularLeagues] = useState<LeagueSummary[]>([]);
  const [searchResults, setSearchResults] = useState<LeagueSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPopular();
    }
  }, [isOpen]);

  async function loadPopular() {
    setIsLoadingInitial(true);
    try {
      const popular = await fetchPopularLeagues();
      setPopularLeagues(popular);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingInitial(false);
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLeagues(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelectLeague(customUrl.trim());
    onClose();
  };

  const handleSelect = (url: string) => {
    onSelectLeague(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select a Leisure League</h2>
              <p className="text-xs text-slate-400">
                Search UK venues, towns, or paste any URL from leisureleagues.net
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Custom URL Input Box */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paste Any Leisure Leagues Website URL</span>
            </label>
            <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.leisureleagues.net/league/venue-name/league-day"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                Load League
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Example: /league/aylesbury-vale-academy/aylesbury-monday</span>
              <a 
                href="https://www.leisureleagues.net/" 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                Browse LeisureLeagues.net <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Search by Town, Venue, or Matchday</span>
              </span>
              {isSearching && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Searching 1,700+ leagues...
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type 'Manchester', 'Aylesbury', 'Sunday', 'Oldham', 'Birmingham'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none pl-10"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results List */}
          {searchQuery && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.length === 0 && !isSearching ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  No leagues found matching &ldquo;{searchQuery}&rdquo;. Try another town name or paste the direct URL above.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {searchResults.map((league) => {
                    const isSelected = currentUrl === league.url;
                    return (
                      <div
                        key={league.url}
                        onClick={() => handleSelect(league.url)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                            {league.name}
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              {league.venue}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <Calendar className="w-3 h-3 text-emerald-400" />
                              {league.day}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                          Select
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Popular / Curated Leagues */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Popular UK Leisure Leagues</span>
            </h3>
            {isLoadingInitial ? (
              <div className="p-4 flex items-center justify-center text-xs text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Loading popular venues...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {popularLeagues.map((league) => {
                  const isSelected = currentUrl === league.url;
                  return (
                    <button
                      key={league.url}
                      onClick={() => handleSelect(league.url)}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors leading-snug">
                          {league.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[150px]">{league.venue}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {league.day}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Powered by official Leisure Leagues fixture data</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
