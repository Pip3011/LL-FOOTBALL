import React, { useState, useEffect, useMemo } from 'react';
import { 
  LeagueDetails, 
  MatchFixture,
  Pitch, 
  Referee, 
  MatchAssignment, 
  ViewMode 
} from './types';
import { DEFAULT_PITCHES, DEFAULT_REFEREES } from './constants/defaults';
import { fetchLeagueFixtures } from './services/api';
import { Header } from './components/Header';
import { DateSelector } from './components/DateSelector';
import { MatchList } from './components/MatchList';
import { PitchBoard } from './components/PitchBoard';
import { LeagueSelectorModal } from './components/LeagueSelectorModal';
import { RefereeManagerModal } from './components/RefereeManagerModal';
import { PitchManagerModal } from './components/PitchManagerModal';
import { ShareScheduleModal } from './components/ShareScheduleModal';
import { PrintMatchdaySheet } from './components/PrintMatchdaySheet';
import { BulkAssignModal } from './components/BulkAssignModal';
import { AddExtraTimeModal } from './components/AddExtraTimeModal';
import { Loader2, AlertCircle, RefreshCw, Trophy } from 'lucide-react';

const DEFAULT_LEAGUE_URL = "https://www.leisureleagues.net/league/aylesbury-vale-academy/aylesbury-monday";

