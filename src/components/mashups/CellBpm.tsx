import React from 'react';

interface CellBpmProps {
  bpm: string | number | null | undefined;
}

export function CellBpm({ bpm }: CellBpmProps) {
  if (bpm == null || bpm === '-' || bpm === '') {
    return <span className="text-gray-400">—</span>;
  }
  
  // If it's a number, round it
  if (typeof bpm === 'number' && Number.isFinite(bpm)) {
    return <span>{Math.round(bpm)}</span>;
  }
  
  // If it's a string, display as is
  return <span>{bpm}</span>;
}
