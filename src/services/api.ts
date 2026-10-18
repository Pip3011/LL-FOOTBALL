import { LeagueDetails, LeagueSummary } from '../types';

export async function fetchPopularLeagues(): Promise<LeagueSummary[]> {
  try {
    const res = await fetch('/api/leagues/popular');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.leagues || [];
  } catch (err) {
    console.error('Error fetching popular leagues:', err);
    return [];
  }
}

export async function searchLeagues(query: string): Promise<LeagueSummary[]> {
  try {
    const res = await fetch(`/api/leagues/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.leagues || [];
  } catch (err) {
    console.error('Error searching leagues:', err);
    return [];
  }
}

export async function fetchLeagueFixtures(leagueUrl: string): Promise<LeagueDetails> {
  const res = await fetch(`/api/leagues/fixtures?url=${encodeURIComponent(leagueUrl)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}
