import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Calendar,
  Layers,
  ClipboardCheck
} from 'lucide-react';
import { MatchFixture, Pitch, Referee, MatchAssignment, LeagueDetails } from '../types';

interface ShareScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: LeagueDetails | null;
  selectedDate: string;
  fixtures: MatchFixture[];
  allFixtures?: MatchFixture[];
  pitches: Pitch[];
  referees: Referee[];
  assignments: Record<string, MatchAssignment>;
}

export const ShareScheduleModal: React.FC<ShareScheduleModalProps> = ({
  isOpen,
  onClose,
  league,
  selectedDate,
  fixtures,
  allFixtures = [],
  pitches,
  referees,
  assignments
}) => {
  const [copied, setCopied] = useState(false);
  
  // Scope: 'selectedDate' | 'allFixtures'
  const [scope, setScope] = useState<'selectedDate' | 'allFixtures'>('selectedDate');
  
  // Filter by ref: 'all' or refId
  const [selectedRefFilter, setSelectedRefFilter] = useState<string>('all');
  
  // Format options
  const [includePitch, setIncludePitch] = useState(true);
  const [includeRefName, setIncludeRefName] = useState(true);
  const [includeDivision, setIncludeDivision] = useState(true);
  const [fillInStyle, setFillInStyle] = useState<'blankLine' | 'recorded'>('recorded');

  if (!isOpen) return null;

  // Determine base fixtures based on scope
  const targetFixtures = useMemo(() => {
    let list = scope === 'allFixtures' && allFixtures.length > 0 ? allFixtures : fixtures;

    // Filter by referee if selected
    if (selectedRefFilter !== 'all') {
      list = list.filter(f => assignments[f.id]?.refereeId === selectedRefFilter);
    }

    return list;
  }, [scope, allFixtures, fixtures, selectedRefFilter, assignments]);

  // Generate clean plain text
  const plainTextMessage = useMemo(() => {
    const selectedRefObj = referees.find(r => r.id === selectedRefFilter);
    const refHeader = selectedRefObj ? ` (Referee: ${selectedRefObj.name})` : '';

    let text = `LEISURE LEAGUES FIXTURES${refHeader}\n`;
    text += `Venue: ${league?.name || 'Leisure Leagues'}\n`;
    if (scope === 'selectedDate') {
      text += `Date: ${selectedDate}\n`;
    } else {
      text += `Full Fixture Schedule (${targetFixtures.length} matches)\n`;
    }
    text += `----------------------------------------\n\n`;

    if (targetFixtures.length === 0) {
      return text + `No fixtures found for the selected filter.`;
    }

    // Group fixtures by Date and Kick-off Time
    const dates = Array.from(new Set(targetFixtures.map(f => f.date)));

    for (const d of dates) {
      if (dates.length > 1) {
        text += `MATCHDAY: ${d}\n`;
        text += `--------------------\n`;
      }

      const dateMatches = targetFixtures.filter(f => f.date === d);
      const timeSlots = Array.from(new Set(dateMatches.map(f => f.time))).sort();

      for (const time of timeSlots) {
        const matchesAtTime = dateMatches.filter(f => f.time === time);

        for (const m of matchesAtTime) {
          const a = assignments[m.id];
          const pitch = pitches.find(p => p.id === a?.pitchId);
          const ref = referees.find(r => r.id === a?.refereeId);

          const homeScorers = a?.homeScorers?.trim() 
            ? a.homeScorers 
            : (fillInStyle === 'blankLine' ? '____________________' : '');
            
          const awayScorers = a?.awayScorers?.trim() 
            ? a.awayScorers 
            : (fillInStyle === 'blankLine' ? '____________________' : '');

          // Exact requested structure:
          // TIME TEAMS VS TEAM
          // GOAL SCORER TEAM
          // GOAL SCORER TEAM
          text += `TIME: ${time} - ${m.homeTeam} VS ${m.awayTeam}\n`;

          const metaParts: string[] = [];
          if (includePitch) metaParts.push(`Pitch: ${pitch?.name || 'Pitch TBD'}`);
          if (includeDivision) metaParts.push(`Division: ${m.division}`);
          if (includeRefName) metaParts.push(`Referee: ${ref?.name || 'Unassigned'}`);
          if (metaParts.length > 0) {
            text += `${metaParts.join(' | ')}\n`;
          }

          text += `GOAL SCORER ${m.homeTeam.toUpperCase()}: ${homeScorers || ''}\n`;
          text += `GOAL SCORER ${m.awayTeam.toUpperCase()}: ${awayScorers || ''}\n\n`;
        }
      }
    }

    text += `----------------------------------------\n`;
    text += `Referees: Please record final score, goal scorers and conduct notes after each match.\n`;
    text += `Reminder: Collect £36 match fee from team captains prior to kick-off.`;
    return text;
  }, [
    targetFixtures, 
    league, 
    selectedDate, 
    scope, 
    selectedRefFilter, 
    includePitch, 
    includeRefName, 
    includeDivision, 
    fillInStyle, 
    assignments, 
    pitches, 
    referees
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(plainTextMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadTextFile = () => {
    const element = document.createElement("a");
    const file = new Blob([plainTextMessage], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `LeisureLeagues_Fixtures_${selectedDate.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadCSV = () => {
    const headers = [
      'Date', 
      'Time', 
      'Pitch', 
      'Division', 
      'Home Team', 
      'Away Team', 
      'Referee', 
      'Home Goal Scorers', 
      'Away Goal Scorers', 
      'Fee Paid'
    ];

    const rows = targetFixtures.map(f => {
      const a = assignments[f.id];
      const pitch = pitches.find(p => p.id === a?.pitchId)?.name || 'Unassigned';
      const ref = referees.find(r => r.id === a?.refereeId)?.name || 'Unassigned';
      const homeScorers = a?.homeScorers || '';
      const awayScorers = a?.awayScorers || '';
      const fee = a?.matchFeeCollected ? 'Yes (£36)' : 'No';

      return [
        `"${f.date}"`,
        `"${f.time}"`,
        `"${pitch}"`,
        `"${f.division}"`,
        `"${f.homeTeam}"`,
        `"${f.awayTeam}"`,
        `"${ref}"`,
        `"${homeScorers}"`,
        `"${awayScorers}"`,
        `"${fee}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leisure_leagues_fixtures_${selectedDate.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Copy Fixtures as Plain Text</h2>
              <p className="text-xs text-slate-400">
                Formatted fixture text for referees with Time, Teams &amp; Goal Scorer lines
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Fixture Scope */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fixture Selection</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setScope('selectedDate')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                      scope === 'selectedDate' 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active Date ({fixtures.length})
                  </button>
                  <button
                    onClick={() => setScope('allFixtures')}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                      scope === 'allFixtures' 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Every Fixture ({allFixtures.length || fixtures.length})
                  </button>
                </div>
              </div>

              {/* Filter by Referee */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Filter by Referee (Optional)</span>
                </label>
                <select
                  value={selectedRefFilter}
                  onChange={(e) => setSelectedRefFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Referees ({targetFixtures.length} matches)</option>
                  {referees.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.badgeLevel})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Formatting Options */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePitch}
                    onChange={(e) => setIncludePitch(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Include Pitch</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRefName}
                    onChange={(e) => setIncludeRefName(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Include Ref Name</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDivision}
                    onChange={(e) => setIncludeDivision(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Include Division</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Goal Scorer lines:</span>
                <select
                  value={fillInStyle}
                  onChange={(e) => setFillInStyle(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none"
                >
                  <option value="recorded">Empty / Recorded</option>
                  <option value="blankLine">Underline (_______)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plain Text Preview & Big Copy Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>Plain Text Output</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono">
                  {targetFixtures.length} matches
                </span>
              </label>

              {/* The User-Requested Primary Plain Text Copy Button */}
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                {copied ? <ClipboardCheck className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '✓ Copied as Plain Text!' : 'Copy as Plain Text'}</span>
              </button>
            </div>

            {/* Readonly preview textarea */}
            <textarea
              readOnly
              rows={12}
              value={plainTextMessage}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500 selection:text-black"
            />
          </div>

          {/* Export alternatives */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={downloadTextFile}
              className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Download Plain Text (.txt)</span>
            </button>

            <button
              onClick={downloadCSV}
              className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Download CSV Spreadsheet</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Fee reminder: £36 per team</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
