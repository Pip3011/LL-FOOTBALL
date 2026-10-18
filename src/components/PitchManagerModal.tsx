import React, { useState } from 'react';
import { Layers, X, Plus, Trash2, Edit2, Check, MapPin } from 'lucide-react';
import { Pitch } from '../types';

interface PitchManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitches: Pitch[];
  onAddPitch: (pitch: Omit<Pitch, 'id'>) => void;
  onUpdatePitch: (id: string, updates: Partial<Pitch>) => void;
  onDeletePitch: (id: string) => void;
  venueName?: string;
}

export const PitchManagerModal: React.FC<PitchManagerModalProps> = ({
  isOpen,
  onClose,
  pitches,
  onAddPitch,
  onUpdatePitch,
  onDeletePitch,
  venueName
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New pitch form
  const [name, setName] = useState('');
  const [surface, setSurface] = useState<Pitch['surface']>('3G Astro');
  const [description, setDescription] = useState('');

  // Edit pitch form
  const [editName, setEditName] = useState('');
  const [editSurface, setEditSurface] = useState<Pitch['surface']>('3G Astro');
  const [editDescription, setEditDescription] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPitch({
      name: name.trim(),
      surface,
      description: description.trim() || undefined,
    });
    setName('');
    setDescription('');
    setIsAdding(false);
  };

  const startEdit = (p: Pitch) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSurface(p.surface);
    setEditDescription(p.description || '');
  };

  const saveEdit = (id: string) => {
    onUpdatePitch(id, {
      name: editName.trim(),
      surface: editSurface,
      description: editDescription.trim() || undefined,
    });
    setEditingId(null);
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Specify &amp; Configure Pitches</h2>
              <p className="text-xs text-slate-400">
                Pitches available at {venueName || 'this venue'} for match assignments
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
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Configured Pitches ({pitches.length})
            </span>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pitch</span>
              </button>
            )}
          </div>

          {/* Add Pitch Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Add New Venue Pitch</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Pitch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pitch 5 (Floodlit) or Cage A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Surface Type</label>
                  <select
                    value={surface}
                    onChange={(e) => setSurface(e.target.value as Pitch['surface'])}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="3G Astro">3G Astro (Standard)</option>
                    <option value="4G Rubber Crumb">4G Rubber Crumb</option>
                    <option value="Indoor Sports Hall">Indoor Sports Hall</option>
                    <option value="Sand-Dressed Astro">Sand-Dressed Astro</option>
                    <option value="Grass">Grass</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Location Notes / Rules (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Moulded boots only, far side near car park"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
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
                  Add Pitch
                </button>
              </div>
            </form>
          )}

          {/* Pitches List */}
          <div className="space-y-2">
            {pitches.map((p) => {
              const isEditing = editingId === p.id;

              return (
                <div
                  key={p.id}
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
                      <select
                        value={editSurface}
                        onChange={(e) => setEditSurface(e.target.value as Pitch['surface'])}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="3G Astro">3G Astro</option>
                        <option value="4G Rubber Crumb">4G Rubber Crumb</option>
                        <option value="Indoor Sports Hall">Indoor Sports Hall</option>
                        <option value="Sand-Dressed Astro">Sand-Dressed Astro</option>
                        <option value="Grass">Grass</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          {p.surface}
                        </span>
                      </div>
                      {p.description && (
                        <div className="text-xs text-slate-400">
                          {p.description}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {isEditing ? (
                      <button
                        onClick={() => saveEdit(p.id)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        title="Save changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        title="Edit pitch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeletePitch(p.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
                      title="Remove pitch"
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
          <span className="text-xs text-slate-400">Available across all match schedules</span>
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
