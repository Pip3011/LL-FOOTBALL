import React, { useState, useMemo } from 'react';
import { X, Users, Check, Sparkles, Layers, Clock, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { MatchFixture, Pitch, Referee, MatchAssignment } from '../types';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixtures: MatchFixture[];
  pitches: Pitch[];
  referees: Referee[];
  assignments: Record<string, MatchAssignment>;
  onBulkAssignRef: (fixtureIds: string[], refereeId: string) => void;
  onBulkAssignPitch?: (fixtureIds: string[], pitchId: string) => void;
  selectedDate: string;
  initialPitchId?: string;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  fixtures,
  pitches,
  referees,
  assignments,
  onBulkAssignRef,
  onBulkAssignPitch,
  selectedDate,
  initialPitchId
}) => {
  const [selectedRefId, setSelectedRefId] = useState<string>(referees[0]?.id || '');
  const [selectedPitchId, setSelectedPitchId] = useState<string>(initialPitchId || '');
  
  // Assignment target mode: 'byPitch' | 'byTime' | 'byDivision' | 'allUnassigned' | 'customSelect'
  const [targetMode, setTargetMode] = useState<'byPitch' | 'byTime' | 'byDivision' | 'allUnassigned' | 'customSelect'>(
    initialPitchId ? 'byPitch' : 'byPitch'
  );

  const [filterPitchId, setFilterPitchId] = useState<string>(initialPitchId || pitches[0]?.id || '');
  const [filterTime, setFilterTime] = useState<string>(fixtures[0]?.time || '');
  const [filterDivision, setFilterDivision] = useState<string>(fixtures[0]?.division || '');
  const [checkedFixtureIds, setCheckedFixtureIds] = useState<string[]>([]);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Collect unique times and divisions
  const uniqueTimes = useMemo(() => Array.from(new Set(fixtures.map(f => f.time))).sort(), [fixtures]);
  const uniqueDivisions = useMemo(() => Array.from(new Set(fixtures.map(f => f.division))), [fixtures]);

  // Determine affected fixtures based on mode
  const affectedFixtures = useMemo(() => {
    switch (targetMode) {
      case 'byPitch':
        return fixtures.filter(f => assignments[f.id]?.pitchId === filterPitchId);
      case 'byTime':
        return fixtures.filter(f => f.time === filterTime);
      case 'byDivision':
        return fixtures.filter(f => f.division === filterDivision);
      case 'allUnassigned':
        return fixtures.filter(f => !assignments[f.id]?.refereeId);
      case 'customSelect':
        return fixtures.filter(f => checkedFixtureIds.includes(f.id));
      default:
        return [];
    }
  }, [targetMode, fixtures, assignments, filterPitchId, filterTime, filterDivision, checkedFixtureIds]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!selectedRefId || affectedFixtures.length === 0) return;

    const ids = affectedFixtures.map(f => f.id);
    onBulkAssignRef(ids, selectedRefId);

    const refName = referees.find(r => r.id === selectedRefId)?.name || 'Referee';
    setAppliedFeedback(`Successfully assigned ${refName} to ${ids.length} ${ids.length === 1 ? 'game' : 'games'}!`);
    
    setTimeout(() => {
      setAppliedFeedback(null);
      onClose();
    }, 1200);
  };

  const toggleCheck = (id: string) => {
    setCheckedFixtureIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllCustom = () => {
    setCheckedFixtureIds(fixtures.map(f => f.id));
  };

  const clearAllCustom = () => {
    setCheckedFixtureIds([]);
  };

  const selectedRefObj = referees.find(r => r.id === selectedRefId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Bulk Assign Referee to Games</h2>
              <p className="text-xs text-slate-400">
                Quickly allocate a referee across multiple matches on {selectedDate}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Step 1: Choose Referee */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Step 1: Choose Referee to Assign</span>
            </label>
            <div className="flex gap-2">
              <select
                value={selectedRefId}
                onChange={(e) => setSelectedRefId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="">-- Choose Referee --</option>
                {referees.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.badgeLevel})
                  </option>
                ))}
              </select>
            </div>
            {selectedRefObj && (
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <span>Badge: <strong className="text-emerald-400">{selectedRefObj.badgeLevel}</strong></span>
                {selectedRefObj.phone && <span>• Tel: {selectedRefObj.phone}</span>}
              </div>
            )}
          </div>

          {/* Step 2: Choose Target Scope */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Step 2: Choose Which Games to Assign to</span>
            </label>

            {/* Target mode buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                onClick={() => setTargetMode('byPitch')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border ${
                  targetMode === 'byPitch'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🏟️ Entire Pitch
              </button>
              <button
                onClick={() => setTargetMode('allUnassigned')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border ${
                  targetMode === 'allUnassigned'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                ⚠️ All Unassigned
              </button>
              <button
                onClick={() => setTargetMode('byTime')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border ${
                  targetMode === 'byTime'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                ⏰ Time Slot
              </button>
              <button
                onClick={() => setTargetMode('byDivision')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border ${
                  targetMode === 'byDivision'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🏆 Division
              </button>
              <button
                onClick={() => setTargetMode('customSelect')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border col-span-2 sm:col-span-2 ${
                  targetMode === 'customSelect'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                ☑️ Pick Specific Games ({checkedFixtureIds.length} selected)
              </button>
            </div>

            {/* Mode-specific secondary filter */}
            {targetMode === 'byPitch' && (
              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">Select Pitch (assigns referee to all games on this pitch tonight):</label>
                <select
                  value={filterPitchId}
                  onChange={(e) => setFilterPitchId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {pitches.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.surface})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetMode === 'byTime' && (
              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">Select Kick-Off Round:</label>
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {uniqueTimes.map(t => (
                    <option key={t} value={t}>{t} Kick-Off</option>
                  ))}
                </select>
              </div>
            )}

            {targetMode === 'byDivision' && (
              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">Select Division:</label>
                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {uniqueDivisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
            )}

            {targetMode === 'customSelect' && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Check games to assign:</span>
                  <div className="flex gap-2">
                    <button onClick={selectAllCustom} className="text-emerald-400 hover:underline text-[11px]">Select All</button>
                    <span>•</span>
                    <button onClick={clearAllCustom} className="text-slate-400 hover:underline text-[11px]">Clear</button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {fixtures.map(f => {
                    const isChecked = checkedFixtureIds.includes(f.id);
                    const currentPitch = pitches.find(p => p.id === assignments[f.id]?.pitchId)?.name || 'No pitch';
                    const currentRef = referees.find(r => r.id === assignments[f.id]?.refereeId)?.name || 'No ref';

                    return (
                      <div
                        key={f.id}
                        onClick={() => toggleCheck(f.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                          <div>
                            <span className="font-bold text-white">{f.homeTeam} vs {f.awayTeam}</span>
                            <span className="text-[11px] text-slate-400 font-mono ml-2">({f.time} • {currentPitch})</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Current: {currentRef}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Summary of affected matches */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                Matches to update: <span className="text-emerald-400 font-mono">{affectedFixtures.length}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {selectedRefObj ? `Will assign ${selectedRefObj.name}` : 'Please select a referee above'}
              </div>
            </div>

            {appliedFeedback ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <Check className="w-4 h-4" />
                <span>{appliedFeedback}</span>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={!selectedRefId || affectedFixtures.length === 0}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Apply to {affectedFixtures.length} {affectedFixtures.length === 1 ? 'Game' : 'Games'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Updates live match assignments</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
