import { Seed, Result, Settings, Filters } from '../state/copilotLab';

// Telemetry helper
const track = (event: string, properties?: any) => {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track(event, {
      category: 'copilot_lab',
      ...properties
    });
  }
};

// Stubbed API functions - replace with real implementations
export async function getSeeds(query: string, type: "track" | "playlist" | "artist"): Promise<Seed[]> {
  track('search_seeds', { query, type });
  
  // Mock data for now
  const mockSeeds: Seed[] = [
    {
      type,
      id: `mock_${type}_1`,
      name: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)}: ${query}`,
      artwork: "https://placehold.co/60x60/png",
      meta: { popularity: 85 }
    },
    {
      type,
      id: `mock_${type}_2`,
      name: `Another ${type.charAt(0).toUpperCase() + type.slice(1)}: ${query}`,
      artwork: "https://placehold.co/60x60/png",
      meta: { popularity: 72 }
    }
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockSeeds;
}

export async function getAudioFeatures(ids: string[]): Promise<any[]> {
  track('get_audio_features', { count: ids.length });
  
  // Mock audio features data
  const mockFeatures = ids.map(id => ({
    id,
    bpm: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
    key: Math.floor(Math.random() * 12),
    mode: Math.random() > 0.5 ? 1 : 0, // 1 = major, 0 = minor
    energy: Math.random(),
    danceability: Math.random(),
    valence: Math.random(),
    tempo: Math.floor(Math.random() * 60) + 80
  }));
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockFeatures;
}

export async function getRecommendations(input: {
  seed: Seed;
  settings: Settings;
  filters: Filters;
}): Promise<{ results: Result[] }> {
  track('generate_recommendations', {
    seed_type: input.seed.type,
    bpm_range: input.settings.bpmRange,
    key_mode: input.settings.keyMode
  });
  
  // Mock recommendations
  const mockResults: Result[] = Array.from({ length: 25 }, (_, i) => ({
    id: `rec_${i}`,
    title: `Track ${i + 1}`,
    artist: `Artist ${i + 1}`,
    art: "https://placehold.co/60x60/png",
    bpm: Math.floor(Math.random() * 60) + 80,
    key: `${Math.floor(Math.random() * 12)}${Math.random() > 0.5 ? 'm' : ''}`,
    energy: Math.random(),
    danceability: Math.random(),
    score: Math.random(),
    preview_url: `https://example.com/preview_${i}.mp3`,
    duration_ms: (Math.random() * 300000) + 120000, // 2-5 minutes
    popularity: Math.floor(Math.random() * 100),
    explicit: Math.random() > 0.7,
    release_year: Math.floor(Math.random() * 25) + 2000
  }));
  
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { results: mockResults };
}

export function computeMatchScore(
  track: any, 
  seed: any, 
  settings: Settings,
  config: any
): number {
  const weights = config.scoring.weights;
  
  // BPM distance score
  const bpmDistance = Math.abs(track.bpm - seed.bpm);
  const bpmScore = Math.max(0, 1 - (bpmDistance / config.scoring.maxBpmDelta));
  
  // Key compatibility score
  let keyScore = 0;
  if (settings.keyMode === "exact") {
    keyScore = track.key === seed.key ? 1 : 0;
  } else if (settings.keyMode === "compatible") {
    // Simplified compatibility check
    keyScore = Math.random() > 0.3 ? 0.8 : 0.2;
  } else {
    keyScore = 0.5; // Any key
  }
  
  // Energy distance score
  const energyDistance = Math.abs(track.energy - settings.energyTarget);
  const energyScore = Math.max(0, 1 - energyDistance);
  
  // Danceability score
  const danceabilityScore = track.danceability >= settings.danceabilityMin ? 1 : 0;
  
  // Weighted total score
  const totalScore = 
    (bpmScore * weights.bpmDistance) +
    (keyScore * weights.keyCompatibility) +
    (energyScore * weights.energyDistance) +
    (danceabilityScore * weights.danceability);
  
  return Math.round(totalScore * 100) / 100;
}

export async function saveMashupSession(session: {
  seed: Seed;
  settings: Settings;
  results: Result[];
  queue: any[];
}): Promise<{ success: boolean; sessionId?: string }> {
  track('save_mashup_session', {
    seed_type: session.seed.type,
    result_count: session.results.length,
    queue_count: session.queue.length
  });
  
  // Mock save operation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sessionId = `session_${Date.now()}`;
  console.log('💾 Saved mashup session:', { sessionId, session });
  
  return { success: true, sessionId };
}

export async function exportCSV(session: {
  seed: Seed;
  results: Result[];
  queue: any[];
}): Promise<{ success: boolean; url?: string }> {
  track('export_csv', {
    result_count: session.results.length,
    queue_count: session.queue.length
  });
  
  // Mock CSV export
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const csvData = [
    'Title,Artist,BPM,Key,Energy,Danceability,Score',
    ...session.results.map(r => 
      `"${r.title}","${r.artist}",${r.bpm},"${r.key}",${r.energy},${r.danceability},${r.score}`
    )
  ].join('\n');
  
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  return { success: true, url };
}

// Helper function to get config
export async function getCopilotConfig() {
  try {
    const response = await fetch('/config/copilot.lab.json');
    if (!response.ok) throw new Error('Config not found');
    return await response.json();
  } catch (error) {
    console.warn('Using fallback config');
    // Return minimal fallback config
    return {
      unauthenticated: {
        headline: "Connect Spotify to activate Co-Pilot",
        bullets: [
          "Generate mashup matches by key/BPM/energy",
          "Instant A/B preview with audio features", 
          "Save sessions to Mashups or export"
        ],
        cta: {
          label: "Login with Spotify",
          action: "auth.spotify.login"
        }
      },
      panels: {
        left: [],
        middle: [],
        right: []
      }
    };
  }
}
