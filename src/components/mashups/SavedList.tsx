import React from 'react';
import { useMashups, Mashup } from '../../store/mashups';

const colors = {
  text: "#E8EDFF",
  secondary: "#96A0C2",
  muted: "#6F7BA6",
  accent: "#8A7CFF",
  accentSoft: "rgba(138,124,255,0.12)",
  divider: "rgba(255,255,255,0.06)",
  bgPanel: "#0E1530",
  border: "#1A2348",
};

export default function SavedList() {
  const { saved, removeMashup } = useMashups();

  if (saved.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: colors.muted }}>
          No saved mashups yet. Create some in the Build tab!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Saved Mashups ({saved.length})
        </h3>
      </div>

      {/* List */}
      <div className="space-y-4">
        {saved.map((mashup) => (
          <SavedMashupCard
            key={mashup.id}
            mashup={mashup}
            onRemove={() => removeMashup(mashup.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SavedMashupCard({ 
  mashup, 
  onRemove
}: { 
  mashup: Mashup; 
  onRemove: () => void;
}) {
  // Use stored track data
  const seedTrack = mashup.seedTrack;
  const partnerTrack = mashup.partnerTrack;

  // Helper function to get BPM and Key display
  const getBpmKey = (track: any) => {
    const bpm = track?.audio?.bpm || track?.bpm || '—';
    const key = track?.audio?.key || track?.keyStr || '—';
    return { bpm, key };
  };

  // Helper function to get cover art
  const getCoverArt = (track: any) => {
    return track?.cover || track?.cover_url || track?.album_art || 'https://placehold.co/60x60/png';
  };

  const seedInfo = seedTrack ? getBpmKey(seedTrack) : { bpm: '—', key: '—' };
  const partnerInfo = partnerTrack ? getBpmKey(partnerTrack) : { bpm: '—', key: '—' };

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: colors.divider, background: colors.bgPanel }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium" style={{ color: colors.muted }}>
          Saved {new Date(mashup.createdAt).toLocaleDateString()}
        </div>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seed Track */}
        <div className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: colors.divider, background: '#0F1836' }}>
          <div className="flex-shrink-0">
            <img
              src={seedTrack ? getCoverArt(seedTrack) : 'https://placehold.co/60x60/png'}
              alt={seedTrack?.name || 'Unknown track'}
              className="w-12 h-12 rounded object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium" style={{ color: colors.text }}>
              {seedTrack?.name || seedTrack?.title || 'Unknown Track'}
            </div>
            <div className="text-xs" style={{ color: colors.secondary }}>
              {seedTrack?.artist_primary_name || seedTrack?.artist || 'Unknown Artist'}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="text-xs" style={{ color: colors.muted }}>
                BPM: <span style={{ color: colors.text }}>{seedInfo.bpm}</span>
              </div>
              <div className="text-xs" style={{ color: colors.muted }}>
                Key: <span style={{ color: colors.text }}>{seedInfo.key}</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-medium px-2 py-1 rounded" style={{ background: colors.accentSoft, color: colors.accent }}>
            SEED
          </div>
        </div>

        {/* Partner Track */}
        <div className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: colors.divider, background: '#0F1836' }}>
          <div className="flex-shrink-0">
            <img
              src={partnerTrack ? getCoverArt(partnerTrack) : 'https://placehold.co/60x60/png'}
              alt={partnerTrack?.name || 'Unknown track'}
              className="w-12 h-12 rounded object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium" style={{ color: colors.text }}>
              {partnerTrack?.name || partnerTrack?.title || 'Unknown Track'}
            </div>
            <div className="text-xs" style={{ color: colors.secondary }}>
              {partnerTrack?.artist_primary_name || partnerTrack?.artist || 'Unknown Artist'}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="text-xs" style={{ color: colors.muted }}>
                BPM: <span style={{ color: colors.text }}>{partnerInfo.bpm}</span>
              </div>
              <div className="text-xs" style={{ color: colors.muted }}>
                Key: <span style={{ color: colors.text }}>{partnerInfo.key}</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-medium px-2 py-1 rounded" style={{ background: colors.accentSoft, color: colors.accent }}>
            PARTNER
          </div>
        </div>
      </div>

      {/* Mashup Criteria */}
      <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.divider }}>
        <div className="text-xs" style={{ color: colors.muted }}>
          <strong>Search Criteria:</strong> BPM Range: {mashup.criteria.bpm[0]}-{mashup.criteria.bpm[1]} | Source: {mashup.source}
        </div>
      </div>
    </div>
  );
}