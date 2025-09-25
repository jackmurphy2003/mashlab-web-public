import React, { useState, useRef } from 'react';
import { Popover } from './Popover';

interface TempoKeyMenuProps {
  spotifyId: string;
  currentKeyNum?: number | null;
  currentMode?: number | null;
  onUpdate: (data: { key_num?: number; mode?: number; reason: string }) => void;
  onClear: () => void;
  hasOverride: boolean;
}

const colors = {
  text: "#E8EDFF",
  muted: "#96A0C2",
  muted2: "#6F7BA6",
  pillBorder: "#8A7CFF",
  pillBg: "rgba(138,124,255,0.12)",
  pillSolid: "#8A7CFF",
  pillSolidText: "#0B0F22",
  divider: "rgba(255,255,255,0.08)",
  inputBg: "#0F1836",
  inputBorder: "#222C55",
};

const pillBase = "h-8 px-3 rounded-full border transition text-sm";
const pillDefault = `${pillBase} border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110`;

export default function TempoKeyMenu({ 
  spotifyId, 
  currentKeyNum, 
  currentMode, 
  onUpdate, 
  onClear, 
  hasOverride 
}: TempoKeyMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [customKey, setCustomKey] = useState(currentKeyNum?.toString() || '');
  const [customMode, setCustomMode] = useState(currentMode?.toString() || '');

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];



  const handleSaveCustom = () => {
    const key_num = customKey ? parseInt(customKey) : undefined;
    const mode = customMode ? parseInt(customMode) : undefined;
    
    if (key_num !== undefined && mode !== undefined) {
      onUpdate({ 
        key_num, 
        mode, 
        reason: "Manual override" 
      });
    }
  };

  const handleClearOverride = () => {
    onClear();
    setIsOpen(false);
  };



  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-white hover:bg-opacity-10 rounded"
        aria-label="Fix BPM/Key"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>

      {isOpen && (
        <Popover
          anchorEl={buttonRef.current}
          onClose={() => setIsOpen(false)}
        >
          <div className="bg-[#0E1530] border border-[#1A2348] rounded-lg p-4 min-w-[280px] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
                Fix BPM/Key
              </h3>
              {hasOverride && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-300">
                  Verified
                </span>
              )}
            </div>



            {/* Key Controls */}
            <div className="space-y-3 mb-4">
              <div className="text-xs font-medium" style={{ color: colors.muted }}>
                Key
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                {notes.map((note, index) => (
                  <button
                    key={note}
                    onClick={() => setCustomKey(index.toString())}
                    className={`h-8 px-2 rounded border text-xs transition ${
                      customKey === index.toString() 
                        ? 'bg-[#8A7CFF] text-[#0B0F22] border-[#8A7CFF]' 
                        : 'border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCustomMode('0')}
                  className={`h-8 px-3 rounded border text-xs transition ${
                    customMode === '0' 
                      ? 'bg-[#8A7CFF] text-[#0B0F22] border-[#8A7CFF]' 
                      : 'border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110'
                  }`}
                >
                  Minor
                </button>
                <button
                  onClick={() => setCustomMode('1')}
                  className={`h-8 px-3 rounded border text-xs transition ${
                    customMode === '1' 
                      ? 'bg-[#8A7CFF] text-[#0B0F22] border-[#8A7CFF]' 
                      : 'border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110'
                  }`}
                >
                  Major
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t" style={{ borderColor: colors.divider }}>
              <button
                onClick={handleSaveCustom}
                className={`${pillDefault} flex-1`}
                disabled={!customKey || customMode === ''}
              >
                Save
              </button>
              {hasOverride && (
                <button
                  onClick={handleClearOverride}
                  className="h-8 px-3 rounded border border-red-500 bg-red-500 bg-opacity-10 text-red-300 hover:bg-opacity-20 text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
}
