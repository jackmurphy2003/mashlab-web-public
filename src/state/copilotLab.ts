import { create } from "zustand";

export type Seed = { 
  type: "track" | "playlist" | "artist"; 
  id: string; 
  name: string; 
  meta?: any;
  artwork?: string;
};

export type Settings = {
  bpmRange: [number, number];
  keyMode: "exact" | "compatible" | "any";
  energyTarget: number;
  danceabilityMin: number;
  durationToleranceSec: number;
  tempoShiftSemitones: number;
};

export type Result = {
  id: string; 
  title: string; 
  artist: string; 
  art: string;
  bpm: number; 
  key: string; 
  energy: number; 
  danceability: number; 
  score: number;
  preview_url?: string;
  duration_ms?: number;
  popularity?: number;
  explicit?: boolean;
  release_year?: number;
};

export type QueueItem = Result & { 
  role?: "A" | "B";
  order: number;
};

export type Filters = {
  excludeExplicit: boolean;
  releaseYear: [number, number];
  popularity: [number, number];
};

export type CopilotState = {
  // Auth state
  auth: { accessToken?: string | null };
  
  // Current seed and settings
  seed?: Seed;
  settings: Settings;
  filters: Filters;
  
  // Results and queue
  results: Result[];
  queue: QueueItem[];
  
  // UI state
  loading: boolean;
  error?: string;
  
  // Actions
  setAuth: (auth: { accessToken?: string | null }) => void;
  setSeed: (seed: Seed) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setResults: (results: Result[]) => void;
  addToQueue: (item: Result, role?: "A" | "B") => void;
  removeFromQueue: (order: number) => void;
  moveQueueItem: (order: number, direction: "up" | "down") => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  set: (p: Partial<CopilotState>) => void;
  reset: () => void;
};

const defaultSettings: Settings = {
  bpmRange: [118, 132],
  keyMode: "compatible",
  energyTarget: 0.7,
  danceabilityMin: 0.6,
  durationToleranceSec: 20,
  tempoShiftSemitones: 0
};

const defaultFilters: Filters = {
  excludeExplicit: false,
  releaseYear: [2000, 2025],
  popularity: [40, 100]
};

export const useCopilotLab = create<CopilotState>((set, get) => ({
  // Initial state
  auth: { accessToken: null },
  settings: defaultSettings,
  filters: defaultFilters,
  results: [],
  queue: [],
  loading: false,
  
  // Actions
  setAuth: (auth) => set({ auth }),
  
  setSeed: (seed) => set({ seed }),
  
  setSettings: (settingsUpdate) => 
    set((state) => ({ 
      settings: { ...state.settings, ...settingsUpdate } 
    })),
  
  setFilters: (filtersUpdate) => 
    set((state) => ({ 
      filters: { ...state.filters, ...filtersUpdate } 
    })),
  
  setResults: (results) => set({ results }),
  
  addToQueue: (item, role) => {
    const state = get();
    const maxOrder = state.queue.length > 0 ? Math.max(...state.queue.map(q => q.order)) : 0;
    const queueItem: QueueItem = {
      ...item,
      role,
      order: maxOrder + 1
    };
    set({ queue: [...state.queue, queueItem] });
  },
  
  removeFromQueue: (order) => 
    set((state) => ({ 
      queue: state.queue.filter(item => item.order !== order) 
    })),
  
  moveQueueItem: (order, direction) => {
    set((state) => {
      const queue = [...state.queue];
      const index = queue.findIndex(item => item.order === order);
      if (index === -1) return state;
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= queue.length) return state;
      
      // Swap items
      [queue[index], queue[newIndex]] = [queue[newIndex], queue[index]];
      
      // Update order values
      queue.forEach((item, i) => {
        item.order = i + 1;
      });
      
      return { queue };
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  set: (partial) => set(partial),
  
  reset: () => set({ 
    results: [], 
    queue: [], 
    error: undefined,
    loading: false
  })
}));
