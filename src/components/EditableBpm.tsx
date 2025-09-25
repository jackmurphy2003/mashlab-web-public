import React, { useState } from 'react';
import { useLibraryStore } from '../store/library';

interface EditableBpmProps {
  track: any;
  className?: string;
}

export default function EditableBpm({ track, className = "" }: EditableBpmProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const { updateTrack } = useLibraryStore();

  const currentBpm = track.audio?.bpm || track.bpm;
  const displayBpm = currentBpm && typeof currentBpm === 'number' ? Math.round(currentBpm) : "—";

  const handleClick = () => {
    if (displayBpm !== "—") {
      setEditValue(displayBpm.toString());
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    const newBpm = parseFloat(editValue);
    if (!isNaN(newBpm) && newBpm > 0 && newBpm <= 300) {
      // Update the track with new BPM and set source to "User Input"
      const updatedTrack = {
        ...track,
        audio: {
          ...track.audio,
          bpm: newBpm
        },
        bpm: newBpm,
        metaSource: 'User Input',
        metaConfidence: 100
      };

      await updateTrack(updatedTrack);
      setIsEditing(false);
    } else {
      // Invalid input, reset to original
      setEditValue(displayBpm.toString());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(displayBpm.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        autoFocus
        className={`bg-gray-800 text-white text-[14px] font-medium px-1 py-0.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none min-w-[50px] ${className}`}
        min="1"
        max="300"
        step="0.1"
      />
    );
  }

  return (
    <div 
      className={`text-white text-[14px] font-medium cursor-pointer hover:text-blue-400 transition-colors ${className}`}
      onClick={handleClick}
      title="Click to edit BPM"
    >
      {displayBpm}
    </div>
  );
}
