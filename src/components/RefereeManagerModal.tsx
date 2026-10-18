import React, { useState } from 'react';
import { Users, X, Plus, Trash2, Phone, Award, Edit2, Check, ShieldCheck } from 'lucide-react';
import { Referee, MatchAssignment, MatchFixture } from '../types';

interface RefereeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  referees: Referee[];
  onAddReferee: (referee: Omit<Referee, 'id'>) => void;
  onUpdateReferee: (id: string, updates: Partial<Referee>) => void;
  onDeleteReferee: (id: string) => void;
  fixtures: MatchFixture[];
  assignments: Record<string, MatchAssignment>;
  selectedDate: string;
}

export const RefereeManagerModal: React.FC<RefereeManagerModalProps> = ({
  isOpen,
  onClose,
  referees,
  onAddReferee,
  onUpdateReferee,
  onDeleteReferee,
  fixtures,
  assignments,
  selectedDate
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New ref form state
  const [name, setName] = useState('');
  const [badgeLevel, setBadgeLevel] = useState('Official Leisure Leagues Ref');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Edit ref form state
  const [editName, setEditName] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editPhone, setEditPhone] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddReferee({
      name: name.trim(),
      badgeLevel,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setName('');
    setPhone('');
    setNotes('');
    setIsAdding(false);
  };

  const startEdit = (ref: Referee) => {
    setEditingId(ref.id);
    setEditName(ref.name);
    setEditBadge(ref.badgeLevel);
    setEditPhone(ref.phone || '');
  };

  const saveEdit = (id: string) => {
    onUpdateReferee(id, {
      name: editName.trim(),
      badgeLevel: editBadge.trim(),
      phone: editPhone.trim() || undefined,
    });
    setEditingId(null);
  };

  // Compute how many matches each ref is officiating on selected date
  const getRefMatchCount = (refId: string) => {
    return fixtures.filter(f => assignments[f.id]?.refereeId === refId).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Referee Roster Management</h2>
              <p className="text-xs text-slate-400">
                Official referees pool for assigning to matches &amp; tracking workloads
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Header Action: Add Ref Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Referees ({referees.length})
            </span>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Referee</span>
              </button>
            )}
          </div>

          {/* Add Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Register New Referee</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Henderson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Badge / Qualification</label>
                  <select
                    value={badgeLevel}
                    onChange={(e) => setBadgeLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Official Leisure Leagues Ref">Official Leisure Leagues Ref</option>
                    <option value="FA Qualified Level 7">FA Qualified Level 7 (Junior County)</option>
                    <option value="FA Qualified Level 5">FA Qualified Level 5 (Senior County)</option>
                    <option value="FA Qualified Level 4">FA Qualified Level 4 (Supply League)</option>
                    <option value="Trainee Referee">Trainee Referee</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mobile Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 07700 900888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Notes / Availability</label>
                  <input
                    type="text"
                    placeholder="e.g. Available every Monday from 18:45"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                >
                  Save Referee
                </button>
              </div>
            </form>
          )}

          {/* Referees List */}
          <div className="space-y-2">
            {referees.map((ref) => {
              const count = getRefMatchCount(ref.id);
              const isEditing = editingId === ref.id;

              return (
                <div
                  key={ref.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={editBadge}
                        onChange={(e) => setEditBadge(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{ref.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          {ref.badgeLevel}
                        </span>
                        {count > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono font-bold">
                            {count} {count === 1 ? 'game' : 'games'} on {selectedDate}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {ref.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {ref.phone}
                          </span>
                        )}
                        {ref.notes && <span>{ref.notes}</span>}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {isEditing ? (
                      <button
                        onClick={() => saveEdit(ref.id)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        title="Save changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(ref)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        title="Edit referee"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteReferee(ref.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
                      title="Remove referee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Referees are synced with all fixtures</span>
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
