import React from 'react';

interface ArtistAutocompleteProps {
  disabled?: boolean;
  value: string[];
  onChange: (ids: string[]) => void;
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

export default function ArtistAutocomplete({ disabled, value, onChange, source }: ArtistAutocompleteProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [artists, setArtists] = React.useState<Array<{ id: string; name: string }>>([]);

  const handleSearch = React.useCallback(async (query: string) => {
    if (query.length < 2) return;
    
    try {
      if (source === 'spotify') {
        const response = await fetch(`/api/spotify/search-artist?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setArtists(data.items?.map((a: any) => ({ id: a.id, name: a.name })) || []);
        }
      } else {
        // For library/collections/playlists, we'd need to implement based on available data
        setArtists([]);
      }
    } catch (error) {
      console.error('Artist search error:', error);
      setArtists([]);
    }
  }, [source]);

  const handleSelectArtist = (artist: { id: string; name: string }) => {
    if (!value.includes(artist.id)) {
      onChange([...value, artist.id]);
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleRemoveArtist = (artistId: string) => {
    onChange(value.filter(id => id !== artistId));
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  return (
    <div className="relative">
      {/* Selected Artists */}
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map((artistId) => (
          <span
            key={artistId}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
              pillDefault
            }`}
          >
            {artistId} {/* In a real app, you'd store artist names too */}
            <button
              onClick={() => handleRemoveArtist(artistId)}
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
        placeholder="Search artists..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
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
        <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded border shadow-lg z-50" style={{ background: colors.inputBg, borderColor: colors.inputBorder }}>
          {artists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => handleSelectArtist(artist)}
              className="w-full p-2 text-left hover:bg-opacity-10 hover:bg-white transition-colors"
              style={{ color: colors.text }}
            >
              {artist.name}
            </button>
          ))}
          {artists.length === 0 && searchQuery.length >= 2 && (
            <div className="p-2 text-sm" style={{ color: colors.muted2 }}>
              No artists found
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
