import React from 'react';
import { MatchFixture, Pitch, Referee, MatchAssignment } from '../types';
import { Clock, UserCheck, AlertTriangle, MapPin, Users, Plus, Sparkles } from 'lucide-react';

interface PitchBoardProps {
  fixtures: MatchFixture[];
  pitches: Pitch[];
  referees: Referee[];
  assignments: Record<string, MatchAssignment>;
  onUpdateAssignment: (fixtureId: string, updates: Partial<MatchAssignment>) => void;
  onBulkAssignRef: (fixtureIds: string[], refId: string) => void;
  onOpenPitchModal: () => void;
  onOpenBulkModal?: (initialPitchId?: string) => void;
  extraTimes?: string[];
  onOpenExtraTimeModal?: (initialTime?: string, initialPitchId?: string) => void;
}

export const PitchBoard: React.FC<PitchBoardProps> = ({
  fixtures,
  pitches,
  referees,
  assignments,
  onUpdateAssignment,
  onBulkAssignRef,
  onOpenPitchModal,
  onOpenBulkModal,
  extraTimes = [],
  onOpenExtraTimeModal
}) => {
  // Collect all unique kick-off times (regular scheduled times + extra pitch hire times) sorted
  const timeSlots = Array.from(new Set([...fixtures.map(f => f.time), ...extraTimes])).sort();

  // Find unassigned fixtures (no pitch assigned)
  const unassignedFixtures = fixtures.filter(f => !assignments[f.id]?.pitchId);

  // Quick helper to assign a referee to all matches on a pitch tonight
  const handleAssignRefToPitch = (pitchId: string, refId: string) => {
    if (!refId) return;
    const matchIdsOnPitch = fixtures
      .filter(f => assignments[f.id]?.pitchId === pitchId)
      .map(f => f.id);

    if (matchIdsOnPitch.length > 0) {
      onBulkAssignRef(matchIdsOnPitch, refId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Pitch Summary, Extra Time Slot, and Bulk Referee Assignment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Visual Pitch Board Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Real-time pitch allocations. Assign referees in bulk per pitch, or add extra hired time slots (e.g. 18:30, 20:30) for extra pitch hire occasions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Extra Time / Pitch Hire Button */}
          {onOpenExtraTimeModal && (
            <button
              onClick={() => onOpenExtraTimeModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
              title="Add extra kick-off times or book extra pitch hire"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>+ Extra Time / Hire</span>
            </button>
          )}

          {/* Bulk Assign Ref */}
          {onOpenBulkModal && (
            <button
              onClick={() => onOpenBulkModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              title="Bulk assign referees to multiple games on this night"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Bulk Assign Referee</span>
            </button>
          )}

          {/* Configure Pitches */}
          <button
            onClick={onOpenPitchModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pitches</span>
          </button>
        </div>
      </div>

      {/* Unassigned Matches Drawer (if any) */}
      {unassignedFixtures.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Unassigned Pitches ({unassignedFixtures.length} matches need pitch assignment)</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {unassignedFixtures.map(f => (
              <div 
                key={f.id} 
                className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{f.homeTeam} vs {f.awayTeam}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{f.time} • {f.division}</div>
                </div>
                <select
                  value=""
                  onChange={(e) => onUpdateAssignment(f.id, { pitchId: e.target.value })}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2 py-1 rounded text-xs focus:outline-none cursor-pointer"
                >
                  <option value="">+ Assign Pitch</option>
                  {pitches.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Time Slots (rows) x Pitches (columns) */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[880px] space-y-4">
          
          {/* Pitch Columns Header with Bulk Pitch Referee Assignment */}
          <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-400 px-2">
            <div className="col-span-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kick-Off</span>
            </div>
            <div className="col-span-10 grid gap-3" style={{ gridTemplateColumns: `repeat(${pitches.length}, minmax(0, 1fr))` }}>
              {pitches.map((p) => {
                const gamesOnThisPitch = fixtures.filter(f => assignments[f.id]?.pitchId === p.id);

                return (
                  <div 
                    key={p.id} 
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-white text-xs truncate" title={p.name}>
                        {p.name}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {p.surface}
                      </span>
                    </div>

                    {/* Quick Bulk Assign Ref for all games on this pitch tonight */}
                    <div className="pt-1 border-t border-slate-800/80">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignRefToPitch(p.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-[10px] text-slate-300 font-medium rounded px-1.5 py-1 focus:outline-none cursor-pointer transition-colors"
                        title="Assign referee to all games playing on this pitch tonight"
                      >
                        <option value="" disabled>⚡ Set Ref for this Pitch...</option>
                        {referees.map(r => (
                          <option key={r.id} value={r.id}>
                            Assign {r.name} ({gamesOnThisPitch.length} games)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Rows */}
          {timeSlots.map((time) => {
            const isExtraHiredSlot = extraTimes.includes(time);

            return (
              <div key={time} className="grid grid-cols-12 gap-3 items-stretch">
                {/* Time Indicator */}
                <div className={`col-span-2 rounded-xl p-3 flex flex-col justify-center items-center font-mono border ${
                  isExtraHiredSlot
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/90 border-slate-800 text-white'
                }`}>
                  <span className="text-sm font-black">{time}</span>
                  {isExtraHiredSlot ? (
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mt-0.5 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                      Extra Hire
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Round</span>
                  )}
                </div>

                {/* Pitch Cells */}
                <div 
                  className="col-span-10 grid gap-3" 
                  style={{ gridTemplateColumns: `repeat(${pitches.length}, minmax(0, 1fr))` }}
                >
                  {pitches.map((pitch) => {
                    // Find match(es) assigned to this pitch at this time
                    const matchesHere = fixtures.filter(
                      f => f.time === time && assignments[f.id]?.pitchId === pitch.id
                    );

                    const isCollision = matchesHere.length > 1;

                    return (
                      <div
                        key={pitch.id}
                        className={`rounded-xl border p-2.5 min-h-[140px] flex flex-col justify-between transition-all relative overflow-hidden ${
                          isCollision
                            ? 'bg-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-950/40'
                            : matchesHere.length > 0
                            ? matchesHere.some(m => m.isExtraBooking) 
                              ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
                              : 'bg-slate-900/90 border-slate-700/80 shadow-md'
                            : isExtraHiredSlot
                            ? 'bg-amber-950/10 border-dashed border-amber-500/30 hover:bg-slate-900/50'
                            : 'bg-slate-950/40 border-dashed border-slate-800/80 hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Soccer field pitch lines graphic in background */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border border-white"></div>
                        </div>

                        {matchesHere.length === 0 ? (
                          /* Empty Pitch Slot */
                          <div className="h-full flex flex-col items-center justify-center text-center p-2 text-slate-600">
                            <span className="text-[11px] font-semibold text-slate-500 mb-1">
                              {isExtraHiredSlot ? 'Hired Slot Open' : 'Available'}
                            </span>
                            {onOpenExtraTimeModal && (
                              <button
                                type="button"
                                onClick={() => onOpenExtraTimeModal(time, pitch.id)}
                                className="mt-1 px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[10px] font-bold transition-all border border-slate-700"
                                title="Book pitch hire or add match at this time"
                              >
                                + Book Pitch
                              </button>
                            )}
                          </div>
                        ) : (
                          /* Match(es) assigned to pitch */
                          <div className="space-y-2 z-10">
                            {isCollision && (
                              <div className="p-1 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase text-center">
                                ⚠️ Pitch Conflict!
                              </div>
                            )}

                            {matchesHere.map((m) => {
                              const a = assignments[m.id];
                              const ref = referees.find(r => r.id === a?.refereeId);

                              return (
                                <div key={m.id} className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px]">
                                    {m.isExtraBooking ? (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[9px] uppercase">
                                        {m.bookingType || 'Pitch Hire'}
                                      </span>
                                    ) : (
                                      <span className="truncate max-w-[90px] font-medium text-emerald-400">{m.division}</span>
                                    )}

                                    {m.homeScore !== null ? (
                                      <span className="font-mono font-bold text-white">
                                        {m.homeScore} - {m.awayScore}
                                      </span>
                                    ) : a?.recordedHomeScore !== undefined && a.recordedHomeScore !== null ? (
                                      <span className="font-mono font-bold text-emerald-300">
                                        {a.recordedHomeScore} - {a.recordedAwayScore ?? 0}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[10px]">Live</span>
                                    )}
                                  </div>

                                  <div className="font-bold text-xs text-white leading-tight">
                                    <div className="truncate text-slate-200">{m.homeTeam}</div>
                                    <div className="text-[10px] text-slate-500 font-normal">vs</div>
                                    <div className="truncate text-slate-200">{m.awayTeam}</div>
                                  </div>

                                  {/* Direct Interactive Referee Selector Right Inside Pitch Cell */}
                                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <select
                                      value={a?.refereeId || ''}
                                      onChange={(e) => onUpdateAssignment(m.id, { refereeId: e.target.value })}
                                      className={`w-full bg-slate-950 border text-[10px] rounded px-1.5 py-0.5 focus:outline-none transition-colors cursor-pointer ${
                                        a?.refereeId 
                                          ? 'text-emerald-300 border-slate-700 hover:border-emerald-500' 
                                          : 'text-amber-300 border-amber-500/50 bg-amber-500/10 font-bold'
                                      }`}
                                      title="Assign or change referee for this game"
                                    >
                                      <option value="">-- Assign Ref --</option>
                                      {referees.map(r => (
                                        <option key={r.id} value={r.id}>
                                          {r.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
