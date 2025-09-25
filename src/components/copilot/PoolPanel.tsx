import React, { useState, useEffect } from 'react';
import { SetItem } from '../../state/useCopilot';

const colors = {
  accentPrimary: "#7aa7ff",
  accentSecondary: "#9a6bff",
  text: "#E8EEFF",
  muted: "#9AA6C3",
  surface: "#141a33",
  bg: "#0c1020",
};

interface PoolPanelProps {
  selectedRowId?: string;
  onSwapItem: (item: Partial<SetItem>) => void;
}

interface FilterState {
  genres: string[];
  bpmRange: [number, number];
  keyCamelot: string | null;
  eras: string[];
  familiarity: 'low' | 'medium' | 'high' | null;
  hasBpmKey: boolean;
}

const mockPoolItems: SetItem[] = [
  {
    pos: 1,
    id: 'pool-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    bpm: 171,
    keyCamelot: '8B',
    duration_sec: 200,
    source: 'deezer',
    transition: 'Hard cut'
  },
  {
    pos: 2,
    id: 'pool-2',
    title: 'Levitating',
    artist: 'Dua Lipa',
    bpm: 103,
    keyCamelot: '5A',
    duration_sec: 203,
    source: 'getsongbpm',
    transition: 'Beatmatch'
  },
  {
    pos: 3,
    id: 'pool-3',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    bpm: 166,
    keyCamelot: '7A',
    duration_sec: 178,
    source: 'analysis_preview',
    transition: 'Quick mix'
  },
  {
    pos: 4,
    id: 'pool-4',
    title: 'Industry Baby',
    artist: 'Lil Nas X ft. Jack Harlow',
    bpm: 150,
    keyCamelot: '11A',
    duration_sec: 212,
    source: 'deezer',
    transition: 'Loop out'
  },
  {
    pos: 5,
    id: 'pool-5',
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    bpm: 169,
    keyCamelot: '6B',
    duration_sec: 141,
    source: 'getsongbpm',
    transition: 'Drop swap'
  }
];

const camelotKeys = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B'];
const genres = ['hip-hop', 'pop', 'electronic', 'rock', 'indie', 'rnb', 'country', 'reggaeton'];
const eras = ['2000s', '2010s', '2020s', '90s', '80s'];

