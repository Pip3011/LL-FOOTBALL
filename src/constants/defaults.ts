import { Pitch, Referee } from '../types';

export const DEFAULT_PITCHES: Pitch[] = [
  { id: 'pitch-1', name: 'Pitch 1 (Main)', surface: '3G Astro', description: 'Center 3G pitch, nearest clubhouse' },
  { id: 'pitch-2', name: 'Pitch 2', surface: '3G Astro', description: 'Far side 3G pitch' },
  { id: 'pitch-3', name: 'Pitch 3', surface: '3G Astro', description: 'North floodlit pitch' },
  { id: 'pitch-4', name: 'Pitch 4', surface: '4G Rubber Crumb', description: 'South cage pitch' },
];

export const DEFAULT_REFEREES: Referee[] = [
  { id: 'ref-1', name: 'Dave Miller', badgeLevel: 'FA Qualified Level 7', phone: '07700 900123', notes: 'Experienced coordinator' },
  { id: 'ref-2', name: 'Sarah Jenkins', badgeLevel: 'FA Qualified Level 5', phone: '07700 900456', notes: 'Senior official' },
  { id: 'ref-3', name: 'Mark Collins', badgeLevel: 'Official Leisure Leagues Ref', phone: '07700 900789', notes: 'Great with match control' },
  { id: 'ref-4', name: 'Chris Taylor', badgeLevel: 'FA Qualified Level 7', phone: '07700 900321', notes: 'Available all evening' },
  { id: 'ref-5', name: 'Alex Davies', badgeLevel: 'Official Leisure Leagues Ref', phone: '07700 900654', notes: 'Punctual & reliable' },
];
