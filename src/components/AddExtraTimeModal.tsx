import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  Layers, 
  Calendar 
} from 'lucide-react';
import { Pitch, Referee, MatchFixture, MatchAssignment } from '../types';

interface AddExtraTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  pitches: Pitch[];
  referees: Referee[];
  existingTimes: string[];
  extraTimes: string[];
  onAddExtraTimeSlot: (time: string) => void;
  onRemoveExtraTimeSlot: (time: string) => void;
  onAddCustomFixture: (fixture: MatchFixture, assignment?: Partial<MatchAssignment>) => void;
  initialTime?: string;
  initialPitchId?: string;
}

export const AddExtraTimeModal: React.FC<AddExtraTimeModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  pitches,
  referees,
  existingTimes,
  extraTimes,
  onAddExtraTimeSlot,
  onRemoveExtraTimeSlot,
  onAddCustomFixture,
  initialTime = '20:30',
  initialPitchId
}) => {
  // Tabs: 'addSlotOnly' | 'addExtraGame'
  const [tab, setTab] = useState<'addExtraGame' | 'addSlotOnly'>('addExtraGame');

  // Slot only state
  const [newTimeInput, setNewTimeInput] = useState(initialTime);

  // Extra Game form state
  const [gameTime, setGameTime] = useState(initialTime);
  const [bookingType, setBookingType] = useState<MatchFixture['bookingType']>('Extra Pitch Hire');
  const [homeTeam, setHomeTeam] = useState('Hire Team A');
  const [awayTeam, setAwayTeam] = useState('Hire Team B');
  const [division, setDivision] = useState('Extra Pitch Hire');
  const [assignedPitchId, setAssignedPitchId] = useState(initialPitchId || pitches[0]?.id || '');
  const [assignedRefId, setAssignedRefId] = useState('');
  const [notes, setNotes] = useState('');
  const [feeCollected, setFeeCollected] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset quick times
  const PRESET_EXTRA_TIMES = ['18:00', '18:30', '20:30', '21:00', '21:30'];

  const handleAddSlotOnly = (timeToAdd: string) => {
    if (!timeToAdd.trim()) return;
    const formatted = timeToAdd.trim();
    onAddExtraTimeSlot(formatted);
    setFeedback(`Extra time slot ${formatted} added to ${selectedDate}!`);
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleCreateExtraGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTime.trim() || !homeTeam.trim() || !awayTeam.trim()) return;

    const fixtureId = `extra_${Date.now()}_${gameTime.replace(':', '')}`;
    const newFixture: MatchFixture = {
      id: fixtureId,
      date: selectedDate,
      time: gameTime.trim(),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      division: division.trim() || 'Extra Pitch Hire',
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
      isExtraBooking: true,
      bookingType: bookingType || 'Extra Pitch Hire',
    };

    onAddCustomFixture(newFixture, {
      pitchId: assignedPitchId,
      refereeId: assignedRefId,
      notes: notes.trim() || `Extra Pitch Hire on ${gameTime}`,
      matchFeeCollected: feeCollected,
    });

    // Also register the time slot so the pitch matrix shows it
    onAddExtraTimeSlot(gameTime.trim());

    setFeedback(`Extra game scheduled at ${gameTime}!`);
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Extra Pitch Hire &amp; Times</h2>
              <p className="text-xs text-slate-400">
                Add extra kick-off rounds or book extra hired matches for {selectedDate}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 flex gap-2 border-b border-slate-800/80">
          <button
            onClick={() => setTab('addExtraGame')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              tab === 'addExtraGame'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Extra Match / Pitch Hire</span>
          </button>

          <button
            onClick={() => setTab('addSlotOnly')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              tab === 'addSlotOnly'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Manage Night Time Slots ({extraTimes.length} extra)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* TAB 1: Add Extra Match / Pitch Hire */}
          {tab === 'addExtraGame' && (
            <form onSubmit={handleCreateExtraGame} className="space-y-4">
              
              {/* Kick-off Time & Booking Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kick-Off Time</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      required
                      value={gameTime}
                      onChange={(e) => setGameTime(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {PRESET_EXTRA_TIMES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setGameTime(t)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          gameTime === t 
                            ? 'bg-emerald-500 text-slate-950 font-bold' 
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Occasion / Booking Type
                  </label>
                  <select
                    value={bookingType}
                    onChange={(e) => {
                      const val = e.target.value as MatchFixture['bookingType'];
                      setBookingType(val);
                      if (val) setDivision(val);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Extra Pitch Hire">Extra Pitch Hire</option>
                    <option value="Catch-up Game">Catch-up Game</option>
                    <option value="Cup / Playoff">Cup / Playoff Decider</option>
                    <option value="Friendly">Friendly Match</option>
                    <option value="League Fixture">League Fixture (Additional)</option>
                  </select>
                </div>
              </div>

              {/* Teams */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Teams / Hire Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Team 1 / Hire Client</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Red Dragons FC"
                      value={homeTeam}
                      onChange={(e) => setHomeTeam(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Team 2 / Opponent</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blue Stars FC"
                      value={awayTeam}
                      onChange={(e) => setAwayTeam(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Pitch & Referee Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Assigned Pitch</span>
                  </label>
                  <select
                    value={assignedPitchId}
                    onChange={(e) => setAssignedPitchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Unassigned Pitch --</option>
                    {pitches.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.surface})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Assigned Referee</span>
                  </label>
                  <select
                    value={assignedRefId}
                    onChange={(e) => setAssignedRefId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- No Referee Needed / Unassigned --</option>
                    {referees.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.badgeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes & Match Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Coordinator Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra 30 mins hired; £36 match fee collected..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feeCollected}
                      onChange={(e) => setFeeCollected(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>£36 Fee Paid</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Save Extra Pitch Booking
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: Manage Time Slots Only */}
          {tab === 'addSlotOnly' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Add Extra Kick-Off Time on {selectedDate}</span>
                </label>
                <p className="text-xs text-slate-400">
                  Adds a new kick-off round to the Visual Pitch Board matrix for extra pitch hire occasions (e.g. 18:30 or 20:30).
                </p>

                <div className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={newTimeInput}
                    onChange={(e) => setNewTimeInput(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono w-36"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSlotOnly(newTimeInput)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
                  >
                    Add Extra Time Slot
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1.5">Or click to add popular extra hire times:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_EXTRA_TIMES.map((t) => {
                      const alreadyAdded = existingTimes.includes(t) || extraTimes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddSlotOnly(t)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-mono font-semibold transition-all ${
                            alreadyAdded
                              ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800'
                              : 'bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-700'
                          }`}
                        >
                          + {t} {alreadyAdded ? '(Active)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Extra Times List */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Active Extra Times for {selectedDate} ({extraTimes.length})
                </span>
                {extraTimes.length === 0 ? (
                  <div className="p-4 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
                    No extra hired times added yet for this date. Add one above to create extra slots on the Visual Pitch Board.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {extraTimes.map((time) => (
                      <div
                        key={time}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-emerald-400 text-sm">{time}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/20">
                            Extra Pitch Hire Slot
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveExtraTimeSlot(time)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                          title="Remove extra time slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Synced with Visual Pitch Board &amp; Plain Text Export</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
