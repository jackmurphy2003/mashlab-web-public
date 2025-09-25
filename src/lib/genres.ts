export function normalizeGenres(genres: string[]): string[] {
  const normalized = genres
    .map(g => g.toLowerCase().trim())
    .filter(g => g.length > 0);
  
  return Array.from(new Set(normalized));
}
