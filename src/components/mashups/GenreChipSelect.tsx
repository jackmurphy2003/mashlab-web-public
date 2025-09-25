import React from 'react';

interface GenreChipSelectProps {
  disabled?: boolean;
  values: string[];
  onChange: (values: string[]) => void;
  source: "library" | "collections" | "playlists" | "spotify";
}

const colors = {
  text: "#E8EDFF",
  muted: "#96A0C2",
  muted2: "#6F7BA6",
  inputBg: "#0F1836",
  inputBorder: "#222C55",
};

const pillBase = "h-6 px-2 rounded-full border transition text-xs";
const pillDefault = `${pillBase} border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110`;

// Common genres for quick selection
const COMMON_GENRES = [
  "pop", "rock", "hip hop", "electronic", "r&b", "country", "jazz", "classical",
  "indie", "alternative", "dance", "reggae", "blues", "folk", "metal", "punk"
];

export default function GenreChipSelect({ disabled, values, onChange, source }: GenreChipSelectProps) {
  const [inputValue, setInputValue] = React.useState('');

  const handleAddGenre = (genre: string) => {
    const normalizedGenre = genre.toLowerCase().trim();
    if (normalizedGenre && !values.includes(normalizedGenre)) {
      onChange([...values, normalizedGenre]);
    }
    setInputValue('');
  };

  const handleRemoveGenre = (genre: string) => {
    onChange(values.filter(g => g !== genre));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddGenre(inputValue);
    }
  };

  const handleChipClick = (genre: string) => {
    if (values.includes(genre)) {
      handleRemoveGenre(genre);
    } else {
      handleAddGenre(genre);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Genres */}
      <div className="flex flex-wrap gap-1">
        {values.map((genre) => (
          <span
            key={genre}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
              pillDefault
            }`}
          >
            {genre}
            <button
              onClick={() => handleRemoveGenre(genre)}
              className="hover:text-red-400"
              disabled={disabled}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input for adding new genres */}
      <input
        type="text"
        placeholder="Add genre..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        className="w-full h-8 px-3 rounded border text-sm outline-none"
        style={{ 
          background: colors.inputBg, 
          color: colors.text, 
          borderColor: colors.inputBorder,
          opacity: disabled ? 0.5 : 1
        }}
      />

      {/* Common Genres */}
      {!disabled && (
        <div className="flex flex-wrap gap-1">
          {COMMON_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleChipClick(genre)}
              className={`px-2 py-1 text-xs rounded-full border transition ${
                values.includes(genre)
                  ? 'border-[#8A7CFF] bg-[#8A7CFF] text-[#0B0F22]'
                  : 'border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
