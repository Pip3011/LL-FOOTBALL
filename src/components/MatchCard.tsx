import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp,
  CircleDot
} from 'lucide-react';
import { MatchFixture, Pitch, Referee, MatchAssignment } from '../types';

interface MatchCardProps {
  fixture: MatchFixture;
  pitches: Pitch[];
  referees: Referee[];
  assignment: MatchAssignment;
  onUpdateAssignment: (fixtureId: string, updates: Partial<MatchAssignment>) => void;
  pitchConflictWith?: string; // name of conflicting team/match
  refConflictWith?: string;   // name of conflicting team/match
  onOpenAddPitch: () => void;
  onOpenAddRef: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  fixture,
  pitches,
  referees,
  assignment,
  onUpdateAssignment,
  pitchConflictWith,
  refConflictWith,
  onOpenAddPitch,
  onOpenAddRef
}) => {
  const [showNotes, setShowNotes] = useState(false);

  const selectedPitch = pitches.find(p => p.id === assignment.pitchId);
  const selectedRef = referees.find(r => r.id === assignment.refereeId);
  const selectedAssistant = referees.find(r => r.id === assignment.assistantRefId);

  // Compute referee's workload across the evening
  return (
    <div className={`p-4 rounded-2xl border transition-all relative ${
      pitchConflictWith || refConflictWith
        ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-sm'
    }`}>
      {/* Top Bar: Time, Division, Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{fixture.time}</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
            {fixture.division}
          </span>
          {fixture.isExtraBooking && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
              {fixture.bookingType || 'Extra Pitch Hire'}
            </span>
          )}
        </div>

        {/* Status / Live Score indicator */}
        <div className="flex items-center gap-2 text-xs">
          {fixture.status === 'completed' || assignment.recordedHomeScore !== undefined ? (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[11px] flex items-center gap-1">
              <CircleDot className="w-2.5 h-2.5 text-emerald-400" /> Result Finalized
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold text-[11px]">
              Scheduled
            </span>
          )}
        </div>
      </div>

      {/* Collision Alerts if any */}
      {(pitchConflictWith || refConflictWith) && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 space-y-1 text-xs text-amber-200">
          {pitchConflictWith && (
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Pitch Clashed: {selectedPitch?.name} is also booked for {pitchConflictWith} at {fixture.time}!</span>
            </div>
          )}
          {refConflictWith && (
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Referee Clashed: {selectedRef?.name} is also assigned to {refConflictWith} at {fixture.time}!</span>
            </div>
          )}
        </div>
      )}

      {/* Teams & Score Display */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 mb-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-3">
          
          {/* Home Team */}
          <div className="sm:col-span-4 flex items-center justify-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
              {fixture.homeTeam.charAt(0)}
            </div>
            <div className="font-bold text-sm text-white truncate max-w-[170px]" title={fixture.homeTeam}>
              {fixture.homeTeam}
            </div>
          </div>

          {/* Score or VS */}
          <div className="sm:col-span-3 flex items-center justify-center">
            {fixture.homeScore !== null && fixture.awayScore !== null ? (
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono font-black text-base text-white tracking-widest">
                {fixture.homeScore} - {fixture.awayScore}
              </div>
            ) : assignment.recordedHomeScore !== undefined && assignment.recordedHomeScore !== null ? (
              <div className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-mono font-black text-base text-emerald-300 tracking-widest">
                {assignment.recordedHomeScore} - {assignment.recordedAwayScore ?? 0}
              </div>
            ) : (
              <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase tracking-widest">
                VS
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="sm:col-span-4 flex items-center justify-end gap-2.5">
            <div className="font-bold text-sm text-white truncate max-w-[170px] text-right" title={fixture.awayTeam}>
              {fixture.awayTeam}
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-black text-xs flex items-center justify-center border border-blue-500/30 shrink-0">
              {fixture.awayTeam.charAt(0)}
            </div>
          </div>

        </div>
      </div>

      {/* Pitch & Referee Assignment Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        
        {/* PITCH SELECTOR */}
        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assigned Pitch</span>
            </label>
            {selectedPitch && (
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                {selectedPitch.surface}
              </span>
            )}
          </div>
          
          <div className="flex gap-1.5">
            <select
              value={assignment.pitchId || ''}
              onChange={(e) => onUpdateAssignment(fixture.id, { pitchId: e.target.value })}
              className={`flex-1 bg-slate-900 border text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none transition-colors ${
                pitchConflictWith 
                  ? 'border-amber-500 text-amber-200 focus:border-amber-400' 
                  : assignment.pitchId 
                  ? 'border-emerald-500/40 text-emerald-300 focus:border-emerald-500' 
                  : 'border-slate-700 text-slate-400 focus:border-slate-500'
              }`}
            >
              <option value="">-- Select Pitch --</option>
              {pitches.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.surface})
                </option>
              ))}
            </select>
            <button
              onClick={onOpenAddPitch}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              title="Add or configure pitches"
            >
              +
            </button>
          </div>
        </div>

        {/* REFEREE SELECTOR */}
        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assigned Referee</span>
            </label>
            {selectedRef && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                {selectedRef.badgeLevel}
              </span>
            )}
          </div>

          <div className="flex gap-1.5">
            <select
              value={assignment.refereeId || ''}
              onChange={(e) => onUpdateAssignment(fixture.id, { refereeId: e.target.value })}
              className={`flex-1 bg-slate-900 border text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none transition-colors ${
                refConflictWith 
                  ? 'border-amber-500 text-amber-200 focus:border-amber-400' 
                  : assignment.refereeId 
                  ? 'border-emerald-500/40 text-emerald-300 focus:border-emerald-500' 
                  : 'border-slate-700 text-slate-400 focus:border-slate-500'
              }`}
            >
              <option value="">-- Select Referee --</option>
              {referees.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.badgeLevel})
                </option>
              ))}
            </select>
            <button
              onClick={onOpenAddRef}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              title="Add or configure referees"
            >
              +
            </button>
          </div>
        </div>

      </div>

      {/* Match Coordinator Accordion (Match fees, balls, notes, recorded score) */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Quick checkbox: Fee collected */}
            <button
              onClick={() => onUpdateAssignment(fixture.id, { matchFeeCollected: !assignment.matchFeeCollected })}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {assignment.matchFeeCollected ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>£36 Match Fee Paid</span>
            </button>

            {/* Quick checkbox: Balls out */}
            <button
              onClick={() => onUpdateAssignment(fixture.id, { ballsProvided: !assignment.ballsProvided })}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {assignment.ballsProvided ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>Match Balls Out</span>
            </button>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showNotes ? 'Hide Details' : 'Details & Notes'}</span>
            {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expanded Notes & Assistant Ref */}
        {showNotes && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Optional Assistant Ref / Timekeeper */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Assistant Ref / Timekeeper (Optional)
                </label>
                <select
                  value={assignment.assistantRefId || ''}
                  onChange={(e) => onUpdateAssignment(fixture.id, { assistantRefId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">None / Solo Ref</option>
                  {referees
                    .filter(r => r.id !== assignment.refereeId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Enter Live Score */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Record Night Score (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Home"
                    value={assignment.recordedHomeScore ?? ''}
                    onChange={(e) => onUpdateAssignment(fixture.id, { 
                      recordedHomeScore: e.target.value === '' ? null : parseInt(e.target.value, 10) 
                    })}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-center text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-500">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Away"
                    value={assignment.recordedAwayScore ?? ''}
                    onChange={(e) => onUpdateAssignment(fixture.id, { 
                      recordedAwayScore: e.target.value === '' ? null : parseInt(e.target.value, 10) 
                    })}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-center text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Goal Scorers Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-emerald-400 block mb-1">
                  ⚽ Goal Scorers: {fixture.homeTeam}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dave (2), Marcus (1)"
                  value={assignment.homeScorers || ''}
                  onChange={(e) => onUpdateAssignment(fixture.id, { homeScorers: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-blue-400 block mb-1">
                  ⚽ Goal Scorers: {fixture.awayTeam}
                </label>
                <input
                  type="text"
                  placeholder="e.g. John (1), Ryan (2)"
                  value={assignment.awayScorers || ''}
                  onChange={(e) => onUpdateAssignment(fixture.id, { awayScorers: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Coordinator / Disciplinary Notes (Cards, bibs, ref fee)
              </label>
              <input
                type="text"
                placeholder="e.g. Away team wearing orange bibs; collected £36 ref fee..."
                value={assignment.notes || ''}
                onChange={(e) => onUpdateAssignment(fixture.id, { notes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