export default function App() {
  // Current active league URL
  const [currentLeagueUrl, setCurrentLeagueUrl] = useState<string>(() => {
    return localStorage.getItem('ll_current_league_url') || DEFAULT_LEAGUE_URL;
  });

  // League details loaded from server
  const [league, setLeague] = useState<LeagueDetails | null>(null);
  const [isLoadingLeague, setIsLoadingLeague] = useState<boolean>(true);
  const [leagueError, setLeagueError] = useState<string | null>(null);

  // Selected date & division filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [teamSearch, setTeamSearch] = useState<string>('');

  // Active view mode
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Pitches state (persisted per venue in localStorage)
  const [pitches, setPitches] = useState<Pitch[]>(() => {
    const saved = localStorage.getItem('ll_pitches');
    return saved ? JSON.parse(saved) : DEFAULT_PITCHES;
  });

  // Referees state (persisted in localStorage)
  const [referees, setReferees] = useState<Referee[]>(() => {
    const saved = localStorage.getItem('ll_referees');
    return saved ? JSON.parse(saved) : DEFAULT_REFEREES;
  });

  // Match assignments state (keyed by fixtureId)
  // Persisted in localStorage
  const [assignments, setAssignments] = useState<Record<string, MatchAssignment>>(() => {
    const saved = localStorage.getItem('ll_assignments');
    return saved ? JSON.parse(saved) : {};
  });

  // Extra hired time slots per date e.g. { "19th Oct 2026": ["18:30", "20:30"] }
  const [extraTimeSlots, setExtraTimeSlots] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('ll_extra_times');
    return saved ? JSON.parse(saved) : {};
  });

  // Custom fixtures (extra pitch hire bookings, catch-up games)
  const [customFixtures, setCustomFixtures] = useState<MatchFixture[]>(() => {
    const saved = localStorage.getItem('ll_custom_fixtures');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal open states
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInitialPitchId, setBulkInitialPitchId] = useState<string | undefined>();
  const [isExtraTimeModalOpen, setIsExtraTimeModalOpen] = useState(false);
  const [extraModalInitialTime, setExtraModalInitialTime] = useState<string>('20:30');
  const [extraModalInitialPitchId, setExtraModalInitialPitchId] = useState<string | undefined>();

  // Save pitches, referees, assignments, extra times to localStorage
  useEffect(() => {
    localStorage.setItem('ll_extra_times', JSON.stringify(extraTimeSlots));
  }, [extraTimeSlots]);

  useEffect(() => {
    localStorage.setItem('ll_custom_fixtures', JSON.stringify(customFixtures));
  }, [customFixtures]);

  useEffect(() => {
    localStorage.setItem('ll_pitches', JSON.stringify(pitches));
  }, [pitches]);

  useEffect(() => {
    localStorage.setItem('ll_referees', JSON.stringify(referees));
  }, [referees]);

  useEffect(() => {
    localStorage.setItem('ll_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('ll_current_league_url', currentLeagueUrl);
  }, [currentLeagueUrl]);

  // Load League Data
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setIsLoadingLeague(true);
      setLeagueError(null);
      try {
        const data = await fetchLeagueFixtures(currentLeagueUrl);
        if (!isCancelled) {
          setLeague(data);
          // Set initial date to upcoming or first date
          setSelectedDate(data.currentOrUpcomingDate || data.dates[0] || '');
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error fetching league:', err);
          setLeagueError(err.message || 'Failed to load league data');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingLeague(false);
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [currentLeagueUrl]);

  // Filter fixtures by selected date, division, and team search (combining league fixtures & custom pitch hire bookings)
  const dateFixtures = useMemo(() => {
    const leagueMatches = league?.fixtures.filter((f) => f.date === selectedDate) || [];
    const customMatches = customFixtures.filter((f) => f.date === selectedDate);
    return [...leagueMatches, ...customMatches];
  }, [league, customFixtures, selectedDate]);

  // Extra Time Slots & Custom Pitch Hire Handlers
  const handleAddExtraTimeSlot = (time: string) => {
    if (!selectedDate || !time) return;
    setExtraTimeSlots((prev) => {
      const existing = prev[selectedDate] || [];
      if (existing.includes(time)) return prev;
      return { ...prev, [selectedDate]: [...existing, time].sort() };
    });
  };

  const handleRemoveExtraTimeSlot = (time: string) => {
    if (!selectedDate) return;
    setExtraTimeSlots((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((t) => t !== time),
    }));
  };

  const handleAddCustomFixture = (
    newFixture: MatchFixture,
    initialAssignment?: Partial<MatchAssignment>
  ) => {
    setCustomFixtures((prev) => [...prev, newFixture]);
    if (initialAssignment) {
      setAssignments((prev) => ({
        ...prev,
        [newFixture.id]: {
          pitchId: initialAssignment.pitchId || '',
          refereeId: initialAssignment.refereeId || '',
          notes: initialAssignment.notes || '',
          matchFeeCollected: initialAssignment.matchFeeCollected || false,
        },
      }));
    }
  };

  const handleOpenExtraTimeModal = (initialTime?: string, initialPitchId?: string) => {
    setExtraModalInitialTime(initialTime || '20:30');
    setExtraModalInitialPitchId(initialPitchId);
    setIsExtraTimeModalOpen(true);
  };

  const filteredFixtures = useMemo(() => {
    let result = dateFixtures;
    if (selectedDivision !== 'All') {
      result = result.filter((f) => f.division === selectedDivision);
    }
    if (teamSearch.trim()) {
      const q = teamSearch.toLowerCase();
      result = result.filter(
        (f) =>
          f.homeTeam.toLowerCase().includes(q) ||
          f.awayTeam.toLowerCase().includes(q)
      );
    }
    // Sort by kick-off time
    return [...result].sort((a, b) => a.time.localeCompare(b.time));
  }, [dateFixtures, selectedDivision, teamSearch]);

  // Collision calculation
  const totalConflicts = useMemo(() => {
    if (!dateFixtures.length) return 0;
    let conflicts = 0;
    const pitchMap = new Map<string, number>();
    const refMap = new Map<string, number>();

    for (const f of dateFixtures) {
      const a = assignments[f.id];
      if (a?.pitchId) {
        const key = `${a.pitchId}_${f.time}`;
        pitchMap.set(key, (pitchMap.get(key) || 0) + 1);
      }
      if (a?.refereeId) {
        const key = `${a.refereeId}_${f.time}`;
        refMap.set(key, (refMap.get(key) || 0) + 1);
      }
    }

    pitchMap.forEach((count) => {
      if (count > 1) conflicts += count - 1;
    });
    refMap.forEach((count) => {
      if (count > 1) conflicts += count - 1;
    });

    return conflicts;
  }, [dateFixtures, assignments]);

  // Update a single fixture assignment
  const handleUpdateAssignment = (fixtureId: string, updates: Partial<MatchAssignment>) => {
    setAssignments((prev) => ({
      ...prev,
      [fixtureId]: {
        ...(prev[fixtureId] || { pitchId: '', refereeId: '' }),
        ...updates,
      },
    }));
  };

  // Bulk assign a referee to multiple fixtures
  const handleBulkAssignRef = (fixtureIds: string[], refId: string) => {
    setAssignments((prev) => {
      const updated = { ...prev };
      for (const id of fixtureIds) {
        updated[id] = {
          ...(updated[id] || { pitchId: '', refereeId: '' }),
          refereeId: refId,
        };
      }
      return updated;
    });
  };

  // Smart Auto-Assign Pitches & Referees for the active date
  const handleAutoAssign = () => {
    if (!dateFixtures.length || !pitches.length) return;

    // Group fixtures by kick-off time
    const timeGroups = new Map<string, typeof dateFixtures>();
    for (const f of dateFixtures) {
      const list = timeGroups.get(f.time) || [];
      list.push(f);
      timeGroups.set(f.time, list);
    }

    const newAssignments = { ...assignments };
    let refIndex = 0;

    timeGroups.forEach((fixturesAtTime) => {
      // Assign unique pitches to each match at this time slot
      fixturesAtTime.forEach((f, idx) => {
        const pitchToAssign = pitches[idx % pitches.length];
        // Assign a ref from roster, cycling to balance workload
        const refToAssign = referees.length > 0 ? referees[refIndex % referees.length] : null;
        if (referees.length > 0) refIndex++;

        newAssignments[f.id] = {
          ...(newAssignments[f.id] || {}),
          pitchId: pitchToAssign ? pitchToAssign.id : '',
          refereeId: refToAssign ? refToAssign.id : '',
        };
      });
    });

    setAssignments(newAssignments);
  };

  // Referee CRUD
  const handleAddReferee = (newRef: Omit<Referee, 'id'>) => {
    const id = `ref-${Date.now()}`;
    setReferees((prev) => [...prev, { ...newRef, id }]);
  };

  const handleUpdateReferee = (id: string, updates: Partial<Referee>) => {
    setReferees((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleDeleteReferee = (id: string) => {
    setReferees((prev) => prev.filter((r) => r.id !== id));
  };

  // Pitch CRUD
  const handleAddPitch = (newPitch: Omit<Pitch, 'id'>) => {
    const id = `pitch-${Date.now()}`;
    setPitches((prev) => [...prev, { ...newPitch, id }]);
  };

  const handleUpdatePitch = (id: string, updates: Partial<Pitch>) => {
    setPitches((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleDeletePitch = (id: string) => {
    setPitches((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sticky Header */}
      <Header
        league={league}
        selectedDate={selectedDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenLeagueSelector={() => setIsLeagueModalOpen(true)}
        onOpenRefModal={() => setIsRefModalOpen(true)}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenBulkModal={() => { setBulkInitialPitchId(undefined); setIsBulkModalOpen(true); }}
        onAutoAssign={handleAutoAssign}
        totalConflicts={totalConflicts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Loading State */}
        {isLoadingLeague && (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 ring-4 ring-emerald-500/5">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Fetching Leisure Leagues Fixture Data...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Connecting to leisureleagues.net to parse live divisions, matchdays, kick-off rounds and teams.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoadingLeague && leagueError && (
          <div className="p-8 text-center bg-red-950/20 border border-red-500/30 rounded-2xl space-y-4">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-red-200">Failed to Load League Fixtures</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                {leagueError}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentLeagueUrl(DEFAULT_LEAGUE_URL)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Load Default League
              </button>
              <button
                onClick={() => setIsLeagueModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Choose Another League
              </button>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoadingLeague && !leagueError && league && (
          <div className="space-y-6">
            
            {/* Date & Division Bar (hidden when printing) */}
            {viewMode !== 'print' && (
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                <DateSelector
                  dates={league.dates}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  divisions={league.divisions}
                  selectedDivision={selectedDivision}
                  onSelectDivision={setSelectedDivision}
                  matchesCount={filteredFixtures.length}
                  upcomingDate={league.currentOrUpcomingDate}
                  teamSearch={teamSearch}
                  onTeamSearchChange={setTeamSearch}
                />
              </div>
            )}

            {/* View Switching */}
            {viewMode === 'list' && (
              <MatchList
                fixtures={filteredFixtures}
                pitches={pitches}
                referees={referees}
                assignments={assignments}
                onUpdateAssignment={handleUpdateAssignment}
                onAutoAssign={handleAutoAssign}
                onOpenAddPitch={() => setIsPitchModalOpen(true)}
                onOpenAddRef={() => setIsRefModalOpen(true)}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onOpenBulkModal={() => { setBulkInitialPitchId(undefined); setIsBulkModalOpen(true); }}
                onBulkAssignRef={handleBulkAssignRef}
                onOpenExtraTimeModal={() => handleOpenExtraTimeModal()}
                selectedDate={selectedDate}
              />
            )}

            {viewMode === 'pitchBoard' && (
              <PitchBoard
                fixtures={dateFixtures}
                pitches={pitches}
                referees={referees}
                assignments={assignments}
                onUpdateAssignment={handleUpdateAssignment}
                onBulkAssignRef={handleBulkAssignRef}
                onOpenPitchModal={() => setIsPitchModalOpen(true)}
                onOpenBulkModal={(pitchId?: string) => {
                  setBulkInitialPitchId(pitchId);
                  setIsBulkModalOpen(true);
                }}
                extraTimes={extraTimeSlots[selectedDate] || []}
                onOpenExtraTimeModal={handleOpenExtraTimeModal}
              />
            )}

            {viewMode === 'print' && (
              <PrintMatchdaySheet
                league={league}
                selectedDate={selectedDate}
                fixtures={filteredFixtures}
                pitches={pitches}
                referees={referees}
                assignments={assignments}
                onClose={() => setViewMode('list')}
              />
            )}

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Leisure Leagues Matchday Hub</span>
            <span>•</span>
            <span>Pitch Allocator &amp; Referee Coordinator</span>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://www.leisureleagues.net/" 
              target="_blank" 
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Official Website: leisureleagues.net
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LeagueSelectorModal
        isOpen={isLeagueModalOpen}
        onClose={() => setIsLeagueModalOpen(false)}
        onSelectLeague={(url) => setCurrentLeagueUrl(url)}
        currentUrl={currentLeagueUrl}
      />

      <RefereeManagerModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        referees={referees}
        onAddReferee={handleAddReferee}
        onUpdateReferee={handleUpdateReferee}
        onDeleteReferee={handleDeleteReferee}
        fixtures={dateFixtures}
        assignments={assignments}
        selectedDate={selectedDate}
      />

      <PitchManagerModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        pitches={pitches}
        onAddPitch={handleAddPitch}
        onUpdatePitch={handleUpdatePitch}
        onDeletePitch={handleDeletePitch}
        venueName={league?.venue}
      />

      <ShareScheduleModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        league={league}
        selectedDate={selectedDate}
        fixtures={filteredFixtures}
        allFixtures={league?.fixtures || []}
        pitches={pitches}
        referees={referees}
        assignments={assignments}
      />

      <BulkAssignModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        fixtures={dateFixtures}
        pitches={pitches}
        referees={referees}
        assignments={assignments}
        onBulkAssignRef={handleBulkAssignRef}
        selectedDate={selectedDate}
        initialPitchId={bulkInitialPitchId}
      />

      <AddExtraTimeModal
        isOpen={isExtraTimeModalOpen}
        onClose={() => setIsExtraTimeModalOpen(false)}
        selectedDate={selectedDate}
        pitches={pitches}
        referees={referees}
        existingTimes={Array.from(new Set(dateFixtures.map(f => f.time)))}
        extraTimes={extraTimeSlots[selectedDate] || []}
        onAddExtraTimeSlot={handleAddExtraTimeSlot}
        onRemoveExtraTimeSlot={handleRemoveExtraTimeSlot}
        onAddCustomFixture={handleAddCustomFixture}
        initialTime={extraModalInitialTime}
        initialPitchId={extraModalInitialPitchId}
      />
    </div>
  );
}
