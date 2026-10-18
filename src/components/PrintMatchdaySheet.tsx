import React from 'react';
import { MatchFixture, Pitch, Referee, MatchAssignment, LeagueDetails } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintMatchdaySheetProps {
  league: LeagueDetails | null;
  selectedDate: string;
  fixtures: MatchFixture[];
  pitches: Pitch[];
  referees: Referee[];
  assignments: Record<string, MatchAssignment>;
  onClose: () => void;
}

export const PrintMatchdaySheet: React.FC<PrintMatchdaySheetProps> = ({
  league,
  selectedDate,
  fixtures,
  pitches,
  referees,
  assignments,
  onClose
}) => {
  // Sort fixtures by time, then pitch
  const sortedFixtures = [...fixtures].sort((a, b) => {
    if (a.time !== b.time) return a.time.localeCompare(b.time);
    const pa = pitches.find(p => p.id === assignments[a.id]?.pitchId)?.name || '';
    const pb = pitches.find(p => p.id === assignments[b.id]?.pitchId)?.name || '';
    return pa.localeCompare(pb);
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Screen-only top action bar */}
      <div className="print:hidden bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Match Editor</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ready for clipboard printing</span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Matchday Sheet</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Designed for crisp white paper / clipboard) */}
      <div className="bg-white text-black p-8 rounded-2xl print:rounded-none print:p-2 shadow-2xl print:shadow-none border border-slate-200 print:border-none">
        
        {/* Document Header */}
        <div className="border-b-2 border-black pb-4 mb-5 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase font-black tracking-widest text-emerald-800">
              OFFICIAL LEISURE LEAGUES MATCHDAY SCORE SHEET &amp; PITCH ROSTER
            </div>
            <h1 className="text-2xl font-black tracking-tight text-black mt-0.5">
              {league?.name || 'Leisure Leagues'}
            </h1>
            <div className="text-xs text-gray-700 mt-1 font-medium">
              Venue: <span className="font-bold">{league?.venue || 'Venue'}</span> • Day: <span className="font-bold">{league?.day}</span> • Format: <span className="font-bold">6-a-side</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs font-bold text-gray-600 uppercase">Match Date</div>
            <div className="text-xl font-black text-black font-mono">{selectedDate}</div>
            <div className="text-[11px] text-gray-600 mt-0.5">{fixtures.length} Total Matches</div>
          </div>
        </div>

        {/* Referee Roster Summary Box */}
        <div className="mb-5 p-3 border border-gray-300 rounded-lg bg-gray-50 flex flex-wrap gap-4 text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-700">Referees on Duty:</span>
          {referees.map(r => {
            const count = fixtures.filter(f => assignments[f.id]?.refereeId === r.id).length;
            if (count === 0) return null;
            return (
              <span key={r.id} className="font-medium text-black">
                • {r.name} ({count} {count === 1 ? 'match' : 'matches'})
              </span>
            );
          })}
        </div>

        {/* Matches Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100 text-black">
                <th className="py-2.5 px-2 font-black uppercase text-[10px] w-14">Time</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px] w-28">Pitch</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px] w-28">Division</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px]">Home Team</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px] text-center w-24">Final Score</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px]">Away Team</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px] w-36">Referee</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px] text-center w-20">£36 Paid</th>
                <th className="py-2.5 px-2 font-black uppercase text-[10px] w-24">Sign</th>
              </tr>
            </thead>
            <tbody>
              {sortedFixtures.map((f, index) => {
                const a = assignments[f.id];
                const pitch = pitches.find(p => p.id === a?.pitchId)?.name || 'TBD';
                const ref = referees.find(r => r.id === a?.refereeId)?.name || 'Unassigned';
                const scoreDisplay = f.homeScore !== null 
                  ? `${f.homeScore} - ${f.awayScore}`
                  : (a?.recordedHomeScore !== undefined ? `${a.recordedHomeScore} - ${a.recordedAwayScore ?? 0}` : '[   ] - [   ]');

                return (
                  <tr key={f.id} className={`border-b border-gray-300 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                    <td className="py-2 px-2 font-bold font-mono text-black">{f.time}</td>
                    <td className="py-2 px-2 font-semibold text-black">{pitch}</td>
                    <td className="py-2 px-2 text-gray-700">{f.division}</td>
                    <td className="py-2 px-2 font-bold text-black">{f.homeTeam}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-black bg-gray-100/60">{scoreDisplay}</td>
                    <td className="py-2 px-2 font-bold text-black">{f.awayTeam}</td>
                    <td className="py-2 px-2 font-semibold text-black">{ref}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block w-4 h-4 border border-black rounded ${a?.matchFeeCollected ? 'bg-black text-white text-[9px] font-bold leading-4' : ''}`}>
                        {a?.matchFeeCollected ? '✓' : ''}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="w-16 border-b border-gray-400 h-4"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Coordinator Sign-off Footer */}
        <div className="mt-8 pt-4 border-t-2 border-black grid grid-cols-3 gap-6 text-xs text-gray-700">
          <div>
            <div className="font-bold text-black">League Coordinator Sign-off:</div>
            <div className="mt-4 border-b border-gray-400 w-48"></div>
          </div>
          <div>
            <div className="font-bold text-black">Total Ref Fees Collected (£36/team):</div>
            <div className="mt-4 border-b border-gray-400 w-36"></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500">Official Leisure Leagues Tool • leisureleagues.net</div>
          </div>
        </div>

      </div>
    </div>
  );
};