export default function PoolPanel({ selectedRowId, onSwapItem }: PoolPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    bpmRange: [60, 180],
    keyCamelot: null,
    eras: [],
    familiarity: null,
    hasBpmKey: false
  });
  
  const [filteredItems, setFilteredItems] = useState<SetItem[]>(mockPoolItems);

  useEffect(() => {
    let filtered = mockPoolItems;

    // Genre filter
    if (filters.genres.length > 0) {
      filtered = filtered.filter(item => 
        filters.genres.some(genre => 
          item.title.toLowerCase().includes(genre) || 
          item.artist.toLowerCase().includes(genre)
        )
      );
    }

    // BPM filter
    filtered = filtered.filter(item => 
      item.bpm && item.bpm >= filters.bpmRange[0] && item.bpm <= filters.bpmRange[1]
    );

    // Key filter
    if (filters.keyCamelot) {
      filtered = filtered.filter(item => item.keyCamelot === filters.keyCamelot);
    }

    // BPM/Key filter
    if (filters.hasBpmKey) {
      filtered = filtered.filter(item => item.bpm && item.keyCamelot);
    }

    setFilteredItems(filtered);
  }, [filters]);

  const handleGenreToggle = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleEraToggle = (era: string) => {
    setFilters(prev => ({
      ...prev,
      eras: prev.eras.includes(era)
        ? prev.eras.filter(e => e !== era)
        : [...prev.eras, era]
    }));
  };

  const Chip = ({ 
    label, 
    isActive, 
    onClick 
  }: { 
    label: string; 
    isActive: boolean; 
    onClick: () => void; 
  }) => (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        isActive ? 'ring-2 ring-offset-1' : ''
      }`}
        style={{
          backgroundColor: isActive ? colors.accentPrimary : 'rgba(255,255,255,0.1)',
          color: isActive ? '#000' : colors.text
        }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          borderColor: 'rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(12,16,32,0.8)'
        }}
      >
        <h3 
          className="text-lg font-semibold"
          style={{ color: colors.text }}
        >
          Pool & Filters
        </h3>
        {selectedRowId && (
          <div 
            className="text-sm mt-1"
            style={{ color: colors.muted }}
          >
            Click a track to replace position {selectedRowId}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4 overflow-auto flex-1">
        {/* Genres */}
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: colors.text }}
          >
            Genres
          </h4>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <Chip
                key={genre}
                label={genre}
                isActive={filters.genres.includes(genre)}
                onClick={() => handleGenreToggle(genre)}
              />
            ))}
          </div>
        </div>

        {/* BPM Range */}
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: colors.text }}
          >
            BPM Range
          </h4>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={filters.bpmRange[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                bpmRange: [parseInt(e.target.value) || 60, prev.bpmRange[1]]
              }))}
              className="w-16 px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
                color: colors.text
              }}
            />
            <span style={{ color: colors.muted }}>—</span>
            <input
              type="number"
              value={filters.bpmRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                bpmRange: [prev.bpmRange[0], parseInt(e.target.value) || 180]
              }))}
              className="w-16 px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
                color: colors.text
              }}
            />
          </div>
        </div>

        {/* Key */}
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: colors.text }}
          >
            Key (Camelot)
          </h4>
          <select
            value={filters.keyCamelot || ''}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              keyCamelot: e.target.value || null
            }))}
            className="w-full px-2 py-1 rounded text-sm"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.2)',
              color: colors.text
            }}
          >
            <option value="">Any Key</option>
            {camelotKeys.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        {/* Eras */}
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: colors.text }}
          >
            Eras
          </h4>
          <div className="flex flex-wrap gap-2">
            {eras.map(era => (
              <Chip
                key={era}
                label={era}
                isActive={filters.eras.includes(era)}
                onClick={() => handleEraToggle(era)}
              />
            ))}
          </div>
        </div>

        {/* Familiarity */}
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: colors.text }}
          >
            Familiarity
          </h4>
          <select
            value={filters.familiarity || ''}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              familiarity: e.target.value as 'low' | 'medium' | 'high' | null || null
            }))}
            className="w-full px-2 py-1 rounded text-sm"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.2)',
              color: colors.text
            }}
          >
            <option value="">Any</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Has BPM/Key Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasBpmKey"
            checked={filters.hasBpmKey}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              hasBpmKey: e.target.checked
            }))}
            className="rounded"
          />
          <label 
            htmlFor="hasBpmKey"
            className="text-sm"
            style={{ color: colors.text }}
          >
            Only tracks with BPM/Key
          </label>
        </div>
      </div>

      {/* Pool Items */}
      <div 
        className="border-t flex-1 overflow-auto"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="p-4">
          <h4 
            className="text-sm font-medium mb-3"
            style={{ color: colors.text }}
          >
            Pool ({filteredItems.length} tracks)
          </h4>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSwapItem(item)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRowId ? 'hover:ring-2 hover:ring-opacity-50' : ''
                }`}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Album Art Placeholder */}
                  <div
                    className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg"
                  >
                    {item.title.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-sm font-medium truncate"
                      style={{ color: colors.text }}
                    >
                      {item.title}
                    </div>
                    <div 
                      className="text-xs truncate"
                      style={{ color: colors.muted }}
                    >
                      {item.artist}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: colors.accentPrimary,
                          color: '#000'
                        }}
                      >
                        {item.bpm || '—'} BPM
                      </span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: colors.accentSecondary,
                          color: '#000'
                        }}
                      >
                        {item.keyCamelot || '—'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Preview track
                    }}
                    className="p-1 rounded hover:bg-opacity-20 transition-colors"
                    style={{ backgroundColor: colors.accentPrimary }}
                    title="Preview"
                  >
                    ▶️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
