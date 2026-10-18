export interface LeagueSummary {
  name: string;
  venue: string;
  city: string;
  day: string;
  url: string;
  format?: string;
}

export interface MatchFixture {
  id: string;
  date: string;
  dateIso?: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  division: string;
  status: 'scheduled' | 'completed';
  homeScore: number | null;
  awayScore: number | null;
  venue?: string;
  isExtraBooking?: boolean;
  bookingType?: 'League Fixture' | 'Extra Pitch Hire' | 'Friendly' | 'Cup / Playoff' | 'Catch-up Game';
}

export interface ExtraTimeSlot {
  time: string;
  label?: string;
}

export interface LeagueDetails {
  name: string;
  venue: string;
  city: string;
  day: string;
  url: string;
  divisions: string[];
  dates: string[];
  currentOrUpcomingDate: string;
  fixtures: MatchFixture[];
}

export interface Pitch {
  id: string;
  name: string;
  surface: '3G Astro' | '4G Rubber Crumb' | 'Indoor Sports Hall' | 'Grass' | 'Sand-Dressed Astro';
  description?: string;
}

export interface Referee {
  id: string;
  name: string;
  badgeLevel: string; // e.g. "FA Level 7", "FA Level 5", "Official Leisure Leagues Ref"
  phone?: string;
  email?: string;
  notes?: string;
}

export interface MatchAssignment {
  pitchId: string;
  refereeId: string;
  assistantRefId?: string;
  notes?: string;
  matchFeeCollected?: boolean;
  ballsProvided?: boolean;
  recordedHomeScore?: number | null;
  recordedAwayScore?: number | null;
  homeScorers?: string;
  awayScorers?: string;
  cards?: string;
}

export type ViewMode = 'list' | 'pitchBoard' | 'refSchedule' | 'print';
