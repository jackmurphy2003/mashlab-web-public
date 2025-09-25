import React from 'react';
import { useMashups } from '../../store/mashups';
import SeedPicker from './SeedPicker';
import SourceSelector from './SourceSelector';

const colors = {
  bgPanel: "#0E1530",
  border: "#1A2348",
  text: "#E8EDFF",
  muted: "#96A0C2",
  muted2: "#6F7BA6",
  pillBorder: "#8A7CFF",
  pillBg: "rgba(138,124,255,0.12)",
  pillSolid: "#8A7CFF",
  pillSolidText: "#0B0F22",
  divider: "rgba(255,255,255,0.08)"
};

interface ControlBarProps {
  onTabChange: (tab: 'build' | 'saved') => void;
}

export default function ControlBar({ onTabChange }: ControlBarProps) {
  const { criteria, setCriteria, search, setBpmPercent, seed } = useMashups();

  const handleSearch = () => {
    console.log('🔍 Search button clicked');
    console.log('Current criteria:', criteria);
    console.log('Current seed:', seed);
    search({ reset: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="rounded-2xl border px-4 md:px-6 py-4" style={{ background: colors.bgPanel, borderColor: colors.border }}>
      {/* Top Row: Seed + Source + Search */}
      <div className="flex items-center gap-4 md:gap-5 flex-wrap">
        {/* Seed Pill */}
        <SeedPicker />

        {/* Seed Track BPM & Key Display */}
        {seed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded border" style={{ 
            background: "#0F1836", 
            borderColor: "#222C55",
            minWidth: '120px'
          }}>
            <div className="flex flex-col items-center">
              <div className="text-xs" style={{ color: colors.muted }}>
                BPM
              </div>
              <div className="text-sm font-medium" style={{ color: colors.text }}>
                {seed.audio?.bpm || seed.bpm || "—"}
              </div>
            </div>
            <div className="w-px h-8" style={{ background: colors.muted2 }} />
            <div className="flex flex-col items-center">
              <div className="text-xs" style={{ color: colors.muted }}>
                Key
              </div>
              <div className="text-sm font-medium" style={{ color: colors.text }}>
                {seed.audio?.key || seed.keyStr || "—"}
              </div>
            </div>
          </div>
        )}

        {/* Source Selector */}
        <SourceSelector />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="h-8 px-4 rounded-full border text-sm font-medium transition-colors"
          style={{ 
            background: colors.pillSolid, 
            color: colors.pillSolidText, 
            borderColor: colors.pillBorder 
          }}
        >
          Search
        </button>
      </div>

      {/* BPM Row (Always On) */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <div className="text-[14px] font-semibold" style={{ color: colors.muted2 }}>
          BPM Range (always on)
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: colors.muted }}>
            Min:
          </label>
          <input
            type="number"
            min={40}
            max={300}
            step={1}
            value={criteria.bpm[0]}
            onChange={(e) => {
              const minVal = Math.max(40, Math.min(300, parseInt(e.target.value) || 40));
              const maxVal = Math.max(minVal, criteria.bpm[1]);
              setCriteria({ bpm: [minVal, maxVal] });
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const newMin = Math.min(300, criteria.bpm[0] + 1);
                const maxVal = Math.max(newMin, criteria.bpm[1]);
                setCriteria({ bpm: [newMin, maxVal] });
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const newMin = Math.max(40, criteria.bpm[0] - 1);
                setCriteria({ bpm: [newMin, criteria.bpm[1]] });
              }
            }}
            className="w-16 h-8 px-2 rounded border text-sm outline-none text-center focus:ring-2 focus:ring-opacity-50"
            style={{ 
              background: "#0F1836", 
              color: colors.text, 
              borderColor: "#222C55"
            }}
          />
        </div>
        
        <div className="text-[18px]" style={{ color: colors.muted2 }}>
          -
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: colors.muted }}>
            Max:
          </label>
          <input
            type="number"
            min={40}
            max={300}
            step={1}
            value={criteria.bpm[1]}
            onChange={(e) => {
              const maxVal = Math.max(40, Math.min(300, parseInt(e.target.value) || 300));
              const minVal = Math.min(maxVal, criteria.bpm[0]);
              setCriteria({ bpm: [minVal, maxVal] });
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const newMax = Math.min(300, criteria.bpm[1] + 1);
                setCriteria({ bpm: [criteria.bpm[0], newMax] });
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const newMax = Math.max(40, criteria.bpm[1] - 1);
                const minVal = Math.min(newMax, criteria.bpm[0]);
                setCriteria({ bpm: [minVal, newMax] });
              }
            }}
            className="w-16 h-8 px-2 rounded border text-sm outline-none text-center focus:ring-2 focus:ring-opacity-50"
            style={{ 
              background: "#0F1836", 
              color: colors.text, 
              borderColor: "#222C55"
            }}
          />
        </div>

        {/* BPM Helper Chips */}
        <div className="flex items-center gap-2 ml-2">
          <div className="text-xs" style={{ color: colors.muted }}>
            Quick:
          </div>
          <button
            onClick={() => {
              console.log('5% button clicked');
              setBpmPercent(5);
            }}
            className="h-6 px-2 rounded-full border text-xs transition-all duration-200 hover:scale-105"
            style={{ 
              background: colors.pillBg, 
              color: colors.text, 
              borderColor: colors.pillBorder 
            }}
          >
            5%
          </button>
          <button
            onClick={() => setBpmPercent(8)}
            className="h-6 px-2 rounded-full border text-xs transition-all duration-200 hover:scale-105"
            style={{ 
              background: colors.pillBg, 
              color: colors.text, 
              borderColor: colors.pillBorder 
            }}
          >
            8%
          </button>
          <button
            onClick={() => setBpmPercent(10)}
            className="h-6 px-2 rounded-full border text-xs transition-all duration-200 hover:scale-105"
            style={{ 
              background: colors.pillBg, 
              color: colors.text, 
              borderColor: colors.pillBorder 
            }}
          >
            10%
          </button>
          <button
            onClick={() => setCriteria({ bpm: [120, 130] })}
            className="h-6 px-2 rounded-full border text-xs transition-all duration-200 hover:scale-105"
            style={{ 
              background: 'transparent', 
              color: colors.muted, 
              borderColor: colors.muted2 
            }}
            title="Reset to default range"
          >
            Reset
          </button>
        </div>

        {/* Current Range Display */}
        <div className="flex items-center gap-2 ml-4">
          <div className="text-xs" style={{ color: colors.muted }}>
            Current: {criteria.bpm[0]} - {criteria.bpm[1]} BPM
          </div>
          <div className="text-xs" style={{ color: colors.muted2 }}>
            (Range: {criteria.bpm[1] - criteria.bpm[0]} BPM)
          </div>
        </div>
      </div>
    </div>
  );
}
