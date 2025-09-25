import React from 'react';
import { useLibraryStore } from '../../store/library';

interface LibraryArtistDropdownProps {
  disabled?: boolean;
  value: string[];
  onChange: (artistNames: string[]) => void;
}

const colors = {
  text: "#E8EDFF",
  muted: "#96A0C2",
  muted2: "#6F7BA6",
  inputBg: "#0F1836",
  inputBorder: "#222C55",
  pillBorder: "#8A7CFF",
  pillBg: "rgba(138,124,255,0.12)",
};

const pillBase = "h-6 px-2 rounded-full border transition text-xs";
const pillDefault = `${pillBase} border-[#8A7CFF] bg-[rgba(138,124,255,0.12)] text-[#E8EDFF] hover:brightness-110`;

export default function LibraryArtistDropdown({ disabled, value, onChange }: LibraryArtistDropdownProps) {
  const { libraryById, libraryOrder } = useLibraryStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  // Get all unique artists from library
  const allArtists = React.useMemo(() => {
    const artists = new Set<string>();
    libraryOrder.forEach(id => {
      const track = libraryById[id];
      if (track?.artist_primary_name) {
        artists.add(track.artist_primary_name);
      }
    });
    return Array.from(artists).sort();
  }, [libraryById, libraryOrder]);

  // Filter artists based on search query
  const filteredArtists = React.useMemo(() => {
    if (!searchQuery.trim()) return allArtists;
    const query = searchQuery.toLowerCase();
    return allArtists.filter(artist => 
      artist.toLowerCase().includes(query)
    );
  }, [allArtists, searchQuery]);

  const handleSelectArtist = (artistName: string) => {
    if (!value.includes(artistName)) {
      onChange([...value, artistName]);
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleRemoveArtist = (artistName: string) => {
    onChange(value.filter(name => name !== artistName));
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className="relative">
      {/* Selected Artists */}
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map((artistName) => (
          <span
            key={artistName}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
              pillDefault
            }`}
          >
            {artistName}
            <button
              onClick={() => handleRemoveArtist(artistName)}
              className="hover:text-red-400"
              disabled={disabled}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder={`Search ${allArtists.length} artists...`}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        disabled={disabled}
        className="w-full h-8 px-3 rounded border text-sm outline-none"
        style={{ 
          background: colors.inputBg, 
          color: colors.text, 
          borderColor: colors.inputBorder,
          opacity: disabled ? 0.5 : 1
        }}
      />

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded border shadow-lg z-50" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artistName) => (
              <button
                key={artistName}
                onClick={() => handleSelectArtist(artistName)}
                className="w-full p-2 text-left hover:bg-opacity-10 hover:bg-white transition-colors border-b border-opacity-10 border-white last:border-b-0"
                style={{ color: colors.text }}
              >
                {artistName}
              </button>
            ))
          ) : (
            <div className="p-3 text-sm text-center" style={{ color: colors.muted2 }}>
              {searchQuery.trim() ? 'No artists found' : 'No artists in library'}
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
