import React from 'react';
import { SetItem } from '../../state/useCopilot';

const colors = {
  accentPrimary: "#7aa7ff",
  accentSecondary: "#9a6bff",
  text: "#E8EEFF",
  muted: "#9AA6C3",
  surface: "#141a33",
  bg: "#0c1020",
};

interface SetlistTableProps {
  items: SetItem[];
  selectedRowId?: string;
  onSelectRow: (rowId: string) => void;
  onMoveRow: (pos: number, direction: 'up' | 'down') => void;
  onLockRow: (pos: number) => void;
  onReplaceRow: (pos: number) => void;
}

export default function SetlistTable({ 
  items, 
  selectedRowId, 
  onSelectRow, 
  onMoveRow, 
  onLockRow, 
  onReplaceRow 
}: SetlistTableProps) {
  const totalDuration = items.reduce((sum, item) => sum + item.duration_sec, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const getSourceBadge = (source: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      deezer: { label: 'D', color: '#00C7F2' },
      getsongbpm: { label: 'G', color: '#FF6B6B' },
      analysis_preview: { label: 'A', color: '#4ECDC4' }
    };
    
    const badge = badges[source] || { label: '?', color: colors.muted };
    
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: badge.color, color: '#000' }}
        title={source}
      >
        {badge.label}
      </div>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (items.length === 0) {
    return (
      <div 
        className="text-center py-12 rounded-lg border-2 border-dashed"
        style={{ 
          borderColor: 'rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.02)'
        }}
      >
        <div 
          className="text-lg mb-2"
          style={{ color: colors.muted }}
        >
          🧪 No setlist yet
        </div>
        <div 
          className="text-sm"
          style={{ color: colors.muted }}
        >
          Complete the questions to brew your perfect set
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 
          className="text-lg font-semibold"
          style={{ color: colors.text }}
        >
          Setlist ({items.length} tracks)
        </h3>
        <div 
          className="text-sm"
          style={{ color: colors.muted }}
        >
          Total: {totalMinutes} minutes
        </div>
      </div>

      {/* Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ 
          borderColor: 'rgba(255,255,255,0.1)',
          backgroundColor: colors.surface
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr 
                className="border-b"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-12"
                  style={{ color: colors.muted }}
                >
                  #
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.muted }}
                >
                  Title
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-44"
                  style={{ color: colors.muted }}
                >
                  Artist
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-16"
                  style={{ color: colors.muted }}
                >
                  BPM
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-20"
                  style={{ color: colors.muted }}
                >
                  Key
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-16"
                  style={{ color: colors.muted }}
                >
                  Dur
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-40"
                  style={{ color: colors.muted }}
                >
                  Transition
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-20"
                  style={{ color: colors.muted }}
                >
                  Source
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider w-32"
                  style={{ color: colors.muted }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.pos}
                  className={`border-b transition-colors cursor-pointer ${
                    selectedRowId === item.pos.toString() 
                      ? 'ring-2 ring-inset' 
                      : 'hover:bg-opacity-50'
                  }`}
                  style={{
                    borderColor: 'rgba(255,255,255,0.05)',
                    backgroundColor: selectedRowId === item.pos.toString() 
                      ? `rgba(${colors.accentPrimary.replace('#', '')}, 0.1)` 
                      : 'transparent'
                  }}
                  onClick={() => onSelectRow(item.pos.toString())}
                >
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: colors.text }}>
                    {item.pos}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {item.title}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm" style={{ color: colors.muted }}>
                      {item.artist}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: colors.text }}>
                    {item.bpm || '—'}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: colors.text }}>
                    {item.keyCamelot || '—'}
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color: colors.text }}>
                    {formatDuration(item.duration_sec)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm" style={{ color: colors.muted }}>
                      {item.transition}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getSourceBadge(item.source)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLockRow(item.pos);
                        }}
                        className="p-1 rounded hover:bg-opacity-20 transition-colors"
                        style={{ backgroundColor: colors.accentPrimary }}
                        title="Lock track"
                      >
                        🔒
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveRow(item.pos, 'up');
                        }}
                        className="p-1 rounded hover:bg-opacity-20 transition-colors"
                        style={{ backgroundColor: colors.accentSecondary }}
                        title="Move up"
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveRow(item.pos, 'down');
                        }}
                        className="p-1 rounded hover:bg-opacity-20 transition-colors"
                        style={{ backgroundColor: colors.accentSecondary }}
                        title="Move down"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReplaceRow(item.pos);
                        }}
                        className="p-1 rounded hover:bg-opacity-20 transition-colors"
                        style={{ backgroundColor: '#FF6B6B' }}
                        title="Replace"
                      >
                        🔄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Duration Progress */}
      <div className="space-y-2">
        <div 
          className="text-sm"
          style={{ color: colors.muted }}
        >
          Duration Progress: {totalMinutes} minutes
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${Math.min((totalMinutes / 120) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${colors.accentPrimary} 0%, ${colors.accentSecondary} 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
