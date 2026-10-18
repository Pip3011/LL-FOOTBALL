import React, { useState } from 'react';
import { MatchFixture, Pitch, Referee, MatchAssignment } from '../types';
import { MatchCard } from './MatchCard';
import { Sparkles, Calendar, CheckCircle2, Layers, Users, CheckSquare, Square, X, Clock } from 'lucide-react';

interface MatchListProps {
  fixtures: MatchFixture[];
  pitches: Pitch[];
  referees: Referee[];
  assignments: Record<string, MatchAssignment>;
  onUpdateAssignment: (fixtureId: string, updates: Partial<MatchAssignment>) => void;
  onAutoAssign: () => void;
  onOpenAddPitch: () => void;
  onOpenAddRef: () => void;
  onOpenShareModal?: () => void;
  onOpenBulkModal?: () => void;
  onBulkAssignRef?: (fixtureIds: string[], refId: string) => void;
  onOpenExtraTimeModal?: () => void;
  selectedDate: string;
}

export const MatchList: React.FC<MatchListProps> = ({
  fixtures,
  pitches,
  referees,
  assignments,
  onUpdateAssignment,
  onAutoAssign,
  onOpenAddPitch,
  onOpenAddRef,
  onOpenShareModal,
  onOpenBulkModal,
  onBulkAssignRef,
  onOpenExtraTimeModal,
  selectedDate
}) => {
  const [selectedFixtureIds, setSelectedFixtureIds] = useState<string[]>([]);
  const [batchRefId, setBatchRefId] = useState<string>('');

  // Compute collision maps:
  const pitchTimeMap = new Map<string, { id: string; name: string }[]>();
  const refTimeMap = new Map<string, { id: string; name: string }[]>();

  for (const f of fixtures) {
    const a = assignments[f.id];
    if (a?.pitchId) {
      const key = `${a.pitchId}_${f.time}`;
      const list = pitchTimeMap.get(key) || [];
      list.push({ id: f.id, name: `${f.homeTeam} vs ${f.awayTeam}` });
      pitchTimeMap.set(key, list);
    }
    if (a?.refereeId) {
      const key = `${a.refereeId}_${f.time}`;
      const list = refTimeMap.get(key) || [];
      list.push({ id: f.id, name: `${f.homeTeam} vs ${f.awayTeam}` });
      refTimeMap.set(key, list);
    }
  }

  // Count assigned pitches & referees
  const totalAssignedPitches = fixtures.filter(f => assignments[f.id]?.pitchId).length;
  const totalAssignedRefs = fixtures.filter(f => assignments[f.id]?.refereeId).length;
  const allAssigned = totalAssignedPitches === fixtures.length && totalAssignedRefs === fixtures.length;

  const toggleSelectMatch = (id: string) => {
    setSelectedFixtureIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFixtureIds.length === fixtures.length) {
      setSelectedFixtureIds([]);
    } else {
      setSelectedFixtureIds(fixtures.map(f => f.id));
    }
  };

  const handleApplyBatchRef = () => {
    if (!batchRefId || selectedFixtureIds.length === 0 || !onBulkAssignRef) return;
    onBulkAssignRef(selectedFixtureIds, batchRefId);
    setSelectedFixtureIds([]);
    setBatchRefId('');
  };

  return (
    <div className="space-y-4">
      {/* Coordinator Quick Stats Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              totalAssignedPitches === fixtures.length 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-amber-500/10 text-amber-400'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400">Pitches Allocated:</span>{' '}
              <span className="font-bold text-white">
                {totalAssignedPitches}/{fixtures.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              totalAssignedRefs === fixtures.length 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-amber-500/10 text-amber-400'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400">Referees Allocated:</span>{' '}
              <span className="font-bold text-white">
                {totalAssignedRefs}/{fixtures.length}
              </span>
            </div>
          </div>

          {allAssigned && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Matchday Allocated</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Extra Time, Bulk Assign Ref, Plain Text, Auto Assign */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenExtraTimeModal && (
            <button
              onClick={onOpenExtraTimeModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-95"
              title="Add extra kick-off times or book extra pitch hire"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>+ Extra Time / Hire</span>
            </button>
          )}

          {onOpenBulkModal && (
            <button
              onClick={onOpenBulkModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95"
              title="Bulk assign a referee to multiple games on this night"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Bulk Assign Ref</span>
            </button>
          )}

          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm active:scale-95"
              title="Export fixtures as plain text with Kick-Off Time, Teams & Goal Scorer lines"
            >
              <span>📋 Copy as Plain Text</span>
            </button>
          )}

          {/* Smart Auto Assign Shortcut Button */}
          {!allAssigned && fixtures.length > 0 && (
            <button
              onClick={onAutoAssign}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Allocate All</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-Match Select & Batch Action Bar */}
      {fixtures.length > 0 && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors"
            >
              {selectedFixtureIds.length === fixtures.length && fixtures.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span>
                {selectedFixtureIds.length === fixtures.length
                  ? 'Deselect All'
                  : 'Select All Matches'}
              </span>
            </button>

            {selectedFixtureIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                {selectedFixtureIds.length} {selectedFixtureIds.length === 1 ? 'match' : 'matches'} selected
              </span>
            )}
          </div>

          {/* Bulk Assign Controls for selected matches */}
          {selectedFixtureIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <span className="text-slate-400 font-semibold">Assign Ref to Selected:</span>
              <select
                value={batchRefId}
                onChange={(e) => setBatchRefId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="">-- Choose Referee --</option>
                {referees.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.badgeLevel})</option>
                ))}
              </select>

              <button
                onClick={handleApplyBatchRef}
                disabled={!batchRefId}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-all"
              >
                Apply
              </button>

              <button
                onClick={() => setSelectedFixtureIds([])}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* No fixtures empty state */}
      {fixtures.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No matches found for this date or filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please pick another match date from the date bar above, or select &ldquo;All Divisions&rdquo; to view scheduled games.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {fixtures.map((fixture) => {
            const a = assignments[fixture.id] || { pitchId: '', refereeId: '' };
            const isSelected = selectedFixtureIds.includes(fixture.id);

            // Check pitch collision
            let pitchConflictWith: string | undefined;
            if (a.pitchId) {
              const list = pitchTimeMap.get(`${a.pitchId}_${fixture.time}`) || [];
              if (list.length > 1) {
                const other = list.find(x => x.id !== fixture.id);
                if (other) pitchConflictWith = other.name;
              }
            }

            // Check referee collision
            let refConflictWith: string | undefined;
            if (a.refereeId) {
              const list = refTimeMap.get(`${a.refereeId}_${fixture.time}`) || [];
              if (list.length > 1) {
                const other = list.find(x => x.id !== fixture.id);
                if (other) refConflictWith = other.name;
              }
            }

            return (
              <div key={fixture.id} className="flex items-start gap-2.5 group">
                {/* Selection Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleSelectMatch(fixture.id)}
                  className="mt-4 p-1 rounded hover:bg-slate-800 text-slate-600 hover:text-emerald-400 transition-colors"
                  title="Select for bulk referee assignment"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1">
                  <MatchCard
                    fixture={fixture}
                    pitches={pitches}
                    referees={referees}
                    assignment={a}
                    onUpdateAssignment={onUpdateAssignment}
                    pitchConflictWith={pitchConflictWith}
                    refConflictWith={refConflictWith}
                    onOpenAddPitch={onOpenAddPitch}
                    onOpenAddRef={onOpenAddRef}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
