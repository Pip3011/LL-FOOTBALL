import React from 'react';
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  Grid3X3, 
  ListFilter, 
  Printer, 
  Share2, 
  Users, 
  Layers,
  Search,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { LeagueDetails, ViewMode } from '../types';

interface HeaderProps {
  league: LeagueDetails | null;
  selectedDate: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenLeagueSelector: () => void;
  onOpenRefModal: () => void;
  onOpenPitchModal: () => void;
  onOpenShareModal: () => void;
  onOpenBulkModal?: () => void;
  onAutoAssign: () => void;
  totalConflicts: number;
}

export const Header: React.FC<HeaderProps> = ({
  league,
  selectedDate,
  viewMode,
  setViewMode,
  onOpenLeagueSelector,
  onOpenRefModal,
  onOpenPitchModal,
  onOpenShareModal,
  onOpenBulkModal,
  onAutoAssign,
  totalConflicts
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Banner with League summary and main actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Active League */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <Trophy className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Leisure Leagues Coordinator
                </span>
                {league && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {league.day} Nights
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {league ? league.name : 'Select a Leisure League'}
                <button
                  onClick={onOpenLeagueSelector}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/50 hover:decoration-emerald-400 ml-1 transition-all"
                  title="Search or switch league"
                >
                  (Change)
                </button>
              </h1>
              {league && (
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {league.venue}
                  </span>
                  <span>•</span>
                  <a
                    href={league.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    leisureleagues.net <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Assign */}
            <button
              onClick={onAutoAssign}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              title="Automatically allocate pitches and balance referee workload without clashes"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Auto-Assign</span>
            </button>

            {/* Bulk Assign Ref */}
            {onOpenBulkModal && (
              <button
                onClick={onOpenBulkModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition-all"
                title="Bulk assign a referee to multiple games on this night"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bulk Assign Ref</span>
              </button>
            )}

            {/* Manage Pitches */}
            <button
              onClick={onOpenPitchModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pitches</span>
            </button>

            {/* Manage Referees */}
            <button
              onClick={onOpenRefModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Referees</span>
            </button>

            {/* Plain Text Export Button */}
            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95"
              title="Copy fixtures as plain text with Kick-Off Time, Teams & Goal Scorers"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Copy as Plain Text</span>
            </button>

            {/* Change League Modal Button */}
            <button
              onClick={onOpenLeagueSelector}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search Leagues</span>
            </button>
          </div>
        </div>

        {/* View Mode Tabs & Status strip */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Match List &amp; Assignments</span>
            </button>
            <button
              onClick={() => setViewMode('pitchBoard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'pitchBoard'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Visual Pitch Board</span>
            </button>
            <button
              onClick={() => setViewMode('print')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'print'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Matchday Sheet</span>
            </button>
          </div>

          {/* Conflict Alert indicator if any collisions exist */}
          {totalConflicts > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{totalConflicts} Schedule Collision{totalConflicts > 1 ? 's' : ''} detected on this date</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              Selected Matchday: <span className="text-emerald-400 font-semibold">{selectedDate || 'Select Date'}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
