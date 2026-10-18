import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  divisions: string[];
  selectedDivision: string;
  onSelectDivision: (division: string) => void;
  matchesCount: number;
  upcomingDate?: string;
  teamSearch: string;
  onTeamSearchChange: (search: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  selectedDate,
  onSelectDate,
  divisions,
  selectedDivision,
  onSelectDivision,
  matchesCount,
  upcomingDate,
  teamSearch,
  onTeamSearchChange
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3">
      {/* Date Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Select Match Date:
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono font-semibold">
            {matchesCount} {matchesCount === 1 ? 'game' : 'games'} on {selectedDate || 'this date'}
          </span>
        </div>

        {/* Quick Date Dropdown for when there are dozens of dates */}
        <div className="flex items-center gap-2">
          <label htmlFor="date-dropdown" className="text-xs text-slate-400 hidden sm:inline">Jump to:</label>
          <select
            id="date-dropdown"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d} {d === upcomingDate ? '🌟 (Upcoming)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Carousel Pills */}
      <div className="relative flex items-center">
        <button
          onClick={() => scroll('left')}
          className="absolute -left-2 z-10 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-lg border border-slate-700 hidden sm:flex items-center justify-center"
          title="Previous dates"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 sm:px-6 w-full scroll-smooth"
        >
          {dates.map((d) => {
            const isSelected = d === selectedDate;
            const isUpcoming = d === upcomingDate;
            return (
              <button
                key={d}
                onClick={() => onSelectDate(d)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center min-w-[100px] border ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 scale-102'
                    : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                {isUpcoming && !isSelected && (
                  <span className="absolute -top-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                    Next
                  </span>
                )}
                <span>{d}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute -right-2 z-10 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-lg border border-slate-700 hidden sm:flex items-center justify-center"
          title="Next dates"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Division filter & Team Search Filter */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Division Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            Division:
          </span>
          <button
            onClick={() => onSelectDivision('All')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDivision === 'All'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Divisions
          </button>
          {divisions.map((div) => (
            <button
              key={div}
              onClick={() => onSelectDivision(div)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedDivision === div
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {div}
            </button>
          ))}
        </div>

        {/* Team Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter teams..."
            value={teamSearch}
            onChange={(e) => onTeamSearchChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-44"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
        </div>
      </div>
    </div>
  );
};
