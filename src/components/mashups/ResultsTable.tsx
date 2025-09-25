import React from 'react';
import { useMashups } from '../../store/mashups';
import { BPMKeyFixer } from './BPMKeyFixer';
import { CellBpm } from './CellBpm';

const colors = {
  text: "#E8EDFF",
  muted: "#96A0C2",
  muted2: "#6F7BA6",
  pillBorder: "#8A7CFF",
  pillBg: "rgba(138,124,255,0.12)",
  pillSolid: "#8A7CFF",
  pillSolidText: "#0B0F22",
  divider: "rgba(255,255,255,0.08)",
  bgHover: "#121A3A",
  accent: "#8A7CFF",
  accentSoft: "rgba(138,124,255,0.12)",
};

const pillBase = "h-8 px-3 rounded-full border transition text-sm";
const pillDefault = `${pillBase} border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110`;

export default function ResultsTable() {
  const { results, total, loading, showMore, saveMashup, saved, removeMashup } = useMashups();

  const handleSaveMashup = async (track: any) => {
    console.log('🎯 Save Mashup button clicked for track:', track);
    
    if (isTrackSaved(track)) {
      // Remove the mashup
      const mashupToRemove = saved.find(mashup => mashup.partnerId === track.id);
      if (mashupToRemove) {
        removeMashup(mashupToRemove.id);
      }
    } else {
      // Save the mashup
      await saveMashup(track);
    }
  };

  const isTrackSaved = (track: any) => {
    return saved.some(mashup => mashup.partnerId === track.id);
  };

  if (results.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-lg font-medium mb-2" style={{ color: colors.text }}>
          No results yet
        </div>
        <div className="text-sm" style={{ color: colors.muted }}>
          Pick a seed, set your filters, then Search.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_80px_80px_100px_120px] py-3 px-4 text-[13px] font-semibold border-b" style={{ color: colors.muted2, borderColor: colors.divider }}>
          <div>Title</div>
          <div>BPM</div>
          <div>Key</div>
          <div>Popularity</div>
          <div></div>
        </div>

        {/* Table Body */}
        <div className="divide-y" style={{ borderColor: colors.divider }}>
          {results.map((track, index) => (
            <div key={track.id} className="grid grid-cols-[1fr_80px_80px_100px_120px] items-center px-4 py-3 hover:bg-opacity-10 hover:bg-white transition-colors" style={{ background: 'transparent' }}>
              <div className="flex items-center gap-3">
                <img 
                  src={track.cover} 
                  alt="" 
                  className="h-11 w-11 rounded-[10px] object-cover"
                />
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold truncate" style={{ color: colors.text }}>
                    {track.name}
                  </div>
                  <div className="text-[13px] font-medium truncate" style={{ color: colors.muted }}>
                    {track.artist}
                  </div>
                </div>
              </div>
              
              <div className="text-[14px] font-medium" style={{ color: colors.text }}>
                <CellBpm bpm={(track as any).audio?.bpm || track.bpm} />
              </div>
              
              <div className="text-[14px] font-medium" style={{ color: colors.text }}>
                {(track as any).audio?.key || track.keyStr || "—"}
              </div>

              <div className="text-[14px] font-medium" style={{ color: colors.text }}>
                {track.popularity || "—"}
              </div>
              
              <div className="flex justify-end items-center space-x-2">
                <BPMKeyFixer
                  spotifyId={track.id}
                  currentBpm={typeof (track as any).audio?.bpm === 'number' ? (track as any).audio.bpm : (typeof track.bpm === 'number' ? track.bpm : null)}
                  currentKey={(track as any).audio?.key || track.keyStr || null}
                  onUpdate={(bpm, keyNum, mode) => {
                    // Update the track in the results
                    track.bpm = bpm;
                    track.keyNum = keyNum;
                    track.mode = mode === 0 || mode === 1 ? mode : null;
                    track.keyStr = keyNum !== null && mode !== null ? 
                      `${["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][keyNum]} ${mode === 1 ? "major" : "minor"}` : null;
                  }}
                />
                <button
                  onClick={() => handleSaveMashup(track)}
                  className="h-8 px-4 rounded-full border text-sm font-medium transition-colors whitespace-nowrap"
                  style={{ 
                    background: isTrackSaved(track) ? colors.accentSoft : colors.pillSolid, 
                    color: isTrackSaved(track) ? colors.accent : colors.pillSolidText, 
                    borderColor: colors.pillBorder 
                  }}
                >
                  {isTrackSaved(track) ? 'Saved' : 'Save Mashup'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show More Footer */}
      {results.length < total && (
        <div className="flex justify-center py-4 border-t" style={{ borderColor: colors.divider }}>
          <button
            onClick={showMore}
            disabled={loading}
            className={pillDefault}
          >
            {loading ? "Loading..." : "Show More"}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="text-lg font-medium mb-2" style={{ color: colors.text }}>
            Searching...
          </div>
        </div>
      )}
    </div>
  );
}
